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
    'na gaveta de um funcionário que está de férias desde agosto',
    'num T0 a 1500 euros por mês',
    'na fila da Segurança Social, desde 2019',
    'à espera que o D. Sebastião traga o servidor num dia de nevoeiro',
];

const CRONICAS: Array<[string, string, string]> = [
    [
        'Prometeram o caminho de ferro até à tua página.',
        'Criaram uma comissão parlamentar, caiu o portal e ficaste com um 404.',
        'Toma lá um manguito oficial',
    ],
    [
        'O Zé pagava o imposto do real d’água e ficava a ver navios.',
        'Pagas o IVA a 23% sobre os bytes desta página e ela nem sequer abre.',
        'Continua tudo como dantes',
    ],
    [
        'Faltava o carimbo de lacre do amanuense do Terreiro do Paço.',
        'Falta o anexo 7-B em PDF assinado com Chave Móvel Digital caducada.',
        'Volte amanhã entre as 9h00 e as 9h02',
    ],
    [
        'A mala-posta de Lisboa para o Porto levava três dias e perdia as cartas.',
        'A fibra ótica leva 3 milissegundos a dizer que a página foi comer um pastel de nata.',
        'Progresso à portuguesa',
    ],
    [
        'Culparam o défice do Reino, a filoxera e o Ultimato Inglês.',
        'Culpam o estagiário, o DNS, a gota fria e o árbitro do VAR.',
        'A culpa nunca é de ninguém',
    ],
    [
        'O ministro inaugurou o fontanário com banda filarmónica e foguetes.',
        'Inauguraram este URL em PowerPoint, mas esqueceram-se de fazer a página.',
        'Obra adjudicada ao primo',
    ],
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
$('anos').textContent = String(Math.max(151, new Date().getFullYear() - 1875));

const chourico = $('chourico');
const carimbo = $('carimbo');
const antes = $('antes');
const agora = $('agora');
const gravura = $('gravura');
const palavras = $('palavras');
const azeite = $('azeite');
const estado = $('estado');
const quatro = $('quatro');
const encher = $<HTMLButtonElement>('encher');

let cronicaIdx = 0;
let total = 0;
let timer = 0;

const contar = (texto: string) => texto.split(/\s+/).filter(Boolean).length;
const mostrarContas = (extra: number) => {
    palavras.textContent = String(total + extra);
    azeite.textContent = String((total + extra) * 3);
};

function rodarCronica() {
    const [ontem, hoje, selo] = CRONICAS[cronicaIdx % CRONICAS.length];
    cronicaIdx++;
    antes.textContent = ontem;
    agora.textContent = hoje;
    carimbo.textContent = selo;
    carimbo.classList.remove('animate-carimbo');
    void carimbo.offsetWidth;
    carimbo.classList.add('animate-carimbo');
    $('destino').textContent = pick(DESTINOS);
}

// Types a fresh chouriço letter by letter; the word count climbs, useful information stays at zero.
function encherChourico() {
    window.clearTimeout(timer);
    encher.disabled = true;
    quatro.classList.remove('animate-siuuu');
    void quatro.offsetWidth; // restart the animation
    quatro.classList.add('animate-siuuu');
    rodarCronica();

    const frases = generator
        .generate(1, 80)[0]
        .replace(/([.!?])\s+(?=\p{Lu})/gu, '$1\n')
        .split('\n');
    const texto = frases.slice(0, 2).join(' ');
    const terminar = () => {
        chourico.classList.remove('a-escrever');
        chourico.textContent = texto;
        total += contar(texto);
        mostrarContas(0);
        estado.textContent = `Crónica de 1875 atualizada. ${total} palavras enchidas, zero úteis.`;
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
        timer = window.setTimeout(passo, /[,.!?]$/.test(chourico.textContent) ? 220 : 24);
    };
    timer = window.setTimeout(passo, 350);
}

encher.hidden = false;
encher.addEventListener('click', encherChourico);
gravura.addEventListener('click', encherChourico);
encherChourico();
