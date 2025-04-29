import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import { getRandomInt, getNonZeroRandomInt } from '@/utils/mathUtils';
import { FractionUtils } from '@/utils/FractionUtils';

// 定义分数数据结构
interface Fraction {
    numerator: number;   // 分子
    denominator: number; // 分母
}

// 定义混合运算数据结构
interface FractionOperation {
    expression: string;    // 表达式字符串
    answer: Fraction;      // 答案（分数形式）
    formattedAnswer: string; // 格式化后的答案
}

export default class F1L0_1_3_Q1_F_MQ extends QuestionGenerator {
    private readonly CONSTANTS = {
        // 级别1：分母为固定组合
        LEVEL1_DENOMINATORS: [2, 3, 4, 5, 6, 8, 9, 12, 15, 16],
        // 级别2：分母范围较大
        LEVEL2_DENOMINATORS_RANGE: [2, 25],
        // 级别3：整数部分和分母范围
        LEVEL3_INTEGER_RANGE: [1, 10],
        LEVEL3_DENOMINATOR_RANGE: [2, 21],
        // 级别4：帶分数运算
        LEVEL4_INTEGER_RANGE: [1, 12],
        LEVEL4_DENOMINATOR_RANGE: [2, 12],
        // 级别5：分数乘法
        LEVEL5_FRACTION_RANGE: [1, 36],
        // 级别6：分数除法
        LEVEL6_FRACTION_RANGE: [1, 30],
        // 级别7：混合运算
        LEVEL7_FRACTION_RANGE: [1, 35]
    };

    constructor(difficulty: number = 1) {
        super(difficulty, 'F1L0.1.3_Q1_F_MQ');
    }

    generate(): IGeneratorOutput {
        // 根据难度生成不同类型的题目
        const questionData = this.generateQuestionByDifficulty();
        
        // 构建问题文本
        const questionText = `\\[${questionData.expression} = \\text{?}\\]`;
        
        // 正确答案
        const correctAnswer = this.wrapWithLatex(questionData.formattedAnswer);
        
        // 生成错误答案
        const wrongAnswers = this.generateWrongAnswers(questionData.answer)
            .map(answer => this.wrapWithLatex(answer));
        
        // 随机打乱答案选项顺序
        const allAnswers = [...wrongAnswers, correctAnswer];
        const shuffledAnswers = this.shuffleArray(allAnswers);
        
        // 找出正确答案的位置
        const correctAnswerIndex = shuffledAnswers.findIndex(
            ans => ans === correctAnswer
        );

        // 生成解释
        const explanation = this.generateExplanation(questionData);

        return {
            content: questionText,
            correctAnswer: shuffledAnswers[correctAnswerIndex],
            wrongAnswers: shuffledAnswers.filter((_, index) => index !== correctAnswerIndex),
            explanation: explanation,
            type: 'text',
            displayOptions: {
                latex: true
            }
        };
    }

