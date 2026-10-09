import { next } from '@vercel/edge';
import { decodeShareState, encodeShareState } from './src/utils/urlState.js';

// Only the app's document route. Shared links look like /?p=..&s=..
export const config = { matcher: '/', runtime: 'nodejs' };

const STATIC_IMAGE = 'https://encher-chouricos.vercel.app/og-image.jpeg';
const STATIC_OG_URL = '<meta property="og:url" content="https://encher-chouricos.vercel.app/" />';

// For shared links, swap the static OG/Twitter image for a dynamic one that
// previews the actual generated text. Plain visits pass straight through.
export default async function middleware(req: Request): Promise<Response> {
    const url = new URL(req.url);

    // Internal fetch below carries __raw to grab the static HTML without looping.
    if (url.searchParams.has('__raw')) return next();

    // Not a shared generation? Leave the default preview untouched.
    const state = decodeShareState(url.search);
    if (!state) return next();

    const res = await fetch(`${url.origin}/?__raw=1`, {
        headers: { accept: 'text/html' },
    });
    if (!res.ok) return next();

    // Rebuilt from validated values only, so stray params never reach the HTML.
    const query = encodeShareState(state).replaceAll('&', '&amp;');
    const html = await res.text();
    const rewritten = html
        .split(STATIC_IMAGE)
        .join(`${url.origin}/api/og?${query}`)
        // Facebook/LinkedIn re-scrape og:url, so it must point at the shared link too.
        // The <link rel="canonical"> stays on "/" for search engines.
        .replace(STATIC_OG_URL, `<meta property="og:url" content="${url.origin}/?${query}" />`);

    return new Response(rewritten, {
        headers: {
            'content-type': 'text/html; charset=utf-8',
            // Cache the rewritten shell at the edge; each seed is its own URL.
            'cache-control': 'public, max-age=0, s-maxage=86400',
        },
    });
}
