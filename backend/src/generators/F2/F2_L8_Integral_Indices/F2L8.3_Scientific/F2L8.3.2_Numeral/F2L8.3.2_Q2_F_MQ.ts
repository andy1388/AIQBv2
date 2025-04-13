import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import { getRandomInt } from '@/utils/mathUtils';

interface PlaceValueQuestion {
    number: string;
    markedPosition: number;  // 0-based from right
    placeValue: number;
    isBinary: boolean;
    isDecimal: boolean;
}

export default class F2L8_3_2_Q1_F_MQ extends QuestionGenerator {
    protected difficulty: number;
    private question!: PlaceValueQuestion;

    constructor(difficulty: number) {
        super(difficulty, 'F2L8.3.2_Q1_F_MQ');
        this.difficulty = difficulty;
    }

    private generateDecimalNumber(min: number, max: number): string {
        return getRandomInt(min, max).toString();
    }

    private generateBinaryNumber(length: number): string {
        let result = '1';  // Always start with 1
        for (let i = 1; i < length; i++) {
            result += Math.random() < 0.5 ? '0' : '1';
        }
        return result;
    }

    private generateDecimalFraction(length: number): string {
        let result = '';
        let allZeros = true;
        for (let i = 0; i < length; i++) {
            const digit = getRandomInt(0, 9);
            if (digit !== 0) allZeros = false;
            result += digit;
        }
        // 如果全是0，确保最后一位不为0
        if (allZeros) {
            result = result.slice(0, -1) + getRandomInt(1, 9);
        }
        return result;
    }

    private generateBinaryFraction(length: number): string {
        let result = '';
        let allZeros = true;
        for (let i = 0; i < length; i++) {
            const bit = Math.random() < 0.5 ? '0' : '1';
            if (bit === '1') allZeros = false;
            result += bit;
        }
        // 如果全是0，确保最后一位为1
        if (allZeros) {
            result = result.slice(0, -1) + '1';
        }
        return result;
    }

    private generateQuestion(): PlaceValueQuestion {
        let number: string;
        let isBinary = false;
        let isDecimal = false;

        try {
            switch (this.difficulty) {
                case 1: {
                    // 难度1：十进制整数 (3-5位数)
                    const min = Math.pow(10, 2);  // 100
                    const max = Math.pow(10, 5) - 1;  // 99999
                    number = this.generateDecimalNumber(min, max);
                    break;
                }
                case 2: {
                    // 难度2：二进制整数 (4-7位)
                    number = this.generateBinaryNumber(getRandomInt(4, 7));
                    isBinary = true;
                    break;
                }
                case 3: {
                    // 难度3：十进制小数
                    const intPart = this.generateDecimalNumber(1000, 9999);
                    const fracPart = this.generateDecimalFraction(getRandomInt(2, 4));
                    number = `${intPart}.${fracPart}`;
                    isDecimal = true;
                    break;
                }
                case 4: {
                    // 难度4：二进制小数
                    const intPart = this.generateBinaryNumber(getRandomInt(3, 4));
                    const fracPart = this.generateBinaryFraction(getRandomInt(2, 3));
                    number = `${intPart}.${fracPart}`;
                    isBinary = true;
                    isDecimal = true;
                    break;
                }
                default:
                    throw new Error(`Invalid difficulty: ${this.difficulty}`);
            }

            let markedPosition: number;
            let placeValue: number;

            if (isDecimal) {
                // 对于难度3和4，只标记小数部分
                const [intPart, fracPart] = number.split('.');
                // 随机选择小数部分的一个位置
                markedPosition = intPart.length + getRandomInt(0, fracPart.length - 1);
                // 计算位值（负指数）
                const fracPosition = markedPosition - intPart.length;
                placeValue = isBinary ? 
                    Math.pow(2, -(fracPosition + 1)) : 
                    Math.pow(10, -(fracPosition + 1));
            } else {
                markedPosition = getRandomInt(0, number.length - 1);
                placeValue = isBinary ? 
                    Math.pow(2, markedPosition) : 
                    Math.pow(10, markedPosition);
            }

            return {
                number,
                markedPosition,
                placeValue,
                isBinary,
                isDecimal
            };
        } catch (error) {
            console.error('Error in generateQuestion:', error);
            return {
                number: '1234',
                markedPosition: 0,
                placeValue: 1,
                isBinary: false,
                isDecimal: false
            };
        }
    }

