import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import {
    getRandomInt,
    getNonZeroRandomInt,
    NumberCalculator,
    LaTeX
} from '@/utils/mathUtils';

interface FractionOperation {
    numbers: string[];  // 存储分数字符串，如 "1/2", "3/4", "2 1/3" 等
    result: string;     // 存储计算结果
    type: 'add' | 'subtract' | 'multiply' | 'divide' | 'mixed';
}

export default class F1L0_1_3_Q1_F_MQ extends QuestionGenerator {
    constructor(difficulty: number) {
        super(difficulty, 'F1L0.1.3_Q1_F_MQ');
    }

    generate(): IGeneratorOutput {
        let operation: FractionOperation;
        
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

        const wrongAnswers = this.generateWrongAnswers(operation);
        const content = this.formatQuestion(operation);
        const correctAnswer = operation.result;
        const explanation = this.generateExplanation(operation);

        return {
            content: `\\[${content}\\]`,
            correctAnswer,
            wrongAnswers,
            explanation,
            type: 'text',
            displayOptions: {
                latex: true
            }
        };
    }

    private generateFraction(maxDenominator: number): string {
        const denominator = getNonZeroRandomInt(2, maxDenominator);
        const numerator = getNonZeroRandomInt(1, denominator - 1);
        return `\\frac{${numerator}}{${denominator}}`;
    }

    private generateMixedNumber(maxWhole: number, maxDenominator: number): string {
        const whole = getNonZeroRandomInt(1, maxWhole);
        const denominator = getNonZeroRandomInt(2, maxDenominator);
        const numerator = getNonZeroRandomInt(1, denominator - 1);
        return `${whole}\\frac{${numerator}}{${denominator}}`;
    }

    private generateLevel1(): FractionOperation {
        // 需要通分的加減
        const denominators = [2, 3, 4, 5, 6, 8, 9, 12, 15, 16];
        let den1, den2, num1, num2;
        let isAdd = Math.random() < 0.5;
        
        do {
            den1 = denominators[getRandomInt(0, denominators.length - 1)];
            den2 = denominators[getRandomInt(0, denominators.length - 1)];
            
            // 確保分子小於分母
            num1 = getNonZeroRandomInt(1, den1 - 1);
            num2 = getNonZeroRandomInt(1, den2 - 1);
            
            // 如果是減法，確保結果為正數
            if (!isAdd) {
                // 計算通分後的值
                const lcm = this.lcm(den1, den2);
                const newNum1 = num1 * (lcm / den1);
                const newNum2 = num2 * (lcm / den2);
                
                // 如果減法結果會是負數，就交換兩個分數
                if (newNum1 < newNum2) {
                    [num1, den1, num2, den2] = [num2, den2, num1, den1];
                }
            }
        } while (den1 === den2);
        
        const fraction1 = `${num1}/${den1}`;
        const fraction2 = `${num2}/${den2}`;
        
        const result = NumberCalculator.calculate(
            `${fraction1} ${isAdd ? '+' : '-'} ${fraction2}`
        );

        return {
            numbers: [`\\frac{${num1}}{${den1}}`, `\\frac{${num2}}{${den2}}`],
            result: this.convertToLatex(result),
            type: isAdd ? 'add' : 'subtract'
        };
    }

    private generateLevel2(): FractionOperation {
        // 基础分数加减
        const isAdd = Math.random() < 0.5;
        let den1, den2, num1, num2;
        
        do {
            // 使用較小的分母範圍避免結果過大
            den1 = getNonZeroRandomInt(2, 12);
            den2 = getNonZeroRandomInt(2, 12);
            
            // 確保分子小於分母
            num1 = getNonZeroRandomInt(1, Math.floor(den1 / 2));
            num2 = getNonZeroRandomInt(1, Math.floor(den2 / 2));
            
            // 如果是減法，確保結果為正數
            if (!isAdd) {
                // 計算通分後的值
                const lcm = this.lcm(den1, den2);
                const newNum1 = num1 * (lcm / den1);
                const newNum2 = num2 * (lcm / den2);
                
                // 如果減法結果會是負數，就交換兩個分數
                if (newNum1 < newNum2) {
                    [num1, den1, num2, den2] = [num2, den2, num1, den1];
                }
            }
        } while (den1 === den2);
        
        const fraction1 = `\\frac{${num1}}{${den1}}`;
        const fraction2 = `\\frac{${num2}}{${den2}}`;
        
        const calcExpr = `${num1}/${den1} ${isAdd ? '+' : '-'} ${num2}/${den2}`;
        const result = NumberCalculator.calculate(calcExpr);
        
        return {
            numbers: [fraction1, fraction2],
            result: this.convertToLatex(result),
            type: isAdd ? 'add' : 'subtract'
        };
    }

