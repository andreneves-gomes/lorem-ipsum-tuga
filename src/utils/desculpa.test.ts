import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { desculpaOficial } from './desculpa';

describe('404: desculpa oficial', () => {
    it('is always one full sentence, never a bare question like "Sabes que mais?"', () => {
        for (let seed = 0; seed < 500; seed++) {
            const desculpa = desculpaOficial(seed);
            expect(desculpa.length, `seed ${seed}`).toBeGreaterThan(40);
            expect(desculpa, `seed ${seed}`).toMatch(/^\p{Lu}.*[.!?]$/u);
            expect(desculpa, `seed ${seed}`).not.toMatch(/[.!?] \p{Lu}/u);
        }
    });

    it('keeps "3.º" inside the sentence instead of cutting there', () => {
        const found = Array.from({ length: 2000 }, (_, seed) => desculpaOficial(seed)).find((d) => d.includes('3.º'));
        expect(found).toMatch(/3\.º esquerdo/);
    });
});

describe('404 page', () => {
    const html = readFileSync(new URL('../../404.html', import.meta.url), 'utf8');

    it('stays out of search results and loads its script from the site itself', () => {
        expect(html).toContain('<meta name="robots" content="noindex" />');
        expect(html).toContain('<script type="module" src="/src/nao-encontrado.ts"></script>');
    });

    it('has no inline styles (the CSP would block them)', () => {
        expect(html).not.toMatch(/\sstyle=|<style/);
    });
});
