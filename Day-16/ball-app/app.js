
(() => {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  const W = canvas.width;
  const H = canvas.height;

  // Game state
  let running = false;
  let score = 0;

  // Ball (slightly smaller to fit)
  const ball = {
    x: W / 2,
    y: H * 0.3,
    r: 8,
    vx: 4,
    vy: 5
  };

  // Paddle
  const paddle = {
    w: 100,
    h: 14,
    x: W / 2 - 50,
    y: H - 30,
    speed: 10
  };

  // Input
  let leftPressed = false;
  let rightPressed = false;

  // Confetti
  let confetti = [];
  function spawnConfetti(count = 120) {
    confetti = [];
    for (let i = 0; i < count; i++) {
      confetti.push({
        x: W / 2,
        y: H / 2,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.8) * 10 - 2,
        size: 3 + Math.random() * 4,
        rotation: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.2,
        life: 90 + Math.random() * 60,
        color: `hsl(${Math.floor(Math.random() * 360)}, 85%, 60%)`
      });
    }
  }
  function updateConfetti(){
    for (let i = confetti.length - 1; i >= 0; i--) {
      const p = confetti[i];
      p.vy += 0.15;
      p.x += p.vx; p.y += p.vy; p.rotation += p.vr; p.life -= 1;
      if (p.y > H + 40 || p.life <= 0) confetti.splice(i, 1);
    }
  }
  function drawConfetti(){
    ctx.save();
    confetti.forEach(p => {
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size * 2);
      ctx.setTransform(1,0,0,1,0,0);
    });
    ctx.restore();
  }

  function reset() {
    score = 0;
    ball.x = W / 2;
    ball.y = H * 0.3;
    ball.vx = Math.random() > 0.5 ? 4 : -4;
    ball.vy = 5;
    paddle.x = W / 2 - paddle.w / 2;
    running = true;
    setStatus("Playing…");
    document.getElementById("score").textContent = `Score: ${score}`;
  }

  function setStatus(t) {
    document.getElementById("status").textContent = t || "";
  }

  function drawBall() {
    ctx.beginPath();
    const grad = ctx.createRadialGradient(ball.x - ball.r/2, ball.y - ball.r/2, 2, ball.x, ball.y, ball.r);
    grad.addColorStop(0, "#fef3c7");
    grad.addColorStop(1, "#f59e0b");
    ctx.fillStyle = grad;
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }

  function drawPaddle() {
    ctx.beginPath();
    const rx = paddle.x, ry = paddle.y, rw = paddle.w, rh = paddle.h, r = 8;
    ctx.moveTo(rx + r, ry);
    ctx.lineTo(rx + rw - r, ry);
    ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + r);
    ctx.lineTo(rx + rw, ry + rh - r);
    ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - r, ry + rh);
    ctx.lineTo(rx + r, ry + rh);
    ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - r);
    ctx.lineTo(rx, ry + r);
    ctx.quadraticCurveTo(rx, ry, rx + r, ry);
    ctx.closePath();
    const grad = ctx.createLinearGradient(rx, ry, rx, ry + rh);
    grad.addColorStop(0, "#60a5fa");
    grad.addColorStop(1, "#1d4ed8");
    ctx.fillStyle = grad;
    ctx.fill();
  }

  function drawHUD() {
    ctx.beginPath();
    ctx.moveTo(0, 60);
    ctx.lineTo(W, 60);
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function update() {
    // update confetti even when paused/over
    updateConfetti();
    if (!running) return;

    if (leftPressed) paddle.x -= paddle.speed;
    if (rightPressed) paddle.x += paddle.speed;
    paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x));

    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.x - ball.r <= 0 || ball.x + ball.r >= W) {
      ball.vx *= -1;
      ball.x = Math.max(ball.r, Math.min(W - ball.r, ball.x));
    }
    if (ball.y - ball.r <= 0) {
      ball.vy *= -1;
      ball.y = ball.r;
      score += 1;
      document.getElementById("score").textContent = `Score: ${score}`;
    }

    if (
      ball.y + ball.r >= paddle.y &&
      ball.y + ball.r <= paddle.y + paddle.h + Math.abs(ball.vy) &&
      ball.x >= paddle.x &&
      ball.x <= paddle.x + paddle.w
    ) {
      const hit = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
      const maxBounce = Math.PI / 3;
      const angle = hit * maxBounce;
      const speed = Math.hypot(ball.vx, ball.vy) * 1.03;
      ball.vx = speed * Math.sin(angle);
      ball.vy = -Math.abs(speed * Math.cos(angle));
      ball.y = paddle.y - ball.r - 0.1;
    }

    if (ball.y - ball.r > H) {
      running = false;
      setStatus("Game Over. Press Start to play again.");
      spawnConfetti();
    }
  }

  function render() {
    ctx.clearRect(0, 0, W, H);
    drawHUD();
    drawPaddle();
    drawBall();
    drawConfetti();
  }

  function loop() {
    update();
    render();
    requestAnimationFrame(loop);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") leftPressed = true;
    if (e.key === "ArrowRight") rightPressed = true;
  });
  document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") leftPressed = false;
    if (e.key === "ArrowRight") rightPressed = false;
  });

  const pointerMove = (clientX) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * W;
    paddle.x = x - paddle.w / 2;
    paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x));
  };
  canvas.addEventListener("mousemove", (e) => pointerMove(e.clientX));
  canvas.addEventListener("touchmove", (e) => {
    if (e.touches && e.touches[0]) {
      pointerMove(e.touches[0].clientX);
      e.preventDefault();
    }
  }, { passive: false });

  document.getElementById("startBtn").addEventListener("click", () => reset());
  document.getElementById("pauseBtn").addEventListener("click", () => {
    running = !running;
    setStatus(running ? "Playing…" : "Paused");
  });

  loop();
})();
