import { inject } from '@vercel/analytics';
import { desculpaOficial } from './utils/desculpa';
import './index.css';

inject();

const $ = (id: string) => document.getElementById(id)!;
const pick = <T>(list: T[]): T => list[Math.floor(Math.random() * list.length)];

const DESTINOS = [
    'em Leiria (que não existe)',
    'no IC19 à hora de ponta',
    'no aeroporto novo (previsto para 2037)',
    'na gaveta de um funcionário que está de férias',
    'no fundo da Ria Formosa, ao lado das chaves do carro',
    'num T0 a 1500 euros por mês',
    'na fila da Segurança Social, desde 2019',
];

const ESPERAS = [
    '3 horas',
    '3 horas e meia',
    '4 horas',
    'o dia todo',
    'amanhã de manhã',
    'depois das férias',
    'quando o aeroporto novo abrir',
];

const RECLAMACOES = [
    'O livro de reclamações está a ser usado por outra pessoa. Tire senha.',
    'Reclamação registada. Resposta prevista em 90 dias úteis.',
    'Falta o anexo 7-B, autenticado pelo notário. Volte amanhã.',
    'O sistema foi abaixo. Tente outra vez entre as 9h00 e as 9h05.',
    'Reclamação reencaminhada para Leiria (que não existe).',
    'A sua reclamação é muito importante para nós. Aguarde em linha.',
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
$('emitida').textContent = `Emitida às ${new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`;

const desculpa = $('desculpa');
const outra = $('outra-desculpa');
desculpa.textContent = desculpaOficial();
outra.hidden = false;
outra.addEventListener('click', () => {
    desculpa.textContent = desculpaOficial();
});

const balcao = $('balcao');
const reclamar = $('reclamar');
let reclamacao = Math.floor(Math.random() * RECLAMACOES.length);
reclamar.hidden = false;
reclamar.addEventListener('click', () => {
    reclamacao = (reclamacao + 1) % RECLAMACOES.length;
    balcao.textContent = RECLAMACOES[reclamacao];
});

// The queue crawls towards A404; the estimated wait only ever gets longer.
const painel = $('painel');
const espera = $('espera');
const VEZ = 404;
const PAUSA = VEZ - 5;
let senha = VEZ - 12 - Math.floor(Math.random() * 6);
let passos = 0;
let pausaFeita = false;
let emPausa = 0;

const relogio = window.setInterval(() => {
    if (emPausa > 0) {
        emPausa--;
        if (emPausa === 0) painel.textContent = `A${senha}`;
        return;
    }
    if (senha === PAUSA && !pausaFeita) {
        pausaFeita = true;
        emPausa = 2;
        painel.textContent = '☕';
        espera.textContent = 'pausa para café';
        return;
    }

    senha++;
    passos++;
    painel.textContent = `A${senha}`;
    espera.textContent = ESPERAS[Math.min(ESPERAS.length - 1, Math.floor(passos / 2))];

    if (senha === VEZ) {
        window.clearInterval(relogio);
        espera.textContent = 'agora mesmo (milagre!)';
        $('carimbo').hidden = false;
        balcao.textContent = 'É a sua vez! Dirija-se ao balcão: o gerador.';
    }
}, 2500);
