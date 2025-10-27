export default function getRandomInt(min: number, max: number): number {
  // Ensure inputs are integers
  min = Math.ceil(min)
  max = Math.floor(max)

  // The maximum is inclusive and the minimum is inclusive
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export class SeededRandom {
  private seed: number

  /**
   * Creates a new random number generator with a given seed.
   * @param {number} seed - The initial seed value.
   */
  constructor(seed: number) {
    this.seed = seed
  }

  /**
   * Generates the next pseudo-random floating-point number between 0 (inclusive) and 1 (exclusive).
   * @returns {number} A random float.
   */
  private nextFloat(): number {
    // This is the Mulberry32 algorithm
    let t = (this.seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000
  }

  /**
   * Generates a random integer between two values (inclusive).
   * @param {number} min - The minimum possible value (inclusive).
   * @param {number} max - The maximum possible value (inclusive).
   * @returns {number} A random integer between min and max.
   */
  public nextInt(min: number, max: number): number {
    min = Math.ceil(min)
    max = Math.floor(max)

    // Uses the seeded float generator to get an integer within the range
    return Math.floor(this.nextFloat() * (max - min + 1)) + min
  }
}
