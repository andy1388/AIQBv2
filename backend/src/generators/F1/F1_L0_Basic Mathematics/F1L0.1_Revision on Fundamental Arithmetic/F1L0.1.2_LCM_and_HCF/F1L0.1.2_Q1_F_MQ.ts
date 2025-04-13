import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import {
    getRandomInt,
    formatNumber,
    DEFAULT_CONFIG,
    getNonZeroRandomInt
} from '@/utils/mathUtils';

interface NumberOperation {
    numbers: number[];
    result: number | number[];
    type: 'multiples' | 'factors' | 'hcf' | 'lcm' | 'mixed' | 'sum' | 'product';
}

export default class F1L0_1_2_Q1_F_MQ extends QuestionGenerator {
    constructor(difficulty: number) {
        super(difficulty, 'F1L0.1.2_Q1_F_MQ');
    }

    generate(): IGeneratorOutput {
        let operation: NumberOperation;
        
        // 根据难度生成问题
        switch (this.difficulty) {
            case 1:
                operation = this.generateLevel1();
                break;
            case 2:
                operation = this.generateLevel2();
                break;
            case 3:
                operation = this.generateLevel3();
                break;
            case 4:
                operation = this.generateLevel4();
                break;
            case 5:
                operation = this.generateLevel5();
                break;
            case 6:
                operation = this.generateLevel6();
                break;
            case 7:
                operation = this.generateLevel7();
                break;
            default:
                throw new Error(`不支援的難度等級: ${this.difficulty}`);
        }

        // 生成错误答案
        const wrongAnswers = this.generateWrongAnswers(operation);

        // 格式化题目和答案
        const content = this.formatQuestion(operation);
        const correctAnswer = this.formatAnswer(operation);
        const explanation = this.generateExplanation(operation);

        return {
            content: content,
            correctAnswer: correctAnswer,
            wrongAnswers: wrongAnswers,
            explanation: explanation,
            type: 'text'
        };
    }

    private generateLevel1(): NumberOperation {
        // 基础倍数计算
        const number = getRandomInt(10, 30);
        const multiples = Array.from({length: 4}, (_, i) => number * (i + 1));
        
        return {
            numbers: [number],
            result: multiples,
            type: 'multiples'
        };
    }

    private generateLevel2(): NumberOperation {
        // 基础因数计算
        const number = getRandomInt(10, 50);
        const factors = this.getFactors(number);
        
        return {
            numbers: [number],
            result: factors,
            type: 'factors'
        };
    }

    private getUniqueNumbers(min: number, max: number, count: number): number[] {
        const numbers: number[] = [];
        while (numbers.length < count) {
            const num = Math.abs(getRandomInt(min, max));
            if (!numbers.includes(num)) {
                numbers.push(num);
            }
        }
        return numbers;
    }

    private generateLevel3(): NumberOperation {
        // 基础HCF和LCM计算（三个数）
        const isThreeNumbers = Math.random() < 0.3; // 30%概率生成三个数的题目
        
        if (isThreeNumbers) {
            let numbers: number[], hcf: number, lcm: number;
            do {
                numbers = this.getUniqueNumbers(2, 20, 3);
                hcf = this.calculateHCFForThree(numbers[0], numbers[1], numbers[2]);
                lcm = this.calculateLCMForThree(numbers[0], numbers[1], numbers[2]);
            } while (hcf <= 1 || lcm > 200);
            
            const isHCF = Math.random() < 0.5;
            
            return {
                numbers: numbers,
                result: [isHCF ? hcf : lcm],
                type: isHCF ? 'hcf' : 'lcm'
            };
        } else {
            let numbers: number[], hcf: number;
            do {
                numbers = this.getUniqueNumbers(2, 30, 2);
                hcf = this.calculateHCF(numbers[0], numbers[1]);
            } while (hcf <= 1);
            
            return {
                numbers: numbers,
                result: [hcf],
                type: 'hcf'
            };
        }
    }

