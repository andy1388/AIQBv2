import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import { getRandomInt } from '@/utils/mathUtils';

interface SquareOfSumData {
    firstTerm: string;
    secondTerm: string;
    coefficient?: number;
}

export default class SquareOfSumGenerator extends QuestionGenerator {
    private readonly CONSTANTS = {
        SMALL_INTEGERS: [2, 3],
        LARGE_INTEGERS: [4, 5, 6, 7, 8, 9, 10, 11, 12],
        FRACTIONS: [
            { num: 1, den: 2 },
            { num: 1, den: 3 },
            { num: 1, den: 5 },
            { num: 1, den: 6 },
            { num: 1, den: 7 },
            { num: 1, den: 15 }
        ]
    };

    constructor(difficulty: number = 1) {
        super(difficulty, 'F2L2.2.3_Q1');
    }

    private generateLevel1(): SquareOfSumData {
        const n = getRandomInt(1, 5);
        return {
            firstTerm: 'x',
            secondTerm: n.toString()
        };
    }

    private generateLevel2(): SquareOfSumData {
        const a = this.getRandomElement(this.CONSTANTS.SMALL_INTEGERS);
        const b = getRandomInt(1, 5);
        return {
            firstTerm: `${a}x`,
            secondTerm: b.toString()
        };
    }

    private generateLevel3(): SquareOfSumData {
        if (Math.random() < 0.3) {
            return {
                firstTerm: 'x',
                secondTerm: 'y'
            };
        }
        const a = this.getRandomElement(this.CONSTANTS.SMALL_INTEGERS);
        const b = this.getRandomElement(this.CONSTANTS.SMALL_INTEGERS);
        return {
            firstTerm: `${a}x`,
            secondTerm: `${b}y`
        };
    }

    private generateLevel4(): SquareOfSumData {
        const rand = Math.random();
        const integerCoef = getRandomInt(2, 4);
        const fraction = this.getRandomElement(this.CONSTANTS.FRACTIONS);
        
        if (rand < 0.5) {
            // (2x + y/3)²
            return {
                firstTerm: `${integerCoef}x`,
                secondTerm: `y/${fraction.den}`
            };
        } else {
            // (x/3 + 2y)²
            return {
                firstTerm: `x/${fraction.den}`,
                secondTerm: `${integerCoef}y`
            };
        }
    }

    private generateLevel5(): SquareOfSumData {
        const rand = Math.random();
        if (rand < 0.5) {
            // (x/a + 1)²
            const frac = this.getRandomElement(this.CONSTANTS.FRACTIONS);
            return {
                firstTerm: `x/${frac.den}`,
                secondTerm: '1'
            };
        } else {
            // (x/a + y/b)²
            const frac1 = this.getRandomElement(this.CONSTANTS.FRACTIONS);
            const frac2 = this.getRandomElement(this.CONSTANTS.FRACTIONS);
            return {
                firstTerm: `x/${frac1.den}`,
                secondTerm: `y/${frac2.den}`
            };
        }
    }

    private generateValidCombination(): SquareOfSumData {
        switch (this.difficulty) {
            case 1:
                return this.generateLevel1();
            case 2:
                return this.generateLevel2();
            case 3:
                return this.generateLevel3();
            case 4:
                return this.generateLevel4();
            case 5:
                return this.generateLevel5();
            default:
                return this.generateLevel1();
        }
    }

    private formatExpression(data: SquareOfSumData): string {
        // 使用LaTeX格式化表达式
        const firstTerm = data.firstTerm.includes('/') ? 
            `\\frac{${data.firstTerm.split('/')[0]}}{${data.firstTerm.split('/')[1]}}` :
            data.firstTerm;
        
        const secondTerm = data.secondTerm.includes('/') ? 
            `\\frac{${data.secondTerm.split('/')[0]}}{${data.secondTerm.split('/')[1]}}` :
            data.secondTerm;

        const base = `\\left(${firstTerm} + ${secondTerm}\\right)`;
        return data.coefficient ? `${data.coefficient}${base}^2` : `${base}^2`;
    }

