import { Request, Response } from 'express';

export interface IGeneratorOutput {
    question: string;
    answer: string;
    options?: string[];
    difficulty?: number;
}

export interface IQuestionGenerator {
    difficulty: number;
    generate(): IGeneratorOutput;
    shuffleArray<T>(array: T[]): T[];
}

declare module '@/utils/mathUtils' {
    export function formatLogResult(result: number): string;
} 