    private generateWrongAnswers(correctValue: number, isBinary: boolean, isDecimal: boolean): string[] {
        try {
            const wrongAnswers = new Set<string>();
            const base = isBinary ? 2 : 10;

            // 对于二进制小数，使用预定义的位值集合
            if (isBinary && isDecimal) {
                const binaryFractions = [0.5, 0.25, 0.125, 0.0625];
                for (const value of binaryFractions) {
                    if (value !== correctValue) {
                        wrongAnswers.add(value.toString());
                    }
                }
                // 如果还需要更多错误答案，添加1
                if (wrongAnswers.size < 3 && correctValue !== 1) {
                    wrongAnswers.add('1');
                }
            } else if (isDecimal) {
                // 十进制小数的情况
                const decimalFractions = [0.1, 0.01, 0.001, 0.0001];
                for (const value of decimalFractions) {
                    if (value !== correctValue) {
                        wrongAnswers.add(value.toString());
                    }
                }
                // 如果还需要更多错误答案，添加1
                if (wrongAnswers.size < 3 && correctValue !== 1) {
                    wrongAnswers.add('1');
                }
            } else {
                // 整数的情况保持不变
                const maxValue = isBinary ? 64 : 10000;

                // 1. 数字本身
                const digit = parseInt(this.question.number[
                    this.question.number.length - 1 - this.question.markedPosition
                ]);
                if (digit !== correctValue && !isNaN(digit)) {
                    wrongAnswers.add(digit.toString());
                }

                // 2. 邻近位值
                if (correctValue > base) {
                    const lowerValue = Math.floor(correctValue / base);
                    wrongAnswers.add(lowerValue.toString());
                }
                if (correctValue * base <= maxValue) {
                    wrongAnswers.add((correctValue * base).toString());
                }

                // 3. 基本位值
                const basicValues = isBinary ? 
                    [1, 2, 4, 8, 16, 32, 64] : 
                    [1, 10, 100, 1000, 10000];
                
                for (const value of basicValues) {
                    if (value !== correctValue && value <= maxValue) {
                        wrongAnswers.add(value.toString());
                    }
                    if (wrongAnswers.size >= 3) break;
                }
            }

            // 确保有3个不同的错误答案
            const result = Array.from(wrongAnswers)
                .filter(ans => !isNaN(Number(ans)) && ans !== correctValue.toString())
                .slice(0, 3);

            // 如果错误答案不够3个，添加安全的默认值
            while (result.length < 3) {
                if (isBinary && isDecimal) {
                    const defaults = ['0.5', '0.25', '0.125'].filter(v => v !== correctValue.toString());
                    result.push(defaults[result.length]);
                } else if (isDecimal) {
                    const defaults = ['0.1', '0.01', '0.001'].filter(v => v !== correctValue.toString());
                    result.push(defaults[result.length]);
                } else {
                    const defaults = isBinary ? 
                        ['2', '4', '8'].filter(v => v !== correctValue.toString()) :
                        ['10', '100', '1000'].filter(v => v !== correctValue.toString());
                    result.push(defaults[result.length]);
                }
            }

            return result;
        } catch (error) {
            console.error('Error in generateWrongAnswers:', error);
            // 提供安全的默认错误答案
            const defaultWrongs = isBinary ? 
                (isDecimal ? ['0.5', '0.25', '0.125'] : ['2', '4', '8']) : 
                (isDecimal ? ['0.1', '0.01', '0.001'] : ['10', '100', '1000']);
            return defaultWrongs
                .filter(w => w !== correctValue.toString())
                .slice(0, 3);
        }
    }