    private gcd(a: number, b: number): number {
        return b === 0 ? a : this.gcd(b, a % b);
    }

    private simplifyFraction(num: number, den: number): { num: number, den: number } {
        const divisor = this.gcd(Math.abs(num), Math.abs(den));
        return {
            num: num / divisor,
            den: den / divisor
        };
    }

    private formatCoefficient(num: number, variable: string): string {
        if (num === 1) {
            return variable;
        }
        if (num === -1) {
            return `-${variable}`;
        }
        return `${num}${variable}`;
    }

    private formatFraction(num: number, den: number, variable: string = ''): string {
        if (den === 1) {
            return variable ? this.formatCoefficient(num, variable) : num.toString();
        }
        return `\\frac{${num}}{${den}}${variable}`;
    }

    private calculateCorrectAnswer(data: SquareOfSumData): string {
        let firstTermSquare: string;
        let crossTerm: string;
        let secondTermSquare: string;
        const coef = data.coefficient || 1;

        // 处理分数形式的平方和
        if (data.firstTerm.includes('/') || data.secondTerm.includes('/')) {
            const [firstNum, firstDen] = data.firstTerm.split('/').map(t => t || '1');
            const [secondNum, secondDen] = data.secondTerm.split('/').map(t => t || '1');

            // 计算分母的平方值
            const firstDenSquared = firstDen ? Math.pow(parseInt(firstDen), 2) : 1;
            const secondDenSquared = secondDen ? Math.pow(parseInt(secondDen), 2) : 1;

            // 计算第一项的平方并约分
            if (firstNum === 'x') {
                const simplified = this.simplifyFraction(1, firstDenSquared);
                firstTermSquare = this.formatFraction(simplified.num, simplified.den, 'x^2');
            } else {
                const num = parseInt(firstNum) || 1;
                const simplified = this.simplifyFraction(num * num, firstDenSquared);
                firstTermSquare = this.formatFraction(simplified.num, simplified.den, 'x^2');
            }

            // 计算第二项的平方并约分
            if (secondNum === 'y') {
                const simplified = this.simplifyFraction(1, secondDenSquared);
                secondTermSquare = this.formatFraction(simplified.num, simplified.den, 'y^2');
            } else {
                const num = parseInt(secondNum) || 1;
                const simplified = this.simplifyFraction(num * num, secondDenSquared);
                secondTermSquare = this.formatFraction(simplified.num, simplified.den, 'y^2');
            }

            // 计算交叉项并约分
            if (firstNum === 'x' && secondNum === 'y') {
                const denominator = firstDen && secondDen ? parseInt(firstDen) * parseInt(secondDen) : 
                                   firstDen ? parseInt(firstDen) : 
                                   secondDen ? parseInt(secondDen) : 1;
                const simplified = this.simplifyFraction(2, denominator);
                crossTerm = this.formatFraction(simplified.num, simplified.den, 'xy');
            } else {
                const num1 = parseInt(firstNum) || 1;
                const num2 = parseInt(secondNum) || 1;
                const denominator = firstDen && secondDen ? parseInt(firstDen) * parseInt(secondDen) : 
                                   firstDen ? parseInt(firstDen) : 
                                   secondDen ? parseInt(secondDen) : 1;
                const simplified = this.simplifyFraction(2 * num1 * num2, denominator);
                crossTerm = this.formatFraction(simplified.num, simplified.den, 'xy');
            }

            // 组合最终结果
            const result = `${firstTermSquare} + ${crossTerm} + ${secondTermSquare}`;
            return coef === 1 ? result : `${coef}\\left(${result}\\right)`;
        }

        // 非分数形式的计算
        // 计算第一项的平方
        if (data.firstTerm.includes('x')) {
            const coef = data.firstTerm.replace('x', '') || '1';
            const numCoef = coef === '1' ? 1 : parseInt(coef);
            firstTermSquare = numCoef === 1 ? 'x^2' : `${numCoef * numCoef}x^2`;
        } else {
            const num = parseInt(data.firstTerm);
            firstTermSquare = (num * num).toString();
        }

        // 计算第二项的平方
        if (data.secondTerm.includes('y')) {
            const coef = data.secondTerm.replace('y', '') || '1';
            const numCoef = coef === '1' ? 1 : parseInt(coef);
            secondTermSquare = numCoef === 1 ? 'y^2' : `${numCoef * numCoef}y^2`;
        } else {
            const num = parseInt(data.secondTerm);
            secondTermSquare = (num * num).toString();
        }

        // 计算交叉项
        if (data.firstTerm.includes('x') && data.secondTerm.includes('y')) {
            const coef1 = data.firstTerm.replace('x', '') || '1';
            const coef2 = data.secondTerm.replace('y', '') || '1';
            const numCoef1 = coef1 === '1' ? 1 : parseInt(coef1);
            const numCoef2 = coef2 === '1' ? 1 : parseInt(coef2);
            crossTerm = `${2 * numCoef1 * numCoef2}xy`;
        } else if (data.firstTerm.includes('x')) {
            const coef1 = data.firstTerm.replace('x', '') || '1';
            const numCoef1 = coef1 === '1' ? 1 : parseInt(coef1);
            const num2 = parseInt(data.secondTerm);
            crossTerm = `${2 * numCoef1 * num2}x`;
        } else {
            const num1 = parseInt(data.firstTerm);
            const num2 = parseInt(data.secondTerm);
            crossTerm = (2 * num1 * num2).toString();
        }

        // 组合最终结果
        if (coef === 1) {
            // 对于(x + 5)²这样的情况，直接返回x² + 10x + 25
            if (data.firstTerm === 'x' && !isNaN(parseInt(data.secondTerm))) {
                const num = parseInt(data.secondTerm);
                return `x^2 + ${2 * num}x + ${num * num}`;
            }
            return `${firstTermSquare} + ${crossTerm} + ${secondTermSquare}`;
        } else {
            // 对于带系数的情况，先计算括号内的结果
            const innerResult = `${firstTermSquare} + ${crossTerm} + ${secondTermSquare}`;
            return `${coef}\\left(${innerResult}\\right)`;
        }
    }

