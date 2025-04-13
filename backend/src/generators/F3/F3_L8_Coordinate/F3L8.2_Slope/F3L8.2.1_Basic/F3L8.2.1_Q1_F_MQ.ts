import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import { getRandomInt, getRandomDecimal, gcd } from '@/utils/mathUtils';
import { FractionUtils } from '@/utils/FractionUtils';

interface Point {
    x: number;
    y: number;
}

interface SlopeQuestion {
    pointA: Point;
    pointB: Point;
    slope: string;
}

export default class F3L8_2_1_Q1_F_MQ extends QuestionGenerator {
    constructor(difficulty: number) {
        super(difficulty, 'F3L8.2.1_Q1_F_MQ');
    }

    generate(): IGeneratorOutput {
        const question = this.generateQuestion();
        const wrongAnswers = this.generateWrongAnswers(question);
        const content = this.formatQuestion(question);
        const explanation = this.generateExplanation(question);

        return {
            content,
            correctAnswer: question.slope,
            wrongAnswers,
            explanation,
            type: 'text',
            displayOptions: {
                latex: true
            }
        };
    }

    private generatePoint(): Point {
        let x: number, y: number;
        const range = this.getCoordinateRange();
        const decimals = this.getDecimalPlaces();

        switch (this.difficulty) {
            case 1: // 正整数
                x = getRandomInt(0, range);
                y = getRandomInt(0, range);
                break;
            case 2: // 可以包含负整数
                x = getRandomInt(-range, range);
                y = getRandomInt(-range, range);
                break;
            case 3: // 整数
                x = getRandomInt(-range, range);
                y = getRandomInt(-range, range);
                break;
            case 4: // 一位小数
                x = getRandomDecimal(-range, range, 1);
                y = getRandomDecimal(-range, range, 1);
                break;
            case 5: // 两位小数
                x = getRandomDecimal(-range, range, 2);
                y = getRandomDecimal(-range, range, 2);
                break;
            case 6: // 特殊情况
                x = getRandomInt(-range, range);
                y = getRandomInt(-range, range);
                break;
            default:
                x = getRandomInt(-range, range);
                y = getRandomInt(-range, range);
        }

        return { x, y };
    }

    private getCoordinateRange(): number {
        switch (this.difficulty) {
            case 1: return 5;  // 小范围正整数
            case 2: return 5;  // 包含负数
            case 3: return 6;  // 较大范围整数
            case 4: return 5;  // 一位小数
            case 5: return 5;  // 两位小数
            case 6: return 5;  // 特殊情况
            default: return 5;
        }
    }

    private getDecimalPlaces(): number {
        switch (this.difficulty) {
            case 1:
            case 2:
            case 3:
            case 6:
                return 0;
            case 4:
                return 1;
            case 5:
                return 2;
            default:
                return 0;
        }
    }

    private generateQuestion(): SlopeQuestion {
        let pointA: Point, pointB: Point, slope: string;
        
        do {
            if (this.difficulty === 6) {
                // 特殊情况：垂直线、水平线、对角线
                const type = Math.random();
                if (type < 0.33) {
                    // 垂直线
                    pointA = this.generatePoint();
                    pointB = { x: pointA.x, y: pointA.y + getRandomInt(1, 5) };
                } else if (type < 0.66) {
                    // 水平线
                    pointA = this.generatePoint();
                    pointB = { x: pointA.x + getRandomInt(1, 5), y: pointA.y };
                } else {
                    // 对角线（斜率为±1）
                    pointA = this.generatePoint();
                    const step = getRandomInt(1, 5);
                    pointB = { 
                        x: pointA.x + step,
                        y: Math.random() < 0.5 ? pointA.y + step : pointA.y - step
                    };
                }
            } else {
                pointA = this.generatePoint();
                pointB = this.generatePoint();
            }
            
            slope = this.calculateSlope(pointA, pointB);
        } while (!this.isValidSlope(slope));

        return { pointA, pointB, slope };
    }

