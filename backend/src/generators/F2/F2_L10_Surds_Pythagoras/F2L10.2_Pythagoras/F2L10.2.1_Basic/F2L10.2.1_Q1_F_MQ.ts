import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import { getRandomInt } from '@/utils/mathUtils';

// 定义题目所需的接口
interface TriangleData {
    side1: number;      // 第一条边长
    side2: number;      // 第二条边长
    hypotenuse: number; // 斜边长度
    unknownSide: 1 | 2 | 3; // 表示哪条边是未知的 (1=side1, 2=side2, 3=hypotenuse)
}

export default class PythagorasBasicGenerator extends QuestionGenerator {
    // 定义常量和配置
    private readonly PYTHAGOREAN_TRIPLES: [number, number, number][] = [
        [3, 4, 5],
        [5, 12, 13],
        [8, 15, 17],
        [7, 24, 25],
        [9, 40, 41],
        [6, 8, 10],
        [12, 16, 20]
    ];

    // 中等难度的边长范围
    private readonly MEDIUM_RANGE = {
        MIN: 10,
        MAX: 30
    };

    // 高级难度的边长范围
    private readonly HARD_RANGE = {
        MIN: 5,
        MAX: 20
    };

    constructor(difficulty: number = 1) {
        // 设置难度和题目ID
        super(difficulty, 'F2L10.2.1_Q1_F_MQ');
    }

    // 生成有效组合的方法
    private generateValidCombination(): TriangleData {
        switch (this.difficulty) {
            case 1:
                return this.generateLevel1Combination();
            case 2:
                return this.generateLevel2Combination();
            case 3:
                return this.generateLevel3Combination();
            default:
                return this.generateLevel1Combination();
        }
    }

    // 难度1：使用简单的勾股数
    private generateLevel1Combination(): TriangleData {
        // 随机选择一个勾股数组
        const triple = this.getRandomElement(this.PYTHAGOREAN_TRIPLES);
        
        // 随机决定哪条边是未知的
        const unknownSide = (getRandomInt(1, 3) as 1 | 2 | 3);
        
        return {
            side1: triple[0],
            side2: triple[1],
            hypotenuse: triple[2],
            unknownSide
        };
    }

    // 难度2：使用较大的整数
    private generateLevel2Combination(): TriangleData {
        // 生成两个较大的整数作为已知边
        let side1 = getRandomInt(this.MEDIUM_RANGE.MIN, this.MEDIUM_RANGE.MAX);
        let side2 = getRandomInt(this.MEDIUM_RANGE.MIN, this.MEDIUM_RANGE.MAX);
        
        // 确保side1 <= side2
        if (side1 > side2) {
            [side1, side2] = [side2, side1];
        }
        
        // 计算斜边
        const hypotenuse = Math.sqrt(side1 * side1 + side2 * side2);
        
        // 如果斜边是整数，则使用它，否则重新生成
        if (hypotenuse === Math.floor(hypotenuse)) {
            // 随机决定哪条边是未知的
            const unknownSide = (getRandomInt(1, 3) as 1 | 2 | 3);
            
            return {
                side1,
                side2,
                hypotenuse,
                unknownSide
            };
        } else {
            // 如果斜边不是整数，则只能让斜边作为未知边
            return {
                side1,
                side2,
                hypotenuse,
                unknownSide: 3
            };
        }
    }

    // 难度3：涉及无理数结果
    private generateLevel3Combination(): TriangleData {
        // 生成两个整数作为已知边
        let side1 = getRandomInt(this.HARD_RANGE.MIN, this.HARD_RANGE.MAX);
        let side2 = getRandomInt(this.HARD_RANGE.MIN, this.HARD_RANGE.MAX);
        
        // 确保side1 <= side2
        if (side1 > side2) {
            [side1, side2] = [side2, side1];
        }
        
        // 计算斜边
        const hypotenuse = Math.sqrt(side1 * side1 + side2 * side2);
        
        // 确保结果是无理数（不是整数）
        if (hypotenuse !== Math.floor(hypotenuse)) {
            // 随机决定哪条边是未知的，但更倾向于选择斜边
            const unknownSide = Math.random() < 0.7 ? 3 : (getRandomInt(1, 2) as 1 | 2);
            
            return {
                side1,
                side2,
                hypotenuse,
                unknownSide
            };
        } else {
            // 如果结果是整数，则重新生成
            return this.generateLevel3Combination();
        }
    }

