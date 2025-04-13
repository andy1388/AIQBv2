import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import { VARIABLE_NAMES } from '@/utils/mathUtils';
import { FractionUtils } from '@/utils/FractionUtils';

interface Factor {
    a: number;  // 第一个因式的第一个变量系数
    b: number;  // 第一个因式的第二个变量系数
    c: number;  // 第二个因式的第一个变量系数
    d: number;  // 第二个因式的第二个变量系数
    e?: number | [number, number];  // 整体系数
    var1: string;  // 第一个变量
    var2: string;  // 第二个变量
}

export default class F2L2_5_Q4_N_MQ extends QuestionGenerator {
    constructor(difficulty: number = 1) {
        super(difficulty, 'F2L2.5_Q4_N_MQ');
    }

    private shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    generate(): IGeneratorOutput {
        // 生成因子
        const factors = this.generateFactors();
        
        // 计算展开式系数
        const [p, q] = this.calculateExpandedCoefficients(factors);
        
        // 生成题目表达式
        const expression = this.formatExpression(p, q, factors);
        
        // 生成正确答案
        const answer = this.formatAnswer(factors);
        
        // 生成错误选项
        const wrongAnswers = this.generateWrongAnswers(factors);

        // 生成解题步骤
        const steps = this.generateSteps(p, q, factors);

        return {
            content: `\\[${expression}\\]`,
            correctAnswer: answer,
            wrongAnswers,
            explanation: steps,
            type: 'text',
            displayOptions: {
                latex: true
            }
        };
    }

    private gcd(a: number, b: number): number {
        a = Math.abs(a);
        b = Math.abs(b);
        while (b) {
            [a, b] = [b, a % b];
        }
        return a;
    }

    private canBeFactorized(a: number, b: number, c: number, d: number): boolean {
        // 计算展开式系数
        const x2Coeff = a * c;     // x²的系数
        const xyCoeff = a * d + b * c;  // xy的系数
        const y2Coeff = b * d;     // y²的系数
        
        // 检查这些系数是否有公因数
        const gcd1 = this.gcd(x2Coeff, xyCoeff);
        const gcd2 = this.gcd(xyCoeff, y2Coeff);
        const gcd3 = this.gcd(x2Coeff, y2Coeff);
        
        // 如果所有系数都有大于1的公因数，说明可以继续因式分解
        return gcd1 > 1 && gcd2 > 1 && gcd3 > 1;
    }

    private generateFactors(): Factor {
        let a = 1, b = 1, c = 1, d = 1;
        let e: number | [number, number] | undefined;
        let var1: string, var2: string;
        
        // 对于难度1-2，使用固定的x和y
        if (this.difficulty <= 2) {
            var1 = 'x';
            var2 = 'y';
        } else {
            // 对于难度3-5，随机选择两个不同的变量
            const variables = this.shuffleArray([...VARIABLE_NAMES]);
            [var1, var2] = variables.slice(0, 2);
        }

        do {
            switch (this.difficulty) {
                case 1: // (ax+by)(x+dy)
                    a = Math.floor(Math.random() * 4) + 2;  // 2 到 5
                    b = Math.floor(Math.random() * 19) - 9; // -9 到 9
                    c = 1;  // 第二个因式的x系数为1
                    d = Math.floor(Math.random() * 19) - 9; // -9 到 9
                    break;

                case 2: // (ax+by)(cx+dy)
                    a = Math.floor(Math.random() * 4) + 2;  // 2 到 5
                    b = Math.floor(Math.random() * 19) - 9; // -9 到 9
                    c = Math.floor(Math.random() * 4) + 2;  // 2 到 5
                    d = Math.floor(Math.random() * 19) - 9; // -9 到 9
                    break;

                case 3: // e(ax+by)(cx+dy)
                    e = Math.floor(Math.random() * 4) + 2;  // 2 到 5
                    a = Math.floor(Math.random() * 4) + 2;
                    b = Math.floor(Math.random() * 19) - 9;
                    c = Math.floor(Math.random() * 4) + 2;
                    d = Math.floor(Math.random() * 19) - 9;
                    break;

                case 4: // e(ax+by)(cx+dy)，e为负整数
                    e = -(Math.floor(Math.random() * 4) + 2);  // -5 到 -2
                    a = Math.floor(Math.random() * 4) + 2;
                    b = Math.floor(Math.random() * 19) - 9;
                    c = Math.floor(Math.random() * 4) + 2;
                    d = Math.floor(Math.random() * 19) - 9;
                    break;

                case 5: // (p/q)(ax+by)(cx+dy)
                    const fractions: [number, number][] = [
                        [1, 2], [1, 3], [2, 3], [3, 2], [3, 4], [2, 5]
                    ];
                    e = fractions[Math.floor(Math.random() * fractions.length)];
                    a = Math.floor(Math.random() * 4) + 2;  // 2 到 5
                    b = Math.floor(Math.random() * 19) - 9; // -9 到 9
                    c = Math.floor(Math.random() * 4) + 2;  // 2 到 5
                    d = Math.floor(Math.random() * 19) - 9; // -9 到 9
                    break;
            }
            
            // 确保系数不为0
            b = b === 0 ? 1 : b;
            d = d === 0 ? 1 : d;

            // 确保展开式不能被进一步因式分解
        } while (
            b === 0 || d === 0 || // 避免系数为0
            (this.difficulty <= 2 && this.canBeFactorized(a, b, c, d)) || // 检查是否可以继续因式分解
            (this.difficulty === 1 && Math.abs(b) === Math.abs(d)) // 对于难度1，避免系数相等的情况
        );

        return { a, b, c, d, e, var1, var2 };
    }