    private generateLevel3(): FractionOperation {
        // 整数与分数混合运算
        const whole = getNonZeroRandomInt(1, 10);
        const fraction1 = this.generateFraction(21);
        const fraction2 = this.generateFraction(21);
        
        const operators = ['+', '-'];
        const op1 = operators[getRandomInt(0, 1)];
        const op2 = operators[getRandomInt(0, 1)];
        
        const expression = `${whole} ${op1} ${fraction1} ${op2} ${fraction2}`;
        const result = NumberCalculator.calculate(expression);

        return {
            numbers: [whole.toString(), fraction1, fraction2],
            result,
            type: 'mixed'
        };
    }

    private generateLevel4(): FractionOperation {
        // 带分数连续运算
        const mixed1 = this.generateMixedNumber(12, 12);
        const mixed2 = this.generateMixedNumber(12, 12);
        const mixed3 = this.generateMixedNumber(12, 12);
        
        const operators = ['+', '-'];
        const op1 = operators[getRandomInt(0, 1)];
        const op2 = operators[getRandomInt(0, 1)];
        
        const expression = `${mixed1} ${op1} ${mixed2} ${op2} ${mixed3}`;
        const result = NumberCalculator.calculate(expression);

        return {
            numbers: [mixed1, mixed2, mixed3],
            result,
            type: 'mixed'
        };
    }

    private generateLevel5(): FractionOperation {
        // 分数连续乘法
        const fraction1 = this.generateFraction(36);
        const fraction2 = this.generateFraction(36);
        
        const expression = `${fraction1} × ${fraction2}`;
        const result = NumberCalculator.calculate(expression);

        return {
            numbers: [fraction1, fraction2],
            result,
            type: 'multiply'
        };
    }

    private generateLevel6(): FractionOperation {
        // 分数除法，包含括号
        const fraction1 = this.generateFraction(30);
        const mixed1 = this.generateMixedNumber(5, 30);
        const mixed2 = this.generateMixedNumber(5, 30);
        
        const expression = `${fraction1} ÷ (${mixed1} + ${mixed2})`;
        const result = NumberCalculator.calculate(expression);

        return {
            numbers: [fraction1, mixed1, mixed2],
            result,
            type: 'divide'
        };
    }

    private generateLevel7(): FractionOperation {
        // 混合运算
        const mixed1 = this.generateMixedNumber(5, 35);
        const mixed2 = this.generateMixedNumber(5, 35);
        const mixed3 = this.generateMixedNumber(5, 35);
        
        // 将 LaTeX 格式转换为计算格式
        const calc1 = this.convertFromLatex(mixed1);
        const calc2 = this.convertFromLatex(mixed2);
        const calc3 = this.convertFromLatex(mixed3);
        
        const expression = `${calc1} + ${calc2} × ${calc3}`;
        const result = NumberCalculator.calculate(expression);

        return {
            numbers: [mixed1, mixed2, mixed3],
            result: this.convertToLatex(result),
            type: 'mixed'
        };
    }

    private convertFromLatex(latex: string): string {
        // 处理带分数
        if (latex.includes('\\frac')) {
            const wholePart = latex.match(/^(-?\d+)/);
            const fractionPart = latex.match(/\\frac\{(\d+)\}\{(\d+)\}/);
            
            if (wholePart && fractionPart) {
                const whole = parseInt(wholePart[1]);
                const [_, num, den] = fractionPart;
                return `${whole} ${num}/${den}`;
            } else if (fractionPart) {
                const [_, num, den] = fractionPart;
                return `${num}/${den}`;
            }
        }
        return latex;
    }

    private convertToLatex(result: string): string {
        // 处理整数
        if (!result.includes('/')) {
            return result;
        }
        
        // 处理分数
        const [num, den] = result.split('/').map(Number);
        return `\\frac{${num}}{${den}}`;
    }

    private formatQuestion(operation: FractionOperation): string {
        switch (operation.type) {
            case 'add':
            case 'subtract':
                return `${operation.numbers[0]} ${operation.type === 'add' ? '+' : '-'} ${operation.numbers[1]} = ?`;
            case 'multiply':
                return `${operation.numbers[0]} \\times ${operation.numbers[1]} = ?`;
            case 'divide':
                return `${operation.numbers[0]} \\div (${operation.numbers[1]} + ${operation.numbers[2]}) = ?`;
            case 'mixed':
                if (operation.numbers.length === 3) {
                    const operators = this.getOperatorsFromResult(operation.result);
                    return `${operation.numbers[0]} ${operators[0]} ${operation.numbers[1]} ${operators[1]} ${operation.numbers[2]} = ?`;
                }
                return `${operation.numbers.join(' ')} = ?`;
        }
    }

