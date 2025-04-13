import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import { getRandomInt } from '@/utils/mathUtils';
import { CoordinateSystem } from '@/utils/coordinates';

interface Point {
    x: number;
    y: number;
    label: string;
}

export default class F1L10_1_Q6_F_MQ extends QuestionGenerator {
    constructor(difficulty: number) {
        super(difficulty, 'F1L10.1_Q6_F_MQ');
    }

    generate(): IGeneratorOutput {
        // 生成点
        const point = this.generatePoint(this.difficulty);
        
        // 生成问题内容
        const content = `判斷$A$點$(${point.x}, ${point.y})$在座標平面上的位置。`;

        // 生成正确答案和错误答案
        const { correctAnswer, wrongAnswers } = this.generateAnswers(point);

        return {
            content,
            correctAnswer,
            wrongAnswers,
            explanation: this.generateExplanation(point),
            type: 'text'
        };
    }

    private generatePoint(level: number): Point {
        let x: number, y: number;
        
        switch (level) {
            case 1: // 四个象限的整数点
                do {
                    const quadrant = getRandomInt(1, 5);
                    switch (quadrant) {
                        case 1:
                            x = getRandomInt(1, 5);
                            y = getRandomInt(1, 5);
                            break;
                        case 2:
                            x = getRandomInt(-5, -1);
                            y = getRandomInt(1, 5);
                            break;
                        case 3:
                            x = getRandomInt(-5, -1);
                            y = getRandomInt(-5, -1);
                            break;
                        case 4:
                            x = getRandomInt(1, 5);
                            y = getRandomInt(-5, -1);
                            break;
                        default:
                            throw new Error("Invalid quadrant");
                    }
                } while (x === 0 || y === 0);
                break;

            case 2: // 包含坐标轴上的点和原点
                const position = getRandomInt(1, 2);
                if (position === 1) { // 在 y 轴上
                    x = 0;
                    y = this.getRandomNonZeroInt(-5, 5);
                } else if (position === 2) { // 在 x 轴上
                    x = this.getRandomNonZeroInt(-5, 5);
                    y = 0;
                } else { // 在原点
                    x = 0;
                    y = 0;
                }
                break;

            default:
                throw new Error("Invalid difficulty level");
        }

        return {
            x,
            y,
            label: 'A'
        };
    }

    private generateAnswers(point: Point): { correctAnswer: string; wrongAnswers: string[] } {
        let correctAnswer: string;
        let possibleAnswers: string[];

        if (point.x === 0 && point.y === 0) {
            correctAnswer = '在原點';
            possibleAnswers = ['第一象限', '第二象限', '第三象限', '第四象限', '在 x 軸上', '在 y 軸上', '在原點'];
        } else if (point.x === 0) {
            correctAnswer = '在 y 軸上';
            possibleAnswers = ['第一象限', '第二象限', '第三象限', '第四象限', '在 x 軸上', '在 y 軸上'];
        } else if (point.y === 0) {
            correctAnswer = '在 x 軸上';
            possibleAnswers = ['第一象限', '第二象限', '第三象限', '第四象限', '在 x 軸上', '在 y 軸上'];
        } else if (point.x > 0 && point.y > 0) {
            correctAnswer = '第一象限';
            possibleAnswers = ['第一象限', '第二象限', '第三象限', '第四象限'];
        } else if (point.x < 0 && point.y > 0) {
            correctAnswer = '第二象限';
            possibleAnswers = ['第一象限', '第二象限', '第三象限', '第四象限'];
        } else if (point.x < 0 && point.y < 0) {
            correctAnswer = '第三象限';
            possibleAnswers = ['第一象限', '第二象限', '第三象限', '第四象限'];
        } else {
            correctAnswer = '第四象限';
            possibleAnswers = ['第一象限', '第二象限', '第三象限', '第四象限'];
        }

        // 从可能的答案中移除正确答案，然后随机选择3个作为错误答案
        const wrongAnswers = possibleAnswers
            .filter(answer => answer !== correctAnswer)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        return {
            correctAnswer,
            wrongAnswers
        };
    }