    private generateWrongAnswers(data: SquareOfSumData): string[] {
        const wrongAnswers: string[] = [];

        if (data.firstTerm.includes('/') || data.secondTerm.includes('/')) {
            const [firstNum, firstDen] = data.firstTerm.split('/').map(t => t || '1');
            const [secondNum, secondDen] = data.secondTerm.split('/').map(t => t || '1');

            // 获取系数并约分
            const num1 = parseInt(firstNum) || 1;
            const num2 = parseInt(secondNum) || 1;
            const den1 = parseInt(firstDen) || 1;
            const den2 = parseInt(secondDen) || 1;

            // 错误1：忘记交叉项（约分后）
            if (firstNum === 'x') {
                const simplified1 = this.simplifyFraction(num1 * num1, 1);
                const simplified2 = this.simplifyFraction(1, den2);
                wrongAnswers.push(
                    `${this.formatFraction(simplified1.num, simplified1.den, 'x^2')} + ${this.formatFraction(simplified2.num, simplified2.den, 'y^2')}`
                );
            } else {
                const simplified1 = this.simplifyFraction(1, den1);
                const simplified2 = this.simplifyFraction(num2 * num2, 1);
                wrongAnswers.push(
                    `${this.formatFraction(simplified1.num, simplified1.den, 'x^2')} + ${this.formatFraction(simplified2.num, simplified2.den, 'y^2')}`
                );
            }

            // 错误2：符号错误
            const correctAnswer = this.calculateCorrectAnswer(data);
            wrongAnswers.push(correctAnswer.replace(/\+/g, '-'));

            // 错误3：分母计算错误（不平方分母，但约分）
            let wrongAnswer = '';
            if (firstNum === 'x') {
                const simplified1 = this.simplifyFraction(num1 * num1, 1);
                const simplified2 = this.simplifyFraction(2, den1);
                const simplified3 = this.simplifyFraction(1, den2);
                wrongAnswer = 
                    `${this.formatFraction(simplified1.num, simplified1.den, 'x^2')} + ${this.formatFraction(simplified2.num, simplified2.den, 'xy')} + ${this.formatFraction(simplified3.num, simplified3.den, 'y^2')}`;
            } else {
                const simplified1 = this.simplifyFraction(1, den1);
                const simplified2 = this.simplifyFraction(2, den1);
                const simplified3 = this.simplifyFraction(num2 * num2, 1);
                wrongAnswer = 
                    `${this.formatFraction(simplified1.num, simplified1.den, 'x^2')} + ${this.formatFraction(simplified2.num, simplified2.den, 'xy')} + ${this.formatFraction(simplified3.num, simplified3.den, 'y^2')}`;
            }
            wrongAnswers.push(wrongAnswer);

            return wrongAnswers;
        }

        // 错误1：忘记交叉项
        if (data.firstTerm === 'x' && !isNaN(parseInt(data.secondTerm))) {
            const num = parseInt(data.secondTerm);
            wrongAnswers.push(`x^2 + ${num * num}`);
        } else {
            wrongAnswers.push(`${data.firstTerm}^2 + ${data.secondTerm}^2`);
        }

        // 错误2：符号错误
        if (data.firstTerm === 'x' && !isNaN(parseInt(data.secondTerm))) {
            const num = parseInt(data.secondTerm);
            wrongAnswers.push(`x^2 - ${2 * num}x - ${num * num}`);
        } else {
            const correctAnswer = this.calculateCorrectAnswer(data);
            wrongAnswers.push(correctAnswer.replace(/\+/g, '-'));
        }

        // 错误3：系数计算错误
        if (data.firstTerm === 'x' && !isNaN(parseInt(data.secondTerm))) {
            const num = parseInt(data.secondTerm);
            wrongAnswers.push(`2(x^2 + ${2 * num}x + ${num * num})`);
        } else {
            const correctAnswer = this.calculateCorrectAnswer(data);
            wrongAnswers.push(`2(${correctAnswer})`);
        }

        return wrongAnswers;
    }

