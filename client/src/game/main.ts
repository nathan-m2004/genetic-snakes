import Snake from './Snake'
import Tiles from './Tiles'

export type Frames = {
  animationFrame: number
  currentFrame: number
  lastFrame: number
  deltaTime: number
  gameTick: number
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
  POPULATION_SIZE: number
  globalOpacity: number
  generation: number
  TOURNAMENT_SIZE: number
  ELITISM_SIZE: number
  MUTATION_RATE: number
  constructor(canvas: HTMLCanvasElement) {
    this.TILECOUNT = 10
    this.INTERNAL_WIDTH = 800
    this.INTERNAL_HEIGHT = 800
    this.POPULATION_SIZE = 1000

    this.renderCanvas = canvas
    this.renderCanvasContext = this.renderCanvas.getContext('2d') as CanvasRenderingContext2D
    this.renderCanvasContext.imageSmoothingEnabled = false

    this.canvas = document.createElement('canvas')
    this.canvas.width = this.INTERNAL_WIDTH
    this.canvas.height = this.INTERNAL_HEIGHT
    this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D
    this.context.imageSmoothingEnabled = false

    this.frames = { animationFrame: 0, currentFrame: 0, lastFrame: 0, deltaTime: 0, gameTick: 0.8 }
    this.globalOpacity = 0.5

    this.players = []
    this.tiles = new Tiles(this.canvas, this.context, this.TILECOUNT)
    this.tiles.calculateTiles()

    this.generation = 1
    this.TOURNAMENT_SIZE = 200
    this.ELITISM_SIZE = 10
    this.MUTATION_RATE = 0.02

    for (let i = 0; i < this.POPULATION_SIZE; i++) {
      this.players.push(new Snake(this.TILECOUNT, this.frames, this.generation))
    }
  }
  tournament() {
    let best: Snake | null = null
    for (let i = 0; i < this.TOURNAMENT_SIZE; i++) {
      const randomSnake = this.players[Math.floor(Math.random() * this.POPULATION_SIZE)]

      if (best === null || randomSnake!.score > best.score) {
        best = randomSnake!
      }
    }
    return best!
  }
  nextGeneration() {
    this.generation++
    this.players.sort((a, b) => b.score - a.score)
    let nextGeneration: Snake[] = []

    // ELITISM
    const elitism = this.players.slice(0, this.ELITISM_SIZE)
    elitism.forEach((snake) => {
      const copy = new Snake(this.TILECOUNT, this.frames, this.generation, snake.brain.copy())
      copy.brain.snake = copy
      nextGeneration.push(copy)
      console.log(snake.score)
    })

    for (let i = 0; i < this.POPULATION_SIZE - this.ELITISM_SIZE; i++) {
      const parentA = this.tournament()
      const parentB = this.tournament()

      const childBrain = parentA.brain.crossover(parentB.brain)
      childBrain.mutate(this.MUTATION_RATE)

      const newSnake = new Snake(this.TILECOUNT, this.frames, this.generation, childBrain)
      newSnake.brain.snake = newSnake
      nextGeneration.push(newSnake)
    }

    this.players = nextGeneration
  }
  checkAllDead() {
    const check = this.players.every((snake) => {
      return snake.dead === true
    })
    if (check) {
      this.nextGeneration()
    }
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

    this.checkAllDead()

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.tiles.draw()

    this.players.forEach((player) => {
      this.context.save()
      player.draw(this.canvas, this.context, this.globalOpacity)
      if (!player.dead) {
        player.plant.draw(this.canvas, this.context)
      }
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
