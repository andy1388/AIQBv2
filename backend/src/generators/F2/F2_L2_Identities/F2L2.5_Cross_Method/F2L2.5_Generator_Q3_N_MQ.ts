import { QuestionGenerator, IGeneratorOutput } from '../../../QuestionGenerator';
import { FractionUtils } from '../../../../utils/FractionUtils';

interface Factor {
    a: number;  // 第一个因式的x系数
    b: number;  // 第一个因式的常数项
    c: number;  // 第二个因式的x系数（难度1时为1）
    d: number;  // 第二个因式的常数项
    e?: number | [number, number];  // 整体系数（难度3用整数，难度4用分数[分子,分母]）
}

export default class F2L2_5_Generator_Q3_N_MQ extends QuestionGenerator {
    constructor(difficulty: number = 1) {
        super(difficulty, 'F2L2.5');
    }

    private gcd(a: number, b: number): number {
        a = Math.abs(a);
        b = Math.abs(b);
        while (b) {
            [a, b] = [b, a % b];
        }
        return a;
    }

    private areCoprime(a: number, b: number): boolean {
        return this.gcd(a, b) === 1;
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
        
        // 随机打乱选项并记录正确答案的位置
        const options = [answer, ...wrongAnswers];
        const shuffledOptions = this.shuffleArray([...options]);
        const correctIndex = shuffledOptions.indexOf(answer);

        // 生成解题步骤
        const steps = this.generateSteps(p, q, factors);

        return {
            content: expression,
            correctAnswer: answer,
            options: shuffledOptions,
            correctIndex: correctIndex,
            explanation: steps
        };
    }

    private generateFactors(): Factor {
        // 初始化所有变量
        let a = 1;
        let b = 1;
        let c = 1;
        let d = 1;
        let e: number | [number, number] | undefined;
        
        do {
            switch (this.difficulty) {
                case 1: // (ax+b)(x+c)
                    a = Math.floor(Math.random() * 4) + 2;  // 2 到 5
                    b = Math.floor(Math.random() * 19) - 9; // -9 到 9
                    d = Math.floor(Math.random() * 19) - 9; // -9 到 9，这里先给d赋值
                    c = 1;  // 第二个因式的x系数为1
                    break;

                case 2: // (ax+b)(cx+d)
                    a = Math.floor(Math.random() * 4) + 2;  // 2 到 5
                    b = Math.floor(Math.random() * 19) - 9; // -9 到 9
                    c = Math.floor(Math.random() * 4) + 2;  // 2 到 5
                    d = Math.floor(Math.random() * 19) - 9; // -9 到 9
                    break;

                case 3: // e(ax+b)(cx+d)
                    e = Math.floor(Math.random() * 4) + 2;  // 2 到 5
                    a = Math.floor(Math.random() * 4) + 2;
                    b = Math.floor(Math.random() * 19) - 9;
                    c = Math.floor(Math.random() * 4) + 2;
                    d = Math.floor(Math.random() * 19) - 9;
                    break;

                case 4: // e(ax+b)(cx+d)，e为负整数
                    e = -(Math.floor(Math.random() * 4) + 2);  // -5 到 -2
                    a = Math.floor(Math.random() * 4) + 2;
                    b = Math.floor(Math.random() * 19) - 9;
                    c = Math.floor(Math.random() * 4) + 2;
                    d = Math.floor(Math.random() * 19) - 9;
                    break;

                case 5: // (p/q)(ax+b)(cx+d)
                    const fractions: [number, number][] = [
                        [1, 2], [1, 3], [2, 3], [3, 2], [3, 4], [2, 5]
                    ];
                    e = fractions[Math.floor(Math.random() * fractions.length)];
                    a = Math.floor(Math.random() * 4) + 2;
                    b = Math.floor(Math.random() * 19) - 9;
                    c = Math.floor(Math.random() * 4) + 2;
                    d = Math.floor(Math.random() * 19) - 9;
                    break;

                default:
                    // 默认情况，避免变量未初始化
                    a = 2;
                    b = 1;
                    c = 2;
                    d = 1;
                    break;
            }
            
            // 确保 b 和 d 不为0，且系数互质
            b = b === 0 ? 1 : b;
            d = d === 0 ? 1 : d;
        } while (!this.areCoprime(a, b) || !this.areCoprime(c, d));

        return { a, b, c, d, e };
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
        return e as [number, number];  // 返回分子分母
    }

