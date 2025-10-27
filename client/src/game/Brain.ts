import Matrix from './Matrix'
import type Snake from './Snake'

class NeuralNetwork {
  inputNode: number
  hiddenNode: number
  outputNode: number
  bias_h: Matrix
  bias_o: Matrix
  weights_ih: Matrix
  weights_ho: Matrix
  constructor(inputNode: number, hiddenNode: number, outputNode: number) {
    this.inputNode = inputNode
    this.hiddenNode = hiddenNode
    this.outputNode = outputNode

    this.bias_h = new Matrix(this.hiddenNode, 1)
    this.bias_o = new Matrix(this.outputNode, 1)
    this.weights_ih = new Matrix(this.hiddenNode, this.inputNode)
    this.weights_ho = new Matrix(this.outputNode, this.hiddenNode)
    this.bias_h.randomize()
    this.bias_o.randomize()
    this.weights_ih.randomize()
    this.weights_ho.randomize()
  }
  mutate(rate: number) {
    let mutated = new NeuralNetwork(this.inputNode, this.hiddenNode, this.outputNode)
    for (let r = 0; r < this.bias_h.rows; r++) {
      for (let c = 0; c < this.bias_h.cols; c++) {
        if (Math.random() < rate) {
          this.bias_h.data[r]![c]! = mutated.bias_h.data[r]![c]!
        }
      }
    }
    for (let r = 0; r < this.bias_o.rows; r++) {
      for (let c = 0; c < this.bias_o.cols; c++) {
        if (Math.random() < rate) {
          this.bias_o.data[r]![c]! = mutated.bias_o.data[r]![c]!
        }
      }
    }
    for (let r = 0; r < this.weights_ih.rows; r++) {
      for (let c = 0; c < this.weights_ih.cols; c++) {
        if (Math.random() < rate) {
          this.weights_ih.data[r]![c]! = mutated.weights_ih.data[r]![c]!
        }
      }
    }
    for (let r = 0; r < this.weights_ho.rows; r++) {
      for (let c = 0; c < this.weights_ho.cols; c++) {
        if (Math.random() < rate) {
          this.weights_ho.data[r]![c]! = mutated.weights_ho.data[r]![c]!
        }
      }
    }
  }

  crossover(brain: NeuralNetwork) {
    let child = new NeuralNetwork(this.inputNode, this.hiddenNode, this.outputNode)

    for (let r = 0; r < this.bias_h.rows; r++) {
      for (let c = 0; c < this.bias_h.cols; c++) {
        if (Math.random() > 0.5) {
          child.bias_h.data[r]![c]! = brain.bias_h.data[r]![c]!
        } else {
          child.bias_h.data[r]![c]! = this.bias_h.data[r]![c]!
        }
      }
    }

    for (let r = 0; r < this.bias_o.rows; r++) {
      for (let c = 0; c < this.bias_o.cols; c++) {
        if (Math.random() > 0.5) {
          child.bias_o.data[r]![c]! = brain.bias_o.data[r]![c]!
        } else {
          child.bias_o.data[r]![c]! = this.bias_o.data[r]![c]!
        }
      }
    }

    for (let r = 0; r < this.weights_ho.rows; r++) {
      for (let c = 0; c < this.weights_ho.cols; c++) {
        if (Math.random() > 0.5) {
          child.weights_ho.data[r]![c]! = brain.weights_ho.data[r]![c]!
        } else {
          child.weights_ho.data[r]![c]! = this.weights_ho.data[r]![c]!
        }
      }
    }

    for (let r = 0; r < this.weights_ih.rows; r++) {
      for (let c = 0; c < this.weights_ih.cols; c++) {
        if (Math.random() > 0.5) {
          child.weights_ih.data[r]![c]! = brain.weights_ih.data[r]![c]!
        } else {
          child.weights_ih.data[r]![c]! = this.weights_ih.data[r]![c]!
        }
      }
    }

    return child
  }
  feedForward(inputArray: number[]) {
    let inputs = Matrix.fromArray(inputArray)

    let hidden = Matrix.multiply(this.weights_ih, inputs)
    hidden!.add(this.bias_h)
    hidden!.sigmoid()

    let output = Matrix.multiply(this.weights_ho, hidden!)
    output!.add(this.bias_o)
    output!.sigmoid()

    return output!.toArray()
  }
}

export default class Brain {
  neuralnetwork: NeuralNetwork
  snake: Snake
  constructor(snake: Snake) {
    this.snake = snake

    this.neuralnetwork = new NeuralNetwork(10, 8, 3)
  }
  checkDirections() {
    let directions = []
    switch (this.snake.direction.str) {
      case 'right':
        directions.push({ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 })
        break
      case 'left':
        directions.push({ x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 })
        break
      case 'up':
        directions.push({ x: 0, y: -1 }, { x: -1, y: 0 }, { x: 1, y: 0 })
        break
      case 'down':
        directions.push({ x: 0, y: 1 }, { x: 1, y: 0 }, { x: -1, y: 0 })
        break
    }
    const head = { x: this.snake.positions[0]!.x, y: this.snake.positions[0]!.y }
    let output = [0, 0, 0, 0, 0, 0]
    directions.forEach((direction, index) => {
      const headPosition = { x: head.x + direction.x, y: head.y + direction.y }
      if (
        headPosition.x < 0 ||
        headPosition.y < 0 ||
        headPosition.x > this.snake.TILECOUNT - 1 ||
        headPosition.y > this.snake.TILECOUNT - 1
      ) {
        output[index]!++
      }
      this.snake.positions.forEach((position) => {
        if (headPosition.x === position.x && headPosition.y === position.y) {
          output[index + 3]!++
        }
      })
    })
    return output
  }
  moveDirectional(direction: string) {
    const currentDirection = this.snake.direction.str

    switch (currentDirection) {
      case 'up':
        if (direction === 'left') {
          this.snake.left()
        } else if (direction === 'right') {
          this.snake.right()
        }
        break

      case 'down':
        if (direction === 'left') {
          this.snake.right() // Turning left while facing down
        } else if (direction === 'right') {
          this.snake.left() // Turning right while facing down
        }
        break

      case 'left':
        if (direction === 'left') {
          this.snake.down()
        } else if (direction === 'right') {
          this.snake.up()
        }
        break

      case 'right':
        if (direction === 'left') {
          this.snake.up()
        } else if (direction === 'right') {
          this.snake.down()
        }
        break
    }
  }
  think() {
    let input: number[] = []

    input.push(this.snake.positions[0]!.x, this.snake.positions[0]!.y)
    input.push(this.snake.plant.position.x, this.snake.plant.position.y)
    input.push(...this.checkDirections())

    console.log(input)
    let output = this.neuralnetwork.feedForward(input)
    if (output[0]! > 0.5) {
      return // go straigth
    }
    if (output[1]! > 0.5) {
      this.moveDirectional('right')
    }
    if (output[2]! > 0.5) {
      this.moveDirectional('left')
    }
  }
}
