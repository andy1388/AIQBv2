import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import {
    getRandomInt,
    getRandomDecimal,
    formatNumber,
    LaTeX,
    DifficultyUtils,
    DEFAULT_CONFIG,
    getNonZeroRandomInt
} from '@/utils/mathUtils';

interface LinearEquation {
    leftSide: string;
    rightSide: string;
    solution: number;
}

export default class F1L3_1_Q1_F_MQ extends QuestionGenerator {
    constructor(difficulty: number) {
        super(difficulty, 'F1L3.1_Q1_F_MQ');
    }

    generate(): IGeneratorOutput {
        let equation: LinearEquation;
        
        // 根據難度生成方程
        switch (this.difficulty) {
            case 1:
                equation = this.generateLevel1();
                break;
            case 2:
                equation = this.generateLevel2();
                break;
            case 3:
                equation = this.generateLevel3();
                break;
            case 4:
                equation = this.generateLevel4();
                break;
            case 5:
                equation = this.generateLevel5();
                break;
            default:
                throw new Error(`不支援的難度等級: ${this.difficulty}`);
        }

        // 生成錯誤答案
        const wrongAnswers = this.generateWrongAnswers(equation.solution);

        // 格式化題目和答案
        const content = `\\[${equation.leftSide} = ${equation.rightSide}\\]`;
        const correctAnswer = equation.solution.toString();
        const explanation = this.generateExplanation(equation);

        return {
            content: content,
            correctAnswer: correctAnswer,
            wrongAnswers: wrongAnswers,
            explanation: explanation,
            type: 'text',
            displayOptions: {
                latex: true
            }
        };
    }

    private generateLevel1(): LinearEquation {
        // x ± b = c 形式，係數固定為1
        const solution = getRandomInt(-10, 10);
        const b = getNonZeroRandomInt(-10, 10);
        const c = solution + b;  // a = 1，所以 c = x + b

        return {
            leftSide: `x ${LaTeX.formatConstant(b)}`,
            rightSide: c.toString(),
            solution
        };
    }

    private generateLevel2(): LinearEquation {
        // ax ± b = c 形式，變量只在左邊
        const solution = getRandomInt(-10, 10);
        const a = getNonZeroRandomInt(-5, 5);
        const b = getNonZeroRandomInt(-10, 10);
        const c = a * solution + b;

        return {
            leftSide: `${LaTeX.formatLinearTerm(a, 'x')} ${LaTeX.formatConstant(b)}`,
            rightSide: c.toString(),
            solution
        };
    }

    private generateLevel3(): LinearEquation {
        // ax + bx = c 形式，兩個變量項都在左邊
        const solution = getRandomInt(-8, 8);
        
        // 確保係數和不為0
        let a, b;
        do {
            a = getNonZeroRandomInt(-5, 5);
            b = getNonZeroRandomInt(-5, 5);
        } while (a + b === 0);  // 避免係數和為0的情況
        
        // 計算等式右邊的值
        const c = (a + b) * solution;

        // 構建左邊的表達式，確保正確顯示加號或減號
        const firstTerm = LaTeX.formatLinearTerm(a, 'x');
        const secondTerm = b > 0 ? 
            `+${LaTeX.formatLinearTerm(b, 'x')}` : 
            LaTeX.formatLinearTerm(b, 'x');

        return {
            leftSide: `${firstTerm}${secondTerm}`,  // 不需要額外的空格，因為符號已包含在 secondTerm 中
            rightSide: c.toString(),
            solution
        };
    }

    private generateLevel4(): LinearEquation {
        // ax ± b = cx ± d 形式，變量在兩邊
        const solution = getRandomInt(-6, 6);
        const a = getNonZeroRandomInt(-5, 5);
        const b = getNonZeroRandomInt(-10, 10);
        const c = getNonZeroRandomInt(-5, 5);
        const d = (a - c) * solution + b;

        return {
            leftSide: `${LaTeX.formatLinearTerm(a, 'x')} ${LaTeX.formatConstant(b)}`,
            rightSide: `${LaTeX.formatLinearTerm(c, 'x')} ${LaTeX.formatConstant(d)}`,
            solution
        };
    }

    private generateLevel5(): LinearEquation {
        // 小數係數：ax + b = cx + d
        const solution = getRandomDecimal(-5, 5, 1);
        const a = getRandomDecimal(0.5, 3, 1);
        const b = getRandomDecimal(-5, 5, 1);
        const c = getRandomDecimal(-2, 2, 1);
        const d = Number((a * solution + b - c * solution).toFixed(1));

        return {
            leftSide: `${LaTeX.formatLinearTerm(a, 'x')} ${LaTeX.formatConstant(b)}`,
            rightSide: `${LaTeX.formatLinearTerm(c, 'x')} ${LaTeX.formatConstant(d)}`,
            solution
        };
    }

