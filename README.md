# Problem Solver Tool

A lightweight background Python application that allows a user to select a screen area, extract text via OCR, send it to an LLM, and display the response as a floating tooltip.

## Features

- **Hotkey-Driven Capture**: No visible UI. Use hotkeys to define the start and end of your capture area.
- **OCR Text Extraction**: Uses Tesseract to accurately extract text from any region of your screen.
- **Flexible LLM Integration**: Connects to the OpenRouter API, allowing you to use a prioritized list of different models.
- **Floating Tooltip**: Displays the LLM's answer in a discreet, auto-closing tooltip near your cursor.
- **Background Operation**: Runs silently in the system tray with options to pause, resume, or exit.

## Prerequisites

1.  **Python 3.7+**: Ensure you have Python installed.
2.  **Tesseract OCR**: This tool depends on Google's Tesseract OCR engine. You must install it on your system and ensure it's in your system's PATH.
    -   **Windows**: Download and run the installer from [Tesseract at UB Mannheim](https://github.com/UB-Mannheim/tesseract/wiki).
    -   **macOS (via Homebrew)**: `brew install tesseract`
    -   **Linux (Debian/Ubuntu)**: `sudo apt-get install tesseract-ocr`

## Setup and Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository_url>
    cd problem-solver-tool
    ```

2.  **Install Python dependencies**:
    It's recommended to use a virtual environment.
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    pip install -r requirements.txt
    ```

3.  **Configure the application**:
    -   Rename `config.template.json` to `config.json`.
    -   Open `config.json` and add your **OpenRouter API key**.
    -   Customize the `models` list (from most to least preferred) and hotkeys if desired.

## How to Run

Execute the main script from your terminal:
```bash
python solver.py
```
The application will start running in the background. You will see a new icon in your system tray.

## How to Use

1.  Press the "start capture" hotkey (default: `<ctrl>+<alt>+1`).
2.  Move your mouse to the end position of the desired capture area.
3.  Press the "end capture" hotkey (default: `<ctrl>+<alt>+2`).
4.  The script will capture the screen region, extract text, and query the LLM.
5.  A tooltip with the answer will appear near your cursor.

To stop the application, right-click the tray icon and select "Exit".
