/**
 * Example usage of the Instaparser Node.js SDK
 */

import { InstaparserClient } from './src/index';
import * as fs from 'fs';

async function main() {
  // Initialize the client
  const client = new InstaparserClient({
    apiKey: process.env.INSTAPARSER_API_KEY || 'your-api-key'
  });

  try {
    // Example 1: Parse an article from URL
    console.log('Example 1: Parsing article from URL');
    const article = await client.article({
      url: 'https://blog.instapaper.com/post/802011928668094464/ai-voices-text-to-speech-redesign-and-android',
    });
    console.log('Title:', article.title);
    console.log('Body length:', article.body?.length);
    console.log('Words:', article.words);

    // Example 2: Parse article with text output
    console.log('\nExample 2: Parsing article as text');
    const textArticle = await client.article({
      url: 'https://blog.instapaper.com/post/802011928668094464/ai-voices-text-to-speech-redesign-and-android',
      output: 'text',
    });
    console.log('Text preview:', textArticle.text?.substring(0, 100));

    // Example 3: Generate summary
    console.log('\nExample 3: Generating summary');
    const summary = await client.summary({
      url: 'https://blog.instapaper.com/post/802011928668094464/ai-voices-text-to-speech-redesign-and-android',
    });
    console.log('Overview:', summary.overview);
    console.log('Key sentences:', summary.keySentences.length);

    // Example 4: Generate summary with streaming
    console.log('\nExample 4: Generating summary with streaming');
    const streamSummary = await client.summary({
      url: 'https://blog.instapaper.com/post/802011928668094464/ai-voices-text-to-speech-redesign-and-android',
      streamCallback: (line) => {
        process.stdout.write(line);
      },
    });
    console.log('\nFinal overview:', streamSummary.overview);

    // Example 5: Parse PDF from URL
    console.log('\nExample 5: Parsing PDF from URL');
    const pdf = await client.pdf({
      url: 'https://bitcoin.org/bitcoin.pdf',
    });
    console.log('PDF title:', pdf.title);
    console.log('PDF words:', pdf.words);

    // Example 6: Parse PDF from file
    console.log('\nExample 6: Parsing PDF from file');
    if (fs.existsSync('document.pdf')) {
      const fileBuffer = fs.readFileSync('document.pdf');
      const pdfFromFile = await client.pdf({
        file: fileBuffer,
      });
      console.log('PDF title:', pdfFromFile.title);
    } else {
      console.log('document.pdf not found, skipping file upload example');
    }
  } catch (error: any) {
    if (error.name === 'InstaparserAuthenticationError') {
      console.error('Authentication error:', error.message);
    } else if (error.name === 'InstaparserRateLimitError') {
      console.error('Rate limit error:', error.message);
    } else if (error.name === 'InstaparserValidationError') {
      console.error('Validation error:', error.message);
    } else if (error.name === 'InstaparserAPIError') {
      console.error('API error:', error.message, 'Status:', error.statusCode);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}

