"""
FinTrack One-Click Launcher
Starts the Flask server and opens the web application in your default browser.
"""

import webbrowser
import threading
import time
from app import app

def open_browser():
    time.sleep(1.2)
    webbrowser.open("http://127.0.0.1:5000")

if __name__ == "__main__":
    print("\n[FinTrack.ai] Starting server and launching browser...")
    threading.Thread(target=open_browser, daemon=True).start()
    app.run(host="127.0.0.1", port=5000, debug=False)