    // 格式化答案的辅助方法
    private formatAnswer(value: number): string {
        // 如果是整数，直接返回
        if (value === Math.floor(value)) {
            return `${value}`;
        }
        
        // 如果是无理数，格式化为根号形式
        // 尝试简化根号表达式
        for (let i = Math.floor(Math.sqrt(value)); i > 1; i--) {
            const squared = i * i;
            if (value % squared === 0) {
                const coefficient = i;
                const radicand = value / squared;
                if (radicand === 1) {
                    return `${coefficient}`;
                } else {
                    return `${coefficient}\\sqrt{${radicand}}`;
                }
            }
        }
        
        // 如果无法简化，则直接使用根号表达式
        return `\\sqrt{${Math.round(value * value)}}`;
    }

    // 生成错误答案
    private generateWrongAnswers(correct: number, data: TriangleData): string[] {
        const wrongAnswers: string[] = [];
        
        // 错误1：加法而非平方和的平方根
        if (data.unknownSide === 3) {
            // 如果求斜边，常见错误是直接相加
            const wrong1 = data.side1 + data.side2;
            wrongAnswers.push(this.formatAnswer(wrong1));
        } else {
            // 如果求直角边，常见错误是直接相减
            const wrong1 = data.unknownSide === 1 
                ? Math.abs(data.hypotenuse - data.side2)
                : Math.abs(data.hypotenuse - data.side1);
            wrongAnswers.push(this.formatAnswer(wrong1));
        }
        
        // 错误2：平方根计算错误或平方操作错误
        const wrong2 = data.unknownSide === 3
            ? Math.sqrt(data.side1 + data.side2) // 错误地对和开方
            : (data.unknownSide === 1 
                ? Math.sqrt(data.hypotenuse - data.side2 * data.side2) // 错误地减法顺序
                : Math.sqrt(data.hypotenuse - data.side1 * data.side1));
        wrongAnswers.push(this.formatAnswer(wrong2));
        
        // 错误3：计算时忘记开方
        const wrong3 = data.unknownSide === 3
            ? data.side1 * data.side1 + data.side2 * data.side2 // 忘记开方
            : (data.unknownSide === 1 
                ? data.hypotenuse * data.hypotenuse - data.side2 * data.side2 // 忘记开方
                : data.hypotenuse * data.hypotenuse - data.side1 * data.side1);
        wrongAnswers.push(this.formatAnswer(wrong3));
        
        // 确保错误答案与正确答案不同
        return wrongAnswers.filter(ans => Math.abs(parseFloat(ans) - correct) > 0.01);
    }

