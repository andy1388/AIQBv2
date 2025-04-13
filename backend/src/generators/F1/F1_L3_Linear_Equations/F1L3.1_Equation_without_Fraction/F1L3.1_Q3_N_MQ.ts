import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import {
    getRandomInt,
    getNonZeroRandomInt,
    formatNumber,
} from '@/utils/mathUtils';

interface PolynomialEquation {
    leftSide: string;
    rightSide: string;
    solution: number;
    terms: {
        left: {
            coefficients: number[];
            constants: number[];
        };
        right: {
            coefficients: number[];
            constants: number[];
        };
    };
}

export default class F1L3_1_Q3_N_MQ extends QuestionGenerator {
    constructor(difficulty: number) {
        super(difficulty, 'F1L3.1_Q3_N_MQ');
    }

    generate(): IGeneratorOutput {
        let equation: PolynomialEquation;
        
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

    private generateLevel1(): PolynomialEquation {
        // 3 + 3(x + 3) = -18 + 4(x - 2) 形式
        
        // 1. 先生成解和系数
        const solution = getRandomInt(-8, 8);
        const a1 = getNonZeroRandomInt(1, 5);  // 左边括号系数
        let a2: number;
        do {
            a2 = getNonZeroRandomInt(1, 5);  // 右边括号系数
        } while (a1 === a2);  // 确保系数不相等
        
        // 2. 生成括号内的常数
        const b1 = getNonZeroRandomInt(-5, 5);  // 左边括号内常数
        const b2 = getNonZeroRandomInt(-5, 5);  // 右边括号内常数
        
        // 3. 生成左边的常数项
        const c1 = getNonZeroRandomInt(-5, 5);
        
        // 4. 计算右边的常数项使方程成立
        // 左边展开：c1 + a1x + a1b1
        // 右边展开：c2 + a2x - a2b2
        // c1 + a1x + a1b1 = c2 + a2x - a2b2
        // 代入x = solution
        const leftSideValue = c1 + a1 * solution + a1 * b1;
        const rightSidePartial = a2 * solution - a2 * b2;
        const c2 = leftSideValue - rightSidePartial;
        
        // 验证方程是否成立（以防万一）
        const leftValue = c1 + a1 * (solution + b1);
        const rightValue = c2 + a2 * (solution - b2);
        
        if (Math.abs(leftValue - rightValue) > 0.0001) {
            console.error('Equation validation failed:', {
                solution, leftValue, rightValue,
                equation: `${c1} + ${a1}(x + ${b1}) = ${c2} + ${a2}(x - ${b2})`
            });
            return this.generateLevel1();
        }

        return {
            leftSide: `${c1} + ${a1}(x ${formatNumber(b1)})`,
            rightSide: `${c2} + ${a2}(x ${formatNumber(-b2)})`,
            solution,
            terms: {
                left: {
                    coefficients: [a1],
                    constants: [c1, b1]
                },
                right: {
                    coefficients: [a2],
                    constants: [c2, -b2]
                }
            }
        };
    }

    private generateLevel2(): PolynomialEquation {
        // 14 - 3(5 - c) = 4 - (c + 1) 形式
        
        // 1. 先生成解和系数
        const solution = getRandomInt(-8, 8);
        const a1 = getNonZeroRandomInt(-9, -1);  // 左边括号系数（负数）
        let a2: number;
        do {
            a2 = getNonZeroRandomInt(-9, -1);  // 右边括号系数（负数）
        } while (a1 === a2);  // 确保系数不相等
        
        // 2. 生成括号内的常数
        const b1 = getNonZeroRandomInt(-9, 9);  // 左边括号内常数
        const b2 = getNonZeroRandomInt(-9, 9);  // 右边括号内常数
        
        // 3. 生成左边的常数项
        const c1 = getNonZeroRandomInt(-9, 9);
        
        // 4. 计算右边的常数项使方程成立
        // 左边展开：c1 + a1(b1 - x) = c1 + a1b1 - a1x
        // 右边展开：c2 - (x + b2) = c2 - x - b2
        // c1 + a1b1 - a1x = c2 - x - b2
        // 代入x = solution
        const leftSideValue = c1 + a1 * b1 - a1 * solution;
        const rightSidePartial = -solution - b2;
        const c2 = leftSideValue - rightSidePartial;
        
        // 验证方程是否成立（以防万一）
        const leftValue = c1 + a1 * (b1 - solution);
        const rightValue = c2 - (solution + b2);
        
        if (Math.abs(leftValue - rightValue) > 0.0001) {
            console.error('Equation validation failed:', {
                solution, leftValue, rightValue,
                equation: `${c1} ${formatNumber(a1)}(${b1} - x) = ${c2} - (x ${formatNumber(b2)})`
            });
            return this.generateLevel2();
        }

        return {
            leftSide: `${c1} ${formatNumber(a1)}(${b1} - x)`,
            rightSide: `${c2} - (x ${formatNumber(b2)})`,
            solution,
            terms: {
                left: {
                    coefficients: [-a1],  // 注意符号变化
                    constants: [c1, b1]
                },
                right: {
                    coefficients: [-1],  // 括号前的负号
                    constants: [c2, b2]
                }
            }
        };
    }

    private generateLevel3(): PolynomialEquation {
        const MAX_ATTEMPTS = 100;
        let attempts = 0;
        
        while (attempts < MAX_ATTEMPTS) {
            attempts++;
            
            // 1. 先生成解和系数
            const solution = getRandomInt(-8, 8);
            const a1 = getNonZeroRandomInt(-9, 9);
            const b1 = getNonZeroRandomInt(-9, 9);
            const a2 = getNonZeroRandomInt(-9, 9);
            const a3 = getNonZeroRandomInt(-9, 9);
            const a4 = getNonZeroRandomInt(-9, 9);
            
            // 确保系数组合不会导致分母为0
            if (a1 * b1 + a2 === a3 + a4) continue;
            
            // 2. 生成括号内的常数
            const c1 = getNonZeroRandomInt(-15, 15);
            const c2 = getNonZeroRandomInt(-15, 15);
            const c3 = getNonZeroRandomInt(-15, 15);
            
            // 3. 计算最后一个常数使方程成立
            const leftValue = a1 * b1 * solution + a1 * c1 + a2 * solution + a2 * c2;
            const rightPartial = a3 * solution + a3 * c3 - a4 * solution;
            
            // 确保c4是整数
            if (Math.abs(leftValue - rightPartial) % Math.abs(a4) !== 0) continue;
            
            const c4 = -(leftValue - rightPartial) / a4;
            
            // 验证方程是否成立
            const leftSideValue = a1 * (b1 * solution + c1) + a2 * (solution + c2);
            const rightSideValue = a3 * (solution + c3) - a4 * (solution + c4);
            
            if (Math.abs(leftSideValue - rightSideValue) < 0.0001) {
                return {
                    leftSide: `${a1}(${b1}x ${formatNumber(c1)}) ${formatNumber(a2)}(x ${formatNumber(c2)})`,
                    rightSide: `${a3}(x ${formatNumber(c3)}) ${formatNumber(-a4)}(x ${formatNumber(c4)})`,
                    solution,
                    terms: {
                        left: {
                            coefficients: [a1 * b1, a2],
                            constants: [a1 * c1, a2 * c2]
                        },
                        right: {
                            coefficients: [a3, -a4],
                            constants: [a3 * c3, -a4 * c4]
                        }
                    }
                };
            }
        }
        
        // 如果无法生成合适的方程，返回一个预设的方程
        return this.generateDefaultLevel3Equation();
    }

    private generateLevel4(): PolynomialEquation {
        const MAX_ATTEMPTS = 100;
        let attempts = 0;
        
        while (attempts < MAX_ATTEMPTS) {
            attempts++;
            
            const solution = getRandomInt(-8, 8);
            const a1 = getNonZeroRandomInt(-12, 12);
            const b1 = getNonZeroRandomInt(-12, 12);
            const a2 = getNonZeroRandomInt(-12, 12);
            const a3 = getNonZeroRandomInt(-12, 12);
            const a4 = getNonZeroRandomInt(-12, 12);
            
            if (a1 * b1 + a2 === a3 + a4) continue;
            
            const c1 = getNonZeroRandomInt(-15, 15);
            const c2 = getNonZeroRandomInt(-15, 15);
            const c3 = getNonZeroRandomInt(-15, 15);
            
            const leftValue = a1 * (b1 * solution + c1) - a2 * (c2 - solution);
            const rightPartial = a3 * (solution + c3);
            
            // 确保c4是整数
            if ((leftValue - rightPartial) % a4 !== 0) continue;
            
            const c4 = (leftValue - rightPartial) / a4 + solution;
            
            // 确保所有计算结果都是整数
            if (!Number.isInteger(c4)) continue;
            
            return {
                leftSide: `${a1}(${b1}x ${formatNumber(c1)}) ${formatNumber(-a2)}(${c2} - x)`,
                rightSide: `${a3}(x ${formatNumber(c3)}) ${formatNumber(-a4)}(${c4} - x)`,
                solution,
                terms: {
                    left: {
                        coefficients: [a1 * b1, a2],
                        constants: [a1 * c1, -a2 * c2]
                    },
                    right: {
                        coefficients: [a3, a4],
                        constants: [a3 * c3, -a4 * c4]
                    }
                }
            };
        }
        
        return this.generateDefaultLevel4Equation();
    }

    private generateLevel5(): PolynomialEquation {
        const MAX_ATTEMPTS = 100;
        let attempts = 0;
        
        while (attempts < MAX_ATTEMPTS) {
            attempts++;
            
            const solution = getRandomInt(-8, 8);
            const a1 = getNonZeroRandomInt(-12, 12);
            const a2 = getNonZeroRandomInt(-12, 12);
            const a3 = getNonZeroRandomInt(-12, 12);
            const b3 = getNonZeroRandomInt(-12, 12);
            const a4 = getNonZeroRandomInt(-12, 12);
            
            const c1 = getNonZeroRandomInt(-20, 20);
            const c2 = getNonZeroRandomInt(-20, 20);
            const c3 = getNonZeroRandomInt(-20, 20);
            
            const leftValue = a1 * (solution + c1) - a2 * (c2 - solution);
            const rightPartial = a3 * (b3 * solution + c3);
            
            // 确保c4是整数
            if ((leftValue - rightPartial) % a4 !== 0) continue;
            
            const c4 = (leftValue - rightPartial) / a4 - solution;
            
            // 确保所有计算结果都是整数
            if (!Number.isInteger(c4)) continue;
            
            return {
                leftSide: `${a1}(x ${formatNumber(c1)}) ${formatNumber(-a2)}(${c2} - x)`,
                rightSide: `${a3}(${b3}x ${formatNumber(c3)}) ${formatNumber(a4)}(x ${formatNumber(c4)})`,
                solution,
                terms: {
                    left: {
                        coefficients: [a1, a2],
                        constants: [a1 * c1, -a2 * c2]
                    },
                    right: {
                        coefficients: [a3 * b3, a4],
                        constants: [a3 * c3, a4 * c4]
                    }
                }
            };
        }
        
        return this.generateDefaultLevel5Equation();
    }

    // 预设的默认方程，用于在无法生成合适方程时使用
    private generateDefaultLevel3Equation(): PolynomialEquation {
        return {
            leftSide: `4(5x - 7) + 5(x + 5)`,
            rightSide: `-1(x + 14) + 6(x + 28)`,
            solution: 6,
            terms: {
                left: {
                    coefficients: [20, 5],
                    constants: [-28, 25]
                },
                right: {
                    coefficients: [-1, 6],
                    constants: [-14, 168]
                }
            }
        };
    }

    private generateWrongAnswers(correctAnswer: number): string[] {
        const wrongAnswers: string[] = [];
        
        while (wrongAnswers.length < 3) {
            let wrong = correctAnswer + (Math.floor(Math.random() * 5) + 1) * (Math.random() < 0.5 ? 1 : -1);
            
            if (Math.abs(wrong) <= 10 && 
                !wrongAnswers.includes(wrong.toString()) && 
                wrong !== correctAnswer) {
                wrongAnswers.push(wrong.toString());
            }
        }
        
        return wrongAnswers;
    }

    private generateExplanation(equation: PolynomialEquation): string {
        const steps: string[] = [];
        
        if (this.difficulty === 1) {
            const { left, right } = equation.terms;
            const a1 = left.coefficients[0];
            const b1 = left.constants[1];
            const c1 = left.constants[0];
            const a2 = right.coefficients[0];
            const b2 = -right.constants[1];  // 注意这里的符号
            const c2 = right.constants[0];

            steps.push(
                '1. 展開括號',
                `\\[${equation.leftSide} = ${equation.rightSide}\\]`,
                `\\[${c1} + ${a1}x ${formatNumber(a1 * b1)} = ${c2} + ${a2}x ${formatNumber(-a2 * b2)}\\]`,
                '2. 移項：將含x的項移到等號左邊，常數項移到右邊',
                `\\[${a1}x - ${a2}x = ${c2} ${formatNumber(-c1)} ${formatNumber(-a1 * b1)} ${formatNumber(a2 * b2)}\\]`,
                '3. 合併同類項',
                `\\[${a1 - a2}x = ${c2 - c1 - a1 * b1 + a2 * b2}\\]`,
                '4. 求解：得到變量的值',
                `\\[x = ${equation.solution}\\]`
            );
        } else if (this.difficulty === 2) {
            const { left, right } = equation.terms;
            const a1 = -left.coefficients[0];  // 注意符号变化
            const b1 = left.constants[1];
            const c1 = left.constants[0];
            const c2 = right.constants[0];
            const b2 = right.constants[1];

            steps.push(
                '1. 展開括號',
                `\\[${equation.leftSide} = ${equation.rightSide}\\]`,
                `\\[${c1} ${formatNumber(a1 * b1)} ${formatNumber(-a1)}x = ${c2} - x ${formatNumber(-b2)}\\]`,
                '2. 移項：將含x的項移到等號左邊，常數項移到右邊',
                `\\[${formatNumber(-a1)}x + x = ${c2} ${formatNumber(-c1)} ${formatNumber(-a1 * b1)} ${formatNumber(-b2)}\\]`,
                '3. 合併同類項',
                `\\[${formatNumber(-a1 + 1)}x = ${c2 - c1 - a1 * b1 - b2}\\]`,
                '4. 求解：得到變量的值',
                `\\[x = ${equation.solution}\\]`
            );
        } else if (this.difficulty === 3) {
            const { left, right } = equation.terms;
            const a1b1 = left.coefficients[0];  // 第一个括号的x系数
            const a2 = left.coefficients[1];    // 第二个括号的x系数
            const a1c1 = left.constants[0];     // 第一个括号的常数项
            const a2c2 = left.constants[1];     // 第二个括号的常数项
            const a3 = right.coefficients[0];   // 右边第一个括号的x系数
            const a4 = right.coefficients[1];   // 右边第二个括号的x系数
            const a3c3 = right.constants[0];    // 右边第一个括号的常数项
            const a4c4 = right.constants[1];    // 右边第二个括号的常数项

            steps.push(
                '1. 展開括號',
                `\\[${equation.leftSide} = ${equation.rightSide}\\]`,
                `\\[${a1b1}x ${formatNumber(a1c1)} ${formatNumber(a2)}x ${formatNumber(a2c2)} = ${a3}x ${formatNumber(a3c3)} ${formatNumber(a4)}x ${formatNumber(a4c4)}\\]`,
                '2. 移項：將含x的項移到等號左邊，常數項移到右邊',
                `\\[${a1b1}x ${formatNumber(a2)}x ${formatNumber(-a3)}x ${formatNumber(-a4)}x = ${formatNumber(-a1c1)} ${formatNumber(-a2c2)} ${formatNumber(a3c3)} ${formatNumber(a4c4)}\\]`,
                '3. 合併同類項',
                `\\[${formatNumber(a1b1 + a2 - a3 - a4)}x = ${formatNumber(-a1c1 - a2c2 + a3c3 + a4c4)}\\]`,
                '4. 求解：得到變量的值',
                `\\[x = ${equation.solution}\\]`
            );
        }

        return steps.join('\n');
    }

    private generateExpandedForm(equation: PolynomialEquation): string {
        // 實現展開形式的生成
        return '\\[展開後的方程式\\]';
    }

    private generateGroupedForm(equation: PolynomialEquation): string {
        // 實現移項後的形式生成
        return '\\[移項後的方程式\\]';
    }

    private generateCombinedForm(equation: PolynomialEquation): string {
        // 實現合併同類項後的形式生成
        return '\\[合併後的方程式\\]';
    }

    private generateDefaultLevel4Equation(): PolynomialEquation {
        return {
            leftSide: `4(2x + 1) - 7(3 - x)`,
            rightSide: `5(x + 3) - 7(5 - x)`,
            solution: 4,
            terms: {
                left: {
                    coefficients: [8, 7],
                    constants: [4, -21]
                },
                right: {
                    coefficients: [5, 7],
                    constants: [15, -35]
                }
            }
        };
    }

    private generateDefaultLevel5Equation(): PolynomialEquation {
        return {
            leftSide: `4(5x - 7) + 5(x + 5)`,
            rightSide: `-1(x + 14) + 6(x + 28)`,
            solution: 6,
            terms: {
                left: {
                    coefficients: [20, 5],
                    constants: [-28, 25]
                },
                right: {
                    coefficients: [-1, 6],
                    constants: [-14, 168]
                }
            }
        };
    }
} 