    private generateExplanation(data: SquareOfSumData, answer: string): string {
        let explanation = `解題步驟：\n\n`;
        
        explanation += `1) 使用平方和公式：\\[(a + b)^2 = a^2 + 2ab + b^2\\]\n\n`;
        
        
        explanation += `2) 代入計算：\n`;
        explanation += `   \\[${this.formatExpression(data)}\\]\n`;
        
        // 获取项的格式化表示
        const firstTerm = data.firstTerm.includes('/') ? 
            `\\frac{${data.firstTerm.split('/')[0]}}{${data.firstTerm.split('/')[1]}}` :
            data.firstTerm;
        const secondTerm = data.secondTerm.includes('/') ? 
            `\\frac{${data.secondTerm.split('/')[0]}}{${data.secondTerm.split('/')[1]}}` :
            data.secondTerm;

        // 显示展开步骤
        explanation += `   \\[= (${firstTerm})^2 + 2(${firstTerm})(${secondTerm}) + (${secondTerm})^2\\]\n`;
        explanation += `   \\[= ${answer}\\]\n`;

        return explanation.trim();
    }

    private getRandomElement<T>(array: T[]): T {
        return array[Math.floor(Math.random() * array.length)];
    }

    generate(): IGeneratorOutput {
        const combination = this.generateValidCombination();
        const expression = this.formatExpression(combination);
        const correctAnswer = this.calculateCorrectAnswer(combination);
        const wrongAnswers = this.generateWrongAnswers(combination);

        return {
            content: `\\[${expression}\\]`,
            correctAnswer: `\\[${correctAnswer}\\]`,
            wrongAnswers: wrongAnswers.map(ans => `\\[${ans}\\]`),
            explanation: this.generateExplanation(combination, correctAnswer),
            type: 'text',
            displayOptions: {
                latex: true
            }
        };
    }
} 