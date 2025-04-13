import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import { getRandomInt } from '@/utils/mathUtils';

interface PowerTerm {
    base: number | string;  // 可以是数字或代数项
    exponent: string;       // 指数可以包含变量，所以用字符串
}

interface FractionExpression {
    numerator: PowerTerm[];    // 分子可以有多项
    denominator: PowerTerm;    // 分母通常是一项
}

export default class F6_Indice_Q2 extends QuestionGenerator {
    // 可用的底数
    private readonly BASES = [2, 3, 4, 8, 9, 27, 81];
    // 代数变量
    private readonly VARIABLES = ['n', 'x', 'm'];

    constructor(difficulty: number = 1) {
        super(difficulty, 'F6_Indice_Q2');
    }

    private getRandomVariable(): string {
        return this.VARIABLES[getRandomInt(0, this.VARIABLES.length - 1)];
    }

    private generateExpression(): FractionExpression {
        if (this.difficulty === 1) {
            return this.generateLevel1Expression();
        }
        return this.generateLevel2Expression();
    }

    private generateLevel1Expression(): FractionExpression {
        // 选择一个基础底数
        const base = this.BASES[getRandomInt(0, 2)]; // 使用较小的底数：2, 3, 4
        const variable = this.getRandomVariable();
        
        // 生成指数
        const exp1 = variable;
        const exp2 = `3${variable}`;
        const exp3 = variable;

        return {
            numerator: [
                { base: base, exponent: exp1 },
                { base: Math.pow(base, 3), exponent: exp2 }
            ],
            denominator: { 
                base: Math.pow(base, 6), 
                exponent: exp3 
            }
        };
    }

    private generateLevel2Expression(): FractionExpression {
        // 使用更复杂的表达式，包含代数项
        const variable = this.getRandomVariable();
        const baseNum = getRandomInt(2, 3);
        
        return {
            numerator: [
                { 
                    base: `2${variable}`, 
                    exponent: '3' 
                }
            ],
            denominator: { 
                base: `4${variable}`, 
                exponent: '-2' 
            }
        };
    }

    private formatPowerTerm(term: PowerTerm): string {
        return `${term.base}^{${term.exponent}}`;
    }

    private generateExplanation(expr: FractionExpression, answer: string): string {
        if (this.difficulty === 1) {
            return `解題步驟：

1) 原式：
\\[\\frac{${expr.numerator.map(t => this.formatPowerTerm(t)).join(' \\times ')}}{${this.formatPowerTerm(expr.denominator)}}\\]

2) 將所有底數統一：
${this.generateLevel1Steps(expr)}

3) 使用指數法則計算：
\\[= ${answer}\\]`;
        }

        return `解題步驟：

1) 原式：
\\[\\frac{${expr.numerator.map(t => this.formatPowerTerm(t)).join(' \\times ')}}{${this.formatPowerTerm(expr.denominator)}}\\]

2) 處理分母的負指數：
${this.generateLevel2Steps(expr)}

3) 化簡得到：
\\[= ${answer}\\]`;
    }

    private generateLevel1Steps(expr: FractionExpression): string {
        const base = expr.numerator[0].base;
        return `\\[= ${base}^{${expr.numerator[0].exponent}} \\times ${base}^{${expr.numerator[1].exponent}} \\div ${base}^{${expr.denominator.exponent}}\\]
\\[= ${base}^{${expr.numerator[0].exponent} + ${expr.numerator[1].exponent} - ${expr.denominator.exponent}}\\]`;
    }

    private generateLevel2Steps(expr: FractionExpression): string {
        return `\\[\\frac{(2${expr.numerator[0].exponent})^3}{(4${expr.denominator.exponent})^{-2}}\\]
\\[= (2${expr.numerator[0].exponent})^3 \\times (4${expr.denominator.exponent})^2\\]`;
    }

    private generateWrongAnswers(correct: string): string[] {
        // 生成三个错误答案
        return [
            correct.replace(/\^{.*}/, '^{n-1}'),  // 错误的指数
            correct.replace(/\d+/, '4'),          // 错误的底数
            correct.replace(/\^{.*}/, '^{2n}')    // 另一个错误的指数
        ];
    }

    generate(): IGeneratorOutput {
        const expression = this.generateExpression();
        
        // 构建问题文本
        const questionText = `\\[\\frac{${expression.numerator.map(t => 
            this.formatPowerTerm(t)).join(' \\times ')}}{${
            this.formatPowerTerm(expression.denominator)}} = \\text{?}\\]`;

        // 生成正确答案
        const correctAnswer = this.difficulty === 1 
            ? `$9^n$`  // 难度1的典型答案
            : `$32${expression.numerator[0].base}^8$`;  // 难度2的典型答案

        // 生成错误答案
        const wrongAnswers = this.generateWrongAnswers(correctAnswer);

        return {
            content: questionText,
            correctAnswer,
            wrongAnswers,
            explanation: this.generateExplanation(expression, correctAnswer),
            type: 'text',
            displayOptions: {
                latex: true
            }
        };
    }
} 