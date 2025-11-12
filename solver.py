"""
Problem Solver Tool
===================

A lightweight background Python application that allows a user to select a
screen area, extract text via OCR, send it to an LLM, and display the
response as a floating tooltip.

Core Features:
- Hotkey-driven screen region capture.
- OCR text extraction from the captured region.
- Prioritized multi-model requests to the OpenRouter API.
- Floating tooltip display for LLM responses.
- System tray icon for pausing, resuming, and exiting the application.
"""
import json
import mss
import os
import pyautogui
import pytesseract
import requests
import sys
import threading
import tkinter as tk
from pynput import keyboard
from PIL import Image
from pystray import Icon, MenuItem, Menu

# --- Global State ---
# A dictionary to manage the application's state, such as capture coordinates and pause status.
capture_state = {
    "start_pos": None,
    "end_pos": None,
    "paused": False
}

# --- Core Functions ---

def load_config():
    """
    Loads the configuration from 'config.json'.
    The application will exit if the file is not found or is malformed.
    """
    try:
        with open("config.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        print("Error: config.json not found. Please create one from the template.", file=sys.stderr)
        sys.exit(1)
    except json.JSONDecodeError:
        print("Error: Could not decode config.json. Please check its format.", file=sys.stderr)
        sys.exit(1)

def show_tooltip(text, duration_ms):
    """
    Displays a floating tooltip with the given text near the mouse cursor.

    Args:
        text (str): The text to display in the tooltip.
        duration_ms (int): How long the tooltip should be visible in milliseconds.
    """
    root = tk.Tk()
    root.overrideredirect(True)  # Borderless window
    root.attributes("-topmost", True)  # Always on top
    root.attributes("-alpha", 0.9)  # Slightly transparent

    label = tk.Label(root, text=text, bg="#FFFFE0", fg="black", relief="solid",
                      borderwidth=1, font=("Arial", 10), wraplength=400, justify="left",
                      padx=10, pady=5)
    label.pack()

    x, y = pyautogui.position()
    root.geometry(f"+{x + 15}+{y + 15}")  # Position slightly offset from cursor

    root.after(duration_ms, root.destroy)
    root.mainloop()

def ask_openrouter(text, config):
    """
    Sends the extracted text to the OpenRouter API and returns the response.
    It iterates through the prioritized list of models from the config file.

    Args:
        text (str): The text prompt to send to the LLM.
        config (dict): The application's configuration dictionary.

    Returns:
        str: The content of the LLM's response, or "-" on failure.
    """
    api_key = config.get("api_key")
    models = config.get("models", [])

    if not api_key or "YOUR_OPENROUTER_API_KEY" in api_key:
        print("Error: API key not configured in config.json.", file=sys.stderr)
        return "-"
    if not models:
        print("Error: No models specified in config.json.", file=sys.stderr)
        return "-"

    for model in models:
        try:
            print(f"Trying model: {model}...")
            response = requests.post(
                url="https://openrouter.ai/api/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}"},
                json={"model": model, "messages": [{"role": "user", "content": text}]},
                timeout=15
            )
            response.raise_for_status()
            data = response.json()
            return data['choices'][0]['message']['content'].strip()
        except requests.exceptions.RequestException as e:
            print(f"Failed to get response from {model}: {e}", file=sys.stderr)
            continue

    print("All models failed.", file=sys.stderr)
    return "-"

def capture_and_ocr():
    """
    Captures the screen region defined by the start and end positions,
    performs OCR on it, and returns the extracted text.

    Returns:
        str: The extracted text, or an empty string if capture is invalid or OCR fails.
    """
    start_pos, end_pos = capture_state["start_pos"], capture_state["end_pos"]
    if not all([start_pos, end_pos]):
        return ""

    bbox = {
        "left": min(start_pos[0], end_pos[0]),
        "top": min(start_pos[1], end_pos[1]),
        "width": abs(start_pos[0] - end_pos[0]),
        "height": abs(start_pos[1] - end_pos[1])
    }
    if bbox["width"] == 0 or bbox["height"] == 0:
        return ""

    try:
        with mss.mss() as sct:
            sct_img = sct.grab(bbox)
            img = Image.frombytes("RGB", sct_img.size, sct_img.bgra, "raw", "BGRX")
            return pytesseract.image_to_string(img).strip()
    except Exception as e:
        print(f"An error occurred during screen capture or OCR: {e}", file=sys.stderr)
        return ""

