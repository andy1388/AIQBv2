import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import { getRandomInt } from '@/utils/mathUtils';

interface PowerExpression {
    base: number;
    exponent: number;
}

interface ValidCombination {
    firstTerm: PowerExpression;
    secondTerm: PowerExpression;
    result: PowerExpression;
}

export default class F6_Indice_Q1 extends QuestionGenerator {
    // 完全平方数列表
    private readonly PERFECT_SQUARES = [4, 9, 16, 25, 36, 49, 64, 81];
    // 第二项可用底数
    private readonly SECOND_BASES = [2, 3];

    constructor(difficulty: number = 1) {
        super(difficulty, 'F6_Indice_Q1');
    }

    private generateValidCombination(): ValidCombination {
        if (this.difficulty === 3) {
            return this.generateLevel3Combination();
        }
        // 难度1和2使用相同的生成逻辑
        return this.generateBasicCombination();
    }

    private generateLevel3Combination(): ValidCombination {
        // 选择两个完全平方数
        const firstSquare = this.getRandomElement(this.PERFECT_SQUARES);
        const secondSquare = this.getRandomElement(
            this.PERFECT_SQUARES.filter(n => n !== firstSquare)
        );
        
        // 生成基础指数（100-999之间的随机数）
        const baseExponent = getRandomInt(100, 999);
        // 第二个指数是基础指数的一半
        const halfExponent = Math.floor(baseExponent / 2);
        
        // 计算两个数的平方根
        const sqrt1 = Math.sqrt(firstSquare);
        const sqrt2 = Math.sqrt(secondSquare);
        
        // 计算结果
        const resultBase = sqrt1 * sqrt2;

        // 随机决定哪个数使用哪个指数
        const shouldSwap = Math.random() < 0.5;

        if (shouldSwap) {
            return {
                firstTerm: {
                    base: firstSquare,
                    exponent: halfExponent
                },
                secondTerm: {
                    base: secondSquare,
                    exponent: baseExponent
                },
                result: {
                    base: resultBase,
                    exponent: baseExponent
                }
            };
        } else {
            return {
                firstTerm: {
                    base: firstSquare,
                    exponent: baseExponent
                },
                secondTerm: {
                    base: secondSquare,
                    exponent: halfExponent
                },
                result: {
                    base: resultBase,
                    exponent: baseExponent
                }
            };
        }
    }

    private generateBasicCombination(): ValidCombination {
        // 随机选择一个完全平方数和一个简单底数
        const squareBase = this.getRandomElement(this.PERFECT_SQUARES);
        const simpleBase = this.getRandomElement(this.SECOND_BASES);
        
        // 生成第一个指数（100-999之间的随机数）
        const smallerExponent = getRandomInt(100, 999);
        // 第二个指数是第一个的2倍
        const largerExponent = smallerExponent * 2;

        // 计算结果项
        const sqrtSquareBase = Math.sqrt(squareBase);
        const resultBase = sqrtSquareBase * simpleBase;

        // 随机决定顺序（50%概率交换）
        return Math.random() < 0.5 ? {
            firstTerm: { 
                base: squareBase, 
                exponent: smallerExponent 
            },
            secondTerm: { 
                base: simpleBase, 
                exponent: largerExponent 
            },
            result: { 
                base: resultBase, 
                exponent: largerExponent 
            }
        } : {
            firstTerm: { 
                base: simpleBase, 
                exponent: largerExponent 
            },
            secondTerm: { 
                base: squareBase, 
                exponent: smallerExponent 
            },
            result: { 
                base: resultBase, 
                exponent: largerExponent 
            }
        };
    }

    private formatPower(base: number, exponent: number): string {
        return `${base}^{${exponent}}`;
    }

    private generateWrongAnswers(correct: PowerExpression): string[] {
        const wrongAnswers: string[] = [];
        
        // 生成错误答案策略：
        // 1. 改变底数
        wrongAnswers.push(this.formatPower(correct.base * 3, Math.floor(correct.exponent / 2)));
        
        // 2. 改变指数
        wrongAnswers.push(this.formatPower(correct.base / 2, correct.exponent * 2));
        
        // 3. 使用原始数据的错误组合
        wrongAnswers.push(this.formatPower(correct.base / 3, correct.exponent));

        return wrongAnswers;
    }

