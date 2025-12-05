// Player.js
export default class Player {
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
    // Horizontal movement
    if (keyIsDown(LEFT_ARROW)) this.vx = -this.speed;
    else if (keyIsDown(RIGHT_ARROW)) this.vx = this.speed;
    else this.vx = 0;

    this.x += this.vx;
    this.y += this.vy;

    // Apply gravity if not standing on grey platform or already jumped
    if (!this.onPlatform || playerReadyToJump) {
      this.vy += this.gravity;
    } else {
      this.vy = 0;
    }

    // Screen wrap
    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
  }

  draw() {
    fill(255, 100, 100);
    ellipse(this.x, this.y, this.size);
  }
}
