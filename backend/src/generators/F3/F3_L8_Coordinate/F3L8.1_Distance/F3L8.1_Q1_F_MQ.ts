import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import { getRandomInt, getRandomDecimal, roundTo } from '@/utils/mathUtils';

interface Point {
    x: number;
    y: number;
}

interface CoordinateQuestion {
    pointA: Point;
    pointB: Point;
    distance: number;
}

export default class F3L8_1_Q1_F_MQ extends QuestionGenerator {
    constructor(difficulty: number) {
        super(difficulty, 'F3L8.1_Q1_F_MQ');
    }

    generate(): IGeneratorOutput {
        const question = this.generateQuestion();
        const content = this.formatQuestion(question);
        const correctAnswer = this.formatAnswer(question.distance, question);
        
        // 计算基本值
        const dx = question.pointB.x - question.pointA.x;
        const dy = question.pointB.y - question.pointA.y;
        const dxSquared = roundTo(dx * dx, 2);
        const dySquared = roundTo(dy * dy, 2);
        const sumSquared = roundTo(dx * dx + dy * dy, 2);

        // 创建一个Set来存储唯一的错误答案
        const wrongAnswerSet = new Set<string>();

        if (this.difficulty === 1) {
            // 预设一些简单的错误答案（都是平方根或整数形式）
            const simpleWrongAnswers = [
                // 常见的平方根值
                `$\\sqrt{2}$`,
                `$\\sqrt{3}$`,
                `$\\sqrt{5}$`,
                `$\\sqrt{8}$`,
                // 简单整数
                `$1$`,
                `$2$`,
                `$3$`
            ];

            // 过滤掉正确答案
            for (const ans of simpleWrongAnswers) {
                const cleanAns = ans.replace(/[\$\\sqrt{}]/g, '');
                const cleanCorrect = correctAnswer.replace(/[\$\\sqrt{}]/g, '');
                if (cleanAns !== cleanCorrect && !wrongAnswerSet.has(ans)) {
                    wrongAnswerSet.add(ans);
                }
                if (wrongAnswerSet.size >= 3) break;
            }

            // 如果错误答案不够3个，添加更多平方根形式的答案
            const extraSquareRoots = [4, 6, 7, 9, 10];
            let i = 0;
            while (wrongAnswerSet.size < 3 && i < extraSquareRoots.length) {
                const newAns = `$\\sqrt{${extraSquareRoots[i]}}$`;
                const cleanAns = newAns.replace(/[\$\\sqrt{}]/g, '');
                const cleanCorrect = correctAnswer.replace(/[\$\\sqrt{}]/g, '');
                if (cleanAns !== cleanCorrect) {
                    wrongAnswerSet.add(newAns);
                }
                i++;
            }

            // 如果还是不够，添加更多整数
            let integer = 1;
            while (wrongAnswerSet.size < 3) {
                const newAns = `$${integer}$`;
                const cleanAns = newAns.replace(/[\$\\sqrt{}]/g, '');
                const cleanCorrect = correctAnswer.replace(/[\$\\sqrt{}]/g, '');
                if (cleanAns !== cleanCorrect) {
                    wrongAnswerSet.add(newAns);
                }
                integer++;
            }
        } else if (this.difficulty === 2) {
            // 难度2的错误答案生成逻辑
            const possibleWrongAnswers = [
                // 忘记开根号
                `$${sumSquared}$`,
                // 直接相加绝对值
                `$${Math.abs(dx) + Math.abs(dy)}$`,
                // x方向距离
                `$${Math.abs(dx)}$`,
                // y方向距离
                `$${Math.abs(dy)}$`,
                // x和y的最大值
                `$${Math.max(Math.abs(dx), Math.abs(dy))}$`,
                // 只计算x方向的平方
                `$${Math.abs(dx * dx)}$`,
                // 只计算y方向的平方
                `$${Math.abs(dy * dy)}$`
            ];

            // 过滤并添加错误答案
            for (const ans of possibleWrongAnswers) {
                const cleanAns = ans.replace(/[\$\\sqrt{}]/g, '');
                const cleanCorrect = correctAnswer.replace(/[\$\\sqrt{}]/g, '');
                if (cleanAns !== cleanCorrect && !wrongAnswerSet.has(ans)) {
                    wrongAnswerSet.add(ans);
                }
                if (wrongAnswerSet.size >= 3) break;
            }

            // 如果错误答案不够3个，添加一些变体
            const baseValue = Math.sqrt(sumSquared);
            const variations = [
                Math.floor(baseValue),
                Math.ceil(baseValue),
                Math.round(baseValue * 2),
                Math.round(baseValue / 2)
            ];

            for (const variation of variations) {
                if (variation > 0 && variation !== baseValue) {
                    const newAns = `$${variation}$`;
                    if (!wrongAnswerSet.has(newAns)) {
                        wrongAnswerSet.add(newAns);
                    }
                    if (wrongAnswerSet.size >= 3) break;
                }
            }
        } else {
            // 难度3的错误答案生成逻辑
            const possibleValues = [
                sumSquared,                    // 忘记开根号
                Math.abs(dx) + Math.abs(dy),   // 直接相加
                dxSquared,                     // 只考虑x方向的平方
                dySquared,                     // 只考虑y方向的平方
                Math.round(sumSquared/2),      // 一半的平方和
                Math.round(sumSquared*2),      // 两倍的平方和
                Math.pow(Math.abs(dx), 2),     // x方向距离的平方
                Math.pow(Math.abs(dy), 2),     // y方向距离的平方
                9,                             // 一些常见的完全平方数
                16,
                25,
                36
            ];

            // 过滤并添加错误答案
            for (const value of possibleValues) {
                const ans = this.simplifyAnswer(value);
                const cleanAns = ans.replace(/[\$\\sqrt{}]/g, '');
                const cleanCorrect = correctAnswer.replace(/[\$\\sqrt{}]/g, '');
                
                if (cleanAns !== cleanCorrect && !wrongAnswerSet.has(ans)) {
                    wrongAnswerSet.add(ans);
                }
                if (wrongAnswerSet.size >= 3) break;
            }

            // 如果错误答案不够3个，添加一些变体
            const baseValue = Math.round(Math.sqrt(sumSquared));
            while (wrongAnswerSet.size < 3) {
                const variation = baseValue + wrongAnswerSet.size;
                const newValue = variation * variation + 1;  // 确保不是完全平方数
                const newAns = `$\\sqrt{${newValue}}$`;
                if (!wrongAnswerSet.has(newAns)) {
                    wrongAnswerSet.add(newAns);
                }
            }
        }

        // 确保至少有3个错误答案
        const wrongAnswers = Array.from(wrongAnswerSet).slice(0, 3);
        while (wrongAnswers.length < 3) {
            const newValue = wrongAnswers.length + 1;
            const newAns = `$${newValue}$`;
            if (!wrongAnswers.includes(newAns)) {
                wrongAnswers.push(newAns);
            }
        }

        return {
            content,
            correctAnswer: `$${correctAnswer}$`,
            wrongAnswers,
            explanation: this.generateExplanation(question),
            type: 'text',
            displayOptions: {
                latex: true
            }
        };
    }

