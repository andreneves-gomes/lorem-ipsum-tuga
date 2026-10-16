import { inject } from '@vercel/analytics';
import { desculpaOficial } from './utils/desculpa';
import './index.css';
import './nao-encontrado.css';

inject();

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const pick = <T>(list: T[]): T => list[Math.floor(Math.random() * list.length)];
const calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const MOTIVOS = [
    'greve',
    'greve às horas extraordinárias',
    'falta de material circulante',
    'uma vaca na linha',
    'o maquinista foi ao café',
    'avaria na catenária',
    'nevoeiro (estamos à espera de D. Sebastião)',
    'obras desde 2019',
    'ninguém sabe',
];

const BOCAS = ['Página? Toma!', 'Vai a pé!', 'Greve, filho!', 'Pois, pois…', 'Não há comboio, há manguito!', 'Amanhã, se Deus quiser.'];

const LINHA = 'grid grid-cols-[3.5rem_1fr_7.5rem] items-baseline gap-x-3 border-b border-gray-800 py-2 font-mono text-sm font-bold uppercase text-amber-300 sm:grid-cols-[4.5rem_1fr_3.5rem_10rem] md:text-lg';
const SUPRIMIDO = 'text-red-400';
const A_CHEGAR = 'text-emerald-400 pisca';
const OUTRO = 'text-gray-300';

// The address the visitor typed, shown as text (never as HTML).
let caminho = window.location.pathname;
try {
    caminho = decodeURIComponent(caminho);
} catch {
    // Malformed escape: show it as typed.
}
const destino = `«${caminho.length > 40 ? caminho.slice(0, 39) + '…' : caminho}»`;
$('caminho').textContent = destino;

let motivo = pick(MOTIVOS);
$('motivo').textContent = motivo;

const hora = (minutos: number) =>
    new Date(Date.now() + minutos * 60_000).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });

const relogio = $('relogio');
const tic = () => (relogio.textContent = new Date().toLocaleTimeString('pt-PT'));
tic();
window.setInterval(tic, 1000);

// Split-flap: letters spin through random characters before settling.
const FLAPS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
function virar(el: HTMLElement, texto: string) {
    if (calmo) {
        el.textContent = texto;
        return;
    }
    let passo = 0;
    const id = window.setInterval(() => {
        passo++;
        el.textContent = [...texto]
            .map((c, i) => (c === ' ' || i < passo - 6 ? c : FLAPS[Math.floor(Math.random() * FLAPS.length)]))
            .join('');
        if (passo - 6 >= texto.length) {
            window.clearInterval(id);
            el.textContent = texto;
        }
    }, 35);
}

function linha(horaTxt: string, dest: string, numero: string, estado: string, cor: string) {
    const row = document.createElement('div');
    row.className = LINHA;
    const cells = [horaTxt, dest, numero, estado].map((texto, i) => {
        const span = document.createElement('span');
        if (i === 1) span.className = 'truncate';
        if (i === 2) span.className = 'hidden sm:block';
        if (i === 3) span.className = cor;
        virar(span, texto);
        return span;
    });
    row.append(...cells);
    return row;
}

const quadro = $('quadro');
quadro.replaceChildren(
    linha(hora(-6), 'A SUA PÁGINA', '404', 'SUPRIMIDO', SUPRIMIDO),
    linha(hora(9), 'AEROPORTO NOVO', '2037', 'EM ESTUDO', OUTRO),
    linha(hora(24), 'LEIRIA', '???', 'NÃO EXISTE', OUTRO),
    linha(hora(39), 'A SUA PÁGINA', '404', 'SUPRIMIDO', SUPRIMIDO),
);

const ticker = $('ticker');
const anunciar = () => {
    ticker.textContent =
        `Informamos os senhores passageiros que o comboio com destino a ${destino} foi suprimido por motivo de ${motivo}. ` +
        `Justificação oficial: ${desculpaOficial()} ` +
        'Pedimos desculpa pelo incómodo. Ou não. · Os passageiros com destino a Leiria devem dirigir-se a uma cidade que exista.';
};
anunciar();

const ze = $('ze');
const bolha = $('bolha');
function manguito(boca = pick(BOCAS)) {
    bolha.textContent = boca;
    ze.classList.remove('ze-toma');
    void ze.getBoundingClientRect(); // restart the animation
    ze.classList.add('ze-toma');
}
window.setTimeout(() => manguito('Página? Toma!'), 900);
ze.addEventListener('click', () => manguito());

const proximo = $<HTMLButtonElement>('proximo');
const aviso = $('aviso');
let tentativas = 0;
proximo.hidden = false;
proximo.addEventListener('click', () => {
    tentativas++;
    proximo.disabled = true;
    const chegada = linha(hora(0), 'A SUA PÁGINA', '404', 'A CHEGAR', A_CHEGAR);
    quadro.prepend(chegada);
    quadro.lastElementChild?.remove();
    aviso.textContent = 'O comboio está a entrar na estação…';

    window.setTimeout(() => {
        motivo = pick(MOTIVOS.filter((m) => m !== motivo));
        const estado = chegada.lastElementChild as HTMLElement;
        estado.className = SUPRIMIDO;
        virar(estado, 'SUPRIMIDO');
        $('motivo').textContent = motivo;
        anunciar();
        manguito();

        if (tentativas >= 5) {
            aviso.textContent = 'A CP desistiu de si. O táxi está à porta.';
            proximo.hidden = true;
            return;
        }
        aviso.textContent =
            tentativas >= 3
                ? `Suprimido outra vez (${motivo}). Ao terceiro, o Zé recomenda o táxi.`
                : `Afinal foi suprimido: ${motivo}.`;
        proximo.textContent = tentativas >= 3 ? '🚆 Insistir (és teimoso)' : '🚆 Apanhar o próximo';
        proximo.disabled = false;
    }, 1800);
});