    // 生成解释
    private generateExplanation(data: TriangleData): string {
        let explanation = `根據畢達哥拉斯定理，在直角三角形中，斜邊的平方等於兩直角邊平方和：\n\n`;
        explanation += `\\[a^2 + b^2 = c^2\\]\n\n`;
        explanation += `其中 $c$ 是斜邊，$a$ 和 $b$ 是兩條直角邊。\n\n`;
        
        if (data.unknownSide === 3) {
            // 求斜边
            explanation += `在這個問題中，我們知道兩條直角邊：\n`;
            explanation += `$a = ${data.side1}$ cm\n`;
            explanation += `$b = ${data.side2}$ cm\n\n`;
            explanation += `我們需要求斜邊 $c$：\n`;
            explanation += `\\[c^2 = a^2 + b^2\\]\n`;
            explanation += `\\[c^2 = ${data.side1}^2 + ${data.side2}^2\\]\n`;
            explanation += `\\[c^2 = ${data.side1 * data.side1} + ${data.side2 * data.side2}\\]\n`;
            explanation += `\\[c^2 = ${data.side1 * data.side1 + data.side2 * data.side2}\\]\n`;
            explanation += `\\[c = \\sqrt{${data.side1 * data.side1 + data.side2 * data.side2}}\\]\n`;
            
            if (data.hypotenuse === Math.floor(data.hypotenuse)) {
                explanation += `\\[c = ${data.hypotenuse}\\]\n\n`;
            } else {
                // 如果结果是无理数，尝试简化
                explanation += `\\[c = ${this.formatAnswer(data.hypotenuse)}\\]\n\n`;
            }
            
            explanation += `因此，斜邊長度為 $${this.formatAnswer(data.hypotenuse)}$ cm。`;
        } else if (data.unknownSide === 1 || data.unknownSide === 2) {
            // 求直角边
            const knownSide = data.unknownSide === 1 ? data.side2 : data.side1;
            const unknownSideLabel = data.unknownSide === 1 ? 'a' : 'b';
            const knownSideLabel = data.unknownSide === 1 ? 'b' : 'a';
            
            explanation += `在這個問題中，我們知道：\n`;
            explanation += `斜邊 $c = ${data.hypotenuse}$ cm\n`;
            explanation += `直角邊 $${knownSideLabel} = ${knownSide}$ cm\n\n`;
            explanation += `我們需要求另一條直角邊 $${unknownSideLabel}$：\n`;
            explanation += `\\[a^2 + b^2 = c^2\\]\n`;
            explanation += `\\[${unknownSideLabel}^2 + ${knownSide}^2 = ${data.hypotenuse}^2\\]\n`;
            explanation += `\\[${unknownSideLabel}^2 = ${data.hypotenuse}^2 - ${knownSide}^2\\]\n`;
            explanation += `\\[${unknownSideLabel}^2 = ${data.hypotenuse * data.hypotenuse} - ${knownSide * knownSide}\\]\n`;
            explanation += `\\[${unknownSideLabel}^2 = ${data.hypotenuse * data.hypotenuse - knownSide * knownSide}\\]\n`;
            explanation += `\\[${unknownSideLabel} = \\sqrt{${data.hypotenuse * data.hypotenuse - knownSide * knownSide}}\\]\n`;
            
            const result = data.unknownSide === 1 ? data.side1 : data.side2;
            if (result === Math.floor(result)) {
                explanation += `\\[${unknownSideLabel} = ${result}\\]\n\n`;
            } else {
                // 如果结果是无理数，尝试简化
                explanation += `\\[${unknownSideLabel} = ${this.formatAnswer(result)}\\]\n\n`;
            }
            
            explanation += `因此，所求直角邊長度為 $${this.formatAnswer(result)}$ cm。`;
        }
        
        return explanation;
    }

