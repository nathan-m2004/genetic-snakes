import Snake from './Snake'
import Tiles from './Tiles'

export type Frames = {
  animationFrame: number
  currentFrame: number
  lastFrame: number
  deltaTime: number
}

export default class Game {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  players: Snake[]
  TILECOUNT: number
  frames: Frames
  tiles: Tiles
  INTERNAL_WIDTH: number
  INTERNAL_HEIGHT: number
  renderCanvas: HTMLCanvasElement
  renderCanvasContext: CanvasRenderingContext2D
  constructor(canvas: HTMLCanvasElement) {
    this.TILECOUNT = 10
    this.INTERNAL_WIDTH = 800
    this.INTERNAL_HEIGHT = 800

    this.renderCanvas = canvas
    this.renderCanvasContext = this.renderCanvas.getContext('2d') as CanvasRenderingContext2D
    this.renderCanvasContext.imageSmoothingEnabled = false

    this.canvas = document.createElement('canvas')
    this.canvas.width = this.INTERNAL_WIDTH
    this.canvas.height = this.INTERNAL_HEIGHT
    this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D
    this.frames = { animationFrame: 0, currentFrame: 0, lastFrame: 0, deltaTime: 0 }

    this.players = [new Snake(this.TILECOUNT, this.frames)]
    this.tiles = new Tiles(this.canvas, this.context, this.TILECOUNT)
    this.tiles.calculateTiles()

    window.addEventListener('keydown', (event) => {
      if (event.code === 'KeyW') {
        this.players[0]?.up()
      } else if (event.code === 'KeyS') {
        this.players[0]?.down()
      } else if (event.code === 'KeyD') {
        this.players[0]?.right()
      } else if (event.code === 'KeyA') {
        this.players[0]?.left()
      }
    })
  }
  start() {
    this.frames.animationFrame = window.requestAnimationFrame((currentFrame) => {
      this.frames.currentFrame = currentFrame
      this.draw()
    })
  }
  stop() {
    this.frames.animationFrame = 0
  }
  draw() {
    this.frames.deltaTime = (this.frames.currentFrame - this.frames.lastFrame) / 1000
    this.frames.lastFrame = this.frames.currentFrame

    this.players.forEach((player) => {
      player.moveTick()
      player.eat()
    })

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.tiles.draw()

    this.players.forEach((player) => {
      this.context.save()
      this.context.globalAlpha = 1
      player.draw(this.canvas, this.context)
      player.plant.draw(this.canvas, this.context)
      this.context.restore()
    })

    this.renderCanvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.renderCanvasContext.drawImage(
      this.canvas,
      0,
      0,
      this.INTERNAL_WIDTH,
      this.INTERNAL_HEIGHT,
      0,
      0,
      this.renderCanvas.width,
      this.renderCanvas.height,
    )

    this.frames.animationFrame = window.requestAnimationFrame((currentFrame) => {
      this.frames.currentFrame = currentFrame
      this.draw()
    })
  }
}
