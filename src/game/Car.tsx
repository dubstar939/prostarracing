export class Car {
  model: string;
  spritesheet: HTMLImageElement;
  data: any;
  currentFrame: string;
  controls: { left: boolean; right: boolean };

  constructor(model: string, spritesheet: HTMLImageElement, data: any) {
    this.model = model;
    this.spritesheet = spritesheet;
    this.data = data;
    this.currentFrame = `${model}_front`;
    this.controls = { left: false, right: false };

    // Listen for keys
    window.addEventListener('keydown', (e) => this.handleKey(e, true));
    window.addEventListener('keyup', (e) => this.handleKey(e, false));
  }

  handleKey(e: KeyboardEvent, isDown: boolean) {
    if (e.key === 'ArrowLeft') this.controls.left = isDown;
    if (e.key === 'ArrowRight') this.controls.right = isDown;
  }

  update() {
    // Logic to swap frames based on input
    if (this.controls.left) {
      this.currentFrame = `${this.model}_drift_l`;
    } else if (this.controls.right) {
      this.currentFrame = `${this.model}_drift_r`;
    } else {
      this.currentFrame = `${this.model}_front`;
    }
  }

  draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const frame = this.data.frames[this.currentFrame];
    if (!frame) return;

    // Draw the car centered at (x, y)
    // ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
    ctx.drawImage(
      this.spritesheet,
      frame.x,
      frame.y,
      frame.w,
      frame.h,
      x - (frame.w * 2) / 2, // Scale up by 2 for visibility
      y - (frame.h * 2) / 2,
      frame.w * 2,
      frame.h * 2
    );
  }
}