    // 生成问题文本
    private generateQuestionText(data: TriangleData): string {
        // 随机决定三角形的变化类型
        const variationType = Math.floor(Math.random() * 4); // 0-3的随机数
        
        // 根据变化类型生成不同的三角形
        let trianglePoints, rightAnglePos, side1LabelPos, side2LabelPos, hypoLabelPos;
        
        switch (variationType) {
            case 0: // 标准右下角直角
                trianglePoints = "100,200 300,200 100,50";
                rightAnglePos = "M 120,200 L 120,180 L 100,180";
                side1LabelPos = { x: 200, y: 225 };
                side2LabelPos = { x: 75, y: 125 };
                hypoLabelPos = { x: 210, y: 110 };
                break;
            case 1: // 右上角直角
                trianglePoints = "100,50 300,50 300,200";
                rightAnglePos = "M 300,70 L 280,70 L 280,50";
                side1LabelPos = { x: 200, y: 35 };
                side2LabelPos = { x: 325, y: 125 };
                hypoLabelPos = { x: 190, y: 140 };
                break;
            case 2: // 左上角直角
                trianglePoints = "100,50 300,200 100,200";
                rightAnglePos = "M 100,70 L 120,70 L 120,50";
                side1LabelPos = { x: 200, y: 225 };
                side2LabelPos = { x: 75, y: 125 };
                hypoLabelPos = { x: 210, y: 110 };
                break;
            case 3: // 左下角直角（更宽的三角形）
                trianglePoints = "100,200 350,200 100,100";
                rightAnglePos = "M 120,200 L 120,180 L 100,180";
                side1LabelPos = { x: 225, y: 225 };
                side2LabelPos = { x: 75, y: 150 };
                hypoLabelPos = { x: 235, y: 135 };
                break;
            default: // 默认情况
                trianglePoints = "100,200 300,200 100,50";
                rightAnglePos = "M 120,200 L 120,180 L 100,180";
                side1LabelPos = { x: 200, y: 225 };
                side2LabelPos = { x: 75, y: 125 };
                hypoLabelPos = { x: 210, y: 110 };
        }
        
        // 创建SVG内容
        const svgContent = `
        <div style="text-align: center; margin: 20px 0;">
        <svg width="400" height="300" viewBox="0 0 400 300">
            <!-- 绘制三角形 -->
            <polygon points="${trianglePoints}" 
                  fill="none" stroke="black" stroke-width="2"/>
            
            <!-- 绘制直角标记 -->
            <path d="${rightAnglePos}" 
                  fill="none" stroke="black" stroke-width="1.5"/>
            
            <!-- 添加边长标签 -->
            ${data.unknownSide !== 1 ? 
                `<text x="${side1LabelPos.x}" y="${side1LabelPos.y}" text-anchor="middle" font-family="Arial" font-size="18px">${data.side1} cm</text>` : 
                `<text x="${side1LabelPos.x}" y="${side1LabelPos.y}" text-anchor="middle" font-family="Arial" font-size="18px" font-weight="bold">x</text>`}
            
            ${data.unknownSide !== 2 ? 
                `<text x="${side2LabelPos.x}" y="${side2LabelPos.y}" text-anchor="middle" font-family="Arial" font-size="18px">${data.side2} cm</text>` : 
                `<text x="${side2LabelPos.x}" y="${side2LabelPos.y}" text-anchor="middle" font-family="Arial" font-size="18px" font-weight="bold">x</text>`}
            
            ${data.unknownSide !== 3 ? 
                `<text x="${hypoLabelPos.x}" y="${hypoLabelPos.y}" text-anchor="middle" font-family="Arial" font-size="18px">${data.hypotenuse} cm</text>` : 
                `<text x="${hypoLabelPos.x}" y="${hypoLabelPos.y}" text-anchor="middle" font-family="Arial" font-size="18px" font-weight="bold">x</text>`}
        </svg>
        </div>
        `;
        
        let questionText = `在下圖所示的直角三角形中，`;
        
        if (data.unknownSide === 3) {
            // 求斜边
            questionText += `已知兩條直角邊長分別為 $${data.side1}$ cm 和 $${data.side2}$ cm，求斜邊長。`;
        } else if (data.unknownSide === 1) {
            // 求第一条直角边
            questionText += `已知斜邊長為 $${data.hypotenuse}$ cm，一條直角邊長為 $${data.side2}$ cm，求另一條直角邊長。`;
        } else {
            // 求第二条直角边
            questionText += `已知斜邊長為 $${data.hypotenuse}$ cm，一條直角邊長為 $${data.side1}$ cm，求另一條直角邊長。`;
        }
        
        return svgContent + questionText;
    }

