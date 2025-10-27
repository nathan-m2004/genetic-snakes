import Brain from './Brain'
import type { Frames } from './main'
import Plant from './Plant'
import getRandomInt from './utils'

export type Position = { x: number; y: number; direction: string }

export type Direction = { x: number; y: number; str: string }

export default class Snake {
  direction: Direction
  positions: Position[]
  dead: boolean
  TILECOUNT: number
  lastPosition: Position
  color: string
  plant: Plant
  score: number
  eyes: { color: string; type: string }
  rotated: boolean
  brain: Brain
  frames: Frames
  times: { timeSinceLastMove: number; timeToMove: number }
  players: any
  constructor(TILECOUNT: number, frames: Frames, gametick: number) {
    this.TILECOUNT = TILECOUNT

    this.direction = { x: 1, y: 0, str: 'right' }
    this.positions = [
      { x: this.TILECOUNT / 2, y: this.TILECOUNT / 2, direction: 'right' },
      { x: this.TILECOUNT / 2 - 1, y: this.TILECOUNT / 2, direction: 'right' },
      { x: this.TILECOUNT / 2 - 2, y: this.TILECOUNT / 2, direction: 'right' },
    ]
    this.lastPosition = { x: 3, y: 5, direction: 'right' }
    this.frames = frames

    this.times = {
      timeSinceLastMove: 0,
      timeToMove: gametick,
    }
    this.plant = new Plant(this.TILECOUNT)

    this.color = `hsl(${getRandomInt(0, 360)}, ${getRandomInt(0, 45)}%, ${getRandomInt(0, 60)}%)`
    this.eyes = {
      color: `hsl(${getRandomInt(0, 360)}, ${getRandomInt(0, 45)}%, ${getRandomInt(0, 60)}%)`,
      type: `normal`,
    }

    this.rotated = false
    this.dead = false
    this.score = 0
    this.brain = new Brain(this)
  }
  eat() {
    if (
      this.plant.position.x !== this.positions[0]?.x ||
      this.plant.position.y !== this.positions[0]?.y
    ) {
      return
    }

    this.score++
    this.positions.push(this.lastPosition)

    let overlaps: boolean
    do {
      this.plant.newPosition()

      overlaps = this.positions.some(
        (segment) => segment.x === this.plant.position.x && segment.y === this.plant.position.y,
      )
    } while (overlaps)
  }
  moveTick() {
    this.times.timeSinceLastMove += this.frames.deltaTime
    if (this.times.timeSinceLastMove >= this.times.timeToMove) {
      if (this.dead) return
      this.times.timeSinceLastMove = 0
      this.brain.think()
      this.move()
      this.rotated = false
    }
  }
  move() {
    this.lastPosition = {
      ...(this.positions[this.positions.length - 1] || { x: 0, y: 0, direction: 'right' }),
    }

    const oldPositions = this.positions.map((p) => ({ ...p }))

    for (let i = this.positions.length - 1; i > 0; i--) {
      const segment = this.positions[i]
      const nextSegment = this.positions[i - 1]
      if (!segment || !nextSegment) return
      segment.x = nextSegment.x
      segment.y = nextSegment.y
      segment.direction = nextSegment.direction
    }

    const head = this.positions[0]
    if (!head) return

    head.direction = this.direction.str
    head.x += this.direction.x
    head.y += this.direction.y

    this.checkDead()

    if (this.dead) {
      this.positions = oldPositions
    }
  }
  checkDead() {
    const head = this.positions[0]
    if (!head) return

    if (head.x < 0 || head.y < 0 || head.x > this.TILECOUNT - 1 || head.y > this.TILECOUNT - 1) {
      this.dead = true
      return
    }

    for (let i = 1; i < this.positions.length; i++) {
      const segment = this.positions[i]
      if (!segment) return
      if (head.x === segment.x && head.y === segment.y) {
        this.dead = true
        return
      }
    }
  }
  right() {
    if ((this.positions[0] && this.positions[0]?.x + 1 === this.positions[1]?.x) || this.rotated)
      return
    this.direction = { x: 1, y: 0, str: 'right' }
    this.rotated = true
  }
  left() {
    if ((this.positions[0] && this.positions[0]?.x + -1 === this.positions[1]?.x) || this.rotated)
      return
    this.direction = { x: -1, y: 0, str: 'left' }
    this.rotated = true
  }
  up() {
    if ((this.positions[0] && this.positions[0]?.y + -1 === this.positions[1]?.y) || this.rotated)
      return
    this.direction = { x: 0, y: -1, str: 'up' }
    this.rotated = true
  }
  down() {
    if ((this.positions[0] && this.positions[0]?.y + 1 === this.positions[1]?.y) || this.rotated)
      return
    this.direction = { x: 0, y: 1, str: 'down' }
    this.rotated = true
  }