# --- Hotkey and Tray Icon Logic ---

def on_start_capture():
    """Callback function for the 'start capture' hotkey."""
    if not capture_state["paused"]:
        capture_state["start_pos"] = pyautogui.position()
        print(f"Capture start position set: {capture_state['start_pos']}")

def on_end_capture_factory(config):
    """
    Factory to create a configured on_end_capture handler.
    This allows the callback to have access to the application config.
    """
    def on_end_capture():
        if capture_state["paused"] or not capture_state["start_pos"]:
            return

        capture_state["end_pos"] = pyautogui.position()
        print(f"Capture end position set: {capture_state['end_pos']}")

        extracted_text = capture_and_ocr()
        duration_ms = config.get("tooltip_duration_ms", 5000)

        def task():
            if extracted_text:
                answer = ask_openrouter(extracted_text, config)
                show_tooltip(answer, duration_ms)
            else:
                # Show a brief error indicator if no text was found
                show_tooltip("-", 1000)

        # Run OCR/API calls in a separate thread to keep the UI responsive
        threading.Thread(target=task).start()

        # Reset for the next capture
        capture_state["start_pos"] = None
        capture_state["end_pos"] = None

    return on_end_capture

def setup_tray(listener):
    """
    Creates and runs the system tray icon in a separate thread.
    """
    # pystray requires an image. A simple black square will suffice.
    image = Image.new("RGB", (64, 64), "black")

    def on_toggle_pause(icon, item):
        capture_state["paused"] = not item.checked
        print(f"Application {'paused' if capture_state['paused'] else 'resumed'}.")

    def on_exit(icon, item):
        print("Exiting application...")
        listener.stop()
        icon.stop()
        os._exit(0)  # Force exit to ensure all threads are terminated

    icon = Icon(
        "ProblemSolver",
        image,
        "Problem Solver Tool",
        menu=Menu(
            MenuItem("Pause/Resume", on_toggle_pause, checkable=True, checked=False),
            MenuItem("Exit", on_exit)
        )
    )
    icon.run()

def main():
    """
    Main function to initialize and run the application.
    """
    config = load_config()

    try:
        start_hotkey = keyboard.HotKey.parse(config["hotkeys"]["start_capture"])
        end_hotkey = keyboard.HotKey.parse(config["hotkeys"]["end_capture"])
    except (ValueError, KeyError) as e:
        print(f"Invalid hotkey configuration in config.json: {e}", file=sys.stderr)
        sys.exit(1)

    on_end_capture = on_end_capture_factory(config)

    def on_press(key):
        # Using a simple dispatcher for pressed keys
        if key == start_hotkey:
            on_start_capture()
        elif key == end_hotkey:
            on_end_capture()

    listener = keyboard.Listener(on_press=on_press)
    listener.start()

    # The tray icon must run in a separate thread to be non-blocking
    tray_thread = threading.Thread(target=setup_tray, args=(listener,))
    tray_thread.daemon = True
    tray_thread.start()

    print("Problem Solver Tool is running in the background. Use the tray icon to exit.")
    listener.join()

if __name__ == "__main__":
    # Check for Tesseract installation before starting
    try:
        pytesseract.get_tesseract_version()
    except pytesseract.TesseractNotFoundError:
        print("Tesseract is not installed or not in your PATH.", file=sys.stderr)
        print("Please install it from: https://github.com/tesseract-ocr/tesseract", file=sys.stderr)
        sys.exit(1)

    main()
