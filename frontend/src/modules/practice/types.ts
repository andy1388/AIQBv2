export interface Question {
    content: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    difficulty: number;
    maxDifficulty: number;
}

export interface GeneratorInfo {
    id: string;
    title: string;
    difficulty: number;
    levelNumber: number;
} 