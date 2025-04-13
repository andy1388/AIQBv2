import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import {
    getRandomInt,
    getRandomDecimal,
    formatNumber,
    LaTeX,
    DEFAULT_CONFIG,
    roundTo,
    roundUp,
    roundDown
} from '@/utils/mathUtils';

interface LogarithmQuestion {
    number: number;
    result: number;
}

export default class F4L7_1_1_Q1_F_MQ extends QuestionGenerator {
    constructor(difficulty: number) {
        super(difficulty, 'F4L7.1.1_Q1_F_MQ');
    }

    generate(): IGeneratorOutput {
        let question: LogarithmQuestion;
        
        // 根据难度生成问题
        switch (this.difficulty) {
            case 1:
                question = this.generateLevel1();
                break;
            case 2:
                question = this.generateLevel2();
                break;
            case 3:
                question = this.generateLevel3();
                break;
            case 4:
                question = this.generateLevel4();
                break;
            default:
                throw new Error(`不支援的難度等級: ${this.difficulty}`);
        }

        // 处理无定义的情况
        if (isNaN(question.result)) {
            const content = `\\[\\log ${question.number}\\]`;
            return {
                content: content,
                correctAnswer: "Undefined",
                wrongAnswers: ["0", "1", "-1"],  // 对于无定义的情况的错误答案
                explanation: this.generateExplanation(question),
                type: 'text',
                displayOptions: {
                    latex: true
                }
            };
        }

        // 计算结果并格式化
        const exactResult = Math.log10(question.number);
        const formattedResult = this.isIntegerResult(question.number) ? 
            Math.round(exactResult) : // 对于整数结果直接返回
            roundTo(exactResult, 2);  // 对于非整数结果四舍五入到2位小数

        // 生成错误答案
        const wrongAnswers = this.generateWrongAnswers(formattedResult, question.number);

        // 格式化题目和答案
        const content = `\\[\\log ${question.number}\\]`;
        const correctAnswer = this.isIntegerResult(question.number) ? 
            formattedResult.toString() :  // 整数结果不需要小数点
            formattedResult.toFixed(2);   // 非整数结果显示2位小数
        const explanation = this.generateExplanation(question);

        return {
            content: content,
            correctAnswer: correctAnswer,
            wrongAnswers: this.isIntegerResult(question.number) ? 
                wrongAnswers.map(x => x.toString()) :  // 整数结果的错误答案不需要小数点
                wrongAnswers.map(x => x.toFixed(2)),   // 非整数结果的错误答案显示2位小数
            explanation: explanation,
            type: 'text',
            displayOptions: {
                latex: true
            }
        };
    }

    private generateLevel1(): LogarithmQuestion {
        // 整数 2-9
        const number = getRandomInt(2, 9);
        return {
            number,
            result: Math.log10(number)
        };
    }

    private generateLevel2(): LogarithmQuestion {
        // 特殊数字：1, 10, 0, -1
        const specialNumbers = [1, 10, 0, -1];
        const number = specialNumbers[getRandomInt(0, specialNumbers.length - 1)];
        
        // 对于无定义的情况（0和负数），我们返回特殊标记
        if (number <= 0) {
            return {
                number,
                result: NaN  // 用于标识无定义的情况
            };
        }
        
        return {
            number,
            result: Math.log10(number)
        };
    }

    private generateLevel3(): LogarithmQuestion {
        // 较大整数 10-9999
        const number = getRandomInt(10, 9999);
        return {
            number,
            result: Math.log10(number)
        };
    }

    private generateLevel4(): LogarithmQuestion {
        // 小数 0.01-0.99
        const number = getRandomDecimal(0.01, 0.99, 2); // 修改范围并使用2位小数
        return {
            number,
            result: Math.log10(number)
        };
    }

    private generateWrongAnswers(correctAnswer: number, originalNumber: number): number[] {
        const wrongAnswers: number[] = [];
        
        while (wrongAnswers.length < 3) {
            let wrongAnswer: number;
            
            // 根据不同的错误类型生成错误答案
            const errorType = getRandomInt(1, 3);
            
            switch (errorType) {
                case 1: // 正负号错误
                    wrongAnswer = -correctAnswer;
                    break;
                    
                case 2: // 小数点位置错误
                    wrongAnswer = correctAnswer < 0 ? 
                        correctAnswer * 0.1 : 
                        correctAnswer * 10;
                    break;
                    
                case 3: // 计算错误（略微偏差）
                    // 对于小于1的数，使用更小的偏差
                    const deviation = originalNumber < 1 ? 
                        (Math.random() - 0.5) * 0.1 : // ±0.05 范围内的偏差
                        (Math.random() - 0.5) * 0.2;  // ±0.1 范围内的偏差
                    wrongAnswer = correctAnswer + deviation;
                    break;
                    
                default:
                    wrongAnswer = correctAnswer + 0.1;
            }
            
            // 确保答案格式正确（2位小数）
            wrongAnswer = roundTo(wrongAnswer, 2);
            
            // 确保答案不重复且不等于正确答案
            if (!wrongAnswers.includes(wrongAnswer) && 
                Math.abs(wrongAnswer - correctAnswer) > 0.01) {
                wrongAnswers.push(wrongAnswer);
            }
        }
        
        return wrongAnswers;
    }

    private isIntegerResult(number: number): boolean {
        // 检查是否为特殊情况（log 1 = 0 或 log 10 = 1）
        return number === 1 || number === 10;
    }

    private generateExplanation(question: LogarithmQuestion): string {
        const steps: string[] = [];
        
        steps.push('計算步驟：');
        steps.push(`\\[\\log ${question.number}\\]`);
        
        if (question.number <= 0) {
            if (question.number === 0) {
                steps.push('因為10的任何次方也不會是0');
                steps.push('所以 log 0 沒有定義');
            } else {
                steps.push('因為10的任何次方也不會是負數');
                steps.push('所以負數的對數沒有定義');
            }
            steps.push(`\\[= \\text{Undefined}\\]`);
        } else if (question.number === 1) {
            steps.push('因為10^{0} = 1');
            steps.push(`\\[= 0\\]`);
        } else if (question.number === 10) {
            steps.push('因為10^{1} = 10');
            steps.push(`\\[= 1\\]`);
        } else if (question.number < 1) {
            steps.push('因為輸入小於 1，所以結果為負數');
            const result = roundTo(Math.log10(question.number), 2);
            steps.push(`\\[= ${result.toFixed(2)}\\]`);
        } else {
            steps.push('使用計算機計算：');
            const result = roundTo(Math.log10(question.number), 2);
            steps.push(`\\[= ${result.toFixed(2)}\\]`);
        }
        
        return steps.join('\n');
    }
} 