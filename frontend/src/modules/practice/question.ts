import { Question, GeneratorInfo } from './types';

export class QuestionManager {
    constructor() {}
    
    async generateQuestion(generatorId: string, difficulty: number): Promise<Question> {
        const response = await fetch(`/api/questions/generate/${generatorId}?difficulty=${difficulty}`);
        if (!response.ok) {
            throw new Error('Failed to generate question');
        }
        return response.json();
    }
    
    async getGeneratorInfo(generatorId: string): Promise<GeneratorInfo> {
        const response = await fetch(`/api/questions/generator-info/${generatorId}`);
        if (!response.ok) {
            throw new Error('Failed to get generator info');
        }
        return response.json();
    }
} 