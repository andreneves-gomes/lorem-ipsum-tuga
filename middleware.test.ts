import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import middleware, { config } from './middleware';

const fetchMock = vi.fn<typeof fetch>();
const indexHtml = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const staticImage = 'https://encher-chouricos.vercel.app/og-image.jpeg';

beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('middleware', () => {
    it('uses the Node.js runtime for the document route', () => {
        expect(config).toEqual({ matcher: '/', runtime: 'nodejs' });
    });

    it('passes plain visits through without fetching HTML', async () => {
        const response = await middleware(new Request('https://example.com/'));

        expect(response.headers.get('x-middleware-next')).toBe('1');
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('bypasses internal fetches even when share parameters are present', async () => {
        const response = await middleware(new Request('https://example.com/?p=1&s=42&__raw=1'));

        expect(response.headers.get('x-middleware-next')).toBe('1');
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('rewrites both social image tags and og:url of the real page for a shared generation', async () => {
        fetchMock.mockResolvedValue(new Response(indexHtml));

        const response = await middleware(new Request('https://example.com/?p=1&s=42'));
        const html = await response.text();
        const query = 'p=1&amp;i=50&amp;c=1&amp;e=1&amp;f=1&amp;s=42';

        expect(fetchMock).toHaveBeenCalledExactlyOnceWith('https://example.com/?__raw=1', {
            headers: { accept: 'text/html' },
        });
        expect(response.headers.get('content-type')).toBe('text/html; charset=utf-8');
        expect(html).not.toContain(staticImage);
        expect(html).toContain(`<meta property="og:image" content="https://example.com/api/og?${query}" />`);
        expect(html).toContain(`<meta name="twitter:image" content="https://example.com/api/og?${query}" />`);
        expect(html).toContain(`<meta property="og:url" content="https://example.com/?${query}" />`);
        // Search engines keep seeing a single canonical page.
        expect(html).toContain('<link rel="canonical" href="https://encher-chouricos.vercel.app/" />');
    });

    it('drops unknown parameters so they never reach the HTML', async () => {
        fetchMock.mockResolvedValue(new Response(indexHtml));

        const response = await middleware(
            new Request('https://example.com/?p=2&s=7&x=%22%3E%3Cscript%3Ealert(1)%3C/script%3E'),
        );
        const html = await response.text();

        expect(html).not.toContain('alert(1)');
        expect(html).toContain('/api/og?p=2&amp;i=50&amp;c=1&amp;e=1&amp;f=1&amp;s=7"');
    });

    it('passes through when the static HTML fetch returns an error', async () => {
        fetchMock.mockResolvedValue(new Response(null, { status: 503 }));

        const response = await middleware(new Request('https://example.com/?p=1&s=42'));

        expect(response.headers.get('x-middleware-next')).toBe('1');
    });
});