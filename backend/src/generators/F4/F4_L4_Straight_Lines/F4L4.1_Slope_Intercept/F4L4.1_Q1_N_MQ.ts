import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import { getRandomInt, getNonZeroRandomInt, gcd } from '@/utils/mathUtils';

interface Point {
    x: number;
    y: number;
}

interface LineEquation {
    slope: string;     // 斜率，可能是整数或分数
    intercept: string; // y轴截距，可能是整数或分数
    points?: {         // 用于难度5-7
        pointA?: Point;
        pointB?: Point;
    };
}

export default class F4L4_1_Q1_N_MQ extends QuestionGenerator {
    constructor(difficulty: number) {
        super(difficulty, 'F4L4.1_Q1_N_MQ');
    }

    generate(): IGeneratorOutput {
        const equation = this.generateEquation();
        const wrongAnswers = this.generateWrongAnswers(equation);
        const content = this.formatQuestion(equation);
        const explanation = this.generateExplanation(equation);

        return {
            content,
            correctAnswer: this.formatAnswer(equation),
            wrongAnswers,
            explanation,
            type: 'text'
        };
    }

    private generateEquation(): LineEquation {
        switch (this.difficulty) {
            case 1:
            case 2:
            case 3:
                return this.generatePointSlopeEquation();
            case 4:
                return this.generateTwoPointsEquation(false); // 普通斜率
            case 5:
                return this.generateTwoPointsEquation(true);  // 特殊情况（垂直线、水平线）
            default:
                throw new Error(`不支援的難度等級: ${this.difficulty}`);
        }
    }

    private calculateIntercept(point: Point, slope: string): string {
        // 将斜率转换为分数形式（分子/分母）
        let slopeNum: number, slopeDen: number;
        if (slope.includes('\\frac{')) {
            // 处理负号在分数前面的情况
            const isNegative = slope.startsWith('-');
            const matches = slope.match(/\\frac\{(\d+)\}\{(\d+)\}/);
            if (matches) {
                slopeNum = parseInt(matches[1]);
                slopeDen = parseInt(matches[2]);
                if (isNegative) {
                    slopeNum = -slopeNum;
                }
            } else {
                slopeNum = parseInt(slope);
                slopeDen = 1;
            }
        } else {
            slopeNum = parseInt(slope);
            slopeDen = 1;
        }

        // 计算截距：c = y₁ - mx₁
        const numerator = point.y * slopeDen - slopeNum * point.x;
        const denominator = slopeDen;

        return this.formatStandardFraction(numerator, denominator);
    }

    private formatStandardFraction(numerator: number, denominator: number): string {
        // 先约分
        const gcdValue = gcd(Math.abs(numerator), Math.abs(denominator));
        let num = numerator / gcdValue;
        let den = denominator / gcdValue;

        // 确保分母为正
        if (den < 0) {
            num = -num;
            den = -den;
        }

        // 如果分母为1，直接返回分子
        if (den === 1) {
            return num.toString();
        }

        // 不需要在分数前加负号，让调用者处理负号
        return `\\frac{${Math.abs(num)}}{${den}}`;
    }

    private decimalToFraction(decimal: number): string {
        // 将小数转换为分数
        const precision = 10; // 因为我们只处理一位小数
        const numerator = decimal * precision;
        const denominator = precision;
        return this.formatStandardFraction(numerator, denominator);
    }

