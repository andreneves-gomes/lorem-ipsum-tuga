import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Controls } from './components/Controls';
import { OutputBox } from './components/OutputBox';
import { Toast } from './components/Toast';
import { generator } from './utils/generator';
import { Copy, Dice5 } from 'lucide-react';

function App() {
    const [darkMode, setDarkMode] = useState(true);
    const [paragraphs, setParagraphs] = useState(3);
    const [intensity, setIntensity] = useState(50);
    const [options, setOptions] = useState({
        celebrities: true,
        expressions: true,
        food: true
    });
    const [outputText, setOutputText] = useState<string[]>([]);
    const [showToast, setShowToast] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Dark Mode Effect
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const handleGenerate = () => {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 600);
        
        const text = generator.generate(paragraphs, intensity, options);
        setOutputText(text);
    };

    const handleSurprise = () => {
        // Roll the dice once, then generate from the exact same values we show in the
        // controls — so what you see is what you got.
        const p = Math.floor(Math.random() * 5) + 1;
        const i = Math.floor(Math.random() * 100) + 1;
        const newOptions = {
            celebrities: Math.random() > 0.5,
            expressions: Math.random() > 0.5,
            food: Math.random() > 0.5,
        };

        setParagraphs(p);
        setIntensity(i);
        setOptions(newOptions);

        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 600);

        setOutputText(generator.generate(p, i, newOptions));
    };

    const handleCopy = async () => {
        if (outputText.length === 0) return;

        const payload = outputText.join('\n\n');
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(payload);
            } else {
                throw new Error('Clipboard API unavailable');
            }
            setShowToast(true);
        } catch {
            // Browser blocked the clipboard (e.g. insecure context): fall back to selection.
            const range = document.createRange();
            const output = document.getElementById('output-text');
            if (output) {
                range.selectNodeContents(output);
                const selection = window.getSelection();
                selection?.removeAllRanges();
                selection?.addRange(range);
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] p-6 md:p-12 border-t-8 border-t-tuga-green border-b-8 border-b-tuga-red relative overflow-hidden transition-colors duration-300">
                
                {/* Decorative Flag Strip */}
                <div className="absolute top-4 right-4 text-4xl opacity-20 rotate-12 select-none pointer-events-none" aria-hidden="true">
                    🇵🇹
                </div>

                <Header darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />

                <Controls 
                    paragraphs={paragraphs} 
                    setParagraphs={setParagraphs}
                    intensity={intensity}
                    setIntensity={setIntensity}
                    options={options}
                    setOptions={setOptions}
                />

                {/* Action Buttons */}
                <div className="flex flex-wrap justify-center gap-4 mb-10">
                    <button 
                        onClick={handleGenerate}
                        className={`
                            group relative px-8 py-4 rounded-full font-black text-lg uppercase tracking-wide
                            bg-gradient-to-br from-tuga-red to-red-700 text-tuga-gold border-2 border-tuga-gold
                            shadow-[0_6px_0_#7f1d1d] active:shadow-[0_2px_0_#7f1d1d] active:translate-y-1
                            transition-all hover:-translate-y-1 hover:shadow-[0_10px_0_#7f1d1d]
                            flex items-center gap-3
                            ${isAnimating ? 'animate-siuuu' : ''}
                        `}
                    >
                        <span className="text-2xl group-hover:scale-125 transition-transform" aria-hidden="true">🇵🇹</span>
                        {isAnimating ? "SIUUUUUUUU!" : "Gerar Texto"}
                    </button>

                    <button 
                        onClick={handleSurprise}
                        className="px-8 py-4 rounded-full font-bold text-tuga-green border-2 border-tuga-green bg-white dark:bg-gray-800 shadow-[0_6px_0_#046A38] hover:-translate-y-1 hover:shadow-[0_10px_0_#046A38] active:translate-y-1 active:shadow-[0_2px_0_#046A38] transition-all flex items-center gap-2"
                    >
                        <Dice5 size={24} aria-hidden="true" />
                        Surpreende-me
                    </button>

                    <button 
                        onClick={handleCopy}
                        className="p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-tuga-gold hover:border-tuga-gold hover:rotate-6 transition-all bg-white dark:bg-gray-800"
                        title="Copiar para a área de transferência"
                        aria-label="Copiar texto para a área de transferência"
                    >
                        <Copy size={24} aria-hidden="true" />
                    </button>
                </div>

                <OutputBox text={outputText} />
            </div>

            <Toast show={showToast} onClose={() => setShowToast(false)} />
        </div>
    )
}

export default App
