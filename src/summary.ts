/**
 * Summary class representing a summary result from Instaparser.
 */

export class Summary {
  /**
   * List of key sentences extracted from the article
   */
  public readonly keySentences: string[];

  /**
   * Concise summary of the article
   */
  public readonly overview: string;

  /**
   * Initialize a Summary from API response data.
   */
  constructor(keySentences: string[], overview: string) {
    this.keySentences = keySentences;
    this.overview = overview;
  }

  /**
   * Returns a string representation of the summary.
   */
  toString(): string {
    return this.overview;
  }

  /**
   * Returns a string representation for debugging.
   */
  [Symbol.for('nodejs.util.inspect.custom')](): string {
    const overviewPreview = this.overview.length > 50 
      ? this.overview.substring(0, 50) + '...' 
      : this.overview;
    return `<Summary overview=${JSON.stringify(overviewPreview)} keySentences=${this.keySentences.length}>`;
  }
}

