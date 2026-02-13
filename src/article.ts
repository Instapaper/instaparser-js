/**
 * Article class representing a parsed article from Instaparser.
 */

export interface ArticleData {
  url?: string;
  title?: string;
  site_name?: string;
  author?: string;
  date?: number;
  description?: string;
  thumbnail?: string;
  words?: number;
  is_rtl?: boolean;
  images?: string[];
  videos?: string[];
  html?: string;
  text?: string;
}

export class Article {
  /**
   * The canonical URL of the article
   */
  public readonly url?: string;

  /**
   * The title of the article
   */
  public readonly title?: string;

  /**
   * The name of the website
   */
  public readonly siteName?: string;

  /**
   * The author's name
   */
  public readonly author?: string;

  /**
   * Published date as UNIX timestamp
   */
  public readonly date?: number;

  /**
   * Article description
   */
  public readonly description?: string;

  /**
   * Thumbnail image URL
   */
  public readonly thumbnail?: string;

  /**
   * Number of words in the article
   */
  public readonly words: number;

  /**
   * Whether the article is right-to-left (Arabic/Hebrew)
   */
  public readonly isRtl: boolean;

  /**
   * List of images in the article
   */
  public readonly images: string[];

  /**
   * List of embedded videos
   */
  public readonly videos: string[];

  /**
   * The HTML body (if output was 'html')
   */
  public readonly html?: string;

  /**
   * The plain text body (if output was 'text')
   */
  public readonly text?: string;

  /**
   * The article body (HTML or text depending on output format)
   */
  public readonly body?: string;

  /**
   * Initialize an Article from API response data.
   */
  constructor(data: ArticleData) {
    this.url = data.url;
    this.title = data.title;
    this.siteName = data.site_name;
    this.author = data.author;
    this.date = data.date;
    this.description = data.description;
    this.thumbnail = data.thumbnail;
    this.words = data.words ?? 0;
    this.isRtl = data.is_rtl ?? false;
    this.images = data.images ?? [];
    this.videos = data.videos ?? [];
    this.html = data.html;
    this.text = data.text;
    this.body = this.html || this.text;
  }

  /**
   * Returns a string representation of the article.
   */
  toString(): string {
    return this.body || '';
  }

  /**
   * Returns a string representation for debugging.
   */
  [Symbol.for('nodejs.util.inspect.custom')](): string {
    return `<Article url=${JSON.stringify(this.url)} title=${JSON.stringify(this.title)}>`;
  }
}