    private calculateExpandedCoefficients(factors: Factor): [number, number] {
        const { e } = factors;
        
        if (this.difficulty <= 2) {
            return [1, 1];  // 不需要分数处理
        }
        
        if (this.difficulty === 3 || this.difficulty === 4) {
            return [e as number, 1];  // 整数系数（包括负数）
        }
        
        // 难度5：分数系数
        return e as [number, number];
    }

    private formatExpression(p: number, q: number, factors: Factor): string {
        const { a, b, c, d, var1, var2 } = factors;
        
        // 计算展开式的系数
        const var1_2Coeff = p * a * c;  // var1²项系数
        const var1var2Coeff = p * (a * d + b * c);  // var1var2项系数
        const var2_2Coeff = p * b * d;  // var2²项系数

        // 检查除法结果是否有多位小数
        const needsFraction = (num: number): boolean => {
            const decimal = num / q;
            return Math.abs(decimal - Math.round(decimal * 100) / 100) > 0.001;
        };

        // 构建表达式
        let expression = '';
        
        // var1²项
        if (this.difficulty === 5 && needsFraction(var1_2Coeff)) {
            expression += `\\frac{${var1_2Coeff}}{${q}}${var1}^2`;
        } else {
            expression += `${var1_2Coeff/q}${var1}^2`;
        }
        
        // var1var2项
        if (var1var2Coeff !== 0) {
            if (this.difficulty === 5 && needsFraction(var1var2Coeff)) {
                expression += var1var2Coeff > 0 ? 
                    `+\\frac{${var1var2Coeff}}{${q}}${var1}${var2}` : 
                    `\\frac{${var1var2Coeff}}{${q}}${var1}${var2}`;
            } else {
                expression += var1var2Coeff > 0 ? 
                    `+${var1var2Coeff/q}${var1}${var2}` : 
                    `${var1var2Coeff/q}${var1}${var2}`;
            }
        }
        
        // var2²项
        if (var2_2Coeff !== 0) {
            if (this.difficulty === 5 && needsFraction(var2_2Coeff)) {
                expression += var2_2Coeff > 0 ? 
                    `+\\frac{${var2_2Coeff}}{${q}}${var2}^2` : 
                    `\\frac{${var2_2Coeff}}{${q}}${var2}^2`;
            } else {
                expression += var2_2Coeff > 0 ? 
                    `+${var2_2Coeff/q}${var2}^2` : 
                    `${var2_2Coeff/q}${var2}^2`;
            }
        }
        
        return expression;
    }

    private formatAnswer(factors: Factor): string {
        const { a, b, c, d, e, var1, var2 } = factors;
        
        // 格式化第一个因式
        const firstTerm = b === 0 ? 
            (a === 1 ? var1 : `${a}${var1}`) :
            b > 0 ? 
                (a === 1 ? `(${var1} + ${b === 1 ? '' : b}${var2})` : `(${a}${var1} + ${b === 1 ? '' : b}${var2})`) : 
                (a === 1 ? `(${var1} ${b === -1 ? '-' : b}${var2})` : `(${a}${var1} ${b === -1 ? '-' : b}${var2})`);
        
        // 格式化第二个因式
        const secondTerm = this.difficulty === 1 ?
            (d > 0 ? 
                `(${var1} + ${d === 1 ? '' : d}${var2})` : 
                `(${var1} ${d === -1 ? '-' : d}${var2})`) :
            (d > 0 ? 
                (c === 1 ? 
                    `(${var1} + ${d === 1 ? '' : d}${var2})` : 
                    `(${c}${var1} + ${d === 1 ? '' : d}${var2})`) : 
                (c === 1 ? 
                    `(${var1} ${d === -1 ? '-' : d}${var2})` : 
                    `(${c}${var1} ${d === -1 ? '-' : d}${var2})`));
        
        // 根据难度添加系数
        if (this.difficulty <= 2) {
            return `${firstTerm}${secondTerm}`;
        }
        
        if (this.difficulty === 3 || this.difficulty === 4) {
            return `${e}${firstTerm}${secondTerm}`;
        }
        
        // 难度5：分数系数
        const [p, q] = e as [number, number];
        return `\\frac{${p}}{${q}}${firstTerm}${secondTerm}`;
    }

