import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import { getRandomInt } from '@/utils/mathUtils';

interface PlaceValueQuestion {
    number: string;
    markedPosition: number;  // 0-based from right
    placeValue: number;      // 存儲指數
    isBinary: boolean;
    isDecimal: boolean;
}

export default class F2L8_3_2_Q6_F_MQ extends QuestionGenerator {
    protected difficulty: number;
    private question!: PlaceValueQuestion;

    constructor(difficulty: number) {
        super(difficulty, 'F2L8.3.2_Q6_F_MQ');
        this.difficulty = difficulty;
    }

    // 生成數字的基本方法保持不變
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
                    // 難度1：十進制整數 (3-5位數)
                    const min = Math.pow(10, 2);
                    const max = Math.pow(10, 5) - 1;
                    number = this.generateDecimalNumber(min, max);
                    break;
                }
                case 2: {
                    // 難度2：二進制整數 (4-7位)
                    number = this.generateBinaryNumber(getRandomInt(4, 7));
                    isBinary = true;
                    break;
                }
                case 3: {
                    // 難度3：十進制小數
                    const intPart = this.generateDecimalNumber(1000, 9999);
                    const fracPart = this.generateDecimalFraction(getRandomInt(2, 4));
                    number = `${intPart}.${fracPart}`;
                    isDecimal = true;
                    break;
                }
                case 4: {
                    // 難度4：二進制小數
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
                const [intPart, fracPart] = number.split('.');
                // 只標記小數部分
                markedPosition = intPart.length + getRandomInt(0, fracPart.length - 1);
                // 計算位值（負指數）
                const fracPosition = markedPosition - intPart.length;
                placeValue = -(fracPosition + 1);
            } else {
                markedPosition = getRandomInt(0, number.length - 1);
                placeValue = number.length - 1 - markedPosition;
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

    private formatPowerExpression(base: number, exponent: number): string {
        return `${base}^{${exponent}}`;
    }

    private generateWrongAnswers(correctExp: string, isBinary: boolean, isDecimal: boolean): string[] {
        const wrongAnswers = new Set<string>();
        const base = isBinary ? 2 : 10;
        const exponent = this.question.placeValue;

        try {
            // 1. 指數錯誤
            wrongAnswers.add(this.formatPowerExpression(base, exponent + 1));
            wrongAnswers.add(this.formatPowerExpression(base, exponent - 1));

            // 2. 基數錯誤
            const wrongBase = isBinary ? 10 : 2;
            wrongAnswers.add(this.formatPowerExpression(wrongBase, exponent));

            // 3. 符號錯誤（對於小數）
            if (isDecimal) {
                wrongAnswers.add(this.formatPowerExpression(base, -exponent));
            }

            return Array.from(wrongAnswers).slice(0, 3);
        } catch (error) {
            console.error('Error in generateWrongAnswers:', error);
            return [
                '10^{1}',
                '2^{2}',
                '10^{3}'
            ];
        }
    }

    private generateExplanation(question: PlaceValueQuestion): string {
        try {
            const steps: string[] = [];
            const base = question.isBinary ? 2 : 10;
            
            steps.push(
                '1. 找出底線數字的位置',
                question.isDecimal ?
                    `\\[\\text{從小數點後第 ${-question.placeValue} 位}\\]` :
                    `\\[\\text{從右邊數起第 ${question.placeValue + 1} 位}\\]`,
                '2. 計算位值',
                `\\[${this.formatPowerExpression(base, question.placeValue)}\\]`,
                '3. 確認答案',
                `\\[\\text{底線數字的位值為 }${this.formatPowerExpression(base, question.placeValue)}\\]`
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
            
            // 構建帶有底線的數字
            let displayNumber = this.question.number;
            const markedIndex = this.question.isDecimal ?
                (this.question.markedPosition >= this.question.number.indexOf('.') ?
                    this.question.markedPosition + 1 : // 加1是因為小數點
                    this.question.markedPosition) :
                this.question.markedPosition;

            displayNumber = 
                displayNumber.slice(0, markedIndex) + 
                '\\underline{' + displayNumber[markedIndex] + '}' + 
                displayNumber.slice(markedIndex + 1);

            const correctAnswer = this.formatPowerExpression(
                this.question.isBinary ? 2 : 10,
                this.question.placeValue
            );

            const wrongAnswers = this.generateWrongAnswers(
                correctAnswer,
                this.question.isBinary,
                this.question.isDecimal
            );

            return {
                content: `What is the place value of the underlined number?\n\\[${displayNumber}${this.question.isBinary ? '_2' : ''}\\]`,
                correctAnswer,
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
                content: 'What is the place value?\n\\[1234\\]',
                correctAnswer: '10^{3}',
                wrongAnswers: ['10^{2}', '2^{3}', '10^{4}'],
                explanation: '错误生成题目',
                type: 'text',
                displayOptions: {
                    latex: true
                }
            };
        }
    }
} 