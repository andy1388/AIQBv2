import { IGeneratorOutput } from './QuestionGenerator';

export interface IQuestion {
    content: string;
    options: string[];
    correctIndex: number;
    correctAnswer: string;
    explanation: string;
}

export class MC_Maker {
    static createQuestion(output: IGeneratorOutput, difficulty: number): IQuestion {
        if (!output.wrongAnswers) {
            throw new Error('Generator output missing wrongAnswers array');
        }

        // 如果有 optionContents，使用它们作为选项内容
        let options: string[];
        if (output.optionContents) {
            options = output.optionContents;
        } else {
            // 否则使用默认的合并正确答案和错误答案
            options = [output.correctAnswer, ...output.wrongAnswers];
            // 随机打乱所有选项
            options = this.shuffleArray(options);
        }
        
        // 找出正确答案在选项中的位置
        const correctIndex = output.optionContents 
            ? output.wrongAnswers.findIndex(ans => ans === output.correctAnswer)
            : options.indexOf(output.correctAnswer);

        return {
            content: output.content,
            options,
            correctIndex,
            correctAnswer: output.correctAnswer,
            explanation: output.explanation
        };
    }

    private static shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
} 