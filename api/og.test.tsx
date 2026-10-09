import { describe, expect, it } from 'vitest';
import { GET } from './og';

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47];

async function render(url: string) {
    const response = GET(new Request(url));
    const bytes = new Uint8Array(await response.arrayBuffer());
    return { response, bytes };
}

describe('api/og', () => {
    it('renders the default card as a PNG on the Node.js runtime', async () => {
        const { response, bytes } = await render('https://example.com/api/og');

        expect(response.headers.get('content-type')).toBe('image/png');
        expect([...bytes.slice(0, 4)]).toEqual(PNG_SIGNATURE);
    }, 20000);

    it('renders a shared generation as a PNG', async () => {
        const { response, bytes } = await render('https://example.com/api/og?p=1&i=80&c=1&e=1&f=1&s=12345');

        expect(response.status).toBe(200);
        expect([...bytes.slice(0, 4)]).toEqual(PNG_SIGNATURE);
    }, 20000);
});
