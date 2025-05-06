import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import { getRandomInt } from '@/utils/mathUtils';

interface ProbabilityQuestionData {
    totalItems: number;
    targetItems: number;
    itemType: string;
    question: string;
    answer: string;
}

export default class BasicProbabilityGenerator extends QuestionGenerator {
    private readonly CONSTANTS = {
        MIN_TOTAL_ITEMS: 10,
        MAX_TOTAL_ITEMS: 50,
        MIN_TARGET_ITEMS: 2,
        MAX_TARGET_ITEMS: 20,
        ITEM_TYPES: [
            { name: '钞票', unit: '张' },
            { name: '水果', unit: '个' },
            { name: '学生', unit: '名' },
            { name: '球', unit: '个' },
            { name: '卡片', unit: '张' }
        ]
    };

    constructor(difficulty: number = 1) {
        super(difficulty, 'F3L12.1_Q1_F_MQ');
    }

    private generateValidCombination(): ProbabilityQuestionData {
        // 根据难度调整总数和目标数
        const totalItems = getRandomInt(
            this.CONSTANTS.MIN_TOTAL_ITEMS,
            this.CONSTANTS.MAX_TOTAL_ITEMS
        );
        
        const maxTargetItems = Math.min(
            totalItems - 1,
            this.CONSTANTS.MAX_TARGET_ITEMS
        );
        
        const targetItems = getRandomInt(
            this.CONSTANTS.MIN_TARGET_ITEMS,
            maxTargetItems
        );

        // 随机选择物品类型
        const itemType = this.getRandomElement(this.CONSTANTS.ITEM_TYPES);

        // 构建问题
        const question = `在${totalItems}${itemType.unit}${itemType.name}中随机抽取一${itemType.unit}，抽到其中${targetItems}${itemType.unit}特定${itemType.name}的概率是多少？`;

        // 计算答案（以分数形式）
        const answer = `\\frac{${targetItems}}{${totalItems}}`;

        return {
            totalItems,
            targetItems,
            itemType: itemType.name,
            question,
            answer
        };
    }

    private generateWrongAnswers(correct: ProbabilityQuestionData): string[] {
        const wrongAnswers: string[] = [];
        
        // 错误答案1：分子分母互换
        wrongAnswers.push(`\\frac{${correct.totalItems}}{${correct.targetItems}}`);
        
        // 错误答案2：分母减1
        wrongAnswers.push(`\\frac{${correct.targetItems}}{${correct.totalItems - 1}}`);
        
        // 错误答案3：分子加1
        wrongAnswers.push(`\\frac{${correct.targetItems + 1}}{${correct.totalItems}}`);

        return wrongAnswers;
    }

    private generateExplanation(data: ProbabilityQuestionData): string {
        return `解题步骤：

1) 在这个概率问题中：
   * 样本空间（总数）：${data.totalItems}${data.itemType}
   * 目标事件（特定${data.itemType}数量）：${data.targetItems}${data.itemType}

2) 根据概率的定义：
   * 概率 = 目标事件数量 ÷ 样本空间总数
   \\[P(事件) = \\frac{目标事件数量}{样本空间总数}\\]

3) 代入数值计算：
   \\[P(抽中特定${data.itemType}) = \\frac{${data.targetItems}}{${data.totalItems}}\\]

因此，答案为 \\[${data.answer}\\]`.trim();
    }

    generate(): IGeneratorOutput {
        const combination = this.generateValidCombination();
        
        const questionText = combination.question;
        const correctAnswer = combination.answer;
        const wrongAnswers = this.generateWrongAnswers(combination);

        // 随机打乱答案选项
        const allAnswers = [...wrongAnswers, correctAnswer];
        const shuffledAnswers = this.shuffleArray(allAnswers);
        
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

    private getRandomElement<T>(array: T[]): T {
        return array[getRandomInt(0, array.length - 1)];
    }

    private shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
} 