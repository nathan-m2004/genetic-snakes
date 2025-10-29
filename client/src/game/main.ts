import JSZip from 'jszip'
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
  showBest: boolean
  best_size: number
  replay: boolean
  replayPlayers: Snake[]
  runNoDraw: boolean
  currentBestScore: number
  exportCanvas: HTMLCanvasElement
  exportCanvasContext: CanvasRenderingContext2D
  saveGeneration: boolean
  zip: JSZip
  generationsToSave: number
  isProcessingGeneration: boolean
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
    this.context.imageSmoothingEnabled = false

    this.exportCanvas = document.createElement('canvas')
    this.exportCanvas.width = this.INTERNAL_WIDTH
    this.exportCanvas.height = this.INTERNAL_HEIGHT
    this.exportCanvasContext = this.exportCanvas.getContext('2d') as CanvasRenderingContext2D
    this.exportCanvasContext.imageSmoothingEnabled = false

    this.frames = { animationFrame: 0, currentFrame: 0, lastFrame: 0, deltaTime: 0, gameTick: 0.8 }
    this.globalOpacity = 0.5

    this.players = []
    this.tiles = new Tiles(this.canvas, this.context, this.TILECOUNT)
    this.tiles.calculateTiles()

    this.generation = 1
    this.POPULATION_SIZE = 1000
    this.TOURNAMENT_SIZE = 150
    this.ELITISM_SIZE = 20
    this.MUTATION_RATE = 0.002

    this.best_size = 1
    this.replay = false
    this.replayPlayers = []
    this.showBest = false

    this.currentBestScore = 0

    this.runNoDraw = false

    this.saveGeneration = true
    this.generationsToSave = 10
    this.isProcessingGeneration = false
    this.zip = new JSZip()

    for (let i = 0; i < this.POPULATION_SIZE; i++) {
      this.players.push(new Snake(this.TILECOUNT, this.frames, this.generation))
    }
  }
  tournament() {
    let best: Snake | null = null
    for (let i = 0; i < this.TOURNAMENT_SIZE; i++) {
      const randomSnake = this.players[Math.floor(Math.random() * this.POPULATION_SIZE)]

      if (best === null || randomSnake!.fitness > best.fitness) {
        best = randomSnake!
      }
    }
    return best!
  }
  async saveSnakeFiles() {
    this.isProcessingGeneration = true
    const savePromise = this.players.map(async (player, index) => {
      const [mainFile, brain, pngBlob] = await player.save(
        index,
        this.generation - 1,
        this.renderCanvas,
        this.renderCanvasContext,
      )

      this.zip.file(`gen${this.generation - 1}/${index}.json`, JSON.stringify(mainFile))
      this.zip.file(`gen${this.generation - 1}/${index}_brain.json`, JSON.stringify(brain))
      if (typeof pngBlob !== 'undefined' && pngBlob !== null) {
        this.zip.file(`gen${this.generation - 1}/${index}.png`, pngBlob as Blob)
      }
    })

    await Promise.all(savePromise)

    if (this.generation - 1 === this.generationsToSave) {
      const generationsToSave = this.generationsToSave
      this.zip.generateAsync({ type: 'blob' }).then(function (content) {
        // 5. Create a download link and trigger the download
        const link = document.createElement('a')
        link.href = URL.createObjectURL(content)
        link.download = `GeneticSnakes_Generations_0-${generationsToSave}.zip`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })
    }

    this.isProcessingGeneration = false
  }
  async nextGeneration() {
    if (this.isProcessingGeneration) {
      return
    }
    this.generation++
    this.players.sort((a, b) => b.fitness - a.fitness)
    let nextGeneration: Snake[] = []

    if (this.saveGeneration) {
      await this.saveSnakeFiles()
    }

    this.currentBestScore = this.players[0]!.score

    // ELITISM
    const elitism = this.players.slice(0, this.ELITISM_SIZE)
    elitism.forEach((snake) => {
      const copy = new Snake(this.TILECOUNT, this.frames, this.generation, snake.brain.copy())
      copy.brain.snake = copy
      nextGeneration.push(copy)
      console.log(snake.fitness)
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
    if (check && !this.showBest) {
      this.nextGeneration()
    } else if (check && this.showBest) {
      if (this.replayPlayers.every((snake) => snake.dead === true)) {
        if (this.replay === false && !this.runNoDraw) {
          this.runBest()
        } else {
          this.replay = false
          this.nextGeneration()
        }
      }
    }
  }
  start() {
    window.cancelAnimationFrame(this.frames.animationFrame)
    this.frames.animationFrame = window.requestAnimationFrame((currentFrame) => {
      this.frames.currentFrame = currentFrame
      if (this.replay) {
        this.drawReplay()
      } else if (this.showBest || this.runNoDraw) {
        this.runWithNoDraw()
      } else {
        this.drawRealTime()
      }
    })
  }
  stop() {
    window.cancelAnimationFrame(this.frames.animationFrame)
  }
  runWithNoDraw() {
    this.frames.deltaTime = (this.frames.currentFrame - this.frames.lastFrame) / 1000
    this.frames.lastFrame = this.frames.currentFrame

    this.players.forEach((player) => {
      player.moveTick(true)
      player.eat()
    })

    this.checkAllDead()

    this.frames.animationFrame = window.requestAnimationFrame((currentFrame) => {
      this.frames.currentFrame = currentFrame
      if (this.replay) {
        this.drawReplay()
      } else if (this.showBest || this.runNoDraw) {
        this.runWithNoDraw()
      } else {
        this.drawRealTime()
      }
    })
  }
  sortBestSnake() {
    return this.players.sort((a, b) => b.score - a.score)
  }
  runBest() {
    this.replay = true
    this.players.sort((a, b) => b.fitness - a.fitness)
    const replayPlayers: Snake[] = []
    const best = this.players.slice(0, this.best_size)
    best.forEach((snake) => {
      const copy = new Snake(this.TILECOUNT, this.frames, this.generation, snake.brain.copy())
      copy.brain.snake = copy
      replayPlayers.push(copy)
      console.log(snake.fitness)
    })
    this.replayPlayers = replayPlayers
    this.drawReplay()
  }
  drawReplay() {
    this.frames.deltaTime = (this.frames.currentFrame - this.frames.lastFrame) / 1000
    this.frames.lastFrame = this.frames.currentFrame

    this.replayPlayers.forEach((player) => {
      player.moveTick()
      player.eat()
    })

    this.checkAllDead()

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.tiles.draw()

    this.replayPlayers.forEach((player) => {
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
      if (this.replay) {
        this.drawReplay()
      } else if (this.showBest || this.runNoDraw) {
        this.runWithNoDraw()
      } else {
        this.drawRealTime()
      }
    })
  }
  drawRealTime() {
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
      if (this.replay) {
        this.drawReplay()
      } else if (this.showBest || this.runNoDraw) {
        this.runWithNoDraw()
      } else {
        this.drawRealTime()
      }
    })
  }
}