    private generateLevel4(): NumberOperation {
        // 基础LCM计算
        const isThreeNumbers = Math.random() < 0.3;
        
        if (isThreeNumbers) {
            let numbers: number[], lcm: number;
            do {
                numbers = this.getUniqueNumbers(2, 20, 3);
                lcm = this.calculateLCMForThree(numbers[0], numbers[1], numbers[2]);
            } while (lcm > 200);
            
            return {
                numbers: numbers,
                result: [lcm],
                type: 'lcm'
            };
        } else {
            let numbers: number[], lcm: number;
            do {
                numbers = this.getUniqueNumbers(2, 30, 2);
                lcm = this.calculateLCM(numbers[0], numbers[1]);
            } while (lcm > 300);
            
            return {
                numbers: numbers,
                result: [lcm],
                type: 'lcm'
            };
        }
    }

    private generateLevel5(): NumberOperation {
        // 混合HCF和LCM计算
        const isThreeNumbers = Math.random() < 0.3;
        const difficultyRanges = [
            { min: 2, max: 40 },
            { min: 2, max: 60 },
            { min: 2, max: 100 }
        ];
        
        const range = difficultyRanges[Math.floor(Math.random() * 3)];
        
        if (isThreeNumbers) {
            let numbers: number[], hcf: number, lcm: number;
            do {
                numbers = this.getUniqueNumbers(range.min, Math.min(range.max, 30), 3);
                hcf = this.calculateHCFForThree(numbers[0], numbers[1], numbers[2]);
                lcm = this.calculateLCMForThree(numbers[0], numbers[1], numbers[2]);
            } while (hcf <= 1 || lcm > 500);
            
            return {
                numbers: numbers,
                result: [hcf, lcm],
                type: 'mixed'
            };
        } else {
            let numbers: number[], hcf: number, lcm: number;
            do {
                numbers = this.getUniqueNumbers(range.min, range.max, 2);
                hcf = this.calculateHCF(numbers[0], numbers[1]);
                lcm = this.calculateLCM(numbers[0], numbers[1]);
            } while (hcf <= 1 || lcm > 1000);
            
            return {
                numbers: numbers,
                result: [hcf, lcm],
                type: 'mixed'
            };
        }
    }

    private generateLevel6(): NumberOperation {
        // 将原来的Level 8改为Level 6
        // 倍数或因数的求和应用
        const isMultipleSum = Math.random() < 0.5;
        
        if (isMultipleSum) {
            // 倍数求和
            const number = getRandomInt(2, 12);
            const count = getRandomInt(3, 6); // 随机选择求前3-6个倍数的和
            const multiples = Array.from({length: count}, (_, i) => number * (i + 1));
            const sum = multiples.reduce((a, b) => a + b, 0);
            
            return {
                numbers: [number, count], // 保存数字和需要计算的倍数个数
                result: [sum],
                type: 'sum'
            };
        } else {
            // 部分因数求和
            const number = getRandomInt(12, 30); // 选择较大的数以有更多因数
            const factors = this.getFactors(number);
            const selectedFactors = factors.filter(f => f <= 10); // 只求10以内的因数之和
            const sum = selectedFactors.reduce((a, b) => a + b, 0);
            
            return {
                numbers: [number],
                result: [sum],
                type: 'sum'
            };
        }
    }

    private generateLevel7(): NumberOperation {
        // 将原来的Level 9改为Level 7
        // 因数或倍数的乘积应用
        const isFactorProduct = Math.random() < 0.5;
        
        if (isFactorProduct) {
            // 因数乘积
            const number = getRandomInt(10, 30);
            const factors = this.getFactors(number);
            const product = factors.reduce((a, b) => a * b, 1);
            
            return {
                numbers: [number],
                result: [product],
                type: 'product'
            };
        } else {
            // 连续倍数乘积
            const number = getRandomInt(2, 8); // 选择较小的数
            const count = getRandomInt(2, 4); // 随机选择求前2-4个倍数的乘积
            const multiples = Array.from({length: count}, (_, i) => number * (i + 1));
            const product = multiples.reduce((a, b) => a * b, 1);
            
            return {
                numbers: [number, count], // 保存数字和需要计算的倍数个数
                result: [product],
                type: 'product'
            };
        }
    }