    private formatExpression(p: number, q: number, factors: Factor): string {
        const { a, b, c, d } = factors;
        
        // 计算展开式的系数
        const x2Coeff: number = (p * a * c) / q;
        const xCoeff: number = (p * (a * d + b * c)) / q;
        const constTerm: number = (p * b * d) / q;

        // 辅助函数：检查是否需要使用分数表示（超过2位小数）
        const needsFraction = (num: number): boolean => {
            const decimalParts = num.toString().split('.');
            if (decimalParts.length < 2) {
                return false;  // 整数不需要转换为分数
            }
            const decimalPlaces = decimalParts[1].length;
            const roundedNum = Number(num.toFixed(2));
            const originalNum = Number(num.toFixed(10));
            
            return Math.abs(roundedNum - originalNum) > 1e-10;  // 比较是否有效差异
        };

        // 辅助函数：将数字转换为分数表示
        const toFraction = (num: number): string => {
            // 处理负数，将负号放在分数前面
            const sign = num < 0 ? '-' : '';
            const absNum = Math.abs(num);
            
            // 将数字乘以分母q，得到分子
            const numerator = Math.round(absNum * q);
            return `${sign}\\frac{${numerator}}{${q}}`;
        };

        // 格式化x²项
        let x2Term: string;
        if (x2Coeff === 1) {
            x2Term = 'x^2';
        } else if (x2Coeff === -1) {
            x2Term = '-x^2';
        } else {
            x2Term = needsFraction(x2Coeff) ? 
                `${toFraction(x2Coeff)}x^2` : 
                `${x2Coeff}x^2`;
        }

        // 格式化x项
        let xTerm: string;
        if (xCoeff === 0) {
            xTerm = '';
        } else if (xCoeff === 1) {
            xTerm = '+ x';
        } else if (xCoeff === -1) {
            xTerm = '- x';
        } else {
            const coeffStr = needsFraction(xCoeff) ? 
                toFraction(xCoeff) : 
                xCoeff.toString();
            xTerm = xCoeff > 0 ? `+ ${coeffStr}x` : `${coeffStr}x`;
        }

        // 格式化常数项
        let constantTerm: string;
        if (constTerm === 0) {
            constantTerm = '';
        } else {
            const termStr = needsFraction(constTerm) ? 
                toFraction(constTerm) : 
                constTerm.toString();
            constantTerm = constTerm > 0 ? `+ ${termStr}` : termStr;
        }

        // 移除多余的空格并返回结果
        return `${x2Term} ${xTerm} ${constantTerm}`.trim();
    }

    private formatAnswer(factors: Factor): string {
        const { a, b, c, d, e } = factors;
        
        // 格式化第一个因式
        const firstTerm = b === 0 ? `${a}x` :
                         b > 0 ? `(${a}x + ${b})` : `(${a}x ${b})`;
        
        // 格式化第二个因式
        const secondTerm = this.difficulty === 1 ?
            (d > 0 ? `(x + ${d})` : `(x ${d})`) :
            (d > 0 ? `(${c}x + ${d})` : `(${c}x ${d})`);
        
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
        const { a, b, c, d, e } = factors;
        
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
                // 保持括号内容不变，改变外部系数
                wrongChoices = [
                    { ...factors, e: (e as number) + 1 },
                    { ...factors, e: (e as number) - 1 },
                    { ...factors, e: (e as number) * 2 }
                ];
            } else if (this.difficulty === 4) {
                // 保持括号内容不变，改变外部负系数
                wrongChoices = [
                    { ...factors, e: (e as number) + 1 },
                    { ...factors, e: (e as number) - 1 },
                    { ...factors, e: -(e as number) }  // 变号
                ];
            } else {  // 难度5
                const [p, q] = e as [number, number];
                // 保持括号内容不变，改变分数
                wrongChoices = [
                    { ...factors, e: [p + 1, q] as [number, number] },
                    { ...factors, e: [p, q + 1] as [number, number] },
                    { ...factors, e: [q, p] as [number, number] }  // 分子分母互换
                ];
            }
            
            // 再添加一些改变括号内容的选项
            wrongChoices.push(
                { ...factors, a: a + 1, c: c - 1 },
                { ...factors, a: a - 1, c: c + 1 },
                { ...factors, b: -b, d: -d }
            );
        }
        
        // 打乱错误选项顺序
        wrongChoices = this.shuffleArray(wrongChoices);
        
        // 确保至少有一个只改变外部系数的错误答案
        if (this.difficulty >= 3) {
            const firstChoice = wrongChoices[0];
            wrongAnswers.add(this.formatAnswer(firstChoice));
        }
        
        // 添加其他错误答案直到有3个
        for (const wrong of wrongChoices) {
            if (wrongAnswers.size < 3) {
                wrongAnswers.add(this.formatAnswer(wrong));
            }
        }
        
        return Array.from(wrongAnswers);
    }

    private generateSteps(p: number, q: number, factors: Factor): string {
        const { a, b, c, d, e } = factors;
        
        let steps = `解題步驟：\n`;
        steps += `1. 觀察二次項：\n`;
        steps += `   \\[${this.formatExpression(p, q, factors)}\\]\n\n`;
        
        if (this.difficulty >= 3) {
            steps += `2. 提取公因數：\n`;
            if (this.difficulty === 3) {
                steps += `   \\[${e}(\\quad)\\]\n`;
            } else {
                steps += `   \\[\\frac{${p}}{${q}}(\\quad)\\]\n`;
            }
        }
        
        steps += `${this.difficulty >= 3 ? '3' : '2'}. 找出兩個因式：\n`;
        steps += `   - 第一個因式：\\[${a}x ${b >= 0 ? '+' : ''}${b}\\]\n`;
        
        if (this.difficulty === 1) {
            steps += `   - 第二個因式：\\[x ${d >= 0 ? '+' : ''}${d}\\]\n`;
        } else {
            steps += `   - 第二個因式：\\[${c}x ${d >= 0 ? '+' : ''}${d}\\]\n`;
        }
        
        steps += `\n${this.difficulty >= 3 ? '4' : '3'}. 最終答案：\n`;
        steps += `   \\[${this.formatAnswer(factors)}\\]`;
        
        return steps;
    }
} 