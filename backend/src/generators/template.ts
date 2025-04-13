import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import { getRandomInt } from '@/utils/mathUtils';

// 定义题目所需的接口
interface QuestionData {
    // 根据具体题目需求修改这些属性
    question: string;      // 题目内容
    answer: number | string; // 正确答案
}

export default class YourQuestionGenerator extends QuestionGenerator {
    // 定义常量和配置
    private readonly CONSTANTS = {
        // 在这里定义你的常量
        MIN_VALUE: 1,
        MAX_VALUE: 100,
        SPECIAL_VALUES: [/* 特殊值数组 */]
    };

    constructor(difficulty: number = 1) {
        // 设置难度和题目ID
        super(difficulty, 'Your_Question_ID');
    }

    // 生成有效组合的方法
    private generateValidCombination(): QuestionData {
        if (this.difficulty === 3) {
            return this.generateLevel3Combination();
        }
        return this.generateBasicCombination();
    }

    // 难度3的特殊生成逻辑
    private generateLevel3Combination(): QuestionData {
        // 在这里实现难度3的生成逻辑
        return {
            question: '难度3的题目',
            answer: '难度3的答案'
        };
    }

    // 基础难度的生成逻辑
    private generateBasicCombination(): QuestionData {
        // 在这里实现基础难度的生成逻辑
        return {
            question: '基础难度的题目',
            answer: '基础难度的答案'
        };
    }

    // 格式化答案的辅助方法
    private formatAnswer(answer: number | string): string {
        // 在这里实现答案格式化逻辑
        return `$${answer}$`;
    }

    // 生成错误答案
    private generateWrongAnswers(correct: number | string): string[] {
        // 在这里实现错误答案生成逻辑
        return [
            this.formatAnswer(0),  // 示例错误答案1
            this.formatAnswer(1),  // 示例错误答案2
            this.formatAnswer(2)   // 示例错误答案3
        ];
    }

    // 生成解释
    private generateExplanation(data: QuestionData): string {
        if (this.difficulty === 3) {
            // 难度3的解释
            return `解題步驟：

1) 第一步：
\\[第一步数学公式\\]

2) 第二步：
\\[第二步数学公式\\]

3) 使用规则：
\\[规则公式\\]

4) 最后一步：
\\[最后的公式\\]
\\[= ${data.answer}\\]

因此，
\\[${data.question} = ${data.answer}\\]`.trim();
        }

        // 基础难度的解释
        return `解題步驟：

1) 第一步：
\\[第一步数学公式\\]

2) 第二步：
\\[第二步数学公式\\]

3) 计算结果：
\\[= ${data.answer}\\]

因此，
\\[${data.question} = ${data.answer}\\]`.trim();
    }

    // 主要生成方法
    generate(): IGeneratorOutput {
        // 生成题目组合
        const combination = this.generateValidCombination();
        
        // 构建问题文本（使用 LaTeX 格式）
        const questionText = `\\[${combination.question} = \\text{?}\\]`;
        
        // 格式化正确答案
        const correctAnswer = this.formatAnswer(combination.answer);
        
        // 生成错误答案
        const wrongAnswers = this.generateWrongAnswers(combination.answer);

        // 随机打乱答案选项顺序
        const allAnswers = [...wrongAnswers, correctAnswer];
        const shuffledAnswers = this.shuffleArray(allAnswers);
        
        // 找出正确答案的位置
        const correctAnswerIndex = shuffledAnswers.findIndex(
            ans => ans === correctAnswer
        );

        return {
            content: questionText,
            correctAnswer: shuffledAnswers[correctAnswerIndex],
            wrongAnswers: shuffledAnswers.filter((_, index) => index !== correctAnswerIndex),
            explanation: this.generateExplanation(combination),
            type: 'text',
            displayOptions: {
                latex: true
            }
        };
    }

    // 工具方法：随机选择数组元素
    private getRandomElement<T>(array: T[]): T {
        const randomIndex = getRandomInt(0, array.length - 1);
        return array[randomIndex];
    }

    // 工具方法：打乱数组
    private shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
} 