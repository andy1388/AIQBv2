import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import { getRandomInt } from '@/utils/mathUtils';


interface PowerQuestion {
    number: string;
    coefficient: number;
    exponent: number;
}

export default class F2L8_3_2_Q5_F_MQ extends QuestionGenerator {
    protected difficulty: number;
    private question!: PowerQuestion;

    constructor(difficulty: number) {
        super(difficulty, 'F2L8.3.2_Q5_F_MQ');
        this.difficulty = difficulty;
    }

    private generateDecimalNumber(min: number, max: number): string {
        return getRandomInt(min, max).toString();
    }

    private generateSmallDecimal(minDigits: number, maxDigits: number): string {
        // 生成小數，確保不全是0
        let result = '0.';
        let allZeros = true;
        const digits = getRandomInt(minDigits, maxDigits);
        
        for (let i = 0; i < digits - 1; i++) {
            result += '0';
        }
        
        // 最後一位確保不是0
        result += getRandomInt(1, 9).toString();
        
        return result;
    }

    private calculatePowerForm(num: string): PowerQuestion {
        let coefficient: number;
        let exponent: number;

        if (num.includes('.')) {
            // 處理小數
            const [, decimalPart] = num.split('.');
            const leadingZeros = decimalPart.match(/^0*/)?.[0].length || 0;
            const firstNonZero = decimalPart[leadingZeros];
            const restDigits = decimalPart.slice(leadingZeros + 1);
            
            coefficient = parseFloat(`${firstNonZero}${restDigits ? '.' + restDigits : ''}`);
            exponent = -(leadingZeros + 1);
        } else {
            // 處理整數
            const digits = num.length;
            coefficient = parseInt(num[0]);
            if (num.length > 1) {
                coefficient = parseFloat(num[0] + '.' + num.slice(1));
            }
            exponent = digits - 1;
        }

        return {
            number: num,
            coefficient,
            exponent
        };
    }

    private generateQuestion(): PowerQuestion {
        try {
            let number: string;

            switch (this.difficulty) {
                case 1: {
                    // 難度1：3-5位整數
                    const min = Math.pow(10, 2);
                    const max = Math.pow(10, 5) - 1;
                    number = this.generateDecimalNumber(min, max);
                    break;
                }
                case 2: {
                    // 難度2：3-5位小數
                    number = this.generateSmallDecimal(3, 5);
                    break;
                }
                default:
                    throw new Error(`Invalid difficulty: ${this.difficulty}`);
            }

            return this.calculatePowerForm(number);

        } catch (error) {
            console.error('Error in generateQuestion:', error);
            return {
                number: '1000',
                coefficient: 1,
                exponent: 3
            };
        }
    }

    private formatAnswer(coefficient: number, exponent: number): string {
        return `${coefficient} × 10^{${exponent}}`;
    }

    private generateWrongAnswers(correctAnswer: string): string[] {
        const wrongAnswers = new Set<string>();
        const { coefficient, exponent } = this.question;

        try {
            // 1. 指數錯誤
            wrongAnswers.add(this.formatAnswer(coefficient, exponent + 1));
            wrongAnswers.add(this.formatAnswer(coefficient, exponent - 1));

            // 2. 係數錯誤（小數點位置錯誤）
            const wrongCoef = coefficient * 10;
            wrongAnswers.add(this.formatAnswer(wrongCoef, exponent - 1));

            // 3. 符號錯誤（對於小數）
            if (exponent < 0) {
                wrongAnswers.add(this.formatAnswer(coefficient, -exponent));
            }

            return Array.from(wrongAnswers).slice(0, 3);
        } catch (error) {
            console.error('Error in generateWrongAnswers:', error);
            return [
                '1 × 10^{2}',
                '10 × 10^{1}',
                '1 × 10^{4}'
            ];
        }
    }

    private generateExplanation(question: PowerQuestion): string {
        try {
            const steps: string[] = [];
            
            if (question.number.includes('.')) {
                // 小數的解釋
                const [, decimalPart] = question.number.split('.');
                steps.push(
                    '1. 找出第一個非零數字的位置',
                    `\\[\\text{從小數點後數第 ${-question.exponent} 位}\\]`,
                    '2. 將小數點移到第一個非零數字後',
                    `\\[${question.number} = ${question.coefficient} × 10^{${question.exponent}}\\]`,
                    '3. 確認答案',
                    `\\[\\text{答案為 }${this.formatAnswer(question.coefficient, question.exponent)}\\]`
                );
            } else {
                // 整數的解釋
                steps.push(
                    '1. 計算數字的位數',
                    `\\[\\text{共有 ${question.number.length} 位數}\\]`,
                    '2. 將小數點移到第一位數字後',
                    `\\[${question.number} = ${question.coefficient} × 10^{${question.exponent}}\\]`,
                    '3. 確認答案',
                    `\\[\\text{答案為 }${this.formatAnswer(question.coefficient, question.exponent)}\\]`
                );
            }

            return steps.join('\n');
        } catch (error) {
            console.error('Error in generateExplanation:', error);
            return '解释生成错误';
        }
    }

    generate(): IGeneratorOutput {
        try {
            this.question = this.generateQuestion();
            
            const correctAnswer = this.formatAnswer(
                this.question.coefficient,
                this.question.exponent
            );

            const wrongAnswers = this.generateWrongAnswers(correctAnswer);

            return {
                content: `Express the following number in the form a × 10^n where 1 ≤ a < 10:\n\\[${this.question.number}\\]`,
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
                content: 'Express in the form a × 10^n:\n\\[1000\\]',
                correctAnswer: '1 × 10^{3}',
                wrongAnswers: ['1 × 10^{2}', '10 × 10^{2}', '1 × 10^{4}'],
                explanation: '错误生成题目',
                type: 'text',
                displayOptions: {
                    latex: true
                }
            };
        }
    }
} 