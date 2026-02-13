/**
 * PDF class representing a parsed PDF from Instaparser.
 */

import { Article, ArticleData } from './article';

/**
 * Represents a parsed PDF from Instaparser.
 * 
 * Inherits from Article since most fields are the same.
 * PDFs always have isRtl=false and videos=[].
 */
export class PDF extends Article {
  /**
   * Initialize a PDF from API response data.
   */
  constructor(data: ArticleData) {
    // PDFs always have isRtl=false and videos=[]
    const pdfData: ArticleData = {
      ...data,
      is_rtl: false,
      videos: [],
    };
    super(pdfData);
  }

  /**
   * Returns a string representation for debugging.
   */
  [Symbol.for('nodejs.util.inspect.custom')](): string {
    return `<PDF url=${JSON.stringify(this.url)} title=${JSON.stringify(this.title)}>`;
  }
}