    private generateWrongAnswers(correctAnswer: number): string[] {
        const wrongAnswers: string[] = [];
        const isDecimal = this.difficulty === 5;
        
        while (wrongAnswers.length < 3) {
            let wrong: number;
            if (isDecimal) {
                // 對於小數，生成鄰近的錯誤答案
                wrong = Number((correctAnswer + (Math.random() - 0.5) * 2).toFixed(1));
            } else {
                // 對於整數，生成鄰近的整數
                wrong = correctAnswer + (Math.floor(Math.random() * 5) + 1) * (Math.random() < 0.5 ? 1 : -1);
            }
            
            if (!wrongAnswers.includes(wrong.toString()) && wrong !== correctAnswer) {
                wrongAnswers.push(wrong.toString());
            }
        }
        
        return wrongAnswers;
    }

    private generateExplanation(equation: LinearEquation): string {
        const steps: string[] = [];
        
        if (this.difficulty <= 2) {
            // Level 1-2: ax + b = c
            const matches = equation.leftSide.match(/-?\d+/g)?.map(Number);
            const c = parseInt(equation.rightSide);
            
            if (this.difficulty === 1) {
                // x + b = c 形式
                const b = matches?.[0] || 0;
                steps.push(
                    '1. 移項：將常數項移到等號右邊',
                    `\\[${equation.leftSide} = ${equation.rightSide}\\]`,
                    `\\[x = ${c} ${formatNumber(-b)}\\]`,
                    '2. 計算：解出變量的值',
                    `\\[x = ${equation.solution}\\]`
                );
            } else {
                // ax + b = c 形式
                const [a, b] = matches || [1, 0];
                steps.push(
                    '1. 移項：將常數項移到等號右邊',
                    `\\[${equation.leftSide} = ${equation.rightSide}\\]`,
                    `\\[${LaTeX.formatLinearTerm(a, 'x')} = ${c} ${formatNumber(-b)}\\]`,
                    '2. 計算：解出變量的值',
                    `\\[x = \\frac{${c - b}}{${a}}\\]`,
                    `\\[x = ${equation.solution}\\]`
                );
            }
        } else if (this.difficulty === 3) {
            // Level 3: ax + bx = c
            const [a, b] = equation.leftSide.match(/-?\d+/g)?.map(Number) || [0, 0];
            const c = parseInt(equation.rightSide);
            steps.push(
                '1. 合併同類項：將變量項合併',
                `\\[${equation.leftSide} = ${equation.rightSide}\\]`,
                `\\[${a + b}x = ${c}\\]`,
                '2. 求解：得到變量的值',
                `\\[x = \\frac{${c}}{${a + b}}\\]`,
                `\\[x = ${equation.solution}\\]`
            );
        } else if (this.difficulty === 4) {
            // Level 4: ax + b = cx + d
            const leftMatches = equation.leftSide.match(/-?\d+/g)?.map(Number);
            const rightMatches = equation.rightSide.match(/-?\d+/g)?.map(Number);
            if (leftMatches && rightMatches) {
                const [a, b] = leftMatches;
                const [c, d] = rightMatches;
                steps.push(
                    '1. 移項：將含x的項移到等號左邊，常數項移到等號右邊',
                    `\\[${equation.leftSide} = ${equation.rightSide}\\]`,
                    `\\[${a}x ${formatNumber(b)} = ${LaTeX.formatLinearTerm(c, 'x')} ${formatNumber(d)}\\]`,
                    `\\[${a}x ${formatNumber(-c)}x = ${d} ${formatNumber(-b)}\\]`,
                    '2. 合併同類項',
                    `\\[${a - c}x = ${d - b}\\]`,
                    '3. 求解：得到變量的值',
                    `\\[x = \\frac{${d - b}}{${a - c}}\\]`,
                    `\\[x = ${equation.solution}\\]`
                );
            }
        } else {
            // Level 5: 小數係數
            const leftMatches = equation.leftSide.match(/-?\d+\.?\d*/g)?.map(Number);
            const rightMatches = equation.rightSide.match(/-?\d+\.?\d*/g)?.map(Number);
            if (leftMatches && rightMatches) {
                const [a, b] = leftMatches;
                const [c, d] = rightMatches;
                steps.push(
                    '1. 移項：將含x的項移到等號左邊，常數項移到等號右邊',
                    `\\[${equation.leftSide} = ${equation.rightSide}\\]`,
                    `\\[${a}x ${formatNumber(b)} = ${LaTeX.formatLinearTerm(c, 'x')} ${formatNumber(d)}\\]`,
                    `\\[${a}x ${formatNumber(-c)}x = ${d} ${formatNumber(-b)}\\]`,
                    '2. 合併同類項（注意小數計算）',
                    `\\[${(a - c).toFixed(1)}x = ${(d - b).toFixed(1)}\\]`,
                    '3. 求解：得到變量的值',
                    `\\[x = \\frac{${(d - b).toFixed(1)}}{${(a - c).toFixed(1)}}\\]`,
                    `\\[x = ${equation.solution}\\]`
                );
            }
        }

        return steps.join('\n');
    }
} 