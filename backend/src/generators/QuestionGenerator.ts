import * as path from 'path';
import * as fs from 'fs';

export type GeneratorClass = new (difficulty: number) => QuestionGenerator;
export type GeneratorMap = { [key: string]: GeneratorClass };

export interface IGeneratorOutput {
    content: string;
    correctAnswer: string;
    wrongAnswers: string[];
    explanation: string;

    hasImage?: boolean;
    imageUrl?: string;
    
    type?: 'text' | 'image' | 'mixed';
    metadata?: {
        topic?: string;
        subtopic?: string;
        skills?: string[];
        prerequisites?: string[];
    };
    
    displayOptions?: {
        latex?: boolean;
        graph?: boolean;
        table?: boolean;
    };

    optionContents?: string[];
}

export abstract class QuestionGenerator {
    protected difficulty: number;
    protected generatorId: string;
    protected maxDifficulty: number;

    constructor(difficulty: number, generatorId: string) {
        this.difficulty = difficulty;
        this.generatorId = generatorId;
        this.maxDifficulty = this.readMaxDifficultyFromDesc();
    }

    private readMaxDifficultyFromDesc(): number {
        try {
            const currentFilePath = this.getCurrentFilePath();
            const currentDir = path.dirname(currentFilePath);
            const descPath = path.join(currentDir, `${this.generatorId}.desc.txt`);
            
            console.log('Reading desc file from:', descPath);
            const descContent = fs.readFileSync(descPath, 'utf8');
            
            const levelMatch = descContent.match(/Level number[：:]\s*(\d+)/);
            const maxDifficulty = levelMatch ? parseInt(levelMatch[1]) : 5;
            
            console.log('Found max difficulty:', maxDifficulty);
            return maxDifficulty;
        } catch (error) {
            console.error('Error reading max difficulty:', error);
            return 5;
        }
    }

    private getCurrentFilePath(): string {
        const stack = new Error().stack;
        if (!stack) return __dirname;

        const stackLines = stack.split('\n');
        for (const line of stackLines) {
            if (line.includes('.ts:') && !line.includes('QuestionGenerator.ts')) {
                const match = line.match(/\((.*?):\d+:\d+\)/);
                if (match && match[1]) {
                    return match[1];
                }
            }
        }
        return __dirname;
    }

    abstract generate(): IGeneratorOutput;

    protected getGeneratorOutput(output: Partial<IGeneratorOutput>): IGeneratorOutput {
        const result = {
            ...output,
            maxDifficulty: this.maxDifficulty,
            currentDifficulty: this.difficulty
        } as IGeneratorOutput;
        
        console.log('Generator output:', result);
        return result;
    }
} 