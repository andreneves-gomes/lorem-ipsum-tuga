import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import middleware, { config } from './middleware';

const fetchMock = vi.fn<typeof fetch>();

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

    it('rewrites both social image tags for a shared generation', async () => {
        const staticImage = 'https://encher-chouricos.vercel.app/og-image.jpeg';
        fetchMock.mockResolvedValue(new Response(
            `<meta property="og:image" content="${staticImage}" />` +
            `<meta property="twitter:image" content="${staticImage}" />`,
        ));

        const response = await middleware(new Request('https://example.com/?p=1&s=42'));
        const html = await response.text();

        expect(fetchMock).toHaveBeenCalledExactlyOnceWith('https://example.com/?__raw=1', {
            headers: { accept: 'text/html' },
        });
        expect(response.headers.get('content-type')).toBe('text/html; charset=utf-8');
        expect(html).not.toContain(staticImage);
        expect(html.match(/https:\/\/example\.com\/api\/og\?p=1&s=42/g)).toHaveLength(2);
    });

    it('passes through when the static HTML fetch returns an error', async () => {
        fetchMock.mockResolvedValue(new Response(null, { status: 503 }));

        const response = await middleware(new Request('https://example.com/?p=1&s=42'));

        expect(response.headers.get('x-middleware-next')).toBe('1');
    });
});