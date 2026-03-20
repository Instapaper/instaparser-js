import axios from 'axios';
import { InstaparserClient } from './client';
import { InstaparserValidationError } from './exceptions';
import { Article } from './article';
import { PDF } from './pdf';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

function createMockAxiosInstance() {
  return {
    post: jest.fn(),
    get: jest.fn(),
    defaults: { headers: { common: {} } },
  };
}

describe('InstaparserClient', () => {
  let mockAxiosInstance: ReturnType<typeof createMockAxiosInstance>;
  let client: InstaparserClient;

  beforeEach(() => {
    mockAxiosInstance = createMockAxiosInstance();
    mockedAxios.create.mockReturnValue(mockAxiosInstance as any);
    client = new InstaparserClient({ apiKey: 'test-key' });
  });

  describe('article()', () => {
    it('defaults to html output', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        status: 200,
        data: { url: 'https://example.com', html: '<p>Content</p>' },
      });

      const article = await client.article({ url: 'https://example.com' });
      expect(article).toBeInstanceOf(Article);
      expect(article.html).toBe('<p>Content</p>');
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/api/1/article',
        expect.objectContaining({ output: 'html' }),
      );
    });

    it('accepts text output', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        status: 200,
        data: { url: 'https://example.com', text: 'Content' },
      });

      const article = await client.article({ url: 'https://example.com', output: 'text' });
      expect(article.text).toBe('Content');
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/api/1/article',
        expect.objectContaining({ output: 'text' }),
      );
    });

    it('accepts markdown output', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        status: 200,
        data: { url: 'https://example.com', markdown: '# Title\n\nContent' },
      });

      const article = await client.article({ url: 'https://example.com', output: 'markdown' });
      expect(article).toBeInstanceOf(Article);
      expect(article.markdown).toBe('# Title\n\nContent');
      expect(article.body).toBe('# Title\n\nContent');
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/api/1/article',
        expect.objectContaining({ output: 'markdown' }),
      );
    });

    it('rejects invalid output format', async () => {
      await expect(
        client.article({ url: 'https://example.com', output: 'xml' as any }),
      ).rejects.toThrow(InstaparserValidationError);

      await expect(
        client.article({ url: 'https://example.com', output: 'xml' as any }),
      ).rejects.toThrow("output must be 'html', 'text', or 'markdown'");
    });
  });

  describe('pdf()', () => {
    it('accepts markdown output via URL', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        status: 200,
        data: { url: 'https://example.com/doc.pdf', markdown: '# Doc Title\n\nParagraph' },
      });

      const pdf = await client.pdf({ url: 'https://example.com/doc.pdf', output: 'markdown' });
      expect(pdf).toBeInstanceOf(PDF);
      expect(pdf.markdown).toBe('# Doc Title\n\nParagraph');
      expect(pdf.body).toBe('# Doc Title\n\nParagraph');
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/api/1/pdf',
        expect.objectContaining({
          params: expect.objectContaining({ output: 'markdown' }),
        }),
      );
    });

    it('accepts markdown output via file upload', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        status: 200,
        data: { markdown: '# PDF Content' },
      });

      const fileBuffer = Buffer.from('fake-pdf-content');
      const pdf = await client.pdf({ file: fileBuffer, output: 'markdown' });
      expect(pdf).toBeInstanceOf(PDF);
      expect(pdf.markdown).toBe('# PDF Content');
      expect(pdf.body).toBe('# PDF Content');
    });

    it('rejects invalid output format', async () => {
      await expect(
        client.pdf({ url: 'https://example.com/doc.pdf', output: 'xml' as any }),
      ).rejects.toThrow(InstaparserValidationError);

      await expect(
        client.pdf({ url: 'https://example.com/doc.pdf', output: 'xml' as any }),
      ).rejects.toThrow("output must be 'html', 'text', or 'markdown'");
    });
  });
});
