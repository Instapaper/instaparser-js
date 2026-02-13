/**
 * InstaparserClient - Main client class for the Instaparser API.
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import FormData from 'form-data';
import { Readable } from 'stream';
import { Article, ArticleData } from './article';
import { Summary } from './summary';
import { PDF } from './pdf';
import {
  InstaparserAPIError,
  InstaparserAuthenticationError,
  InstaparserRateLimitError,
  InstaparserValidationError,
} from './exceptions';

export type OutputFormat = 'html' | 'text';

export interface ArticleOptions {
  url: string;
  content?: string;
  output?: OutputFormat;
  useCache?: boolean;
}

export interface SummaryOptions {
  url: string;
  content?: string;
  useCache?: boolean;
  streamCallback?: (line: string) => void;
}

export interface PDFOptions {
  url?: string;
  file?: Buffer | Readable | string;
  output?: OutputFormat;
  useCache?: boolean;
}

/**
 * Client for interacting with the Instaparser API.
 * 
 * @example
 * ```typescript
 * const client = new InstaparserClient({ apiKey: 'your-api-key' });
 * const article = await client.article({ url: 'https://example.com/article' });
 * console.log(article.body);
 * ```
 */
export class InstaparserClient {
  public static readonly BASE_URL = 'https://www.instaparser.com';

  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly axiosInstance: AxiosInstance;

  /**
   * Initialize the Instaparser client.
   * 
   * @param options - Configuration options
   * @param options.apiKey - Your Instaparser API key
   * @param options.baseUrl - Optional base URL for the API (defaults to production)
   */
  constructor(options: { apiKey: string; baseUrl?: string }) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || InstaparserClient.BASE_URL;

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Handle API response and raise appropriate exceptions.
   */
  private handleResponse<T>(response: AxiosResponse<T>): T {
    const statusCode = response.status;

    if (statusCode === 200) {
      return response.data;
    }

    let errorMessage = `API request failed with status ${statusCode}`;
    try {
      const errorData = response.data as any;
      if (errorData && typeof errorData === 'object' && 'reason' in errorData) {
        errorMessage = errorData.reason;
      }
    } catch {
      // If response.data is not JSON, use the text or default message
      errorMessage = (response.data as any)?.toString() || errorMessage;
    }

    if (statusCode === 401) {
      throw new InstaparserAuthenticationError(
        errorMessage || 'Invalid API key',
        statusCode,
        response
      );
    } else if (statusCode === 403) {
      throw new InstaparserAPIError(
        errorMessage || 'Account suspended',
        statusCode,
        response
      );
    } else if (statusCode === 409) {
      throw new InstaparserAPIError(
        errorMessage || 'Exceeded monthly API calls',
        statusCode,
        response
      );
    } else if (statusCode === 429) {
      throw new InstaparserRateLimitError(
        errorMessage || 'Rate limit exceeded',
        statusCode,
        response
      );
    } else if (statusCode === 400) {
      throw new InstaparserValidationError(
        errorMessage || 'Invalid request',
        statusCode,
        response
      );
    } else {
      throw new InstaparserAPIError(errorMessage, statusCode, response);
    }
  }

  /**
   * Parse an article from a URL or HTML content.
   * 
   * @param options - Article parsing options
   * @param options.url - URL of the article to parse (required)
   * @param options.content - Optional raw HTML content to parse instead of fetching from URL
   * @param options.output - Output format, either 'html' (default) or 'text'
   * @param options.useCache - Whether to use cache (default: true)
   * @returns Promise resolving to Article object with parsed content
   * 
   * @example
   * ```typescript
   * const article = await client.article({ url: 'https://example.com/article' });
   * console.log(article.title);
   * console.log(article.body);
   * ```
   */
  async article(options: ArticleOptions): Promise<Article> {
    const { url, content, output = 'html', useCache = true } = options;

    if (output !== 'html' && output !== 'text') {
      throw new InstaparserValidationError("output must be 'html' or 'text'");
    }

    const endpoint = '/api/1/article';
    const payload: any = {
      url,
      output,
    };

    // API expects string 'false' to disable cache, not boolean false
    if (!useCache) {
      payload.use_cache = 'false';
    }

    if (content !== undefined) {
      payload.content = content;
    }

    const response = await this.axiosInstance.post<ArticleData>(endpoint, payload);
    const data = this.handleResponse(response);
    return new Article(data);
  }