    private generateExplanation(point: Point): string {
        // 第一步
        let explanation = `$A$點$(${point.x}, ${point.y})$ 的位置判斷：\n\n`;
        explanation += `【第一步】找出 x 坐標：$x = ${point.x}$，${point.x === 0 ? '在 y 軸上' : point.x > 0 ? '在 y 軸右方' : '在 y 軸左方'}。<br>\n\n`;
        
        // 创建第一步的坐标系统（只显示x坐标）
        const system1 = CoordinateSystem.createExplanationSystem({
            width: 400,
            height: 400,
            xRange: [-5, 5] as [number, number],
            yRange: [-5, 5] as [number, number],
            point: point,
            showGrid: true,
            showAllGrids: true,
            axisLabels: [-5, 5],
            showGridLines: true,
            showAxisNumbers: true,
            showAxisTicks: false
        });

        // 第一步只添加点和x坐标定位线
        system1.addPoint(point.x, point.y, "●", "A", 15, -15, "#00CC00");
        system1.addCoordinateLocatingGuides(point, 1);

        explanation += `<div style="text-align: center;">\n${system1.toString()}\n</div>\n\n`;

        // 第二步
        explanation += `【第二步】找出 y 坐標：$y = ${point.y}$，${point.y === 0 ? '在 x 軸上' : point.y > 0 ? '在 x 軸上方' : '在 x 軸下方'}。<br>\n\n`;

        // 创建第二步的坐标系统（显示x和y坐标）
        const system2 = CoordinateSystem.createExplanationSystem({
            width: 400,
            height: 400,
            xRange: [-5, 5] as [number, number],
            yRange: [-5, 5] as [number, number],
            point: point,
            showGrid: true,
            showAllGrids: true,
            axisLabels: [-5, 5],
            showGridLines: true,
            showAxisNumbers: true,
            showAxisTicks: false
        });

        // 第二步添加点和完整定位线
        system2.addPoint(point.x, point.y, "●", "A", 15, -15, "#00CC00");
        system2.addCoordinateLocatingGuides(point, 2);

        explanation += `<div style="text-align: center;">\n${system2.toString()}\n</div>\n\n`;

        // 第三步
        explanation += `【第三步】辨認象限：`;
        
        // 创建第三步的坐标系统（添加象限标记）
        const system3 = CoordinateSystem.createExplanationSystem({
            width: 400,
            height: 400,
            xRange: [-5, 5] as [number, number],
            yRange: [-5, 5] as [number, number],
            point: point,
            showGrid: true,
            showAllGrids: true,
            axisLabels: [-5, 5],
            showGridLines: true,
            showAxisNumbers: true,
            showAxisTicks: false
        });

        // 第三步添加象限标记和点
        system3.addText(3, 3, "Ⅰ", "#FFD700", 48);
        system3.addText(-3, 3, "Ⅱ", "#FFD700", 48);
        system3.addText(-3, -3, "Ⅲ", "#FFD700", 48);
        system3.addText(3, -3, "Ⅳ", "#FFD700", 48);

        // 添加彩色坐标轴标签和紫色原点
        system3.addLineSegment(0, -5, 0, 5, "#0000FF", "solid", 3);  // 蓝色y轴
        system3.addText(1.3, 4.5, "y-axis", "#0000FF", 24);  // y轴标签
        system3.addLineSegment(-5, 0, 5, 0, "#FF0000", "solid", 3);  // 红色x轴
        system3.addText(4.5, -0.7, "x-axis", "#FF0000", 24); // x轴标签
        system3.addPoint(0, 0, "●", "", 0, 0, "#800080");  // 添加紫色原点
        system3.addText(0.5, 0.5, "O", "#800080", 24);    // 紫色原点标记

        system3.addPoint(point.x, point.y, "●", "A", 15, -15, "#00CC00");
        
        if (point.x === 0 && point.y === 0) {
            explanation += `因為 $x = 0$ 且 $y = 0$，所以$A$點在原點。<br>\n\n`;
        } else if (point.x === 0) {
            explanation += `因為 $x = 0$，所以$A$點在 y 軸上。<br>\n\n`;
        } else if (point.y === 0) {
            explanation += `因為 $y = 0$，所以$A$點在 x 軸上。<br>\n\n`;
        } else {
            explanation += `因為 $x ${point.x > 0 ? '> 0' : '< 0'}$ 且 $y ${point.y > 0 ? '> 0' : '< 0'}$，所以$A$點在${point.x > 0 && point.y > 0 ? '第一' : point.x < 0 && point.y > 0 ? '第二' : point.x < 0 && point.y < 0 ? '第三' : '第四'}象限。<br>\n\n`;
        }

        explanation += `<div style="text-align: center;">\n${system3.toString()}\n</div>`;

        return explanation;
    }

    private getRandomNonZeroInt(min: number, max: number): number {
        let result;
        do {
            result = getRandomInt(min, max);
        } while (result === 0);
        return result;
    }
} 