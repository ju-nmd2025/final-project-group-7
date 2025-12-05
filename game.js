let player;
let platforms = [];
let score = 0;
let gameState = "start"; // start, playing, gameover

const NUM_PLATFORMS = 10;

function setup() {
  createCanvas(400, 600);
  startGame();
}

function startGame() {
  // Player
  player = {
    x: width / 2,
    y: height - 80,
    size: 40,
    vy: -10,
    gravity: 0.3,
    jumpPower: -10,
    springPower: -20, // boosted jump for springs
  };

  // RANDOMIZED + NON-OVERLAPPING PLATFORMS
  platforms = [];

  for (let i = 0; i < NUM_PLATFORMS; i++) {
    let placed = false;

    while (!placed) {
      let px = random(50, width - 50);
      let py = random(50, height - 50);

      let overlapping = false;

      // Check overlap
      for (let p of platforms) {
        if (abs(px - p.x) < 80 && abs(py - p.y) < 50) {
          overlapping = true;
          break;
        }
      }

      if (!overlapping) {
        generatePlatform(px, py);
        placed = true;
      }
    }
  }

  score = 0;
}

function generatePlatform(x, y) {
  const r = random();

  let type = "normal";

  // Increased breaking probability
  if (r < 0.35) type = "breaking";
  else if (r < 0.5) type = "moving";

  // Add the platform
  let platform = {
    x: x,
    y: y,
    w: 70,
    h: 15,
    type: type,
    dx: type === "moving" ? random(1, 2) : 0,
    broken: false,
    spring: null, // NEW: spring object attachment
  };

  // --- SPRING LOGIC ---
  // Springs only appear when height is NOT even
  // AND platform is not breaking
  if (y % 2 !== 0 && type !== "breaking") {
    if (random() < 0.4) {
      // 40% chance to have a spring
      platform.spring = {
        x: x,
        y: y - 15, // drawn above platform
        size: 20,
        used: false,
      };
    }
  }

  platforms.push(platform);
}

function draw() {
  background(150, 200, 255);

  if (gameState === "start") {
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(30);
    text("Press ENTER to Start", width / 2, height / 2);
    return;
  }

  if (gameState === "gameover") {
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(35);
    text("GAME OVER!", width / 2, height / 2 - 30);

    textSize(20);
    text("Score: " + score, width / 2, height / 2 + 10);
    text("Press ENTER to Replay", width / 2, height / 2 + 50);
    return;
  }

  updatePlayer();
  updatePlatforms();
  drawPlatforms();
  drawPlayer();

  fill(0);
  textSize(20);
  text("Score: " + score, 20, 30);
}

function updatePlayer() {
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) player.x -= 5;
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) player.x += 5;

  if (player.x < 0) player.x = width;
  if (player.x > width) player.x = 0;

  player.vy += player.gravity;
  player.y += player.vy;

  if (player.y < height / 2) {
    let diff = height / 2 - player.y;
    player.y = height / 2;

    for (let p of platforms) {
      p.y += diff;
      if (p.spring) p.spring.y += diff;
    }

    score += Math.floor(diff);
  }

  // PLATFORM + SPRING COLLISIONS
  for (let p of platforms) {
    // --- SPRING COLLISION ----
    if (p.spring && !p.spring.used) {
      if (
        dist(player.x, player.y + player.size / 2, p.spring.x, p.spring.y) <
          30 &&
        player.vy > 0
      ) {
        player.vy = player.springPower; // BIG jump
        p.spring.used = true;
      }
    }

    // --- PLATFORM COLLISION ---
    if (
      player.vy > 0 &&
      player.x > p.x - p.w / 2 &&
      player.x < p.x + p.w / 2 &&
      player.y + player.size / 2 > p.y - p.h / 2 &&
      player.y + player.size / 2 < p.y + p.h / 2
    ) {
      if (p.type === "breaking") {
        if (!p.broken) p.broken = true;
      } else {
        player.vy = player.jumpPower;
      }
    }
  }

  if (player.y > height + 100) {
    gameState = "gameover";
  }
}

function updatePlatforms() {
  for (let p of platforms) {
    if (p.type === "moving") {
      p.x += p.dx;
      if (p.x < 0 || p.x > width) p.dx *= -1;
      if (p.spring) p.spring.x = p.x;
    }

    if (p.type === "breaking" && p.broken) {
      p.y += 5;
      if (p.spring) p.spring.y += 5;
    }
  }

  for (let i = platforms.length - 1; i >= 0; i--) {
    if (platforms[i].y > height + 40) {
      platforms.splice(i, 1);
      generatePlatform(random(50, width - 50), -20);
    }
  }
}

function drawPlatforms() {
  rectMode(CENTER);

  for (let p of platforms) {
    if (p.type === "normal") fill(120, 70, 0);
    else if (p.type === "moving") fill(80, 180, 255);
    else if (p.type === "breaking") fill(255, 50, 50);

    if (p.broken) fill(100);

    rect(p.x, p.y, p.w, p.h);

    // DRAW SPRING
    if (p.spring && !p.spring.used) {
      fill(0, 255, 0);
      ellipse(p.spring.x, p.spring.y, p.spring.size, p.spring.size * 0.6);
    }
  }
}

function drawPlayer() {
  fill(0, 200, 0);
  ellipse(player.x, player.y, player.size);
}

function keyPressed() {
  if (keyCode === ENTER) {
    if (gameState === "start" || gameState === "gameover") {
      startGame();
      gameState = "playing";
    }
  }
}