    private generateWrongAnswers(factors: Factor): string[] {
        const wrongAnswers = new Set<string>();
        const { a, b, c, d, e, var1, var2 } = factors;
        
        // 生成错误答案的策略
        let wrongChoices: Factor[] = [];
        
        if (this.difficulty <= 2) {
            // 难度1-2的错误答案策略
            wrongChoices = [
                // 系数错误
                { ...factors, a: a + 1 },
                { ...factors, a: a - 1 },
                { ...factors, c: c + 1 },
                { ...factors, c: c - 1 },
                // 常数项错误
                { ...factors, b: -b },
                { ...factors, d: -d },
                // 交换错误
                { ...factors, a: c, c: a },
                { ...factors, b: d, d: b }
            ];
        } else {
            // 难度3-5的错误答案策略
            if (this.difficulty === 3) {
                wrongChoices = [
                    { ...factors, e: (e as number) + 1 },
                    { ...factors, e: (e as number) - 1 },
                    { ...factors, e: (e as number) * 2 }
                ];
            } else if (this.difficulty === 4) {
                wrongChoices = [
                    { ...factors, e: (e as number) + 1 },
                    { ...factors, e: (e as number) - 1 },
                    { ...factors, e: -(e as number) }
                ];
            } else {
                const [p, q] = e as [number, number];
                wrongChoices = [
                    { ...factors, e: [p + 1, q] as [number, number] },
                    { ...factors, e: [p, q + 1] as [number, number] },
                    { ...factors, e: [q, p] as [number, number] }
                ];
            }
        }
        
        // 确保至少有3个错误答案
        for (const wrong of wrongChoices) {
            if (wrongAnswers.size < 3) {
                wrongAnswers.add(this.formatAnswer(wrong));
            }
        }
        
        return Array.from(wrongAnswers);
    }

    private generateSteps(p: number, q: number, factors: Factor): string {
        const { a, b, c, d, e, var1, var2 } = factors;
        
        let steps = `解題步驟：<br><br>`;
        steps += `1. 觀察二次項：<br>`;
        steps += `\\[${this.formatExpression(p, q, factors)}\\]<br><br>`;
        
        if (this.difficulty >= 3) {
            steps += `2. 提取公因數：<br>`;
            if (this.difficulty === 3 || this.difficulty === 4) {
                steps += `\\[${e}(${a * c}${var1}^2`;
                if (a * d + b * c > 0) {
                    steps += `+${a * d + b * c}${var1}${var2}`;
                } else {
                    steps += `${a * d + b * c}${var1}${var2}`;
                }
                if (b * d > 0) {
                    steps += `+${b * d}${var2}^2`;
                } else {
                    steps += `${b * d}${var2}^2`;
                }
                steps += `)\\]<br><br>`;
            } else {
                const [numerator, denominator] = e as [number, number];
                steps += `\\[\\frac{${numerator}}{${denominator}}(${a * c}${var1}^2`;
                if (a * d + b * c > 0) {
                    steps += `+${a * d + b * c}${var1}${var2}`;
                } else {
                    steps += `${a * d + b * c}${var1}${var2}`;
                }
                if (b * d > 0) {
                    steps += `+${b * d}${var2}^2`;
                } else {
                    steps += `${b * d}${var2}^2`;
                }
                steps += `)\\]<br><br>`;
            }
        }
        
        steps += `${this.difficulty >= 3 ? '3' : '2'}. 分析係數：<br>`;
        steps += `\\[${var1}^2\\]項係數：${a * c}　　`;
        steps += `\\[${var1}${var2}\\]項係數：${a * d + b * c}　　`;
        steps += `\\[${var2}^2\\]項係數：${b * d}<br><br>`;
        
        steps += `${this.difficulty >= 3 ? '4' : '3'}. 找出兩個因式：<br>`;
        steps += `觀察可知：<br>`;
        steps += `- 第一個因式係數為 ${a} 和 ${b}<br>`;
        steps += `- 第二個因式係數為 ${this.difficulty === 1 ? '1' : c} 和 ${d}<br>`;
        steps += `- 相乘後：<br>`;
        steps += `  * \\[${var1}^2\\] 項：${a} \\times ${this.difficulty === 1 ? '1' : c} = ${a * c}<br>`;
        steps += `  * \\[${var1}${var2}\\] 項：${a} \\times ${d} + ${b} \\times ${this.difficulty === 1 ? '1' : c} = ${a * d + b * c}<br>`;
        steps += `  * \\[${var2}^2\\] 項：${b} \\times ${d} = ${b * d}<br><br>`;
        
        steps += `因此：<br>`;
        steps += `第一個因式：<br>`;
        steps += `\\[${a === 1 ? var1 : a + var1} ${b >= 0 ? '+' : ''}${b}${var2}\\]<br>`;
        steps += `第二個因式：<br>`;
        if (this.difficulty === 1) {
            steps += `\\[${var1} ${d >= 0 ? '+' : ''}${d}${var2}\\]<br><br>`;
        } else {
            steps += `\\[${c === 1 ? var1 : c + var1} ${d >= 0 ? '+' : ''}${d}${var2}\\]<br><br>`;
        }
        
        steps += `${this.difficulty >= 3 ? '5' : '4'}. 最終答案：<br>`;
        steps += `\\[${this.formatAnswer(factors)}\\]`;
        
        return steps;
    }
} 