  draw(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    const xSize = canvas.width / this.TILECOUNT
    const ySize = canvas.height / this.TILECOUNT

    const head = this.positions[0]
    if (!head) return

    const shadowColor = 'rgba(0, 0, 0, 0.05)'
    const highlightColor = 'rgba(255, 255, 255, 0.05)'
    const edgeSize = xSize / 10

    // THIS ENTIRE FOR LOOP IS AI SLOPP, THANKS 2025
    this.positions.forEach((position, index, arr) => {
      const x = position.x * xSize
      const y = position.y * ySize

      context.fillStyle = this.color
      context.fillRect(x, y, xSize, ySize)

      const segmentInFront = arr[index - 1]

      if (segmentInFront && position.direction !== segmentInFront.direction) {
        // --- This is a CORNER segment ---
        const currentDir = position.direction
        const nextDir = segmentInFront.direction

        // --- Handle 4 "INNER" Turns (Inner Shadow + Outer Highlight) ---

        // Case: up -> left (Inner)
        if (currentDir === 'up' && nextDir === 'left') {
          context.fillStyle = shadowColor // Shadow (Inner top-right)
          context.fillRect(x + xSize - edgeSize, y, edgeSize, ySize)
          context.fillRect(x, y, xSize - edgeSize, edgeSize)
          context.fillStyle = highlightColor // Highlight (Outer bottom-left)
          context.fillRect(x, y + ySize - edgeSize, edgeSize, edgeSize)
        }
        // Case: left -> down (Inner)
        else if (currentDir === 'left' && nextDir === 'down') {
          context.fillStyle = shadowColor // Shadow (Inner top-left)
          context.fillRect(x, y, xSize, edgeSize)
          context.fillRect(x, y + edgeSize, edgeSize, ySize - edgeSize)
          context.fillStyle = highlightColor // Highlight (Outer bottom-right)
          context.fillRect(x + xSize - edgeSize, y + ySize - edgeSize, edgeSize, edgeSize)
        }
        // Case: down -> right (Inner)
        else if (currentDir === 'down' && nextDir === 'right') {
          context.fillStyle = shadowColor // Shadow (Inner bottom-left)
          context.fillRect(x, y, edgeSize, ySize)
          context.fillRect(x + edgeSize, y + ySize - edgeSize, xSize - edgeSize, edgeSize)
          context.fillStyle = highlightColor // Highlight (Outer top-right)
          context.fillRect(x + xSize - edgeSize, y, edgeSize, edgeSize)
        }
        // Case: right -> up (Inner)
        else if (currentDir === 'right' && nextDir === 'up') {
          context.fillStyle = shadowColor // Shadow (Inner bottom-right)
          context.fillRect(x, y + ySize - edgeSize, xSize, edgeSize)
          context.fillRect(x + xSize - edgeSize, y, edgeSize, ySize - edgeSize)
          context.fillStyle = highlightColor // Highlight (Outer top-left)
          context.fillRect(x, y, edgeSize, edgeSize)
        }

        // --- Handle 4 "OUTER" Turns (Outer Shadow + Inner Highlight) ---

        // Case: up -> right (Outer)
        else if (currentDir === 'up' && nextDir === 'right') {
          context.fillStyle = shadowColor // Shadow (Outer bottom-right)
          context.fillRect(x + xSize - edgeSize, y + ySize - edgeSize, edgeSize, edgeSize)
          context.fillStyle = highlightColor // Highlight (Inner top-left)
          context.fillRect(x, y, xSize, edgeSize)
          context.fillRect(x, y + edgeSize, edgeSize, ySize - edgeSize)
        }
        // Case: right -> down (Outer)
        else if (currentDir === 'right' && nextDir === 'down') {
          context.fillStyle = shadowColor // Shadow (Outer bottom-left)
          context.fillRect(x, y + ySize - edgeSize, edgeSize, edgeSize)
          context.fillStyle = highlightColor // Highlight (Inner top-right)
          context.fillRect(x + xSize - edgeSize, y, edgeSize, ySize)
          context.fillRect(x, y, xSize - edgeSize, edgeSize)
        }
        // Case: down -> left (Outer)
        else if (currentDir === 'down' && nextDir === 'left') {
          context.fillStyle = shadowColor // Shadow (Outer top-left)
          context.fillRect(x, y, edgeSize, edgeSize)
          context.fillStyle = highlightColor // Highlight (Inner bottom-right)
          context.fillRect(x, y + ySize - edgeSize, xSize, edgeSize)
          context.fillRect(x + xSize - edgeSize, y, edgeSize, ySize - edgeSize)
        }
        // Case: left -> up (Outer)
        else if (currentDir === 'left' && nextDir === 'up') {
          context.fillStyle = shadowColor // Shadow (Outer top-right)
          context.fillRect(x + xSize - edgeSize, y, edgeSize, edgeSize)
          context.fillStyle = highlightColor // Highlight (Inner bottom-left)
          context.fillRect(x, y, edgeSize, ySize)
          context.fillRect(x + edgeSize, y + ySize - edgeSize, xSize - edgeSize, edgeSize)
        }
      } else {
        // --- This is a STRAIGHT segment (or the head) ---
        // (This logic remains the same)
        switch (position.direction) {
          case 'up':
            context.fillStyle = shadowColor // Shadow on the RIGHT
            context.fillRect(x + xSize - edgeSize, y, edgeSize, ySize)
            context.fillStyle = highlightColor // Highlight on the LEFT
            context.fillRect(x, y, edgeSize, ySize)
            break
          case 'down':
            context.fillStyle = shadowColor // Shadow on the LEFT
            context.fillRect(x, y, edgeSize, ySize)
            context.fillStyle = highlightColor // Highlight on the RIGHT
            context.fillRect(x + xSize - edgeSize, y, edgeSize, ySize)
            break
          case 'left':
            context.fillStyle = shadowColor // Shadow at the TOP
            context.fillRect(x, y, xSize, edgeSize)
            context.fillStyle = highlightColor // Highlight at the BOTTOM
            context.fillRect(x, y + ySize - edgeSize, xSize, edgeSize)
            break
          case 'right':
          default:
            context.fillStyle = shadowColor // Shadow at the BOTTOM
            context.fillRect(x, y + ySize - edgeSize, xSize, edgeSize)
            context.fillStyle = highlightColor // Highlight at the TOP
            context.fillRect(x, y, xSize, edgeSize)
            break
        }
      }
    })

    // --- Draw the Eyes ---
    context.save()

    const headCenterX = head.x * xSize + xSize / 2
    const headCenterY = head.y * ySize + ySize / 2

    context.translate(headCenterX, headCenterY)

    let rotationInRadians = 0
    switch (this.direction.str) {
      case 'up':
        rotationInRadians = -Math.PI / 2 // -90 degrees
        break
      case 'down':
        rotationInRadians = Math.PI / 2 // 90 degrees
        break
      case 'left':
        rotationInRadians = Math.PI // 180 degrees
        break
    }
    context.rotate(rotationInRadians)

    const eyeSize = xSize / 3.7
    const eyeOffsetX = xSize / 4
    const eyeOffsetY = ySize / 4

    context.fillStyle = 'white'

    const eye1X = eyeOffsetX - eyeSize / 2
    const eye1Y = -eyeOffsetY - eyeSize / 2
    const eye2X = eyeOffsetX - eyeSize / 2
    const eye2Y = eyeOffsetY - eyeSize / 2

    context.fillRect(eye1X, eye1Y, eyeSize, eyeSize)
    context.fillRect(eye2X, eye2Y, eyeSize, eyeSize)

    context.fillStyle = this.eyes.color
    const pupilSize = eyeSize / 2
    context.fillRect(eye1X + pupilSize / 2, eye1Y + pupilSize / 2, pupilSize, pupilSize)
    context.fillRect(eye2X + pupilSize / 2, eye2Y + pupilSize / 2, pupilSize, pupilSize)
    context.restore()
  }
}
