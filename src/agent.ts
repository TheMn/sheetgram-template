import { getErrorMessage } from "./helpers";

// Define a type for the expected API response to improve type safety
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

    // ... [CATALOG, systemPrompt, messages, and payload remain exactly the same] ...
    const CATALOG = {
        program: { id: 11945, title: "Digital Humanities - Interactive Systems and Digital Media (Master)", coordinator: "Ilaria Torre" },
        courses: [
            { id: 111193, code: "DATA SEMANTICS FOR ARTS", teachers: ["Ilaria Torre"] },
            { id: 80158, code: "HUMAN COMPUTER INTERACTION", teachers: ["Antonio Camurri"] },
            { id: 86798, code: "MACHINE LEARNING AND DEEP LEARNING", teachers: ["Luca Oneto", "Davide Anguita"] },
            { id: 90689, code: "IMAGE AND VIDEO PROCESSING", teachers: ["Eleonora Ceccaldi", "Annalisa Barla"] },
            { id: 90690, code: "SOUND AND MUSIC COMPUTING", teachers: ["Gualtiero Volpe"] },
            { id: 90621, code: "MULTIMODAL NARRATIVES", teachers: ["Nicola Ferrari"] },
            { id: 111363, code: "PSYCHOLOGY OF PERCEPTION", teachers: ["Eleonora Ceccaldi"] },
            { id: 104904, code: "RESEARCH METHODS IN SOCIAL SCIENCE", teachers: ["Enrico By Bella"] },
            { id: 118898, code: "DESIGN AND NARRATIVE" },
            { id: 83839, code: "INTERACTION DESIGN", teachers: ["Federica Delprino", "Maria Morozzo..."] },
            { id: 83847, code: "GRAPHICS AND MULTIMEDIA", teachers: ["Massimo Malagugini"] },
            { id: 90619, code: "WRITING FOR DIGITAL MEDIA", teachers: ["Jacqueline Visconti", "Manuela Manfredini"] },
            { id: 111194, code: "VISUAL SEMIOTICS", teachers: ["Rocco Antonucci"] },
            { id: 118885, code: "MEDIA CONTENT PRODUCTION", teachers: ["Saverio Iacono"] }
        ]
    };

    const systemPrompt = `
You are an academic categorization agent. 
Return ONLY a JSON array of numeric course IDs (e.g. [118885, 86798]).
- No prose, no code fences, no comments. 
- If input is program-level (mentions "master", "degree", "study plan", "Teaching Office", "AulaWeb", "class schedule", "program", etc.) → include program id 11945. 
- Use course names or professor names from the CATALOG to map to ids.
- Be deterministic.`;

    const messages = [
        { role: "system", content: systemPrompt + "\nCATALOG:" + JSON.stringify(CATALOG) },
        { role: "user", content: "There’s no general MS-Teams channel for the Digital Humanities master; updates come by email from the Teaching Office and the university, not from AulaWeb. The ML course only needs the provided meeting link." },
        { role: "assistant", content: "[11945, 86798]" },
        { role: "user", content: "PDF version of class schedule exported from easyacademy ... Mandatory: IMAGE AND VIDEO PROCESSING, INTERACTION DESIGN, MEDIA CONTENT PRODUCTION" },
        { role: "assistant", content: "[11945]" },
        { role: "user", content: "the mcp course is not going to be held this week" },
        { role: "assistant", content: "[118885]" },
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

        return arr;
    } catch (error) {
        Logger.log("ERROR in categorizeText: " + getErrorMessage(error));
        throw new Error("Categorization failed: " + getErrorMessage(error));
    }
}