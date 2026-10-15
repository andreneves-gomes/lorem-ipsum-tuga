import { generator } from './generator.js';

/** One sentence from the generator, long enough to read as an official excuse. */
export function desculpaOficial(seed?: number): string {
    const text = generator.generate(1, 80, undefined, seed)[0];
    const sentences = text.replace(/([.!?])\s+(?=\p{Lu})/gu, '$1\n').split('\n');
    return sentences.find((s) => s.length > 40) ?? sentences[0];
}