    private generateQuestion(): CoordinateQuestion {
        let pointA: Point, pointB: Point, distance: number;
        
        // 对于难度1，我们应该生成能产生简单平方根的点
        if (this.difficulty === 1) {
            // 预设一些简单的点对，这些点对之间的距离是简单的平方根值
            const simplePoints = [
                { A: {x: 1, y: 0}, B: {x: 2, y: 1} },  // sqrt{2}
                { A: {x: 0, y: 0}, B: {x: 1, y: 1} },  // sqrt{2}
                { A: {x: 2, y: 2}, B: {x: 4, y: 3} },  // sqrt{5}
                { A: {x: 4, y: 0}, B: {x: 3, y: 1} },  // sqrt{2}
                { A: {x: 0, y: 2}, B: {x: 2, y: 0} },  // sqrt{8}
            ];
            
            const selectedPair = simplePoints[Math.floor(Math.random() * simplePoints.length)];
            pointA = selectedPair.A;
            pointB = selectedPair.B;
        } else {
            do {
                pointA = this.generatePoint();
                pointB = this.generatePoint();
                distance = this.calculateDistance(pointA, pointB);
            } while (!this.isValidDistance(distance));
        }

        distance = this.calculateDistance(pointA, pointB);
        
        return {
            pointA,
            pointB,
            distance
        };
    }

    private generatePoint(): Point {
        let x: number, y: number;
        const range = this.getCoordinateRange();
        const decimals = this.getDecimalPlaces();

        switch (this.difficulty) {
            case 1:
                x = getRandomInt(0, range);
                y = getRandomInt(0, range);
                break;
            case 2:
                x = getRandomInt(-range, range);
                y = getRandomInt(-range, range);
                break;
            case 3:
                x = getRandomInt(-range, range);
                y = getRandomInt(-range, range);
                break;
            default:
                x = getRandomDecimal(-range, range, decimals);
                y = getRandomDecimal(-range, range, decimals);
        }

        return { x, y };
    }