    private generatePointSlopeEquation(): LineEquation {
        if (this.difficulty === 3) {
            const point = {
                x: getRandomInt(-5, 5),
                y: getRandomInt(-5, 5)
            };
            
            // 生成两位小数的斜率
            const wholeNumber = getNonZeroRandomInt(-5, 5);  // 整数部分
            const decimal1 = getRandomInt(0, 9);  // 第一位小数
            const decimal2 = getRandomInt(0, 9);  // 第二位小数
            const decimalSlope = wholeNumber + decimal1/10 + decimal2/100;
            const slope = decimalSlope.toFixed(2);  // 确保显示两位小数
            
            // 计算截距
            const c = point.y - decimalSlope * point.x;
            const intercept = this.formatStandardFraction(Math.round(c * 100), 100);  // 转换为分数形式

            return {
                points: { pointA: point },
                slope,
                intercept
            };
        }
        let point: Point;
        let slope: string;

        switch (this.difficulty) {
            case 1:
                // 正整数斜率和整数坐标点
                point = {
                    x: getRandomInt(-5, 5),
                    y: getRandomInt(-5, 5)
                };
                slope = getNonZeroRandomInt(1, 5).toString();
                break;
            case 2:
                // 分数斜率（简单分数）和整数坐标点
                point = {
                    x: getRandomInt(-5, 5),
                    y: getRandomInt(-5, 5)
                };
                // 生成简单分数，分母为2,3,4,5
                const den = getNonZeroRandomInt(2, 5);
                const num = getNonZeroRandomInt(-5, 5);
                slope = this.formatStandardFraction(num, den);
                break;
            case 3:
                // 给定点和斜率（分数或一位小数）
                point = {
                    x: getRandomInt(-5, 5),
                    y: getRandomInt(-5, 5)
                };
                if (Math.random() < 0.5) {
                    // 生成一位小数，但在答案中转换为分数
                    const wholeNumber = getNonZeroRandomInt(-5, 5);
                    const decimal = getRandomInt(1, 9);
                    const decimalSlope = wholeNumber + decimal/10;
                    slope = decimalSlope.toString(); // 在题目中显示小数
                } else {
                    // 生成分数
                    const den = getNonZeroRandomInt(2, 5);
                    const num = getNonZeroRandomInt(-5, 5);
                    slope = this.formatStandardFraction(num, den);
                }
                break;
            default:
                throw new Error(`不支援的難度等級: ${this.difficulty}`);
        }

        // 使用新的方法计算截距
        const intercept = this.calculateIntercept(point, slope);

        return {
            slope,
            intercept,
            points: { pointA: point }
        };
    }

    private generateTwoPointsEquation(allowSpecialCases: boolean): LineEquation {
        let pointA: Point, pointB: Point;
        let slope = '0';  // 初始化斜率
        let intercept = '0';  // 初始化截距

        if (allowSpecialCases) {  // 难度5的情况
            // 随机决定是生成垂直线还是水平线
            const isVertical = Math.random() < 0.5;
            
            if (isVertical) {
                // 生成垂直线：两点具有相同的x坐标
                const x = getRandomInt(-5, 5);
                let y1, y2;
                do {
                    y1 = getRandomInt(-5, 5);
                    y2 = getRandomInt(-5, 5);
                } while (y1 === y2);  // 确保y坐标不同
                
                pointA = { x, y: y1 };
                pointB = { x, y: y2 };
                
                return {
                    slope: '不存在',
                    intercept: x.toString(),
                    points: { pointA, pointB }
                };
            } else {
                // 生成水平线：两点具有相同的y坐标
                const y = getRandomInt(-5, 5);
                let x1, x2;
                do {
                    x1 = getRandomInt(-5, 5);
                    x2 = getRandomInt(-5, 5);
                } while (x1 === x2);  // 确保x坐标不同
                
                pointA = { x: x1, y };
                pointB = { x: x2, y };
                
                return {
                    slope: '0',
                    intercept: y.toString(),
                    points: { pointA, pointB }
                };
            }
        } else {  // 难度4的情况
            do {
                // 生成第一个点
                pointA = {
                    x: getRandomInt(-5, 5),
                    y: getRandomInt(-5, 5)
                };

                // 生成第二个点，确保x和y坐标都不相同
                let x2, y2;
                do {
                    x2 = getRandomInt(-5, 5);
                } while (x2 === pointA.x);  // 确保x坐标不同

                do {
                    y2 = getRandomInt(-5, 5);
                } while (y2 === pointA.y);  // 确保y坐标不同

                pointB = { x: x2, y: y2 };

                // 计算斜率
                const dx = pointB.x - pointA.x;
                const dy = pointB.y - pointA.y;

                // 格式化斜率
                slope = this.formatStandardFraction(dy, dx);

                // 如果分母超过5，重新生成点
                const slopeParts = slope.match(/\\frac\{(\d+)\}\{(\d+)\}/);
                if (slopeParts && parseInt(slopeParts[2]) > 5) continue;

                // 计算截距
                intercept = this.calculateIntercept(pointA, slope);

            } while (!this.isValidEquation(slope, intercept));

            return {
                slope,
                intercept,
                points: { pointA, pointB }
            };
        }
    }

