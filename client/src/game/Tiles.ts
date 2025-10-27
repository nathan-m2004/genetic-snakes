export default class Tiles {
  TILECOUNT: number
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  tile: { x: number; y: number; width: number; height: number; color: string }[]
  constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, TILECOUNT: number) {
    this.canvas = canvas
    this.context = context

    this.TILECOUNT = TILECOUNT
    this.tile = []
  }
  calculateTiles() {
    const xSize = this.canvas.width / this.TILECOUNT
    const ySize = this.canvas.height / this.TILECOUNT
    for (let y = 0; y < this.TILECOUNT; y++) {
      for (let x = 0; x < this.TILECOUNT; x++) {
        this.tile.push({
          x: xSize * x,
          y: ySize * y,
          width: xSize,
          height: ySize,
          color: (x + y) % 2 === 0 ? 'hsla(191, 0%, 10%, 1)' : 'hsla(0, 0%, 8%, 1)',
        })
      }
    }
  }
  draw() {
    this.tile.forEach((tile) => {
      this.context.fillStyle = tile.color
      this.context.fillRect(tile.x, tile.y, tile.width, tile.height)
    })
  }
}