    // 根据难度生成相应的问题
    private generateQuestionByDifficulty(): FractionOperation {
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
            case 6:
                return this.generateLevel6();
            case 7:
                return this.generateLevel7();
            default:
                return this.generateLevel1();
        }
    }

    // 工具方法：将内容包装为 LaTeX 格式
    private wrapWithLatex(content: string): string {
        return `\\(${content}\\)`;
    }

    // 生成真分数
    private generateProperFraction(minDenominator: number, maxDenominator: number): Fraction {
        const denominator = getNonZeroRandomInt(minDenominator, maxDenominator);
        const numerator = getNonZeroRandomInt(1, denominator - 1);
        return { numerator, denominator };
    }

    // 生成假分数
    private generateImproperFraction(minDenominator: number, maxDenominator: number): Fraction {
        const denominator = getNonZeroRandomInt(minDenominator, maxDenominator);
        const numerator = getNonZeroRandomInt(denominator, denominator * 2);
        return { numerator, denominator };
    }

    // 生成带分数
    private generateMixedNumber(minWhole: number, maxWhole: number, 
                              minDenominator: number, maxDenominator: number): Fraction {
        const whole = getNonZeroRandomInt(minWhole, maxWhole);
        const fraction = this.generateProperFraction(minDenominator, maxDenominator);
        
        // 将带分数转换为假分数
        return {
            numerator: whole * fraction.denominator + fraction.numerator,
            denominator: fraction.denominator
        };
    }

    // 工具方法：格式化分数
    private formatFraction(fraction: Fraction): string {
        const { numerator, denominator } = fraction;
        
        // 首先约分
        const [simplifiedNum, simplifiedDen] = this.simplifyFraction(numerator, denominator);
        
        // 如果分母为1，直接返回整数
        if (simplifiedDen === 1) {
            return `${simplifiedNum}`;
        }
        
        // 如果是假分数，转换为带分数
        if (simplifiedNum > simplifiedDen) {
            const wholePart = Math.floor(simplifiedNum / simplifiedDen);
            const remainder = simplifiedNum % simplifiedDen;
            
            // 如果余数为0，直接返回整数部分
            if (remainder === 0) {
                return `${wholePart}`;
            }
            
            // 否则返回带分数
            return `${wholePart}\\frac{${remainder}}{${simplifiedDen}}`;
        }
        
        // 真分数直接返回
        return `\\frac{${simplifiedNum}}{${simplifiedDen}}`;
    }
    
    // 工具方法：约分分数
    private simplifyFraction(numerator: number, denominator: number): [number, number] {
        // 使用FractionUtils进行约分
        return FractionUtils.simplify(numerator, denominator);
    }
    
    // 工具方法：求最大公约数(GCD)
    private gcd(a: number, b: number): number {
        return b === 0 ? Math.abs(a) : this.gcd(b, a % b);
    }
    
    // 工具方法：求最小公倍数(LCM)
    private lcm(a: number, b: number): number {
        return Math.abs(a * b) / this.gcd(a, b);
    }
    
    // 工具方法：打乱数组
    private shuffleArray<T>(array: T[]): T[] {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }
    
    // 难度1：分数加减（需通分）
    private generateLevel1(): FractionOperation {
        // 使用固定分母组合
        const denominatorList = this.CONSTANTS.LEVEL1_DENOMINATORS;
        
        // 随机选择两个不同的分母
        let den1Index = getRandomInt(0, denominatorList.length - 1);
        let den2Index;
        do {
            den2Index = getRandomInt(0, denominatorList.length - 1);
        } while (den1Index === den2Index);
        
        const den1 = denominatorList[den1Index];
        const den2 = denominatorList[den2Index];
        
        // 生成分子（确保小于分母）
        const num1 = getNonZeroRandomInt(1, den1 - 1);
        const num2 = getNonZeroRandomInt(1, den2 - 1);
        
        // 随机决定是加法还是减法
        const isAddition = Math.random() < 0.5;
        
        // 如果是减法，确保结果为正数
        let fraction1: Fraction = { numerator: num1, denominator: den1 };
        let fraction2: Fraction = { numerator: num2, denominator: den2 };
        
        if (!isAddition) {
            // 计算两个分数的值以确保结果为正
            const value1 = num1 / den1;
            const value2 = num2 / den2;
            
            // 如果第一个分数小于第二个，交换它们
            if (value1 < value2) {
                [fraction1, fraction2] = [fraction2, fraction1];
            }
        }
        
        // 创建表达式
        const operator = isAddition ? '+' : '-';
        const expression = `\\frac{${fraction1.numerator}}{${fraction1.denominator}} ${operator} \\frac{${fraction2.numerator}}{${fraction2.denominator}}`;
        
        // 计算答案
        let answer: Fraction;
        
        // 首先通分
        const lcmValue = this.lcm(fraction1.denominator, fraction2.denominator);
        const newNum1 = fraction1.numerator * (lcmValue / fraction1.denominator);
        const newNum2 = fraction2.numerator * (lcmValue / fraction2.denominator);
        
        // 然后进行加减运算
        if (isAddition) {
            answer = { numerator: newNum1 + newNum2, denominator: lcmValue };
        } else {
            answer = { numerator: newNum1 - newNum2, denominator: lcmValue };
        }
        
        // 格式化答案
        const formattedAnswer = this.formatFraction(answer);
        
        return {
            expression,
            answer,
            formattedAnswer
        };
    }

    // 难度2：基础分数加减
    private generateLevel2(): FractionOperation {
        // 分母范围较大 (2-25)
        const minDenominator = this.CONSTANTS.LEVEL2_DENOMINATORS_RANGE[0];
        const maxDenominator = this.CONSTANTS.LEVEL2_DENOMINATORS_RANGE[1];
        
        // 生成两个真分数
        let fraction1 = this.generateProperFraction(minDenominator, maxDenominator);
        let fraction2 = this.generateProperFraction(minDenominator, maxDenominator);
        
        // 随机决定是加法还是减法
        const isAddition = Math.random() < 0.5;
        
        // 如果是减法，确保结果为正数
        if (!isAddition) {
            // 计算两个分数的值以确保结果为正
            const value1 = fraction1.numerator / fraction1.denominator;
            const value2 = fraction2.numerator / fraction2.denominator;
            
            // 如果第一个分数小于第二个，交换它们
            if (value1 < value2) {
                [fraction1, fraction2] = [fraction2, fraction1];
            }
        }
        
        // 创建表达式
        const operator = isAddition ? '+' : '-';
        const expression = `\\frac{${fraction1.numerator}}{${fraction1.denominator}} ${operator} \\frac{${fraction2.numerator}}{${fraction2.denominator}}`;
        
        // 计算答案
        let answer: Fraction;
        
        // 首先通分
        const lcmValue = this.lcm(fraction1.denominator, fraction2.denominator);
        const newNum1 = fraction1.numerator * (lcmValue / fraction1.denominator);
        const newNum2 = fraction2.numerator * (lcmValue / fraction2.denominator);
        
        // 然后进行加减运算
        if (isAddition) {
            answer = { numerator: newNum1 + newNum2, denominator: lcmValue };
        } else {
            answer = { numerator: newNum1 - newNum2, denominator: lcmValue };
        }
        
        // 格式化答案
        const formattedAnswer = this.formatFraction(answer);
        
        return {
            expression,
            answer,
            formattedAnswer
        };
    }
    
    // 难度3：分数与整数混合运算
    private generateLevel3(): FractionOperation {
        // 整数范围 (1-10)，分母范围 (2-21)
        const minInt = this.CONSTANTS.LEVEL3_INTEGER_RANGE[0];
        const maxInt = this.CONSTANTS.LEVEL3_INTEGER_RANGE[1];
        const minDen = this.CONSTANTS.LEVEL3_DENOMINATOR_RANGE[0];
        const maxDen = this.CONSTANTS.LEVEL3_DENOMINATOR_RANGE[1];
        
        // 生成一个整数和两个分数
        const integer = getNonZeroRandomInt(minInt, maxInt);
        const fraction1 = this.generateProperFraction(minDen, maxDen);
        const fraction2 = this.generateProperFraction(minDen, maxDen);
        
        // 随机生成运算符
        const operators = ['+', '-'];
        const op1 = operators[getRandomInt(0, 1)];
        const op2 = operators[getRandomInt(0, 1)];
        
        // 创建表达式
        const expression = `${integer} ${op1} \\frac{${fraction1.numerator}}{${fraction1.denominator}} ${op2} \\frac{${fraction2.numerator}}{${fraction2.denominator}}`;
        
        // 计算答案（将整数转为分数）
        const intFraction: Fraction = { numerator: integer, denominator: 1 };
        
        // 按照运算顺序计算
        let result: Fraction;
        
        // 第一步：计算第一个操作 (整数 op1 fraction1)
        if (op1 === '+') {
            result = this.addFractions(intFraction, fraction1);
        } else {
            result = this.subtractFractions(intFraction, fraction1);
        }
        
        // 第二步：继续计算 (result op2 fraction2)
        if (op2 === '+') {
            result = this.addFractions(result, fraction2);
        } else {
            result = this.subtractFractions(result, fraction2);
        }
        
        // 格式化答案
        const formattedAnswer = this.formatFraction(result);
        
        return {
            expression,
            answer: result,
            formattedAnswer
        };
    }
    
    // 难度4：带分数运算
    private generateLevel4(): FractionOperation {
        // 整数范围 (1-12)，分母范围 (2-12)
        const minInt = this.CONSTANTS.LEVEL4_INTEGER_RANGE[0];
        const maxInt = this.CONSTANTS.LEVEL4_INTEGER_RANGE[1];
        const minDen = this.CONSTANTS.LEVEL4_DENOMINATOR_RANGE[0];
        const maxDen = this.CONSTANTS.LEVEL4_DENOMINATOR_RANGE[1];
        
        // 生成三个带分数（转换为假分数）
        const mixed1 = this.generateMixedNumber(minInt, maxInt, minDen, maxDen);
        const mixed2 = this.generateMixedNumber(minInt, maxInt, minDen, maxDen);
        const mixed3 = this.generateMixedNumber(minInt, maxInt, minDen, maxDen);
        
        // 格式化带分数用于显示
        const mixedStr1 = this.formatFraction(mixed1);
        const mixedStr2 = this.formatFraction(mixed2);
        const mixedStr3 = this.formatFraction(mixed3);
        
        // 随机生成运算符
        const operators = ['+', '-'];
        const op1 = operators[getRandomInt(0, 1)];
        const op2 = operators[getRandomInt(0, 1)];
        
        // 创建表达式
        const expression = `${mixedStr1} ${op1} ${mixedStr2} ${op2} ${mixedStr3}`;
        
        // 按照运算顺序计算
        let result: Fraction;
        
        // 第一步：计算前两个带分数
        if (op1 === '+') {
            result = this.addFractions(mixed1, mixed2);
        } else {
            result = this.subtractFractions(mixed1, mixed2);
        }
        
        // 第二步：继续计算结果与第三个带分数
        if (op2 === '+') {
            result = this.addFractions(result, mixed3);
        } else {
            result = this.subtractFractions(result, mixed3);
        }
        
        // 格式化答案
        const formattedAnswer = this.formatFraction(result);
        
        return {
            expression,
            answer: result,
            formattedAnswer
        };
    }
    
    // 难度5：分数乘法
    private generateLevel5(): FractionOperation {
        // 分数范围 (1-36)
        const minVal = 1;
        const maxVal = this.CONSTANTS.LEVEL5_FRACTION_RANGE[1];
        
        // 生成两个分数（可以是真分数或假分数）
        const fraction1: Fraction = {
            numerator: getNonZeroRandomInt(minVal, maxVal),
            denominator: getNonZeroRandomInt(minVal + 1, maxVal)
        };
        
        const fraction2: Fraction = {
            numerator: getNonZeroRandomInt(minVal, maxVal),
            denominator: getNonZeroRandomInt(minVal + 1, maxVal)
        };
        
        // 创建表达式
        const expression = `\\frac{${fraction1.numerator}}{${fraction1.denominator}} \\times \\frac{${fraction2.numerator}}{${fraction2.denominator}}`;
        
        // 计算乘法结果
        const answer: Fraction = {
            numerator: fraction1.numerator * fraction2.numerator,
            denominator: fraction1.denominator * fraction2.denominator
        };
        
        // 格式化答案
        const formattedAnswer = this.formatFraction(answer);
        
        return {
            expression,
            answer,
            formattedAnswer
        };
    }
    
    // 难度6：分数除法
    private generateLevel6(): FractionOperation {
        // 分数范围 (1-30)
        const minVal = 1;
        const maxVal = this.CONSTANTS.LEVEL6_FRACTION_RANGE[1];
        
        // 生成一个分数和两个带分数（用于构建除法表达式）
        const fraction: Fraction = {
            numerator: getNonZeroRandomInt(minVal, maxVal),
            denominator: getNonZeroRandomInt(minVal + 1, maxVal)
        };
        
        const mixedNum1 = this.generateMixedNumber(1, 3, 2, 15);
        const mixedNum2 = this.generateMixedNumber(1, 3, 2, 15);
        
        // 格式化显示
        const fractionStr = `\\frac{${fraction.numerator}}{${fraction.denominator}}`;
        const mixedStr1 = this.formatFraction(mixedNum1);
        const mixedStr2 = this.formatFraction(mixedNum2);
        
        // 创建表达式
        const expression = `${fractionStr} \\div (${mixedStr1} + ${mixedStr2})`;
        
        // 计算答案
        // 首先计算括号内的加法
        const sumResult = this.addFractions(mixedNum1, mixedNum2);
        
        // 然后进行除法运算
        const answer = this.divideFractions(fraction, sumResult);
        
        // 格式化答案
        const formattedAnswer = this.formatFraction(answer);
        
        return {
            expression,
            answer,
            formattedAnswer
        };
    }
    
    // 难度7：混合运算
    private generateLevel7(): FractionOperation {
        // 分数范围 (1-35)
        const minVal = 1;
        const maxVal = this.CONSTANTS.LEVEL7_FRACTION_RANGE[1];
        
        // 生成三个带分数用于混合运算
        const mixed1 = this.generateMixedNumber(1, 2, 2, 28);
        const mixed2 = this.generateMixedNumber(1, 2, 2, 35);
        const mixed3 = this.generateMixedNumber(2, 3, 2, 13);
        
        // 格式化带分数用于显示
        const mixedStr1 = this.formatFraction(mixed1);
        const mixedStr2 = this.formatFraction(mixed2);
        const mixedStr3 = this.formatFraction(mixed3);
        
        // 创建带有加法和乘法的混合表达式
        const expression = `${mixedStr1} + ${mixedStr2} \\times ${mixedStr3}`;
        
        // 计算答案（乘法优先）
        // 首先计算乘法部分
        const mulResult = this.multiplyFractions(mixed2, mixed3);
        
        // 然后进行加法运算
        const answer = this.addFractions(mixed1, mulResult);
        
        // 格式化答案
        const formattedAnswer = this.formatFraction(answer);
        
        return {
            expression,
            answer,
            formattedAnswer
        };
    }
    
    // 分数加法
    private addFractions(a: Fraction, b: Fraction): Fraction {
        // 首先求最小公倍数
        const lcmValue = this.lcm(a.denominator, b.denominator);
        
        // 通分
        const newNumA = a.numerator * (lcmValue / a.denominator);
        const newNumB = b.numerator * (lcmValue / b.denominator);
        
        // 相加
        const sumNumerator = newNumA + newNumB;
        
        // 返回结果（不约分，由调用者决定是否需要约分）
        return { numerator: sumNumerator, denominator: lcmValue };
    }
    
    // 分数减法
    private subtractFractions(a: Fraction, b: Fraction): Fraction {
        // 首先求最小公倍数
        const lcmValue = this.lcm(a.denominator, b.denominator);
        
        // 通分
        const newNumA = a.numerator * (lcmValue / a.denominator);
        const newNumB = b.numerator * (lcmValue / b.denominator);
        
        // 相减
        const diffNumerator = newNumA - newNumB;
        
        // 返回结果（不约分，由调用者决定是否需要约分）
        return { numerator: diffNumerator, denominator: lcmValue };
    }
    
    // 分数乘法
    private multiplyFractions(a: Fraction, b: Fraction): Fraction {
        // 分子相乘，分母相乘
        const numerator = a.numerator * b.numerator;
        const denominator = a.denominator * b.denominator;
        
        // 返回结果（不约分，由调用者决定是否需要约分）
        return { numerator, denominator };
    }
    
    // 分数除法
    private divideFractions(a: Fraction, b: Fraction): Fraction {
        // 除法转换为乘以倒数：a÷b = a×(1/b)
        const numerator = a.numerator * b.denominator;
        const denominator = a.denominator * b.numerator;
        
        // 返回结果（不约分，由调用者决定是否需要约分）
        return { numerator, denominator };
    }
    
    // 生成错误答案
    private generateWrongAnswers(correctAnswer: Fraction): string[] {
        const wrongAnswers: string[] = [];
        
        // 生成三个不同的错误答案
        while (wrongAnswers.length < 3) {
            // 使用不同策略生成错误答案
            const wrongAnswer = this.generateSingleWrongAnswer(correctAnswer);
            const formattedWrong = this.formatFraction(wrongAnswer);
            
            // 确保错误答案与正确答案不同，且不与已有的错误答案重复
            const correctFormatted = this.formatFraction(correctAnswer);
            if (formattedWrong !== correctFormatted && !wrongAnswers.includes(formattedWrong)) {
                wrongAnswers.push(formattedWrong);
            }
        }
        
        return wrongAnswers;
    }
    
    // 生成单个错误答案的策略
    private generateSingleWrongAnswer(correctAnswer: Fraction): Fraction {
        // 约分正确答案，以便生成错误答案
        const [num, den] = this.simplifyFraction(correctAnswer.numerator, correctAnswer.denominator);
        
        // 不同策略生成错误答案
        const strategies = [
            // 策略1：分子加减一个小值
            (): Fraction => {
                const offset = getNonZeroRandomInt(-3, 3);
                return { numerator: num + offset, denominator: den };
            },
            // 策略2：分母加减一个小值
            (): Fraction => {
                const offset = getNonZeroRandomInt(1, 3);
                const newDen = Math.max(2, den + offset); // 确保分母至少为2
                return { numerator: num, denominator: newDen };
            },
            // 策略3：分子分母颠倒（如果可能的话）
            (): Fraction => {
                if (num > 1 && den > num) {
                    return { numerator: den, denominator: num };
                }
                // 如果无法颠倒，使用策略1
                const offset = getNonZeroRandomInt(-2, 2);
                return { numerator: num + offset, denominator: den };
            },
            // 策略4：通分错误
            (): Fraction => {
                if (den !== 1) {
                    const wrongNum = num + getNonZeroRandomInt(-2, 2);
                    return { numerator: wrongNum, denominator: den };
                }
                // 如果分母为1，使用策略2
                return { numerator: num, denominator: den + getNonZeroRandomInt(1, 3) };
            }
        ];
        
        // 随机选择一种策略
        const strategy = strategies[getRandomInt(0, strategies.length - 1)];
        return strategy();
    }
    
    // 生成解释
    private generateExplanation(questionData: FractionOperation): string {
        const { expression, answer, formattedAnswer } = questionData;
        
        // 提取表达式中的操作符
        const hasAddition = expression.includes('+');
        const hasSubtraction = expression.includes('-');
        const hasMultiplication = expression.includes('\\times');
        const hasDivision = expression.includes('\\div');
        const hasBrackets = expression.includes('(') && expression.includes(')');
        
        let explanation = `解題步驟：\n\n`;
        
        // 根据不同的运算类型生成不同的解释
        if (this.difficulty <= 2) {
            // 难度1-2：基础分数加减
            explanation += this.generateAddSubtractExplanation(expression, answer);
        } else if (this.difficulty === 3) {
            // 难度3：整数与分数混合
            explanation += this.generateMixedWithIntegerExplanation(expression, answer);
        } else if (this.difficulty === 4) {
            // 难度4：带分数运算
            explanation += this.generateMixedNumberExplanation(expression, answer);
        } else if (this.difficulty === 5) {
            // 难度5：分数乘法
            explanation += this.generateMultiplicationExplanation(expression, answer);
        } else if (this.difficulty === 6) {
            // 难度6：分数除法
            explanation += this.generateDivisionExplanation(expression, answer);
        } else {
            // 难度7：混合运算
            explanation += this.generateMixedOperationExplanation(expression, answer);
        }
        
        // 添加最终答案
        explanation += `\n\n因此，\n\\[${expression} = ${formattedAnswer}\\]`;
        
        return explanation;
    }
    
    // 生成加减法解释
    private generateAddSubtractExplanation(expression: string, answer: Fraction): string {
        // 简化版解释
        return `1) 先通分，找出分母的最小公倍數\n\\[${expression}\\]\n\n2) 分子進行加減運算\n\n3) 約分结果\n\\[= ${this.formatFraction(answer)}\\]`;
    }
    
    // 生成整数与分数混合运算解释
    private generateMixedWithIntegerExplanation(expression: string, answer: Fraction): string {
        return `1) 將整數轉換為分數\n\\[${expression}\\]\n\n2) 按照運算順序進行計算\n\n3) 約分結果\n\\[= ${this.formatFraction(answer)}\\]`;
    }
    
    // 生成带分数运算解释
    private generateMixedNumberExplanation(expression: string, answer: Fraction): string {
        return `1) 將帶分數轉換為假分數\n\\[${expression}\\]\n\n2) 按照運算順序進行計算\n\n3) 約分并轉換回帶分數\n\\[= ${this.formatFraction(answer)}\\]`;
    }
    
    // 生成乘法解释
    private generateMultiplicationExplanation(expression: string, answer: Fraction): string {
        return `1) 分子相乘\n\\[${expression}\\]\n\n2) 分母相乘\n\n3) 約分結果\n\\[= ${this.formatFraction(answer)}\\]`;
    }
    
    // 生成除法解释
    private generateDivisionExplanation(expression: string, answer: Fraction): string {
        return `1) 先計算括號內的加法\n\\[${expression}\\]\n\n2) 除法轉換為乘以倒數\n\n3) 約分結果\n\\[= ${this.formatFraction(answer)}\\]`;
    }
    
    // 生成混合运算解释
    private generateMixedOperationExplanation(expression: string, answer: Fraction): string {
        return `1) 將帶分數轉換為假分數\n\\[${expression}\\]\n\n2) 先進行乘法運算\n\n3) 再進行加法運算\n\n4) 約分并轉換回帶分數\n\\[= ${this.formatFraction(answer)}\\]`;
    }
} 