    private generateFraction(maxDenominator: number): string {
        const denominator = getNonZeroRandomInt(2, maxDenominator);
        const numerator = getNonZeroRandomInt(-maxDenominator, maxDenominator);
        const gcdValue = gcd(Math.abs(numerator), denominator);

        if (denominator === gcdValue) {
            return (numerator / gcdValue).toString();
        }
        return `\\frac{${numerator / gcdValue}}{${denominator / gcdValue}}`;
    }

    private evaluateFraction(fraction: string): number {
        if (fraction.includes('\\frac{')) {
            const matches = fraction.match(/\\frac\{(-?\d+)\}\{(\d+)\}/);
            if (matches) {
                const [_, num, den] = matches;
                return parseInt(num) / parseInt(den);
            }
        }
        return parseFloat(fraction);
    }

    private formatFraction(value: number): string {
        if (Number.isInteger(value)) {
            // 整数直接返回，不用分数形式
            return value.toString();
        }
        
        const precision = 1000000;
        let numerator = Math.round(value * precision);
        let denominator = precision;
        const gcdValue = gcd(Math.abs(numerator), denominator);
        
        numerator = numerator / gcdValue;
        denominator = denominator / gcdValue;
        
        // 如果分母为1，直接返回分子
        if (denominator === 1) {
            return numerator.toString();
        }
        
        return `\\frac{${numerator}}{${denominator}}`;
    }

    private isValidEquation(slope: string, intercept: string): boolean {
        if (slope === '不存在') return true;  // 垂直线总是有效的
        
        const m = this.evaluateFraction(slope);
        const c = this.evaluateFraction(intercept);

        switch (this.difficulty) {
            case 1:
                return m > 0 && m <= 5 && Number.isInteger(m) && 
                       Number.isInteger(c) && c > 0 && c <= 10;
            case 2:
                return Math.abs(m) <= 5 && 
                       Number.isInteger(c) && Math.abs(c) <= 10;
            case 3:
            case 4:
                return Math.abs(m) <= 5 && Math.abs(c) <= 10;
            case 5:
                return true; // 特殊情况不需要限制
            default:
                return true;
        }
    }

    private formatQuestion(equation: LineEquation): string {
        if (this.difficulty === 3) {
            return `\\[\\text{求通過點 }P(${equation.points?.pointA?.x}, ${equation.points?.pointA?.y})\\text{ 且斜率為 }${equation.slope}\\text{ 的直線方程（斜率截距式）}\\]`;
        } else if (this.difficulty <= 3) {
            return `\\[\\text{求通過點 }P(${equation.points?.pointA?.x}, ${equation.points?.pointA?.y})\\text{ 且斜率為 }${equation.slope}\\text{ 的直線方程（斜率截距式）}\\]`;
        } else if ((this.difficulty === 4 || this.difficulty === 5) && equation.points?.pointA && equation.points?.pointB) {
            return `\\[\\text{求通過以下兩點的直線方程：}A(${equation.points.pointA.x}, ${equation.points.pointA.y}), B(${equation.points.pointB.x}, ${equation.points.pointB.y})\\]`;
        }
        return '';
    }

    private simplifyEquation(equation: string): string {
        // 简化 y = x + -3 形式为 y = x - 3
        return equation.replace(/\+ -/g, '- ');
    }

