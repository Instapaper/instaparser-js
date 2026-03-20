import { Article, ArticleData } from './article';

describe('Article', () => {
  const baseData: ArticleData = {
    url: 'https://example.com/article',
    title: 'Test Article',
    site_name: 'Example',
    author: 'Author',
    date: 1700000000,
    description: 'A test article',
    thumbnail: 'https://example.com/thumb.jpg',
    words: 500,
    is_rtl: false,
    images: ['https://example.com/img1.jpg'],
    videos: ['https://example.com/vid1.mp4'],
  };

  it('sets body to html when html is provided', () => {
    const article = new Article({ ...baseData, html: '<p>Hello</p>' });
    expect(article.html).toBe('<p>Hello</p>');
    expect(article.text).toBeUndefined();
    expect(article.markdown).toBeUndefined();
    expect(article.body).toBe('<p>Hello</p>');
  });

  it('sets body to text when text is provided', () => {
    const article = new Article({ ...baseData, text: 'Hello' });
    expect(article.text).toBe('Hello');
    expect(article.html).toBeUndefined();
    expect(article.markdown).toBeUndefined();
    expect(article.body).toBe('Hello');
  });

  it('sets body to markdown when markdown is provided', () => {
    const article = new Article({ ...baseData, markdown: '# Hello' });
    expect(article.markdown).toBe('# Hello');
    expect(article.html).toBeUndefined();
    expect(article.text).toBeUndefined();
    expect(article.body).toBe('# Hello');
  });

  it('prefers html over text over markdown for body', () => {
    const article = new Article({
      ...baseData,
      html: '<p>Hello</p>',
      text: 'Hello',
      markdown: '# Hello',
    });
    expect(article.body).toBe('<p>Hello</p>');
  });

  it('prefers text over markdown when html is absent', () => {
    const article = new Article({
      ...baseData,
      text: 'Hello',
      markdown: '# Hello',
    });
    expect(article.body).toBe('Hello');
  });

  it('maps snake_case fields to camelCase properties', () => {
    const article = new Article(baseData);
    expect(article.siteName).toBe('Example');
    expect(article.isRtl).toBe(false);
  });

  it('defaults numeric/array fields when absent', () => {
    const article = new Article({ url: 'https://example.com' });
    expect(article.words).toBe(0);
    expect(article.isRtl).toBe(false);
    expect(article.images).toEqual([]);
    expect(article.videos).toEqual([]);
  });

  it('toString returns body or empty string', () => {
    const withBody = new Article({ ...baseData, html: '<p>Hi</p>' });
    expect(withBody.toString()).toBe('<p>Hi</p>');

    const empty = new Article({});
    expect(empty.toString()).toBe('');
  });
});
