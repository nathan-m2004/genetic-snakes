import getRandomInt, { SeededRandom } from './utils'

export default class Plant {
  TILECOUNT: number
  seededGenerator: SeededRandom
  position: { x: number; y: number }
  color: string
  constructor(TILECOUNT: number) {
    this.TILECOUNT = TILECOUNT

    this.seededGenerator = new SeededRandom(123)
    this.position = {
      x: this.seededGenerator.nextInt(0, this.TILECOUNT - 1),
      y: this.seededGenerator.nextInt(0, this.TILECOUNT - 1),
    }
    this.color = `hsl(${this.seededGenerator.nextInt(0, 360)}, 20%, 50%)`
  }
  newPosition() {
    this.position = {
      x: this.seededGenerator.nextInt(0, this.TILECOUNT - 1),
      y: this.seededGenerator.nextInt(0, this.TILECOUNT - 1),
    }
    this.color = `hsl(${this.seededGenerator.nextInt(0, 360)}, 20%, 50%)`
  }
  draw(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    const xSize = canvas.width / this.TILECOUNT
    const ySize = canvas.height / this.TILECOUNT
    context.fillStyle = this.color
    context.fillRect(this.position.x * xSize, this.position.y * ySize, xSize, ySize)
  }
}