    private calculateHCF(a: number, b: number): number {
        while (b !== 0) {
            const temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    }

    private calculateLCM(a: number, b: number): number {
        return Math.abs(a * b) / this.calculateHCF(a, b);
    }

    private calculateHCFForThree(a: number, b: number, c: number): number {
        return this.calculateHCF(this.calculateHCF(a, b), c);
    }

    private calculateLCMForThree(a: number, b: number, c: number): number {
        return this.calculateLCM(this.calculateLCM(a, b), c);
    }

    private getFactors(n: number): number[] {
        const factors: number[] = [];
        for (let i = 1; i <= n; i++) {
            if (n % i === 0) {
                factors.push(i);
            }
        }
        return factors;
    }

    private formatQuestion(operation: NumberOperation): string {
        switch (operation.type) {
            case 'multiples':
                return `求${operation.numbers[0]}的前四個倍數。`;
            case 'factors':
                return `求${operation.numbers[0]}的所有因數。`;
            case 'hcf':
                if (operation.numbers.length === 3) {
                    return `求${operation.numbers[0]}、${operation.numbers[1]}和${operation.numbers[2]}的最大公因數。`;
                }
                return `求${operation.numbers[0]}和${operation.numbers[1]}的最大公因數。`;
            case 'lcm':
                if (operation.numbers.length === 3) {
                    return `求${operation.numbers[0]}、${operation.numbers[1]}和${operation.numbers[2]}的最小公倍數。`;
                }
                return `求${operation.numbers[0]}和${operation.numbers[1]}的最小公倍數。`;
            case 'mixed':
                if (operation.numbers.length === 3) {
                    return `求${operation.numbers[0]}、${operation.numbers[1]}和${operation.numbers[2]}的最大公因數和最小公倍數。`;
                }
                return `求${operation.numbers[0]}和${operation.numbers[1]}的最大公因數和最小公倍數。`;
            case 'sum':
                if (operation.numbers.length > 1) {
                    return `求${operation.numbers[0]}的前${operation.numbers[1]}個倍數之和。`;
                }
                return `求${operation.numbers[0]}的10以內所有因數之和。`;
            case 'product':
                if (operation.numbers.length > 1) {
                    return `求${operation.numbers[0]}的前${operation.numbers[1]}個倍數的乘積。`;
                }
                return `求${operation.numbers[0]}的所有因數的乘積。`;
            default:
                throw new Error('未知的運算類型');
        }
    }

    private formatAnswer(operation: NumberOperation): string {
        if (Array.isArray(operation.result)) {
            if (operation.type === 'mixed') {
                return `H.C.F.=${operation.result[0]}, L.C.M.=${operation.result[1]}`;
            }
            return operation.result.join(', ');
        }
        return operation.result.toString();
    }

    private generateWrongAnswers(operation: NumberOperation): string[] {
        const wrongAnswers: string[] = [];
        const correctAnswer = this.formatAnswer(operation);
        
        while (wrongAnswers.length < 3) {
            let wrongAnswer: string;
            
            switch (operation.type) {
                case 'multiples':
                    // 倍数必然为正数，保持不变
                    const number = operation.numbers[0];
                    const wrongTypes = [
                        [0, number, number * 2, number * 3],
                        [number, number * 2, number * 4, number * 5],
                        [number, number * 2, number * 3 + 1, number * 4],
                        [number, number + number, number + number + number, number + number + number + number]
                    ];
                    const randomType = wrongTypes[Math.floor(Math.random() * wrongTypes.length)];
                    wrongAnswer = randomType.join(', ');
                    break;
                    
                case 'factors':
                    // 因数列表保持不变，因为已经是正数
                    const factors = operation.result as number[];
                    const wrongFactorTypes = [
                        [...factors, factors[factors.length - 1] + 1],
                        factors.filter((_, i) => i !== Math.floor(factors.length / 2)),
                        [...factors.slice(0, -1), factors[factors.length - 1] + 2],
                        factors.map((f, i) => i === factors.length - 2 ? f + 1 : f)
                    ];
                    const randomFactorType = wrongFactorTypes[Math.floor(Math.random() * wrongFactorTypes.length)];
                    wrongAnswer = randomFactorType.join(', ');
                    break;
                    
                case 'hcf':
                case 'lcm':
                    // 确保结果为正数
                    const baseNum = (operation.result as number[])[0];
                    const offset = getNonZeroRandomInt(-Math.min(5, baseNum - 1), 5);
                    wrongAnswer = Math.max(1, baseNum + offset).toString();
                    break;
                    
                case 'mixed':
                    // 确保HCF和LCM都为正数
                    const [hcf, lcm] = operation.result as number[];
                    const hcfOffset = getNonZeroRandomInt(-Math.min(2, hcf - 1), 2);
                    const lcmOffset = getNonZeroRandomInt(-Math.min(10, lcm - 1), 10);
                    wrongAnswer = `H.C.F.=${Math.max(1, hcf + hcfOffset)}, L.C.M.=${Math.max(1, lcm + lcmOffset)}`;
                    break;
                    
                case 'sum':
                case 'product':
                    // 确保结果为正数
                    const baseResult = (operation.result as number[])[0];
                    const resultOffset = getNonZeroRandomInt(-Math.min(20, baseResult - 1), 20);
                    wrongAnswer = Math.max(1, baseResult + resultOffset).toString();
                    break;
                    
                default:
                    throw new Error('未知的運算類型');
            }
            
            if (!wrongAnswers.includes(wrongAnswer) && wrongAnswer !== correctAnswer) {
                wrongAnswers.push(wrongAnswer);
            }
        }
        
        return wrongAnswers;
    }

    private generateExplanation(operation: NumberOperation): string {
        const steps: string[] = [];
        
        switch (operation.type) {
            case 'multiples':
                steps.push(
                    `1. ${operation.numbers[0]}的第一個倍數是：${operation.numbers[0]} × 1 = ${operation.numbers[0]}<br>`,
                    `2. ${operation.numbers[0]}的第二個倍數是：${operation.numbers[0]} × 2 = ${operation.numbers[0] * 2}<br>`,
                    `3. ${operation.numbers[0]}的第三個倍數是：${operation.numbers[0]} × 3 = ${operation.numbers[0] * 3}<br>`,
                    `4. ${operation.numbers[0]}的第四個倍數是：${operation.numbers[0]} × 4 = ${operation.numbers[0] * 4}`
                );
                break;
                
            case 'factors':
                steps.push(
                    `1. 找出${operation.numbers[0]}的所有因數：<br>`,
                    `2. 從1開始嘗試，如果能整除${operation.numbers[0]}，就是因數<br>`,
                    `3. ${operation.numbers[0]}的因數有：${(operation.result as number[]).join(', ')}`
                );
                break;
                
            case 'hcf':
                if (operation.numbers.length === 3) {
                    steps.push(
                        `1. 找出${operation.numbers[0]}的所有因數：${this.getFactors(operation.numbers[0]).join(', ')}<br>`,
                        `2. 找出${operation.numbers[1]}的所有因數：${this.getFactors(operation.numbers[1]).join(', ')}<br>`,
                        `3. 找出${operation.numbers[2]}的所有因數：${this.getFactors(operation.numbers[2]).join(', ')}<br>`,
                        `4. 找出三個數的共同因數<br>`,
                        `5. 最大公因數是：${(operation.result as number[])[0]}`
                    );
                } else {
                    steps.push(
                        `1. 找出${operation.numbers[0]}的所有因數：${this.getFactors(operation.numbers[0]).join(', ')}<br>`,
                        `2. 找出${operation.numbers[1]}的所有因數：${this.getFactors(operation.numbers[1]).join(', ')}<br>`,
                        `3. 找出兩數的共同因數<br>`,
                        `4. 最大公因數是：${(operation.result as number[])[0]}`
                    );
                }
                break;

            case 'lcm':
                if (operation.numbers.length === 3) {
                    steps.push(
                        `1. 列出${operation.numbers[0]}的倍數：${operation.numbers[0]}, ${operation.numbers[0]*2}, ${operation.numbers[0]*3}, ...<br>`,
                        `2. 列出${operation.numbers[1]}的倍數：${operation.numbers[1]}, ${operation.numbers[1]*2}, ${operation.numbers[1]*3}, ...<br>`,
                        `3. 列出${operation.numbers[2]}的倍數：${operation.numbers[2]}, ${operation.numbers[2]*2}, ${operation.numbers[2]*3}, ...<br>`,
                        `4. 找出三個數的共同倍數<br>`,
                        `5. 最小公倍數是：${(operation.result as number[])[0]}`
                    );
                } else {
                    steps.push(
                        `1. 列出${operation.numbers[0]}的倍數：${operation.numbers[0]}, ${operation.numbers[0]*2}, ${operation.numbers[0]*3}, ...<br>`,
                        `2. 列出${operation.numbers[1]}的倍數：${operation.numbers[1]}, ${operation.numbers[1]*2}, ${operation.numbers[1]*3}, ...<br>`,
                        `3. 找出兩數的共同倍數<br>`,
                        `4. 最小公倍數是：${(operation.result as number[])[0]}`
                    );
                }
                break;

            case 'mixed':
                const [hcf, lcm] = operation.result as number[];
                if (operation.numbers.length === 3) {
                    steps.push(
                        '求最大公因數：<br>',
                        `1. 找出${operation.numbers[0]}的所有因數：${this.getFactors(operation.numbers[0]).join(', ')}<br>`,
                        `2. 找出${operation.numbers[1]}的所有因數：${this.getFactors(operation.numbers[1]).join(', ')}<br>`,
                        `3. 找出${operation.numbers[2]}的所有因數：${this.getFactors(operation.numbers[2]).join(', ')}<br>`,
                        `4. 找出三個數的共同因數<br>`,
                        `5. 最大公因數(H.C.F.)是：${hcf}<br>`,
                        '求最小公倍數：<br>',
                        `6. 列出各數的倍數<br>`,
                        `7. 找出三個數的共同倍數<br>`,
                        `8. 最小公倍數(L.C.M.)是：${lcm}`
                    );
                } else {
                    steps.push(
                        '求最大公因數：<br>',
                        `1. 找出${operation.numbers[0]}和${operation.numbers[1]}的共同因數<br>`,
                        `2. 最大公因數(H.C.F.)是：${hcf}<br>`,
                        '求最小公倍數：<br>',
                        `3. 找出${operation.numbers[0]}和${operation.numbers[1]}的共同倍數<br>`,
                        `4. 最小公倍數(L.C.M.)是：${lcm}`
                    );
                }
                break;

            case 'sum':
                if (operation.numbers.length > 1) {
                    // 倍数求和
                    const count = operation.numbers[1];
                    const multiples = Array.from({length: count}, (_, i) => operation.numbers[0] * (i + 1));
                    steps.push(
                        `1. 列出${operation.numbers[0]}的前${count}個倍數：${multiples.join(', ')}<br>`,
                        `2. 計算這些數的和：${multiples.join(' + ')} = ${(operation.result as number[])[0]}`
                    );
                } else {
                    // 因数求和
                    const factors = this.getFactors(operation.numbers[0]).filter(f => f <= 10);
                    steps.push(
                        `1. 找出${operation.numbers[0]}的10以內的因數：${factors.join(', ')}<br>`,
                        `2. 計算這些因數的和：${factors.join(' + ')} = ${(operation.result as number[])[0]}`
                    );
                }
                break;

            case 'product':
                if (operation.numbers.length > 1) {
                    // 倍数乘积
                    const count = operation.numbers[1];
                    const multiples = Array.from({length: count}, (_, i) => operation.numbers[0] * (i + 1));
                    steps.push(
                        `1. 列出${operation.numbers[0]}的前${count}個倍數：${multiples.join(', ')}<br>`,
                        `2. 計算這些數的乘積：${multiples.join(' × ')} = ${(operation.result as number[])[0]}`
                    );
                } else {
                    // 因数乘积
                    const factors = this.getFactors(operation.numbers[0]);
                    steps.push(
                        `1. 找出${operation.numbers[0]}的所有因數：${factors.join(', ')}<br>`,
                        `2. 計算這些因數的乘積：${factors.join(' × ')} = ${(operation.result as number[])[0]}`
                    );
                }
                break;
        }
        
        return steps.join('\n');
    }
} 