    private generateExplanation(combination: ValidCombination): string {
        const { firstTerm, secondTerm, result } = combination;

        if (this.difficulty === 3) {
            // 两个数都是完全平方数的情况
            const sqrt1 = Math.sqrt(firstTerm.base);
            const sqrt2 = Math.sqrt(secondTerm.base);

            return `解題步驟：

1) 將 ${firstTerm.base} 寫成平方的形式：
\\[${firstTerm.base} = ${sqrt1}^2\\]

2) 代入原式：
\\[(${sqrt1}^2)^{${firstTerm.exponent}} \\times (${sqrt2}^2)^{${secondTerm.exponent}}\\]

3) 使用指數法則 \\[(a^m)^n = a^{m\\times n}\\]：
\\[${sqrt1}^{${firstTerm.exponent * 2}} \\times ${sqrt2}^{${secondTerm.exponent * 2}}\\]

4) 使用指數法則 \\[a^n \\times b^n = (a\\times b)^n\\]：
\\[= (${sqrt1} \\times ${sqrt2})^{${result.exponent}}\\]
\\[= ${result.base}^{${result.exponent}}\\]

因此，
\\[(${firstTerm.base}^{${firstTerm.exponent}}) \\times (${secondTerm.base}^{${secondTerm.exponent}}) = ${result.base}^{${result.exponent}}\\]`.trim();
        }

        // 找出哪个是完全平方数（较大的底数）
        const squareBase = firstTerm.base > secondTerm.base ? firstTerm : secondTerm;
        const otherBase = firstTerm.base > secondTerm.base ? secondTerm : firstTerm;
        
        // 获取平方根
        const sqrtValue = Math.sqrt(squareBase.base);
        
        return `解題步驟：

1) 將 ${squareBase.base} 寫成平方的形式：
\\[${squareBase.base} = ${sqrtValue}^2\\]

2) 代入原式：
\\[(${otherBase.base}^{${otherBase.exponent}}) \\times (${sqrtValue}^2)^{${squareBase.exponent}}\\]

3) 使用指數法則 (a^m)^n = a^{m\\times n}：
\\[${otherBase.base}^{${otherBase.exponent}} \\times ${sqrtValue}^{${squareBase.exponent * 2}}\\]

4) 使用指數法則 a^n \\times b^n = (a\\times b)^n：
\\[= (${otherBase.base} \\times ${sqrtValue})^{${Math.max(otherBase.exponent, squareBase.exponent * 2)}}\\]
\\[= ${result.base}^{${result.exponent}}\\]

因此，
\\[(${firstTerm.base}^{${firstTerm.exponent}}) \\times (${secondTerm.base}^{${secondTerm.exponent}}) = ${result.base}^{${result.exponent}}\\]`.trim();
    }

    // 添加自己的 getRandomElement 方法
    private getRandomElement<T>(array: T[]): T {
        const randomIndex = getRandomInt(0, array.length - 1);
        return array[randomIndex];
    }

    generate(): IGeneratorOutput {
        // 生成一个新的有效组合
        const combination = this.generateValidCombination();
        const { firstTerm, secondTerm, result } = combination;
        
        // 使用生成的组合构建问题
        const questionText = `\\[(${firstTerm.base}^{${firstTerm.exponent}}) \\times (${secondTerm.base}^{${secondTerm.exponent}}) = \\text{?}\\]`;
        
        // 生成错误答案
        const wrongOptions = [
            // 选项1：错误的底数组合
            { base: firstTerm.base * 2, exponent: secondTerm.exponent },
            // 选项2：第二项的底数和指数
            { base: secondTerm.base, exponent: secondTerm.exponent },
            // 选项3：错误的指数组合
            { base: firstTerm.base / 2, exponent: firstTerm.exponent * 2 }
        ];

        // 格式化所有答案选项（包括正确答案）
        const allAnswers = [
            ...wrongOptions.map(opt => `$${opt.base}^{${opt.exponent}}$`),
            `$${result.base}^{${result.exponent}}$`  // 正确答案
        ];

        // 随机打乱答案选项的顺序
        const shuffledAnswers = this.shuffleArray([...allAnswers]);
        
        // 找出正确答案在打乱后数组中的索引
        const correctAnswerIndex = shuffledAnswers.findIndex(
            ans => ans === `$${result.base}^{${result.exponent}}$`
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

    // 添加数组打乱方法
    private shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
} 