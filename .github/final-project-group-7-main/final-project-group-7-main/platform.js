export default class Platform {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.w = 80;
    this.h = 15;
    this.type = type; // "unbreakable", "breakable", "black", "moving"
    this.broken = false;
    this.dx = type === "moving" ? random(1, 3) : 0; // moving speed
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
