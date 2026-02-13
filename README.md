# Instaparser Node.js/TypeScript SDK

A TypeScript/Node.js client library for the [Instaparser API](https://www.instaparser.com), providing a simple and intuitive interface for parsing articles, generating summaries, and processing PDFs.

## Installation

```bash
npm install instaparser-api
```

Or install from source:

```bash
cd nodejs-sdk
npm install
npm run build
```

## Quick Start

```typescript
import { InstaparserClient } from 'instaparser-api';

// Initialize the client with your API key
const client = new InstaparserClient({ apiKey: 'your-api-key' });

// Parse an article from a URL
const article = await client.article({ url: 'https://example.com/article' });

// Access article properties
console.log(article.title);
console.log(article.body); // HTML or text content
console.log(article.author);
console.log(article.words);
```

## Features

- **Article Parsing**: Extract clean HTML or text from web articles
- **Summary Generation**: Generate AI-powered summaries with key sentences
- **PDF Processing**: Parse PDFs from URLs or file uploads
- **Error Handling**: Comprehensive exception handling for API errors
- **TypeScript Support**: Full type definitions for better IDE support
- **Streaming Support**: Real-time streaming for summary generation
- **Modern Async/Await**: Built with modern JavaScript patterns

## Usage

### Article Parsing

Parse articles from URLs or HTML content:

```typescript
import { InstaparserClient } from 'instaparser-api';

const client = new InstaparserClient({ apiKey: 'your-api-key' });

// Parse from URL (HTML output)
const article = await client.article({ url: 'https://example.com/article' });
console.log(article.html); // HTML content
console.log(article.body); // Same as html when output='html'

// Parse from URL (text output)
const article = await client.article({
  url: 'https://example.com/article',
  output: 'text',
});
console.log(article.text); // Plain text content
console.log(article.body); // Same as text when output='text'

// Parse from HTML content
const htmlContent = '<html><body><h1>Title</h1><p>Content</p></body></html>';
const article = await client.article({
  url: 'https://example.com/article',
  content: htmlContent,
});

// Disable cache
const article = await client.article({
  url: 'https://example.com/article',
  useCache: false,
});
```

### Article Properties

The `Article` object provides access to all parsed metadata:

```typescript
const article = await client.article({ url: 'https://example.com/article' });

// Basic properties
article.url; // Canonical URL
article.title; // Article title
article.siteName; // Website name (note: camelCase in TypeScript)
article.author; // Author name
article.date; // Published date (UNIX timestamp)
article.description; // Article description
article.thumbnail; // Thumbnail image URL
article.words; // Word count
article.isRtl; // Right-to-left language flag (note: camelCase)

// Content
article.body; // HTML or text (depending on output format)
article.html; // HTML content (if output='html')
article.text; // Plain text (if output='text')

// Media
article.images; // Array of image URLs
article.videos; // Array of embedded video URLs
```

### Summary Generation

Generate AI-powered summaries:

```typescript
// Generate summary
const summary = await client.summary({ url: 'https://example.com/article' });

console.log(summary.overview); // Concise summary
console.log(summary.keySentences); // Array of key sentences

// Stream summary with callback (for real-time updates)
const summary = await client.summary({
  url: 'https://example.com/article',
  streamCallback: (line) => {
    console.log(`Streaming: ${line}`);
  },
});
```

### PDF Processing

Parse PDFs from URLs or files. The PDF class extends Article, so it has all the same properties:

```typescript
import * as fs from 'fs';

// Parse PDF from URL
const pdf = await client.pdf({ url: 'https://example.com/document.pdf' });

// Parse PDF from file buffer
const fileBuffer = fs.readFileSync('document.pdf');
const pdf = await client.pdf({ file: fileBuffer });

// Parse PDF from file stream
const fileStream = fs.createReadStream('document.pdf');
const pdf = await client.pdf({ file: fileStream });

// Parse PDF with text output
const pdf = await client.pdf({
  url: 'https://example.com/document.pdf',
  output: 'text',
});
console.log(pdf.text);
console.log(pdf.body); // Same as text when output='text'

// Access all Article properties
console.log(pdf.title);
console.log(pdf.words);
console.log(pdf.images);
```

## Error Handling

The SDK provides specific exception types for different error scenarios:

```typescript
import {
  InstaparserClient,
  InstaparserAuthenticationError,
  InstaparserRateLimitError,
  InstaparserValidationError,
  InstaparserAPIError,
} from 'instaparser-api';

const client = new InstaparserClient({ apiKey: 'your-api-key' });

try {
  const article = await client.article({ url: 'https://example.com/article' });
} catch (error) {
  if (error instanceof InstaparserAuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof InstaparserRateLimitError) {
    console.error('Rate limit exceeded');
  } else if (error instanceof InstaparserValidationError) {
    console.error('Invalid request parameters');
  } else if (error instanceof InstaparserAPIError) {
    console.error(`API error: ${error.message} (status: ${error.statusCode})`);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## API Reference

### InstaparserClient

Main client class for interacting with the Instaparser API.

#### `constructor(options: { apiKey: string; baseUrl?: string })`

Initialize the client.

- `options.apiKey`: Your Instaparser API key
- `options.baseUrl`: Optional base URL for the API (defaults to production)

#### `article(options: ArticleOptions): Promise<Article>`

Parse an article from a URL or HTML content.

- `options.url`: URL of the article (required)
- `options.content`: Optional HTML content to parse instead of fetching from URL
- `options.output`: Output format - `'html'` (default) or `'text'`
- `options.useCache`: Whether to use cache (default: `true`)

Returns: `Promise<Article>` object

#### `summary(options: SummaryOptions): Promise<Summary>`

Generate a summary of an article.

- `options.url`: URL of the article (required)
- `options.content`: Optional HTML content to parse instead of fetching from URL
- `options.useCache`: Whether to use cache (default: `true`)
- `options.streamCallback`: Optional callback function called for each line of streaming response. If provided, enables streaming mode.

Returns: `Promise<Summary>` object with `keySentences` and `overview` attributes

#### `pdf(options: PDFOptions): Promise<PDF>`

Parse a PDF from a URL or file.

- `options.url`: URL of the PDF (required for GET request)
- `options.file`: PDF file to upload (required for POST request, can be Buffer, Readable stream, or file path string)
- `options.output`: Output format - `'html'` (default) or `'text'`
- `options.useCache`: Whether to use cache (default: `true`)

Returns: `Promise<PDF>` object (extends `Article`)

### Article

Represents a parsed article from Instaparser.

#### Properties

- `url`: Canonical URL
- `title`: Article title
- `siteName`: Website name (camelCase)
- `author`: Author name
- `date`: Published date (UNIX timestamp)
- `description`: Article description
- `thumbnail`: Thumbnail image URL
- `words`: Word count
- `isRtl`: Right-to-left language flag (camelCase)
- `images`: Array of image URLs
- `videos`: Array of embedded video URLs
- `body`: Article body (HTML or text)
- `html`: HTML content (if output was 'html')
- `text`: Plain text content (if output was 'text')

### PDF

Represents a parsed PDF from Instaparser. Extends `Article` and has all the same properties. PDFs always have `isRtl=false` and `videos=[]`.

### Summary

Represents a summary result from Instaparser.

#### Properties

- `keySentences`: Array of key sentences extracted from the article (camelCase)
- `overview`: Concise summary of the article

## TypeScript Support

This SDK is written in TypeScript and provides full type definitions. All types are exported and can be imported:

```typescript
import type {
  ArticleOptions,
  SummaryOptions,
  PDFOptions,
  OutputFormat,
  ArticleData,
} from 'instaparser-api';
```

## Requirements

- Node.js >= 14.0.0
- TypeScript >= 4.0 (for TypeScript projects)

## License

MIT

Copyright 2026 Instant Paper, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Support

For support, email support@instaparser.com or visit [https://www.instaparser.com](https://www.instaparser.com).