    private generateExplanation(question: PlaceValueQuestion): string {
        try {
            const steps: string[] = [];
            const base = question.isBinary ? 2 : 10;
            
            let position: number;
            let digit: string;
            
            if (question.isDecimal) {
                const [intPart, fracPart] = question.number.split('.');
                if (question.markedPosition >= intPart.length) {
                    // 小数部分
                    position = question.markedPosition - intPart.length + 1;
                    digit = fracPart[position - 1];
                    steps.push(
                        '1. 找出底線數字的位置',
                        `\\[\\text{從小數點後第 ${position} 位}\\]`,
                        '2. 計算位值',
                        question.isBinary ?
                            `\\[2^{-${position}} = ${question.placeValue}\\]` :
                            `\\[10^{-${position}} = ${question.placeValue}\\]`
                    );
                } else {
                    // 整数部分
                    position = intPart.length - question.markedPosition;
                    digit = intPart[question.markedPosition];
                    steps.push(
                        '1. 找出底線數字的位置',
                        `\\[\\text{整數部分從右邊數起第 ${position} 位}\\]`,
                        '2. 計算位值',
                        question.isBinary ?
                            `\\[2^{${position - 1}} = ${question.placeValue}\\]` :
                            `\\[10^{${position - 1}} = ${question.placeValue}\\]`
                    );
                }
            } else {
                position = question.markedPosition + 1;
                digit = question.number[question.number.length - position];
                steps.push(
                    '1. 找出底線數字的位置',
                    `\\[\\text{從右邊數起第 ${position} 位}\\]`,
                    '2. 計算位值',
                    question.isBinary ?
                        `\\[2^{${question.markedPosition}} = ${question.placeValue}\\]` :
                        `\\[10^{${question.markedPosition}} = ${question.placeValue}\\]`
                );
            }
            
            steps.push(
                '3. 確認答案',
                `\\[\\text{數字 ${digit} 的位值為 ${question.placeValue}}\\]`
            );

            return steps.join('\n');
        } catch (error) {
            console.error('Error in generateExplanation:', error);
            return '解释生成错误';
        }
    }

    generate(): IGeneratorOutput {
        try {
            this.question = this.generateQuestion();
            
            const baseNumber = this.question.number;
            let markedIndex: number;
            
            if (this.question.isDecimal) {
                const [intPart, fracPart] = baseNumber.split('.');
                if (this.question.markedPosition >= intPart.length) {
                    // 标记在小数部分
                    markedIndex = intPart.length + 1 + (this.question.markedPosition - intPart.length);
                } else {
                    // 标记在整数部分
                    markedIndex = this.question.markedPosition;
                }
            } else {
                markedIndex = this.question.number.length - 1 - this.question.markedPosition;
            }
            
            // 添加问题描述
            const questionText = 'What is the place value of the underlined number?';
            const content = `${questionText}\n\\[${baseNumber.slice(0, markedIndex)}\\underline{${baseNumber[markedIndex]}}${baseNumber.slice(markedIndex + 1)}${this.question.isBinary ? '_2' : ''}\\]`;

            const wrongAnswers = this.generateWrongAnswers(
                this.question.placeValue,
                this.question.isBinary,
                this.question.isDecimal
            );

            return {
                content,
                correctAnswer: this.question.placeValue.toString(),
                wrongAnswers,
                explanation: this.generateExplanation(this.question),
                type: 'text',
                displayOptions: {
                    latex: true
                }
            };
        } catch (error) {
            console.error('Error in generate:', error);
            return {
                content: 'What is the place value of the underlined number?\n\\[1234\\]',
                correctAnswer: '1',
                wrongAnswers: ['2', '3', '4'],
                explanation: '错误生成题目',
                type: 'text',
                displayOptions: {
                    latex: true
                }
            };
        }
    }
} 