    private formatAnswer(equation: LineEquation): string {
        if (this.difficulty === 3) {
            // 将斜率转换为分数形式
            const slopeValue = parseFloat(equation.slope);
            const slopeNum = Math.round(Math.abs(slopeValue) * 100);  // 取绝对值并转换为整数
            const slopeDen = 100;
            const slopeFraction = this.formatStandardFraction(slopeNum, slopeDen);
            
            // 构建答案，根据原始斜率的符号决定是否添加负号
            const slopeSign = slopeValue < 0 ? '-' : '';
            
            // 截距已经是分数形式
            const intercept = equation.intercept;
            
            if (intercept === '0') {
                return `y = ${slopeSign}${slopeFraction}x`;
            } else if (intercept.startsWith('-')) {
                return `y = ${slopeSign}${slopeFraction}x - ${intercept.substring(1)}`;
            } else {
                return `y = ${slopeSign}${slopeFraction}x + ${intercept}`;
            }
        }
        let result: string;
        if (equation.slope === '不存在') {
            result = `x = ${equation.intercept}`;
        } else if (this.difficulty === 5 && equation.slope === '0') {
            result = `y = ${equation.intercept}`;
        } else {
            let slope = equation.slope;
            let intercept = equation.intercept;

            // 如果斜率是小数，转换为分数（在难度3时）
            if (this.difficulty === 3) {
                // 将小数斜率转换为分数形式
                slope = this.decimalToFraction(parseFloat(slope));
            }

            // 处理截距为0的情况
            if (intercept === '0') {
                result = `y = ${slope}x`;
            } else if (intercept.startsWith('-')) {
                result = `y = ${slope}x - ${intercept.substring(1)}`;
            } else {
                result = `y = ${slope}x + ${intercept}`;
            }
        }
        return this.simplifyEquation(result);
    }

