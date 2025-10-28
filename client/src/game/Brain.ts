import Matrix from './Matrix'
import type Snake from './Snake'

class NeuralNetwork {
  inputNode: number
  hiddenNode0: number
  outputNode: number
  bias_h0: Matrix
  bias_o: Matrix
  weights_ih: Matrix
  weights_ho: Matrix
  hiddenNode1: any
  weights_hh: Matrix
  bias_h1: Matrix
  previous: number[]
  constructor(inputNode: number, hiddenNode0: number, hiddenNode1: number, outputNode: number) {
    this.inputNode = inputNode
    this.hiddenNode0 = hiddenNode0
    this.hiddenNode1 = hiddenNode1
    this.outputNode = outputNode

    const realInputSize = inputNode + outputNode

    this.previous = new Array(this.outputNode).fill(0)

    this.bias_h0 = new Matrix(this.hiddenNode0, 1)
    this.bias_h1 = new Matrix(this.hiddenNode1, 1)
    this.bias_o = new Matrix(this.outputNode, 1)
    this.weights_ih = new Matrix(this.hiddenNode0, realInputSize)
    this.weights_hh = new Matrix(this.hiddenNode1, this.hiddenNode0)
    this.weights_ho = new Matrix(this.outputNode, this.hiddenNode1)
    this.bias_h0.randomize()
    this.bias_h1.randomize()
    this.bias_o.randomize()
    this.weights_ih.randomize()
    this.weights_hh.randomize()
    this.weights_ho.randomize()
  }
  mutate(rate: number) {
    let mutated = new NeuralNetwork(
      this.inputNode,
      this.hiddenNode0,
      this.hiddenNode1,
      this.outputNode,
    )
    for (let r = 0; r < this.bias_h0.rows; r++) {
      for (let c = 0; c < this.bias_h0.cols; c++) {
        if (Math.random() < rate) {
          this.bias_h0.data[r]![c]! = mutated.bias_h0.data[r]![c]!
        }
      }
    }
    for (let r = 0; r < this.bias_h1.rows; r++) {
      for (let c = 0; c < this.bias_h1.cols; c++) {
        if (Math.random() < rate) {
          this.bias_h1.data[r]![c]! = mutated.bias_h1.data[r]![c]!
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
    for (let r = 0; r < this.weights_hh.rows; r++) {
      for (let c = 0; c < this.weights_hh.cols; c++) {
        if (Math.random() < rate) {
          this.weights_hh.data[r]![c]! = mutated.weights_hh.data[r]![c]!
        }
      }
    }
  }

  crossover(brain: NeuralNetwork) {
    let child = new NeuralNetwork(
      this.inputNode,
      this.hiddenNode0,
      this.hiddenNode1,
      this.outputNode,
    )

    for (let r = 0; r < this.bias_h0.rows; r++) {
      for (let c = 0; c < this.bias_h0.cols; c++) {
        if (Math.random() > 0.5) {
          child.bias_h0.data[r]![c]! = brain.bias_h0.data[r]![c]!
        } else {
          child.bias_h0.data[r]![c]! = this.bias_h0.data[r]![c]!
        }
      }
    }

    for (let r = 0; r < this.bias_h1.rows; r++) {
      for (let c = 0; c < this.bias_h1.cols; c++) {
        if (Math.random() > 0.5) {
          child.bias_h1.data[r]![c]! = brain.bias_h1.data[r]![c]!
        } else {
          child.bias_h1.data[r]![c]! = this.bias_h1.data[r]![c]!
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

    for (let r = 0; r < this.weights_hh.rows; r++) {
      for (let c = 0; c < this.weights_hh.cols; c++) {
        if (Math.random() > 0.5) {
          child.weights_hh.data[r]![c]! = brain.weights_hh.data[r]![c]!
        } else {
          child.weights_hh.data[r]![c]! = this.weights_hh.data[r]![c]!
        }
      }
    }

    return child
  }
  feedForward(inputArray: number[]) {
    let inputs = Matrix.fromArray([...inputArray, ...this.previous])

    let hidden0 = Matrix.multiply(this.weights_ih, inputs)
    hidden0!.add(this.bias_h0)
    hidden0!.sigmoid()

    let hidden1 = Matrix.multiply(this.weights_hh, hidden0!)
    hidden1!.add(this.bias_h1)
    hidden1!.sigmoid()

    let output = Matrix.multiply(this.weights_ho, hidden1!)
    output!.add(this.bias_o)
    output!.sigmoid()

    const outputArray = output!.toArray()
    this.previous = outputArray
    return outputArray
  }
  copy(): NeuralNetwork {
    const copy = new NeuralNetwork(
      this.inputNode,
      this.hiddenNode0,
      this.hiddenNode1,
      this.outputNode,
    )

    copy.weights_ih = this.weights_ih.copy()
    copy.weights_hh = this.weights_hh.copy()
    copy.weights_ho = this.weights_ho.copy()
    copy.bias_h0 = this.bias_h0.copy()
    copy.bias_h1 = this.bias_h1.copy()
    copy.bias_o = this.bias_o.copy()

    return copy
  }
}

export default class Brain {
  neuralnetwork: NeuralNetwork
  snake: Snake | null
  constructor(snake: Snake | null, neuralnetwork?: NeuralNetwork) {
    this.snake = snake

    if (neuralnetwork) {
      this.neuralnetwork = neuralnetwork
    } else {
      this.neuralnetwork = new NeuralNetwork(24, 16, 16, 3)
    }
  }
  copy(): Brain {
    return new Brain(null, this.neuralnetwork.copy())
  }
  crossover(parentB: Brain) {
    let copy = this.copy()
    const neural = copy.neuralnetwork.crossover(parentB!.neuralnetwork)
    copy.neuralnetwork = neural
    return copy
  }
  mutate(rate: number) {
    this.neuralnetwork.mutate(rate)
    return this
  }
  moveDirectional(direction: string) {
    const currentDirection = this.snake!.direction.str

    switch (currentDirection) {
      case 'up':
        if (direction === 'left') {
          this.snake!.left()
        } else if (direction === 'right') {
          this.snake!.right()
        }
        break

      case 'down':
        if (direction === 'left') {
          this.snake!.right() // Turning left while facing down
        } else if (direction === 'right') {
          this.snake!.left() // Turning right while facing down
        }
        break

      case 'left':
        if (direction === 'left') {
          this.snake!.down()
        } else if (direction === 'right') {
          this.snake!.up()
        }
        break

      case 'right':
        if (direction === 'left') {
          this.snake!.up()
        } else if (direction === 'right') {
          this.snake!.down()
        }
        break
    }
  }
  look() {
    let output: number[] = []
    const directions: { [key: string]: { x: number; y: number } } = {
      north: { x: 0, y: -1 },
      northEast: { x: 1, y: -1 },
      east: { x: 1, y: 0 },
      southEast: { x: 1, y: 1 },
      south: { x: 0, y: 1 },
      southWest: { x: -1, y: 1 },
      west: { x: -1, y: 0 },
      northWest: { x: -1, y: -1 },
    }
    for (const key in directions) {
      let distance_wall = 0
      let distance_tail = 0
      let distance_plant = 0

      const rayPos = { x: this.snake!.positions[0]!.x, y: this.snake!.positions[0]!.y }

      let loop = 0
      while (true) {
        loop++
        rayPos.x += directions[key]!.x
        rayPos.y += directions[key]!.y

        // Distance from wall
        if (
          rayPos.x < 0 ||
          rayPos.y < 0 ||
          rayPos.x > this.snake!.TILECOUNT - 1 ||
          rayPos.y > this.snake!.TILECOUNT - 1
        ) {
          distance_wall = loop
          break
        }

        // Distance from tail
        for (let i = 1; i < this.snake!.positions.length; i++) {
          const segment = this.snake!.positions[i]
          if (!segment) continue
          if (rayPos.x === segment.x && rayPos.y === segment.y) {
            distance_tail = loop
            break
          }
        }
        if (distance_tail > 0) {
          break
        }

        // Distance from Plant
        if (
          rayPos.x === this.snake!.plant.position.x &&
          rayPos.y === this.snake!.plant.position.y
        ) {
          distance_plant = loop
          break
        }
      }

      const TILECOUNT = this.snake!.TILECOUNT

      output.push(
        distance_tail > 0 ? 1 - distance_tail / TILECOUNT : 0,
        distance_plant > 0 ? 1 - distance_plant / TILECOUNT : 0,
        distance_wall > 0 ? 1 - distance_wall / TILECOUNT : 0,
      )
    }
    return output
  }
  think() {
    let input: number[] = []

    input.push(...this.look()!)

    let output = this.neuralnetwork.feedForward(input)

    // Find the index of the highest value in the output array.
    // This forces the snake to make only ONE decision.
    let maxOutput = -Infinity
    let decisionIndex = 0

    for (let i = 0; i < output.length; i++) {
      if (output[i]! > maxOutput) {
        maxOutput = output[i]!
        decisionIndex = i
      }
    }

    switch (decisionIndex) {
      case 0:
        // Go straight (do nothing)
        break
      case 1:
        // Turn right
        this.moveDirectional('right')
        break
      case 2:
        // Turn left
        this.moveDirectional('left')
        break
    }
  }
}
