/**
 * Represents a 2D Matrix.
 */
export default class Matrix {
  rows: number
  cols: number
  data: number[][]

  /**
   * Creates a new Matrix.
   * @param rows - The number of rows.
   * @param cols - The number of columns.
   */
  constructor(rows: number, cols: number) {
    this.rows = rows
    this.cols = cols

    // Initialize the matrix data structure in a type-safe way
    this.data = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0))
  }

  /**
   * Fills the matrix with random values between -1 and 1.
   */
  randomize(): void {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        // Generate random value between -1 and 1
        this.data[r]![c] = Math.random() * 2 - 1
      }
    }
  }

  /**
   * Adds another matrix to this matrix (element-wise).
   * @param matrix - The matrix to add.
   */
  add(matrix: Matrix): void {
    // Ensure dimensions match for addition
    if (this.rows !== matrix.rows || this.cols !== matrix.cols) {
      console.error('Matrices must have the same dimensions for addition.')
      return
    }

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.data[r]![c]! += matrix.data[r]![c]!
      }
    }
  }

  /**
   * Creates a Matrix (column vector) from a 1D array.
   * @param array - The input array.
   * @returns A new Matrix (n x 1).
   */
  static fromArray(array: number[]): Matrix {
    let matrix = new Matrix(array.length, 1)
    for (let r = 0; r < array.length; r++) {
      matrix.data[r]![0] = array[r]!
    }
    return matrix
  }

  /**
   * Converts the matrix data into a 1D array (flattened).
   * @returns A 1D array containing all matrix elements.
   */
  toArray(): number[] {
    let array: number[] = []
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        array.push(this.data[r]![c]!)
      }
    }
    return array
  }

  /**
   * Performs matrix multiplication between two matrices (A * B).
   * @param a - The first matrix (Matrix A).
   * @param b - The second matrix (Matrix B).
   * @returns A new Matrix (result of A * B), or undefined if dimensions are incompatible.
   */
  static multiply(a: Matrix, b: Matrix): Matrix | undefined {
    // Matrix multiplication: A.cols must equal B.rows
    if (a.cols !== b.rows) {
      console.error('Columns of A must match rows of B for multiplication.')
      return undefined
    }

    let result = new Matrix(a.rows, b.cols)
    for (let r = 0; r < result.rows; r++) {
      for (let c = 0; c < result.cols; c++) {
        let sum = 0
        // Dot product of A's row and B's column
        for (
          let multiplaction = 0; // Note: 'multiplaction' typo kept from original
          multiplaction < a.cols;
          multiplaction++
        ) {
          sum += a.data[r]![multiplaction]! * b.data[multiplaction]![c]!
        }
        result.data[r]![c] = sum
      }
    }
    return result
  }

  /**
   * Applies the sigmoid activation function to every element of the matrix.
   * f(x) = 1 / (1 + e^-x)
   */
  sigmoid(): void {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const value = this.data[r]![c]!
        this.data[r]![c] = 1 / (1 + Math.exp(-value))
      }
    }
  }
}
