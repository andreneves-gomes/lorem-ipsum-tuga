import { inject } from '@vercel/analytics';
import { generator } from './utils/generator';
import './index.css';
import './nao-encontrado.css';

inject();

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const pick = <T>(list: T[]): T => list[Math.floor(Math.random() * list.length)];
const calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const DESTINOS = [
    'em Leiria (que não existe)',
    'no IC19 à hora de ponta',
    'no aeroporto novo (previsto para 2037)',
    'na gaveta de um funcionário que está de férias',
    'num T0 a 1500 euros por mês',
    'na fila da Segurança Social, desde 2019',
];

// The address the visitor typed, shown as text (never as HTML).
let caminho = window.location.pathname;
try {
    caminho = decodeURIComponent(caminho);
} catch {
    // Malformed escape: show it as typed.
}
$('caminho').textContent = `«${caminho.length > 40 ? caminho.slice(0, 39) + '…' : caminho}»`;
$('destino').textContent = pick(DESTINOS);

const chourico = $('chourico');
const carimbo = $('carimbo');
const palavras = $('palavras');
const azeite = $('azeite');
const estado = $('estado');
const quatro = $('quatro');
const encher = $<HTMLButtonElement>('encher');

let total = 0;
let timer = 0;

const contar = (texto: string) => texto.split(/\s+/).filter(Boolean).length;
const mostrarContas = (extra: number) => {
    palavras.textContent = String(total + extra);
    azeite.textContent = String((total + extra) * 3);
};

// Types a fresh chouriço letter by letter; the word count climbs, useful information stays at zero.
function encherChourico() {
    window.clearTimeout(timer);
    carimbo.hidden = true;
    encher.disabled = true;
    quatro.classList.remove('animate-siuuu');
    void quatro.offsetWidth; // restart the animation
    quatro.classList.add('animate-siuuu');

    const texto = generator.generate(1, 70)[0];
    const terminar = () => {
        chourico.classList.remove('a-escrever');
        chourico.textContent = texto;
        total += contar(texto);
        mostrarContas(0);
        carimbo.hidden = false;
        estado.textContent = 'Chouriço certificado. Informação útil: zero.';
        encher.disabled = false;
    };

    if (calmo) {
        terminar();
        return;
    }

    let i = 0;
    chourico.textContent = '';
    chourico.classList.add('a-escrever');
    const passo = () => {
        i = Math.min(texto.length, i + 1 + Math.floor(Math.random() * 3));
        chourico.textContent = texto.slice(0, i);
        mostrarContas(contar(chourico.textContent));
        if (i >= texto.length) {
            terminar();
            return;
        }
        // Pause a little longer after punctuation, like someone thinking of the next excuse.
        timer = window.setTimeout(passo, /[,.!?]$/.test(chourico.textContent) ? 260 : 28);
    };
    timer = window.setTimeout(passo, 500);
}

encher.hidden = false;
encher.addEventListener('click', encherChourico);
encherChourico();