    private generateWrongAnswers(operation: FractionOperation): string[] {
        const wrongAnswers: string[] = [];
        const correctResult = operation.result;
        
        while (wrongAnswers.length < 3) {
            let wrongAnswer: string | undefined = undefined;
            
            try {
                // 从LaTeX格式提取分子分母
                const matches = correctResult.match(/\\frac\{(\d+)\}\{(\d+)\}/);
                if (matches) {
                    const [_, num, den] = matches;
                    const numValue = parseInt(num);
                    const denValue = parseInt(den);
                    
                    // 生成错误答案的策略
                    const strategies = [
                        // 分子加减一个小数
                        () => {
                            const newNum = numValue + getNonZeroRandomInt(-2, 2);
                            // 确保分子小于分母且不为负数
                            return newNum > 0 && newNum < denValue ? 
                                `\\frac{${newNum}}{${denValue}}` : undefined;
                        },
                        // 分母加减一个小数
                        () => {
                            const newDen = denValue + getNonZeroRandomInt(1, 3);
                            // 确保分母大于分子且不等于分子
                            return newDen > numValue ? 
                                `\\frac{${numValue}}{${newDen}}` : undefined;
                        }
                    ];
                    
                    // 随机尝试不同策略直到生成有效答案
                    for (let i = 0; i < 3; i++) {
                        const strategy = strategies[Math.floor(Math.random() * strategies.length)];
                        const result = strategy();
                        if (result) {
                            wrongAnswer = result;
                            break;
                        }
                    }
                } else {
                    // 处理整数结果
                    const value = parseInt(correctResult);
                    wrongAnswer = (value + getNonZeroRandomInt(-2, 2)).toString();
                }
            } catch (error) {
                console.error('Error generating wrong answer:', error);
                continue;
            }
            
            if (wrongAnswer !== undefined && 
                !wrongAnswers.includes(wrongAnswer) && 
                wrongAnswer !== correctResult && 
                !wrongAnswer.includes('NaN')) {
                wrongAnswers.push(wrongAnswer);
            }
        }
        
        return wrongAnswers;
    }

    private generateExplanation(operation: FractionOperation): string {
        const steps: string[] = [];
        
        switch (operation.type) {
            case 'add':
            case 'subtract': {
                // 從 LaTeX 格式中提取分子分母
                const frac1 = operation.numbers[0].match(/\\frac\{(\d+)\}\{(\d+)\}/);
                const frac2 = operation.numbers[1].match(/\\frac\{(\d+)\}\{(\d+)\}/);
                
                if (frac1 && frac2) {
                    const [_, num1, den1] = frac1;
                    const [__, num2, den2] = frac2;
                    
                    // 計算最小公倍數
                    const lcm = this.lcm(parseInt(den1), parseInt(den2));
                    const factor1 = lcm / parseInt(den1);
                    const factor2 = lcm / parseInt(den2);
                    const newNum1 = parseInt(num1) * factor1;
                    const newNum2 = parseInt(num2) * factor2;
                    
                    steps.push(
                        '1. 通分：找出分母的最小公倍數<br>',
                        `\\[${operation.numbers[0]} ${operation.type === 'add' ? '+' : '-'} ${operation.numbers[1]}\\]`,
                        `\\[= \\frac{${num1} \\times ${factor1}}{${den1} \\times ${factor1}} ${operation.type === 'add' ? '+' : '-'} \\frac{${num2} \\times ${factor2}}{${den2} \\times ${factor2}}\\]`,
                        `\\[= \\frac{${newNum1}}{${lcm}} ${operation.type === 'add' ? '+' : '-'} \\frac{${newNum2}}{${lcm}}\\]`,
                        '2. 進行加減運算<br>',
                        `\\[= \\frac{${operation.type === 'add' ? newNum1 + newNum2 : newNum1 - newNum2}}{${lcm}}\\]`,
                        '3. 化簡結果<br>',
                        `\\[\\text{答案：}${operation.result}\\]`
                    );
                }
                break;
            }
                
            case 'multiply':
                steps.push(
                    '1. 分子相乘<br>',
                    `\\[${operation.numbers[0]} \\times ${operation.numbers[1]}\\]`,
                    '2. 分母相乘<br>',
                    '3. 約分化簡<br>',
                    `\\[\\text{答案：}${operation.result}\\]`
                );
                break;
                
            case 'divide':
                steps.push(
                    '1. 先計算括號內的加法<br>',
                    `\\[${operation.numbers[0]} \\div (${operation.numbers[1]} + ${operation.numbers[2]})\\]`,
                    '2. 除法轉換為乘以倒數<br>',
                    '3. 約分化簡<br>',
                    `\\[\\text{答案：}${operation.result}\\]`
                );
                break;
                
            case 'mixed':
                steps.push(
                    '1. 將帶分數轉換為假分數<br>',
                    `\\[${operation.numbers.join(' ')}\\]`,
                    '2. 按運算順序進行計算<br>',
                    '3. 約分並轉換為帶分數<br>',
                    `\\[\\text{答案：}${operation.result}\\]`
                );
                break;
        }
        
        return steps.join('\n');
    }

    private lcm(a: number, b: number): number {
        return Math.abs(a * b) / this.gcd(a, b);
    }

    private gcd(a: number, b: number): number {
        while (b) {
            [a, b] = [b, a % b];
        }
        return a;
    }

    private getOperatorsFromResult(result: string): string[] {
        // 从结果中提取运算符
        const operators = result.match(/[+\-×÷]/g) || ['+', '+'];
        return operators;
    }
} 