    private getCoordinateRange(): number {
        switch (this.difficulty) {
            case 1: return 5;
            case 2: return 6;
            case 3: return 7;
            case 4: return 8;
            case 5: return 9;
            default: return 5;
        }
    }

    private getDecimalPlaces(): number {
        switch (this.difficulty) {
            case 1:
            case 2:
            case 3: return 0;
            case 4: return 1;
            case 5: return 2;
            default: return 0;
        }
    }

    private calculateDistance(pointA: Point, pointB: Point): number {
        const dx = pointB.x - pointA.x;
        const dy = pointB.y - pointA.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return roundTo(distance, this.getDecimalPlaces());
    }

    private isValidDistance(distance: number): boolean {
        if (distance === 0) return false;
        
        switch (this.difficulty) {
            case 1:
                // 难度1只允许简单的平方根值
                const validRoots = [Math.sqrt(1), Math.sqrt(2), Math.sqrt(4), Math.sqrt(5), Math.sqrt(8)];
                return validRoots.some(root => Math.abs(root - distance) < 0.0001);
            case 2:
                return Number.isInteger(distance) && distance <= 10;
            case 3:
                return distance <= 12;
            case 4:
                return distance <= 15;
            case 5:
                return distance <= 20;
            default:
                return true;
        }
    }

    private formatPoint(point: Point): string {
        const decimals = this.getDecimalPlaces();
        const x = roundTo(point.x, decimals);
        const y = roundTo(point.y, decimals);
        return `(${x}, ${y})`;
    }

    private formatQuestion(question: CoordinateQuestion): string {
        return `求以下兩點之間的距離：\\[A${this.formatPoint(question.pointA)}, B${this.formatPoint(question.pointB)}\\]`;
    }

    private formatAnswer(distance: number, question: CoordinateQuestion): string {
        const { pointA, pointB } = question;
        const dx = pointB.x - pointA.x;
        const dy = pointB.y - pointA.y;
        const sumSquared = roundTo(dx * dx + dy * dy, 2);
        
        // 如果是完全平方数，返回简化后的数字
        const sqrtValue = Math.sqrt(sumSquared);
        if (Number.isInteger(sqrtValue)) {
            return `${sqrtValue}`;
        }
        return `\\sqrt{${sumSquared}}`;
    }

    private roundToSigFigs(num: number, sigFigs: number = 3): number {
        if (num === 0) return 0;
        
        const magnitude = Math.floor(Math.log10(Math.abs(num))) + 1;
        const scale = Math.pow(10, sigFigs - magnitude);
        return Math.round(num * scale) / scale;
    }

    private simplifyAnswer(value: number | string): string {
        // 如果输入是字符串，先转换为数字
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num)) return value.toString();
        
        // 检查是否是完全平方数
        const sqrt = Math.sqrt(num);
        if (Number.isInteger(sqrt)) {
            return `$${sqrt}$`;
        }
        
        // 对平方根内的数字保持3位有效数字
        const roundedNum = this.roundToSigFigs(num, 3);
        return `$\\sqrt{${roundedNum}}$`;
    }

    private generateExplanation(question: CoordinateQuestion): string {
        const { pointA, pointB } = question;
        const dx = pointB.x - pointA.x;
        const dy = pointB.y - pointA.y;
        const dxRounded = roundTo(dx, 2);
        const dyRounded = roundTo(dy, 2);
        const dxSquared = roundTo(dx * dx, 2);
        const dySquared = roundTo(dy * dy, 2);
        const sumSquared = this.roundToSigFigs(dx * dx + dy * dy, 3);  // 使用3位有效数字

        return `解題步驟：
\\[1.\\space 使用兩點距離公式：d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}\\]

\\[2.\\space 代入座標：\\]
\\[x_2-x_1 = ${dxRounded}\\]
\\[y_2-y_1 = ${dyRounded}\\]

\\[3.\\space 計算平方和：\\]
\\[(${dxRounded})^2 + (${dyRounded})^2\\]
\\[= ${dxSquared} + ${dySquared}\\]
\\[= ${sumSquared}\\]

\\[4.\\space 開根號：\\]
\\[d = \\sqrt{${sumSquared}}\\]

\\[因此，兩點之間的距離為\\space \\sqrt{${sumSquared}}。\\]`;
    }
}