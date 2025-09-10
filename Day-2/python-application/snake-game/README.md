# Snake Game with Flask and Docker - Teaching Notes

This document explains the **Snake Game project**, how the code works at a high level, and how to run it both **locally** and **inside Docker**. 

---

## 1. High-Level Code Explanation

### Backend (Flask - `app.py`)
- We use **Flask**, a lightweight Python web framework.
- `app.py` defines one route (`/`) that returns `index.html` from the `templates` folder.
- Flask only serves the HTML page; all game logic is in JavaScript.

### Frontend (HTML + JavaScript - `index.html`)
- The `<canvas>` element (600x600) is used to draw the Snake game graphics.
- **Snake logic**:
  - Snake starts with one green square (head) and grows when it eats food.
  - Food is randomly placed (red square).
  - Arrow keys control the direction.
  - Every 100ms, the screen updates (`setInterval(draw, 100)`).
  - Game ends if the snake hits the wall or itself.
- On Game Over:
  - Confetti bursts 🎉 (via `canvas-confetti` library).
  - A popup alert shows "Game Over! 🎉".

### Requirements
- Only one Python dependency: **Flask**.
- Everything else (canvas, JS) is in the browser.

---

## 2. Running Without Docker (Local Machine)

1. **Install dependencies**:
   ```bash
   pip install flask
   ```

2. **Run Flask app**:
   ```bash
   python app.py
   ```

3. **Open in browser**:
   - Navigate to: [http://localhost:5000](http://localhost:5000)
   - You will see the Snake game running directly.

---

## 3. Running With Docker

1. **Build Docker image**:
   ```bash
   docker build -t snake-game .
   ```

2. **Run a container**:
   ```bash
   docker run -d -p 5000:5000 snake-game
   ```

3. **Open in browser**:
   - Navigate to: [http://localhost:5000](http://localhost:5000)
   - The game runs the same way, but inside a container.

---

## 4. Summary Points

- **Without Docker**: You need to install Python, Flask locally. The app depends on your system setup.
- **With Docker**: The image contains everything (Python, Flask, app code). It runs consistently across any environment.

---

## 5. Demo Flow for Training

1. Show the code structure (`app.py`, `templates/index.html`, `Dockerfile`).
2. Explain Flask = serves HTML, JS = game logic.
3. Run locally → `python app.py`, open browser.
4. Build Docker image → `docker build ...`
5. Run Docker container → `docker run ...`
6. Open browser → same game, but isolated in Docker.
7. Conclude: Docker makes apps portable, repeatable, and environment-independent.

---