    // 生成SVG图像
    private generateSVGImage(data: TriangleData): string {
        // 使用固定尺寸的SVG
        const width = 300;
        const height = 200;
        const padding = 30;
        
        // 计算缩放比例，确保三角形适合SVG尺寸
        const maxSide = Math.max(data.side1, data.side2, data.hypotenuse);
        const scale = (Math.min(width, height) - 2 * padding) / maxSide / 1.5;
        
        // 计算三角形的坐标
        const x1 = padding;
        const y1 = height - padding;
        const x2 = x1 + data.side1 * scale;
        const y2 = y1;
        const x3 = x1;
        const y3 = y1 - data.side2 * scale;
        
        // 创建SVG
        let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
        
        // 绘制三角形
        svg += `<polygon points="${x1},${y1} ${x2},${y2} ${x3},${y3}" fill="none" stroke="black" stroke-width="2"/>`;
        
        // 绘制直角标记
        svg += `<path d="M ${x1+15},${y1} L ${x1+15},${y1-15} L ${x1},${y1-15}" fill="none" stroke="black" stroke-width="1"/>`;
        
        // 添加边长标签
        const side1LabelX = (x1 + x2) / 2;
        const side1LabelY = y1 + 15;
        const side2LabelX = x1 - 25;
        const side2LabelY = (y1 + y3) / 2;
        const hypotenuseLabelX = (x2 + x3) / 2;
        const hypotenuseLabelY = (y2 + y3) / 2 - 10;
        
        // 根据未知边添加标签
        if (data.unknownSide !== 1) {
            svg += `<text x="${side1LabelX}" y="${side1LabelY}" font-family="Arial" font-size="14">${data.side1} cm</text>`;
        } else {
            svg += `<text x="${side1LabelX}" y="${side1LabelY}" font-family="Arial" font-size="14" font-weight="bold">x</text>`;
        }
        
        if (data.unknownSide !== 2) {
            svg += `<text x="${side2LabelX}" y="${side2LabelY}" font-family="Arial" font-size="14">${data.side2} cm</text>`;
        } else {
            svg += `<text x="${side2LabelX}" y="${side2LabelY}" font-family="Arial" font-size="14" font-weight="bold">x</text>`;
        }
        
        if (data.unknownSide !== 3) {
            svg += `<text x="${hypotenuseLabelX}" y="${hypotenuseLabelY}" font-family="Arial" font-size="14">${data.hypotenuse} cm</text>`;
        } else {
            svg += `<text x="${hypotenuseLabelX}" y="${hypotenuseLabelY}" font-family="Arial" font-size="14" font-weight="bold">x</text>`;
        }
        
        svg += `</svg>`;
        
        return svg;
    }

    // 生成ASCII三角形
    private generateASCIITriangle(data: TriangleData): string {
        // 根据未知边生成标签
        const side1Label = data.unknownSide === 1 ? "x" : `${data.side1} cm`;
        const side2Label = data.unknownSide === 2 ? "x" : `${data.side2} cm`;
        const hypotenuseLabel = data.unknownSide === 3 ? "x" : `${data.hypotenuse} cm`;
        
        return `
    C
    |\\
    | \\
    |  \\
    |   \\
    |    \\
${side2Label} |     \\ ${hypotenuseLabel}
    |      \\
    |       \\
    |        \\
    A---------B
       ${side1Label}
    `;
    }

    // 主要生成方法
    generate(): IGeneratorOutput {
        // 生成题目组合
        const triangleData = this.generateValidCombination();
        
        // 构建问题文本（包含SVG图像）
        const questionText = this.generateQuestionText(triangleData);
        
        // 确定正确答案
        let correctAnswerValue: number;
        if (triangleData.unknownSide === 3) {
            correctAnswerValue = triangleData.hypotenuse;
        } else if (triangleData.unknownSide === 1) {
            correctAnswerValue = triangleData.side1;
        } else {
            correctAnswerValue = triangleData.side2;
        }
        
        // 格式化正确答案
        const correctAnswer = this.formatAnswer(correctAnswerValue);
        
        // 生成错误答案
        const wrongAnswers = this.generateWrongAnswers(correctAnswerValue, triangleData);
        
        // 生成解释
        const explanation = this.generateExplanation(triangleData);

        return {
            content: questionText,
            correctAnswer: correctAnswer,
            wrongAnswers: wrongAnswers,
            explanation: explanation,
            type: 'text', // 改为text类型，因为SVG已经包含在content中
            displayOptions: {
                latex: true
            }
        };
    }

    // 生成图像URL
    private generateImageUrl(data: TriangleData): string {
        // 这里应该返回一个图像URL，但由于我们无法实际生成图像，
        // 所以这里只是一个占位符。在实际应用中，您需要实现图像生成逻辑。
        // 可以使用SVG或Canvas动态生成，或者预先准备好一系列图像。
        return `/images/pythagoras/triangle_${data.side1}_${data.side2}_${Math.round(data.hypotenuse)}.png`;
    }

    // 工具方法：随机选择数组元素
    private getRandomElement<T>(array: T[]): T {
        const randomIndex = getRandomInt(0, array.length - 1);
        return array[randomIndex];
    }
} 