    private calculateSlope(pointA: Point, pointB: Point): string {
        const dx = pointB.x - pointA.x;
        const dy = pointB.y - pointA.y;
        
        // 处理垂直线
        if (dx === 0) {
            return "不存在";
        }
        
        // 处理水平线
        if (dy === 0) {
            return "$0$";
        }

        // 使用FractionUtils来约分和格式化分数
        const [num, den] = FractionUtils.simplify(dy, dx);
        
        // 如果分母为1，返回整数
        if (den === 1) {
            return `$${num}$`;
        }
        
        // 返回LaTeX分数格式
        return `$${FractionUtils.toLatex(num, den)}$`;
    }

    private formatFraction(num: number, den: number): string {
        // 使用FractionUtils来约分和格式化分数
        const [simplifiedNum, simplifiedDen] = FractionUtils.simplify(num, den);
        
        // 如果分母为1，返回整数
        if (simplifiedDen === 1) {
            return `$${simplifiedNum}$`;
        }
        
        // 返回LaTeX分数格式
        return `$${FractionUtils.toLatex(simplifiedNum, simplifiedDen)}$`;
    }

    private isValidSlope(slope: string): boolean {
        if (slope === "不存在") {
            return this.difficulty === 6;
        }

        // 移除$符号并获取纯数值
        const cleanSlope = slope.replace(/\$/g, '');

        if (cleanSlope === "0") {
            return this.difficulty === 6;
        }

        let value: number;
        if (cleanSlope.includes('\\frac{')) {
            const matches = cleanSlope.match(/\\frac\{(-?\d+)\}\{(\d+)\}/);
            if (matches) {
                const [_, num, den] = matches;
                value = parseInt(num) / parseInt(den);
            } else {
                value = parseFloat(cleanSlope);
            }
        } else {
            value = parseFloat(cleanSlope);
        }

        switch (this.difficulty) {
            case 1:
                return Number.isInteger(value) && value > 0;
            case 2:
                return Number.isInteger(value);
            case 3:
            case 4:
            case 5:
                return true; // 允许分数
            case 6:
                return Math.abs(value) === 1; // 对角线
            default:
                return true;
        }
    }

    private formatPoint(point: Point): string {
        const decimals = this.getDecimalPlaces();
        return `(${point.x.toFixed(decimals)}, ${point.y.toFixed(decimals)})`;
    }

    private formatQuestion(question: SlopeQuestion): string {
        return `求以下兩點所形成直線的斜率：\\[A${this.formatPoint(question.pointA)}, B${this.formatPoint(question.pointB)}\\]`;
    }

