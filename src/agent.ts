import { getErrorMessage } from "./helpers";
import { CATALOG } from "./catalog"; // Import the new catalog

// Define a type for the expected API response to improve type safety
interface OpenRouterResponse {
    choices?: {
        message: {
            content: string;
        };
    }[];
    error?: {
        message: string;
        type: string;
    };
}

export function categorizeText(inputText: string, apiKey: string): number[] {
    if (!apiKey) throw new Error("Provide apiKey");

    const systemPrompt = `
You are an academic categorization agent. 
Return ONLY a JSON array of numeric course IDs (e.g. [118885, 86798]).
- No prose, no code fences, no comments.
- If input is generic or program-level (mentions "master", "degree", "study plan", "Teaching Office", "AulaWeb", "class schedule", "program", etc.) → include program id 11945.
- Map input to course IDs using the course code, abbreviations (abbr), or full teacher names from the CATALOG.
- Recognize course IDs when mentioned directly (e.g., #83847).
- Be deterministic.`;

    const messages = [
        { role: "system", content: systemPrompt + "\nCATALOG:" + JSON.stringify(CATALOG) },

        // Case: Mix of program-level and course abbreviation
        { role: "user", content: "The Teaching Office sent an email about the final exam for the HCI course." },
        { role: "assistant", content: "[11945, 80158]" },

        // Case: Professor abbreviation and hashtag
        { role: "user", content: "Any updates from -F. Delprino for the #interactionDesign class?" },
        { role: "assistant", content: "[83839]" },

        // Case: Direct ID mention with custom format
        { role: "user", content: "Don't forget to submit the assignment for #GnM_83847 by midnight." },
        { role: "assistant", content: "[83847]" },

        // Case: Generic, program-level question
        { role: "user", content: "What are the deadlines for the study plan submission?" },
        { role: "assistant", content: "[11945]" },

        // Case: Multiple course abbreviations
        { role: "user", content: "The lessons for MCP and WDM are cancelled this week." },
        { role: "assistant", content: "[118885, 90619]" },

        // Your actual input now goes here
        { role: "user", content: inputText }
    ];

    const payload = {
        model: "mistralai/mistral-7b-instruct:free", // Using the new model
        messages,
        max_tokens: 50,
        temperature: 0.0,
        repetition_penalty: 1.05
    };

    const url = "https://openrouter.ai/api/v1/chat/completions";

    try {
        const response = UrlFetchApp.fetch(url, {
            method: "post",
            contentType: "application/json",
            headers: { Authorization: "Bearer " + apiKey },
            payload: JSON.stringify(payload),
            muteHttpExceptions: true,
        });

        const responseText = response.getContentText();

        // **KEY CHANGE**: Added explicit, unmissable logging
        Logger.log("--- START RAW API RESPONSE ---");
        Logger.log(responseText);
        Logger.log("--- END RAW API RESPONSE ---");

        if (response.getResponseCode() !== 200) {
            throw new Error("OpenRouter API request failed with status " + response.getResponseCode() + ": " + responseText);
        }

        const data: OpenRouterResponse = JSON.parse(responseText);

        if (!data.choices || data.choices.length === 0) {
            const apiError = data.error ? `: ${data.error.message}` : '';
            throw new Error(`API did not return valid choices${apiError}`);
        }

        const raw = data.choices[0].message.content.trim();
        Logger.log("--- EXTRACTED 'raw' CONTENT FROM JSON ---");
        Logger.log(raw);
        Logger.log("--- END EXTRACTED 'raw' CONTENT ---");

        let arr: number[];
        try {
            arr = JSON.parse(raw);
            if (!Array.isArray(arr) || !arr.every((id): id is number => typeof id === 'number')) {
                throw new Error('Invalid array content');
            }
        } catch {
            const match = raw.match(/\[[\d,\s]*\]/);
            const arrText = match ? match[0] : "[]";
            arr = JSON.parse(arrText);
        }

        if (arr.length === 0) {
            return [11945]; // Program ID for Digital Humanities
        }

        return arr;
    } catch (error) {
        Logger.log("ERROR in categorizeText: " + getErrorMessage(error));
        throw new Error("Categorization failed: " + getErrorMessage(error));
    }
}