  /**
   * Generate a summary of an article.
   * 
   * @param options - Summary generation options
   * @param options.url - URL of the article to summarize (required)
   * @param options.content - Optional HTML content to parse instead of fetching from URL
   * @param options.useCache - Whether to use cache (default: true)
   * @param options.streamCallback - Optional callback function called for each line of streaming response.
   *                                 If provided, enables streaming mode. The callback receives each line as a string.
   * @returns Promise resolving to Summary object with keySentences and overview attributes
   * 
   * @example
   * ```typescript
   * const summary = await client.summary({ url: 'https://example.com/article' });
   * console.log(summary.overview);
   * console.log(summary.keySentences);
   * 
   * // With streaming callback
   * const summary = await client.summary({
   *   url: 'https://example.com/article',
   *   streamCallback: (line) => console.log(`Received: ${line}`)
   * });
   * ```
   */
  async summary(options: SummaryOptions): Promise<Summary> {
    const { url, content, useCache = true, streamCallback } = options;

    const endpoint = '/api/1/summary';
    const payload: any = {
      url,
      stream: streamCallback !== undefined,
    };

    // API expects string 'false' to disable cache, not boolean false
    if (!useCache) {
      payload.use_cache = 'false';
    }

    if (content !== undefined) {
      payload.content = content;
    }

    if (streamCallback !== undefined) {
      // Handle streaming response
      let response: AxiosResponse;
      try {
        response = await this.axiosInstance.post(endpoint, payload, {
          responseType: 'stream',
        });
      } catch (error: any) {
        // For non-200 responses, axios throws an error
        // The error.response contains the response with status code
        if (error.response) {
          // Create a mock response object for handleResponse
          // We can't easily read the streamed error body, so we'll use the status code
          const mockResponse = {
            status: error.response.status,
            statusText: error.response.statusText,
            headers: error.response.headers,
            data: `API request failed with status ${error.response.status}`,
            config: error.config,
          } as AxiosResponse;
          this.handleResponse(mockResponse);
        }
        throw error;
      }

      return new Promise<Summary>((resolve, reject) => {
        let keySentences: string[] = [];
        let overview = '';
        let buffer = '';

        response.data.on('data', (chunk: Buffer) => {
          buffer += chunk.toString('utf-8');
          const lines = buffer.split('\n');
          // Keep the last incomplete line in the buffer
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim()) {
              streamCallback(line);

              if (line.startsWith('key_sentences:')) {
                try {
                  const jsonStr = line.split(':', 1)[1]?.trim();
                  if (jsonStr) {
                    keySentences = JSON.parse(jsonStr);
                  }
                } catch (error) {
                  reject(
                    new InstaparserAPIError(
                      'Unable to generate key sentences',
                      412
                    )
                  );
                  return;
                }
              } else if (line.startsWith('delta:')) {
                const deltaContent = line.split(': ', 2)[1];
                if (deltaContent) {
                  overview += deltaContent;
                }
              }
            }
          }
        });

        response.data.on('end', () => {
          // Process any remaining buffer content
          if (buffer.trim()) {
            streamCallback(buffer);
            if (buffer.startsWith('key_sentences:')) {
              try {
                const jsonStr = buffer.split(':', 1)[1]?.trim();
                if (jsonStr) {
                  keySentences = JSON.parse(jsonStr);
                }
              } catch (error) {
                // Ignore parse errors for incomplete final chunk
              }
            } else if (buffer.startsWith('delta:')) {
              const deltaContent = buffer.split(': ', 2)[1];
              if (deltaContent) {
                overview += deltaContent;
              }
            }
          }
          resolve(new Summary(keySentences, overview));
        });

        response.data.on('error', (error: Error) => {
          reject(
            new InstaparserAPIError(
              `Stream error: ${error.message}`,
              undefined,
              error
            )
          );
        });
      });
    } else {
      const response = await this.axiosInstance.post<{
        key_sentences: string[];
        overview: string;
      }>(endpoint, payload);
      const data = this.handleResponse(response);
      return new Summary(
        data.key_sentences || [],
        data.overview || ''
      );
    }
  }

  /**
   * Parse a PDF from a URL or file.
   * 
   * @param options - PDF parsing options
   * @param options.url - URL of the PDF to parse (required for GET request)
   * @param options.file - PDF file to upload (required for POST request, can be Buffer, Readable stream, or file path string)
   * @param options.output - Output format, either 'html' (default) or 'text'
   * @param options.useCache - Whether to use cache (default: true)
   * @returns Promise resolving to PDF object with parsed PDF content (inherits from Article)
   * 
   * @example
   * ```typescript
   * // Parse PDF from URL
   * const pdf = await client.pdf({ url: 'https://example.com/document.pdf' });
   * 
   * // Parse PDF from file buffer
   * const fs = require('fs');
   * const fileBuffer = fs.readFileSync('document.pdf');
   * const pdf = await client.pdf({ file: fileBuffer });
   * 
   * // Parse PDF from file stream
   * const fileStream = fs.createReadStream('document.pdf');
   * const pdf = await client.pdf({ file: fileStream });
   * ```
   */
  async pdf(options: PDFOptions): Promise<PDF> {
    const { url, file, output = 'html', useCache = true } = options;

    if (output !== 'html' && output !== 'text') {
      throw new InstaparserValidationError("output must be 'html' or 'text'");
    }

    const endpoint = '/api/1/pdf';

    if (file !== undefined) {
      // POST request with file upload
      const formData = new FormData();
      
      // Handle different file input types
      if (Buffer.isBuffer(file)) {
        formData.append('file', file, {
          filename: 'document.pdf',
          contentType: 'application/pdf',
        });
      } else if (file instanceof Readable) {
        formData.append('file', file, {
          filename: 'document.pdf',
          contentType: 'application/pdf',
        });
      } else if (typeof file === 'string') {
        // Assume it's a file path - in Node.js, we'd need fs to read it
        // For now, we'll require Buffer or Readable
        throw new InstaparserValidationError(
          'File path strings are not supported. Please provide a Buffer or Readable stream.'
        );
      } else {
        throw new InstaparserValidationError(
          'File must be a Buffer, Readable stream, or file path string'
        );
      }

      const formFields: any = {
        output,
      };

      // API expects string 'false' to disable cache, not boolean false
      if (!useCache) {
        formFields.use_cache = 'false';
      }

      if (url) {
        formFields.url = url;
      }

      // Append form fields
      for (const [key, value] of Object.entries(formFields)) {
        formData.append(key, value);
      }

      // Get form-data headers (including boundary)
      const headers = {
        ...formData.getHeaders(),
        Authorization: `Bearer ${this.apiKey}`,
      };

      const response = await this.axiosInstance.post<ArticleData>(
        endpoint,
        formData,
        { headers }
      );
      const data = this.handleResponse(response);
      return new PDF(data);
    } else if (url) {
      // GET request with URL
      const params: any = {
        url,
        output,
      };

      // API expects string 'false' to disable cache, not boolean false
      if (!useCache) {
        params.use_cache = 'false';
      }

      const response = await this.axiosInstance.get<ArticleData>(endpoint, {
        params,
      });
      const data = this.handleResponse(response);
      return new PDF(data);
    } else {
      throw new InstaparserValidationError(
        "Either 'url' or 'file' must be provided"
      );
    }
  }
}