    private generateWrongAnswers(question: SlopeQuestion): string[] {
        const wrongAnswers: Set<string> = new Set();
        const { pointA, pointB } = question;
        const dx = pointB.x - pointA.x;
        const dy = pointB.y - pointA.y;

        // 辅助函数：获取答案的数值
        const getNumericValue = (ans: string): number | null => {
            if (ans === "不存在") return null;
            const cleanAns = ans.replace(/\$/g, '');
            if (cleanAns.includes('\\frac{')) {
                const matches = cleanAns.match(/\\frac\{(-?\d+)\}\{(\d+)\}/);
                if (matches) {
                    const [_, num, den] = matches;
                    return parseInt(num) / parseInt(den);
                }
            }
            return parseFloat(cleanAns);
        };

        // 辅助函数：检查答案是否已存在（数值上相等）
        const isAnswerExists = (newAns: string): boolean => {
            const newValue = getNumericValue(newAns);
            if (newValue === null) return false;
            
            // 检查是否与正确答案相等
            const correctValue = getNumericValue(question.slope);
            if (correctValue === newValue) return true;

            // 检查是否与已有的错误答案相等
            for (const existingAns of wrongAnswers) {
                const existingValue = getNumericValue(existingAns);
                if (existingValue === newValue) return true;
            }
            return false;
        };

        try {
            // 1. 分子分母顛倒
            if (dy !== 0) {
                const wrong1 = this.formatFraction(dx, dy);
                if (!isAnswerExists(wrong1)) {
                    wrongAnswers.add(wrong1);
                }
            }

            // 2. y坐标相减顺序错误
            const wrong2 = this.formatFraction(pointA.y - pointB.y, pointB.x - pointA.x);
            if (!isAnswerExists(wrong2)) {
                wrongAnswers.add(wrong2);
            }

            // 3. x坐标相减顺序错误
            if (dx !== 0) {
                const wrong3 = this.formatFraction(dy, -dx);
                if (!isAnswerExists(wrong3)) {
                    wrongAnswers.add(wrong3);
                }
            }

            // 4. 忘记负号
            if (dx !== 0) {
                const wrong4 = this.formatFraction(Math.abs(dy), Math.abs(dx));
                if (!isAnswerExists(wrong4)) {
                    wrongAnswers.add(wrong4);
                }
            }

            // 5. 分数未化简
            const cleanSlope = question.slope.replace(/\$/g, '');
            if (cleanSlope.includes('\\frac{')) {
                const matches = cleanSlope.match(/\\frac\{(-?\d+)\}\{(\d+)\}/);
                if (matches) {
                    const [_, num, den] = matches;
                    const factor = 2;
                    const wrong5 = this.formatFraction(parseInt(num) * factor, parseInt(den) * factor);
                    if (!isAnswerExists(wrong5)) {
                        wrongAnswers.add(wrong5);
                    }
                }
            }

            // 6. 斜率倒数
            if (question.slope !== "不存在" && question.slope !== "$0$") {
                const cleanSlope = question.slope.replace(/\$/g, '');
                if (cleanSlope.includes('\\frac{')) {
                    const matches = cleanSlope.match(/\\frac\{(-?\d+)\}\{(\d+)\}/);
                    if (matches) {
                        const [_, num, den] = matches;
                        const wrong6 = this.formatFraction(parseInt(den), parseInt(num));
                        if (!isAnswerExists(wrong6)) {
                            wrongAnswers.add(wrong6);
                        }
                    }
                } else {
                    const value = parseFloat(cleanSlope);
                    if (value !== 0) {
                        const wrong6 = this.formatFraction(1, value);
                        if (!isAnswerExists(wrong6)) {
                            wrongAnswers.add(wrong6);
                        }
                    }
                }
            }

        } catch (error) {
            console.error('Error generating wrong answer:', error);
        }

        // 如果还是没有足够的错误答案，添加一些基本的错误答案
        const basicWrongAnswers = [
            "不存在",
            "$0$",
            this.formatFraction(2, 1),
            this.formatFraction(-2, 1),
            this.formatFraction(1, 2),
            this.formatFraction(-1, 2),
            this.formatFraction(-1, 1),
            this.formatFraction(3, 1),
            this.formatFraction(-3, 1)
        ];

        for (const ans of basicWrongAnswers) {
            if (wrongAnswers.size >= 3) break;
            if (!isAnswerExists(ans)) {
                wrongAnswers.add(ans);
            }
        }

        return Array.from(wrongAnswers).slice(0, 3);
    }

    private generateExplanation(question: SlopeQuestion): string {
        const { pointA, pointB } = question;
        const dx = pointB.x - pointA.x;
        const dy = pointB.y - pointA.y;

        let explanation = `解題步驟：
\\[1.\\space 使用斜率公式：m = \\frac{y_2-y_1}{x_2-x_1}\\]

\\[2.\\space 代入座標：\\]
\\[x_2-x_1 = ${pointB.x.toFixed(this.getDecimalPlaces())} - ${pointA.x.toFixed(this.getDecimalPlaces())} = ${dx.toFixed(this.getDecimalPlaces())}\\]
\\[y_2-y_1 = ${pointB.y.toFixed(this.getDecimalPlaces())} - ${pointA.y.toFixed(this.getDecimalPlaces())} = ${dy.toFixed(this.getDecimalPlaces())}\\]`;

        if (dx === 0) {
            explanation += `
\\[3.\\space 因為分母為0（x_2-x_1 = 0），表示為鉛直線\\]
\\[4.\\space 鉛直線的斜率不存在\\]

因此，此直線的斜率不存在。`;
        } else {
            explanation += `
\\[3.\\space 計算斜率：\\]
\\[m = \\frac{y_2-y_1}{x_2-x_1} = \\frac{${dy.toFixed(this.getDecimalPlaces())}}{${dx.toFixed(this.getDecimalPlaces())}}\\]`;

            if (question.slope.includes('\\frac{')) {
                explanation += `
\\[4.\\space 化簡分數：${question.slope}\\]`;
            } else {
                explanation += `
\\[4.\\space 計算結果：${question.slope}\\]`;
            }

            explanation += `

因此，此直線的斜率為 ${question.slope}。`;
        }

        return explanation;
    }
}