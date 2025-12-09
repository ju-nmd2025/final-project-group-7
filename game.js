import Player from "./player.js";
import Platform from "./platform.js";

let player;
let platforms = [];
let score = 0;
let gameState = "start";
let playerReadyToJump = false;

const NUM_PLATFORMS = 10;

// ---------------- Setup ----------------
function setup() {
  createCanvas(400, 600);
  initializeGame();
}

// ---------------- Initialize Game ----------------
function initializeGame() {
  platforms = [];
  score = 0;
  playerReadyToJump = false;

  // First grey platform under player
  const firstPlatform = new Platform(width / 2, height - 50, "unbreakable");
  platforms.push(firstPlatform);

  // Player stands on it
  player = new Player(firstPlatform.x, firstPlatform.y - 30 / 2 - firstPlatform.h / 2);

  // Other platforms
  for (let i = 1; i < NUM_PLATFORMS; i++) {
    spawnPlatform();
  }
}

// ---------------- Platform Functions ----------------
function spawnPlatform() {
  let placed = false;
  while (!placed) {
    const px = random(50, width - 50);
    const py = random(50, height - 50);
    const overlaps = platforms.some(p => Math.abs(px - p.x) < 80 && Math.abs(py - p.y) < 50);
    if (!overlaps) {
      const type = selectPlatformType();
      platforms.push(new Platform(px, py, type));
      placed = true;
    }
  }
}

function selectPlatformType() {
  const r = random();
  if (r < 0.1) return "black"; // 10% black breakable
  if (r < 0.25) return "breakable"; // 15% green breakable
  if (r < 0.4) return "moving"; // 15% green moving
  return "unbreakable"; // 60% grey unbreakable
}

function spawnPlatformAbove() {
  const px = random(50, width - 50);
  const py = -20;
  const type = selectPlatformType();
  platforms.push(new Platform(px, py, type));
}

// ---------------- Classes ----------------
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 30;
    this.vx = 0;
    this.vy = 0;
    this.gravity = 0.6;
    this.jumpPower = -12;
    this.speed = 5;
    this.onPlatform = true; // start on first grey platform
  }

  move() {
    if (keyIsDown(LEFT_ARROW)) this.vx = -this.speed;
    else if (keyIsDown(RIGHT_ARROW)) this.vx = this.speed;
    else this.vx = 0;

    this.x += this.vx;
    this.y += this.vy;

    // Apply gravity only if not on grey platform or already jumped
    if (!this.onPlatform || playerReadyToJump) {
      this.vy += this.gravity;
    } else {
      this.vy = 0;
    }

    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
  }

  draw() {
    fill(255, 100, 100);
    ellipse(this.x, this.y, this.size);
  }
}

class Platform {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.w = 80;
    this.h = 15;
    this.type = type;
    this.broken = false;
    this.dx = type === "moving" ? random(1, 3) : 0;
  }

  draw() {
    if (this.type === "unbreakable") fill(150); // grey
    else if (this.type === "breakable") fill(0, 200, 0); // green
    else if (this.type === "black") fill(0); // black
    else fill(0, 200, 0); // moving green
    rectMode(CENTER);
    rect(this.x, this.y, this.w, this.h, 5);
  }
}

// ---------------- Game Loop ----------------
function draw() {
  background(150, 200, 255);

  switch (gameState) {
    case "start": drawStartScreen(); break;
    case "gameover": drawGameOverScreen(); break;
    case "playing": playGame(); break;
  }
}

// ---------------- Screens ----------------
function drawStartScreen() {
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(30);
  text("Press ENTER to Start", width / 2, height / 2);
}

function drawGameOverScreen() {
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(35);
  text("GAME OVER!", width / 2, height / 2 - 30);
  textSize(20);
  text(`Score: ${score}`, width / 2, height / 2 + 10);
  text("Press ENTER to Replay", width / 2, height / 2 + 50);
}

// ---------------- Game Mechanics ----------------
function playGame() {
  player.move();
  if (playerReadyToJump) {
    scrollScreen();
    handleCollisions();
    updatePlatforms();
  }

  drawPlatforms();
  player.draw();

  fill(0);
  textSize(20);
  text(`Score: ${score}`, 20, 30);

  if (!playerReadyToJump) {
    fill(0);
    textSize(16);
    textAlign(CENTER, CENTER);
    text("Press UP to Jump", width / 2, height / 2 - 50);
  }
}

function scrollScreen() {
  if (player.y < height / 2) {
    const diff = height / 2 - player.y;
    player.y = height / 2;

    platforms.forEach(p => {
      p.y += diff;
    });

    score += Math.floor(diff);
  }
}

// ---------------- Collision Handling ----------------
function handleCollisions() {
  player.onPlatform = false;

  platforms.forEach(p => {
    if (
      player.vy >= 0 &&
      player.x > p.x - p.w / 2 &&
      player.x < p.x + p.w / 2 &&
      player.y + player.size / 2 >= p.y - p.h / 2 &&
      player.y + player.size / 2 <= p.y + p.h / 2
    ) {
      if (p.type === "unbreakable") {
        player.onPlatform = true;
        player.vy = 0;
        player.y = p.y - player.size / 2 - p.h / 2; // snap to grey platform
      } else if (p.type === "breakable" || p.type === "black") {
        player.vy = 0;
        p.broken = true; // green or black platform breaks
      } else if (p.type === "moving") {
        player.vy = 0;
        player.x += p.dx; // move with moving platform
      }
    }
  });

  if (player.y > height + 100) gameState = "gameover";
}

// ---------------- Platform Updates ----------------
function updatePlatforms() {
  platforms.forEach(p => {
    if (p.type === "moving") {
      p.x += p.dx;
      if (p.x < 0 || p.x > width) p.dx *= -1;
    }
    if ((p.type === "breakable" || p.type === "black") && p.broken) {
      p.y += 5;
    }
  });

  for (let i = platforms.length - 1; i >= 0; i--) {
    if (platforms[i].y > height + 40) {
      platforms.splice(i, 1);
      spawnPlatformAbove();
    }
  }
}

function drawPlatforms() {
  platforms.forEach(p => p.draw());
}

// ---------------- Controls ----------------
function keyPressed() {
  if ((gameState === "start" || gameState === "gameover") && keyCode === ENTER) {
    initializeGame();
    gameState = "playing";
  }

  if (gameState === "playing" && keyCode === UP_ARROW) {
    if (!playerReadyToJump) {
      playerReadyToJump = true;
      player.vy = player.jumpPower;
    } else if (player.onPlatform) {
      player.vy = player.jumpPower;
      player.onPlatform = false;
    }
  }
}