    private generateWrongAnswers(equation: LineEquation): string[] {
        if (this.difficulty === 3) {
            // 将斜率转换为分数形式
            const slopeValue = parseFloat(equation.slope);
            const slopeNum = Math.round(Math.abs(slopeValue) * 100);  // 取绝对值
            const slopeDen = 100;
            const slopeFraction = this.formatStandardFraction(slopeNum, slopeDen);
            
            // 获取原始斜率的符号
            const slopeSign = slopeValue < 0 ? '-' : '';
            const oppositeSign = slopeValue < 0 ? '' : '-';  // 用于生成相反符号的错误答案
            
            return [
                `y = ${oppositeSign}${slopeFraction}x - ${equation.intercept.substring(1)}`,  // 斜率符号错误
                `y = ${slopeSign}${slopeFraction}x + ${equation.intercept.substring(1)}`,     // 截距符号错误
                `y = ${oppositeSign}${slopeFraction}x + ${equation.intercept.substring(1)}`   // 斜率和截距符号都错误
            ];
        }
        const wrongAnswers: Set<string> = new Set();
        const correctAnswer = this.formatAnswer(equation);

        try {
            if (this.difficulty === 5) {
                if (equation.slope === '不存在') {
                    // 垂直线的错误答案
                    const x = parseInt(equation.intercept);
                    wrongAnswers.add(this.simplifyEquation(`y = ${x}`));  // 混淆 x = a 和 y = x
                    const xValue = x >= 0 ? `- ${x}` : `+ ${-x}`;
                    wrongAnswers.add(this.simplifyEquation(`y = x ${xValue}`));  // 错误理解为斜率为1的直线
                    wrongAnswers.add(this.simplifyEquation(`x = ${x + 1}`));  // x值错误
                } else if (equation.slope === '0') {
                    // 水平线的错误答案
                    const y = parseInt(equation.intercept);
                    wrongAnswers.add(this.simplifyEquation(`x = ${y}`));  // 混淆 y = b 和 x = b
                    wrongAnswers.add(this.simplifyEquation(`y = ${y + 1}`));  // y值错误
                    wrongAnswers.add(this.simplifyEquation(`y = ${y - 1}`));  // y值错误
                }
            } else {
                // 普通情况的错误答案
                // 错误类型1：斜率正负号错误
                const wrongSlope = equation.slope.startsWith('-') ? 
                    equation.slope.substring(1) : 
                    '-' + equation.slope;
                wrongAnswers.add(this.formatAnswer({
                    slope: wrongSlope,
                    intercept: equation.intercept
                }));

                // 错误类型2：截距正负号错误
                const wrongIntercept = equation.intercept.startsWith('-') ?
                    equation.intercept.substring(1) :
                    '-' + equation.intercept;
                wrongAnswers.add(this.formatAnswer({
                    slope: equation.slope,
                    intercept: wrongIntercept
                }));

                // 错误类型3：斜率和截距互换
                wrongAnswers.add(this.formatAnswer({
                    slope: equation.intercept,
                    intercept: equation.slope
                }));

                // 错误类型4：分数未化简（如果是分数）
                if (equation.slope.includes('\\frac{')) {
                    const matches = equation.slope.match(/\\frac\{(-?\d+)\}\{(\d+)\}/);
                    if (matches) {
                        const [_, num, den] = matches;
                        wrongAnswers.add(this.formatAnswer({
                            slope: `\\frac{${parseInt(num) * 2}}{${parseInt(den) * 2}}`,
                            intercept: equation.intercept
                        }));
                    }
                }
            }
        } catch (error) {
            console.error('Error generating wrong answers:', error);
        }

        // 移除无效答案
        wrongAnswers.delete(correctAnswer);
        wrongAnswers.delete('');

        // 如果还没有足够的错误答案，添加一些基本错误
        while (wrongAnswers.size < 3) {
            if (this.difficulty === 5) {
                if (equation.slope === '不存在') {
                    const x = parseInt(equation.intercept);
                    wrongAnswers.add(this.simplifyEquation(`x = ${x + wrongAnswers.size + 1}`));
                } else {
                    const y = parseInt(equation.intercept);
                    wrongAnswers.add(this.simplifyEquation(`y = ${y + wrongAnswers.size + 1}`));
                }
            } else {
                const wrongSlope = (this.evaluateFraction(equation.slope) + 
                                  (wrongAnswers.size + 1)).toString();
                wrongAnswers.add(this.formatAnswer({
                    slope: wrongSlope,
                    intercept: equation.intercept
                }));
            }
        }

        return Array.from(wrongAnswers).slice(0, 3);
    }

    private generateExplanation(equation: LineEquation): string {
        let explanation = '解題步驟：\n';

        if (this.difficulty <= 4) {
            explanation += `\\[1.\\space 方程已經是斜率截距式：y = mx + c\\]
\\[2.\\space 其中：\\]
\\[m = ${equation.slope}（斜率）\\]
\\[c = ${equation.intercept}（y軸截距）\\]`;
        } else if (this.difficulty === 5 && equation.points?.pointA && equation.points?.pointB) {
            const { pointA, pointB } = equation.points;
            const dx = pointB.x - pointA.x;
            const dy = pointB.y - pointA.y;

            if (dx === 0) {
                // 垂直线
                explanation += `\\[1.\\space 觀察兩點坐標：\\]
\\[A(${pointA.x}, ${pointA.y}), B(${pointB.x}, ${pointB.y})\\]
\\[2.\\space 發現兩點的x坐標相同：x = ${pointA.x}\\]
\\[3.\\space 這是一條鉛直線\\]
\\[4.\\space 鉛直線的方程式形式為：x = a\\]`;
            } else if (dy === 0) {
                // 水平线
                explanation += `\\[1.\\space 觀察兩點坐標：\\]
\\[A(${pointA.x}, ${pointA.y}), B(${pointB.x}, ${pointB.y})\\]
\\[2.\\space 發現兩點的y坐標相同：y = ${pointA.y}\\]
\\[3.\\space 這是一條水平線\\]
\\[4.\\space 水平線的方程式形式為：y = b\\]`;
            }
        }

        explanation += `\n\\[因此，直線方程為：${this.formatAnswer(equation)}\\]`;
        return explanation;
    }
} 