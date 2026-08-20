import { dictionary, GeneratorOptions } from '../data/dictionary';

interface WorkingDictionary {
    intros: string[];
    subjects: string[];
    actions: string[];
    complements: string[];
    connectors: string[];
    endings: string[];
    slang: string[];
}

const DEFAULT_OPTIONS: GeneratorOptions = {
    celebrities: true,
    expressions: true,
    food: true,
};

export class TugaGenerator {
    generate(numParagraphs: number, intensity: number, options: GeneratorOptions = DEFAULT_OPTIONS): string[] {
        const paragraphs: string[] = [];
        for (let i = 0; i < numParagraphs; i++) {
            paragraphs.push(this.createParagraph(intensity, options));
        }
        return paragraphs;
    }

    // Build a fresh, filtered word bank. "people" and general actions/complements are
    // always present so the generator never runs out of words, whatever the options.
    private buildBank(options: GeneratorOptions): WorkingDictionary {
        return {
            intros: options.expressions ? [...dictionary.intros] : [],
            subjects: [
                ...dictionary.people,
                ...(options.celebrities ? dictionary.celebrities : []),
            ],
            actions: [
                ...dictionary.actions,
                ...(options.food ? dictionary.foodActions : []),
            ],
            complements: [
                ...dictionary.complements,
                ...(options.food ? dictionary.foodComplements : []),
            ],
            connectors: [...dictionary.connectors],
            endings: options.expressions ? [...dictionary.endings] : [],
            slang: options.expressions ? [...dictionary.slang] : [],
        };
    }

    private createParagraph(intensity: number, options: GeneratorOptions): string {
        const numSentences = Math.floor(Math.random() * 4) + 3; // 3 to 6 sentences

        // Fresh bank per paragraph so getRandomAndRemove dedupes within the paragraph.
        const tempData = this.buildBank(options);

        let paragraph = "";
        for (let i = 0; i < numSentences; i++) {
            paragraph += this.createSentence(intensity, tempData) + " ";
        }

        return paragraph.trim();
    }

    private createSentence(intensity: number, tempData: WorkingDictionary): string {
        const isComplex = Math.random() > 0.5;
        const useSlang = (intensity / 100) > Math.random();
        
        let sentence = "";
        
        // 1. Intro (only when expressions are enabled and available)
        if (tempData.intros.length > 0 && Math.random() > 0.3) {
            sentence += this.getRandomAndRemove(tempData.intros) + " ";
        }

        // 2. Core Sentence
        sentence += this.buildCoreSentence(useSlang, tempData);

        // 3. Connector + Second part
        if (isComplex) {
            sentence += " " + this.getRandomAndRemove(tempData.connectors) + " " + this.buildCoreSentence(useSlang, tempData);
        }

        // 4. Ending (fall back to a full stop when no expressive endings are available)
        if (tempData.endings.length > 0 && Math.random() < (intensity / 100)) {
            sentence += this.getRandomAndRemove(tempData.endings);
        } else {
            sentence += ".";
        }

        // Trim any leading space (e.g. when the intro was skipped) and capitalize.
        sentence = sentence.trimStart();
        sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
        
        return sentence;
    }

    private buildCoreSentence(useSlang: boolean, tempData: WorkingDictionary): string {
        let s = this.getRandomAndRemove(tempData.subjects) + " ";
        
        if (useSlang && tempData.slang.length > 0 && Math.random() > 0.5) {
            s += this.getRandomAndRemove(tempData.slang) + " "; 
        }
        
        s += this.getRandomAndRemove(tempData.actions) + " ";
        s += this.getRandomAndRemove(tempData.complements);
        
        return s;
    }

    private getRandomAndRemove(arr: string[]): string {
        if (!arr || arr.length === 0) {
            return ""; 
        }
        const index = Math.floor(Math.random() * arr.length);
        const item = arr[index];
        arr.splice(index, 1); // Remove used item
        return item;
    }
}

export const generator = new TugaGenerator();
