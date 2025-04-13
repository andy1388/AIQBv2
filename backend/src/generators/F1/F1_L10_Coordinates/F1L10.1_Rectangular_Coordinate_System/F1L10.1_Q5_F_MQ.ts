import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import { getRandomInt } from '@/utils/mathUtils';
import { CoordinateSystem } from '@/utils/coordinates';

interface Point {
    x: number;
    y: number;
    label: string;
    color: string;
}

export default class F1L10_1_Q5_F_MQ extends QuestionGenerator {
    private targetQuadrant: number = 1;
    private targetPosition: string = '';
    private questionType: string = ''; // 新增：存储难度5的问题类型

    constructor(difficulty: number) {
        super(difficulty, 'F1L10.1_Q5_F_MQ');
    }

    generate(): IGeneratorOutput {
        if (this.difficulty === 5) {
            // 先决定问题类型
            const questionTypes = [
                'x坐標為正數',
                'x坐標為負數',
                'y坐標為正數',
                'y坐標為負數'
            ];
            this.questionType = questionTypes[getRandomInt(0, 3)];
        } else if (this.difficulty === 4) {
            // 先决定要问的位置
            const positions = ['在 x 軸上', '在 y 軸上', '在原點'];
            this.targetPosition = positions[getRandomInt(0, 2)];
        }

        // 生成点
        const points = this.generatePoint(this.difficulty);
        
        // 生成坐标系统
        const coordSystem = this.generateCoordinateSystem(points);

        // 生成问题内容
        let content;
        if (this.difficulty === 5) {
            content = `在下面的坐標平面中，哪一個點的${this.questionType}？`;
        } else if (this.difficulty === 3) {
            const targetQuadrant = getRandomInt(1, 4);
            this.targetQuadrant = targetQuadrant;
            content = `在下面的坐標平面中，哪一個點在第${this.convertToChineseNumber(targetQuadrant)}象限？`;
        } else if (this.difficulty === 4) {
            content = `在下面的坐標平面中，哪一個點${this.targetPosition}？`;
        } else {
            content = `在下面的坐標平面中，點 $${points[0].label}$ 在哪一個位置？`;
        }

        // 生成正确答案和错误答案
        const { correctAnswer, wrongAnswers } = this.generateAnswers(points);

        return {
            content: `${content}<br>\n${coordSystem.toString()}`,
            correctAnswer,
            wrongAnswers,
            explanation: this.generateExplanation(points),
            type: 'text',
            displayOptions: {
                graph: true
            }
        };
    }

    private isPointTooClose(newPoint: {x: number, y: number}, existingPoints: Point[], minDistance: number = 2): boolean {
        return existingPoints.some(point => {
            const dx = point.x - newPoint.x;
            const dy = point.y - newPoint.y;
            return Math.sqrt(dx * dx + dy * dy) < minDistance;
        });
    }

    private getRandomPointInQuadrant(quadrant: number, existingPoints: Point[]): {x: number, y: number} {
        let x: number, y: number;
        let attempts = 0;
        const maxAttempts = 20;

        do {
            switch (quadrant) {
                case 1:
                    x = getRandomInt(1, 4);
                    y = getRandomInt(1, 4);
                    break;
                case 2:
                    x = getRandomInt(-4, -1);
                    y = getRandomInt(1, 4);
                    break;
                case 3:
                    x = getRandomInt(-4, -1);
                    y = getRandomInt(-4, -1);
                    break;
                case 4:
                    x = getRandomInt(1, 4);
                    y = getRandomInt(-4, -1);
                    break;
                default:
                    throw new Error(`无效的象限: ${quadrant}`);
            }
            attempts++;

            // 验证生成的点确实在正确的象限内
            const isInCorrectQuadrant = (() => {
                switch (quadrant) {
                    case 1: return x > 0 && y > 0;
                    case 2: return x < 0 && y > 0;
                    case 3: return x < 0 && y < 0;
                    case 4: return x > 0 && y < 0;
                    default: return false;
                }
            })();

            if (!isInCorrectQuadrant) {
                continue;
            }

        } while (this.isPointTooClose({x, y}, existingPoints) && attempts < maxAttempts);

        if (attempts >= maxAttempts) {
            throw new Error(`无法在${maxAttempts}次尝试内生成合适的点`);
        }

        return {x, y};
    }

    private generatePoint(level: number): Point[] {
        let result: Point[] = [];
        
        if (level === 5) {
            // 随机决定哪个点是正确答案
            const labels = ['P', 'Q', 'R', 'S'];
            const colors = ['#FF0000', '#00CC00', '#0000FF', '#FFA500'];
            const correctIndex = getRandomInt(0, 3);
            
            // 根据问题类型生成正确答案的点
            let correctPoint: Point;
            switch (this.questionType) {
                case 'x坐標為正數':
                    correctPoint = {
                        x: getRandomInt(1, 5),
                        y: getRandomInt(-5, 5),
                        label: labels[correctIndex],
                        color: colors[correctIndex]
                    };
                    break;
                case 'x坐標為負數':
                    correctPoint = {
                        x: getRandomInt(-5, -1),
                        y: getRandomInt(-5, 5),
                        label: labels[correctIndex],
                        color: colors[correctIndex]
                    };
                    break;
                case 'y坐標為正數':
                    correctPoint = {
                        x: getRandomInt(-5, 5),
                        y: getRandomInt(1, 5),
                        label: labels[correctIndex],
                        color: colors[correctIndex]
                    };
                    break;
                case 'y坐標為負數':
                    correctPoint = {
                        x: getRandomInt(-5, 5),
                        y: getRandomInt(-5, -1),
                        label: labels[correctIndex],
                        color: colors[correctIndex]
                    };
                    break;
                default:
                    throw new Error('Invalid question type');
            }
            result.push(correctPoint);

            // 生成其他不满足条件的点
            let remainingLabels = labels.filter((_, i) => i !== correctIndex);
            let remainingColors = colors.filter((_, i) => i !== correctIndex);

            // 确保生成的点分布在不同区域
            const regions = this.getDistinctRegions(this.questionType);
            
            for (let i = 0; i < 3; i++) {
                let point: Point;
                do {
                    point = this.generateWrongPoint(
                        this.questionType,
                        remainingLabels[i],
                        remainingColors[i],
                        result,
                        regions[i]
                    );
                } while (this.isPointTooClose(point, result));
                result.push(point);
            }

            return result;
        }
        
        if (level === 4) {
            const labels = ['P', 'Q', 'R', 'S'];
            const colors = ['#FF0000', '#00CC00', '#0000FF', '#FFA500'];
            
            // 随机决定哪个点是正确答案
            const correctIndex = getRandomInt(0, 3);
            const correctLabel = labels[correctIndex];
            const correctColor = colors[correctIndex];
            
            // 获取剩余的标签和颜色
            const remainingLabels = labels.filter((_, i) => i !== correctIndex);
            const remainingColors = colors.filter((_, i) => i !== correctIndex);
            
            // 生成目标点（正确答案）
            let correctPoint: Point;
            switch (this.targetPosition) {
                case '在 x 軸上':
                    correctPoint = {
                        x: this.getRandomNonZeroInt(-4, 4),
                        y: 0,
                        label: correctLabel,
                        color: correctColor
                    };
                    break;
                case '在 y 軸上':
                    correctPoint = {
                        x: 0,
                        y: this.getRandomNonZeroInt(-4, 4),
                        label: correctLabel,
                        color: correctColor
                    };
                    break;
                case '在原點':
                    correctPoint = {
                        x: 0,
                        y: 0,
                        label: correctLabel,
                        color: correctColor
                    };
                    break;
                default:
                    throw new Error('Invalid target position');
            }
            result.push(correctPoint);

            // 生成其他三个点
            // 一个在第一象限
            result.push({
                x: getRandomInt(1, 4),
                y: getRandomInt(1, 4),
                label: remainingLabels[0],
                color: remainingColors[0]
            });

            // 一个在第三象限
            result.push({
                x: getRandomInt(-4, -1),
                y: getRandomInt(-4, -1),
                label: remainingLabels[1],
                color: remainingColors[1]
            });

            // 一个在第四象限
            result.push({
                x: getRandomInt(1, 4),
                y: getRandomInt(-4, -1),
                label: remainingLabels[2],
                color: remainingColors[2]
            });

            return result;
        }
        
        switch (level) {
            case 1: // 四个象限的整数点
                // 只生成一个点
                const point = this.getRandomPointInQuadrant(getRandomInt(1, 4), result);
                result.push({
                    x: point.x,
                    y: point.y,
                    label: 'A',
                    color: '#00cc00'
                });
                break;

            case 2: // 包含坐标轴上的点和原点
                const position = getRandomInt(1, 3);
                if (position === 1) { // 在 y 轴上
                    result.push({
                        x: 0,
                        y: this.getRandomNonZeroInt(-4, 4), // 使用getRandomNonZeroInt
                        label: 'A',
                        color: '#00cc00'
                    });
                } else if (position === 2) { // 在 x 轴上
                    result.push({
                        x: this.getRandomNonZeroInt(-4, 4), // 使用getRandomNonZeroInt
                        y: 0,
                        label: 'A',
                        color: '#00cc00'
                    });
                } else { // 在原点
                    result.push({
                        x: 0,
                        y: 0,
                        label: 'A',
                        color: '#00cc00'
                    });
                }
                break;

            case 3: // 四个点在不同象限
                const quadrantData = [
                    { label: 'P', color: '#FF0000', quadrant: getRandomInt(1, 4) },
                    { label: 'Q', color: '#00CC00', quadrant: 0 }, // 初始化quadrant
                    { label: 'R', color: '#0000FF', quadrant: 0 },
                    { label: 'S', color: '#FFA500', quadrant: 0 }
                ];

                // 记录已使用的象限
                const usedQuadrants = new Set([quadrantData[0].quadrant]);
                
                // 为其他点分配未使用的象限
                for (let i = 1; i < quadrantData.length; i++) {
                    let quadrant;
                    do {
                        quadrant = getRandomInt(1, 4);
                    } while (usedQuadrants.has(quadrant));
                    quadrantData[i].quadrant = quadrant;
                    usedQuadrants.add(quadrant);
                }

                // 根据象限生成具体坐标
                quadrantData.forEach(data => {
                    const point = this.getRandomPointInQuadrant(data.quadrant, result);
                    result.push({
                        x: point.x,
                        y: point.y,
                        label: data.label,
                        color: data.color
                    });
                });
                break;

            case 4: // 特殊位置的点
                if (this.targetPosition === '在 y 軸上') {
                    // 生成在y轴上的点（正确答案）
                    const yAxisY = this.getRandomNonZeroInt(-3, 3);
                    result.push({
                        x: 0,
                        y: yAxisY,
                        label: 'P',
                        color: '#FF0000'
                    });

                    // 生成在x轴上的点（确保与其他点距离足够）
                    let xAxisX;
                    do {
                        xAxisX = this.getRandomNonZeroInt(-3, 3);
                    } while (Math.abs(xAxisX) < 2);
                    result.push({
                        x: xAxisX,
                        y: 0,
                        label: 'Q',
                        color: '#00CC00'
                    });

                    // 生成第一象限和第三象限的点
                    const quad1Point = this.getRandomPointInQuadrant(1, result);
                    result.push({
                        x: quad1Point.x,
                        y: quad1Point.y,
                        label: 'R',
                        color: '#0000FF'
                    });

                    const quad3Point = this.getRandomPointInQuadrant(3, result);
                    result.push({
                        x: quad3Point.x,
                        y: quad3Point.y,
                        label: 'S',
                        color: '#FFA500'
                    });

                } else if (this.targetPosition === '在 x 軸上') {
                    // 生成在x轴上的点（正确答案）
                    const xAxisX = this.getRandomNonZeroInt(-3, 3);
                    result.push({
                        x: xAxisX,
                        y: 0,
                        label: 'P',
                        color: '#FF0000'
                    });

                    // 生成在y轴上的点（确保与其他点距离足够）
                    let yAxisY;
                    do {
                        yAxisY = this.getRandomNonZeroInt(-3, 3);
                    } while (Math.abs(yAxisY) < 2);
                    result.push({
                        x: 0,
                        y: yAxisY,
                        label: 'Q',
                        color: '#00CC00'
                    });

                    // 生成第二象限和第四象限的点
                    const quad2Point = this.getRandomPointInQuadrant(2, result);
                    result.push({
                        x: quad2Point.x,
                        y: quad2Point.y,
                        label: 'R',
                        color: '#0000FF'
                    });

                    const quad4Point = this.getRandomPointInQuadrant(4, result);
                    result.push({
                        x: quad4Point.x,
                        y: quad4Point.y,
                        label: 'S',
                        color: '#FFA500'
                    });

                } else { // 在原点
                    // 生成原点（正确答案）
                    result.push({
                        x: 0,  // 修改：直接使用(0,0)作为原点坐标
                        y: 0,
                        label: 'P',
                        color: '#FF0000'
                    });

                    // 生成在x轴上的点（非原点）
                    const xAxisX = this.getRandomNonZeroInt(-3, 3);
                    result.push({
                        x: xAxisX,
                        y: 0,
                        label: 'Q',
                        color: '#00CC00'
                    });

                    // 生成在y轴上的点（非原点）
                    const yAxisY = this.getRandomNonZeroInt(-3, 3);
                    result.push({
                        x: 0,
                        y: yAxisY,
                        label: 'R',
                        color: '#0000FF'
                    });

                    // 生成第一象限的点
                    const quad1Point = this.getRandomPointInQuadrant(1, result);
                    result.push({
                        x: quad1Point.x,
                        y: quad1Point.y,
                        label: 'S',
                        color: '#FFA500'
                    });
                }
                break;

            default:
                throw new Error("Invalid difficulty level");
        }

        return result;
    }

    private generateCoordinateSystem(points: Point[]): CoordinateSystem {
        const coordSystem = new CoordinateSystem({
            width: 400,
            height: 400,
            xRange: [-5, 5],
            yRange: [-5, 5],
            showGrid: true,
            gridColor: '#e0e0e0',
            gridOpacity: 0.8,
            axisColor: '#333',
            axisWidth: 1.5,
            showArrows: true,
            labelColor: '#666',
            labelSize: 16,
            showAllGrids: true
        });

        // 修改坐标轴标签，只显示 -5 和 5
        const axisLabels = [-5, 5];
        coordSystem.addAxisLabels(axisLabels, axisLabels);

        // 添加所有点和标签
        points.forEach(point => {
            // 为每个点计算合适的标签偏移量
            const offset = this.getLabelOffset(point);
            // 确保每个点都被添加到坐标系统中
            coordSystem.addPoint(
                point.x, 
                point.y, 
                "●", // 点的符号
                point.label, // 点的标签 (P, Q, R, S)
                offset.x, 
                offset.y, 
                point.color // 使用点的指定颜色
            );
            
            // 调试输出
            console.log(`Adding point ${point.label} at (${point.x}, ${point.y}) with color ${point.color}`);
        });

        return coordSystem;
    }

    private generateAnswers(points: Point[]): { correctAnswer: string; wrongAnswers: string[] } {
        if (this.difficulty === 5) {
            // 根据问题类型找出正确的点
            const targetPoint = points.find(p => {
                switch (this.questionType) {
                    case 'x坐標為正數':
                        return p.x > 0;
                    case 'x坐標為負數':
                        return p.x < 0;
                    case 'y坐標為正數':
                        return p.y > 0;
                    case 'y坐標為負數':
                        return p.y < 0;
                    default:
                        return false;
                }
            });

            if (!targetPoint) {
                throw new Error(`找不到满足${this.questionType}的点`);
            }

            const correctAnswer = targetPoint.label;
            const wrongAnswers = points
                .filter(p => p.label !== correctAnswer)
                .map(p => p.label);

            return { correctAnswer, wrongAnswers };
        } else if (this.difficulty === 4) {
            // 根据目标位置找出正确的点
            const targetPoint = points.find(p => {
                switch (this.targetPosition) {
                    case '在 x 軸上': return p.y === 0 && p.x !== 0;
                    case '在 y 軸上': return p.x === 0 && p.y !== 0;
                    case '在原點': return p.x === 0 && p.y === 0;
                    default: return false;
                }
            });

            if (!targetPoint) {
                throw new Error(`找不到${this.targetPosition}的点`);
            }

            const correctAnswer = targetPoint.label;
            const wrongAnswers = points
                .filter(p => p.label !== correctAnswer)
                .map(p => p.label);

            return { correctAnswer, wrongAnswers };
        } else if (this.difficulty === 3) {
            // 根据目标象限找出正确的点
            const targetPoint = points.find(p => {
                switch (this.targetQuadrant) {
                    case 1: return p.x > 0 && p.y > 0;
                    case 2: return p.x < 0 && p.y > 0;
                    case 3: return p.x < 0 && p.y < 0;
                    case 4: return p.x > 0 && p.y < 0;
                    default: return false;
                }
            });

            // 添加空值检查
            if (!targetPoint) {
                throw new Error(`找不到在第${this.targetQuadrant}象限的点`);
            }

            const correctAnswer = targetPoint.label;
            const wrongAnswers = points
                .filter(p => p.label !== correctAnswer)
                .map(p => p.label);
            return { correctAnswer, wrongAnswers };
        } else {
            let correctAnswer: string;
            let possibleAnswers: string[];

            if (points[0].x === 0 && points[0].y === 0) {
                correctAnswer = '在原點';
                possibleAnswers = ['第一象限', '第二象限', '第三象限', '第四象限', '在 x 軸上', '在 y 軸上', '在原點'];
            } else if (points[0].x === 0) {
                correctAnswer = '在 y 軸上';
                possibleAnswers = ['第一象限', '第二象限', '第三象限', '第四象限', '在 x 軸上', '在 y 軸上'];
            } else if (points[0].y === 0) {
                correctAnswer = '在 x 軸上';
                possibleAnswers = ['第一象限', '第二象限', '第三象限', '第四象限', '在 x 軸上', '在 y 軸上'];
            } else if (points[0].x > 0 && points[0].y > 0) {
                correctAnswer = '第一象限';
                possibleAnswers = ['第一象限', '第二象限', '第三象限', '第四象限'];
            } else if (points[0].x < 0 && points[0].y > 0) {
                correctAnswer = '第二象限';
                possibleAnswers = ['第一象限', '第二象限', '第三象限', '第四象限'];
            } else if (points[0].x < 0 && points[0].y < 0) {
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
    }

    private generateExplanation(points: Point[]): string {
        if (this.difficulty === 5) {
            // 找到正确答案的点
            const correctPoint = points.find(p => {
                switch (this.questionType) {
                    case 'x坐標為正數': return p.x > 0;
                    case 'x坐標為負數': return p.x < 0;
                    case 'y坐標為正數': return p.y > 0;
                    case 'y坐標為負數': return p.y < 0;
                    default: return false;
                }
            })!;

            // 创建主要的坐标系统
            const mainSystem = CoordinateSystem.createExplanationSystem({
                width: 400,
                height: 400,
                xRange: [-5, 5] as [number, number],
                yRange: [-5, 5] as [number, number],
                point: correctPoint,
                showGrid: true,
                showAllGrids: true,
                axisLabels: [-5, 5],
                showGridLines: true,
                showAxisNumbers: true,
                showAxisTicks: false
            });

            // 添加所有点
            points.forEach(point => {
                const offset = this.getLabelOffset(point);
                mainSystem.addPoint(point.x, point.y, "●", point.label, offset.x, offset.y, point.color);
            });

            // 创建演示坐标系统
            const demoSystem = new CoordinateSystem({
                width: 400,
                height: 400,
                xRange: [-6, 6],
                yRange: [-6, 6],
                showGrid: true,
                gridColor: '#e0e0e0',
                gridOpacity: 0.8,
                showAllGrids: true,
                axisColor: '#333',
                axisWidth: 1.5,
                showArrows: true,
                labelColor: '#666',
                labelSize: 16
            });

            // 添加 y > x² 的区域
            demoSystem.addLinearConstraint(
                (x: number) => x * x,  // 函数 f(x) = x²
                0,                     // y-截距
                true,                  // y > x²
                'rgba(255, 0, 0, 0.2)' // 半透明红色
            );

            // 添加网格线（-5 到 5）
            for (let i = -5; i <= 5; i++) {
                // 垂直线
                demoSystem.addLineSegment(i, -5, i, 5, '#e0e0e0', 'solid');
                // 水平线
                demoSystem.addLineSegment(-5, i, 5, i, '#e0e0e0', 'solid');
            }

            // 生成解释文本
            let explanation = `點 $${correctPoint.label}(${correctPoint.x}, ${correctPoint.y})$ 的位置判斷：\n\n`;
            switch (this.questionType) {
                case 'x坐標為正數':
                    explanation += `因為點 $${correctPoint.label}$ 的 $x$ 座標為 $${correctPoint.x} > 0$，所以點 $${correctPoint.label}$ 的 x 座標為正數。`;
                    break;
                case 'x坐標為負數':
                    explanation += `因為點 $${correctPoint.label}$ 的 $x$ 座標為 $${correctPoint.x} < 0$，所以點 $${correctPoint.label}$ 的 x 座標為負數。`;
                    break;
                case 'y坐標為正數':
                    explanation += `因為點 $${correctPoint.label}$ 的 $y$ 座標為 $${correctPoint.y} > 0$，所以點 $${correctPoint.label}$ 的 y 座標為正數。`;
                    break;
                case 'y坐標為負數':
                    explanation += `因為點 $${correctPoint.label}$ 的 $y$ 座標為 $${correctPoint.y} < 0$，所以點 $${correctPoint.label}$ 的 y 座標為負數。`;
                    break;
            }

            // 添加区域说明
            let regionExplanation = '';
            switch (this.questionType) {
                case 'x坐標為正數':
                    regionExplanation = '紅色區域表示 x > 0 的部分';
                    break;
                case 'x坐標為負數':
                    regionExplanation = '紅色區域表示 x < 0 的部分';
                    break;
                case 'y坐標為正數':
                    regionExplanation = '紅色區域表示 y > 0 的部分';
                    break;
                case 'y坐標為負數':
                    regionExplanation = '紅色區域表示 y < 0 的部分';
                    break;
            }

            return `
${explanation}\n
<div style="display: flex; justify-content: space-around; align-items: center;">
    <div style="text-align: center;">
        ${mainSystem.toString()}
        <p>座標平面上的點</p>
    </div>
    <div style="text-align: center;">
        ${demoSystem.toString()}
        <p>${regionExplanation}</p>
    </div>
</div>
            `.trim();
        }

        const system = CoordinateSystem.createExplanationSystem({
            width: 400,
            height: 400,
            xRange: [-5, 5] as [number, number],
            yRange: [-5, 5] as [number, number],
            point: points[0],
            showGrid: true,
            showAllGrids: true,
            axisLabels: [-5, 5],
            showGridLines: true,
            showAxisNumbers: true,
            showAxisTicks: false
        });

        // 添加所有点和标签
        if (this.difficulty === 3 || this.difficulty === 4) {
            points.forEach(point => {
                system.addPoint(point.x, point.y, "●", point.label, 0.3, 0.3, point.color);
            });
        } else {
            const offset = this.getLabelOffset(points[0]);
            system.addPoint(points[0].x, points[0].y, "●", points[0].label, offset.x, offset.y, points[0].color);
        }

        // 使用更大的 Unicode 字符
        system.addText(3, 3, "Ⅰ", "##FFD700", 48);     // 第一象限
        system.addText(-3, 3, "Ⅱ", "##FFD700", 48);    // 第二象限
        system.addText(-3, -3, "Ⅲ", "##FFD700", 48);   // 第三象限
        system.addText(3, -3, "Ⅳ", "##FFD700", 48);    // 第四象限

        // 添加坐标轴标签和原点标记
        if (this.difficulty === 2 || this.difficulty === 4) {
            system.addLineSegment(0, -5, 0, 5, "#0000FF", "solid", 3);  // 蓝色y轴
            system.addText(1.3, 4.5, "y-axis", "#0000FF", 24);  // y轴标签
            system.addLineSegment(-5, 0, 5, 0, "#FF0000", "solid", 3);  // 红色x轴
            system.addText(4.5, -0.7, "x-axis", "#FF0000", 24); // x轴标签
            system.addPoint(0, 0, "●", "", 0, 0, "#800080");  // 添加紫色原点
            system.addText(0.5, 0.5, "O", "#800080", 24);    // 紫色原点标记
        }

        let explanation = '';
        
        if (this.difficulty === 4) {
            // 找到正确答案的点
            const correctPoint = points.find(p => {
                switch (this.targetPosition) {
                    case '在 x 軸上': return p.y === 0 && p.x !== 0;
                    case '在 y 軸上': return p.x === 0 && p.y !== 0;
                    case '在原點': return p.x === 0 && p.y === 0;
                    default: return false;
                }
            })!;

            explanation = `點 $${correctPoint.label}(${correctPoint.x}, ${correctPoint.y})$ 的位置判斷：\n\n`;
            
            switch (this.targetPosition) {
                case '在 x 軸上':
                    explanation += `因為點 $${correctPoint.label}$ 的 $y$ 座標為 $0$，且 $x$ 座標不為 $0$，所以點 $${correctPoint.label}$ 在 x 軸上。`;
                    break;
                case '在 y 軸上':
                    explanation += `因為點 $${correctPoint.label}$ 的 $x$ 座標為 $0$，且 $y$ 座標不為 $0$，所以點 $${correctPoint.label}$ 在 y 軸上。`;
                    break;
                case '在原點':
                    explanation += `因為點 $${correctPoint.label}$ 的 $x$ 座標和 $y$ 座標都為 $0$，所以點 $${correctPoint.label}$ 在原點。`;
                    break;
            }
        } else {
            let position: string;
            if (points[0].x === 0 && points[0].y === 0) {
                position = '在原點';
            } else if (points[0].x === 0) {
                position = '在 y 軸上';
            } else if (points[0].y === 0) {
                position = '在 x 軸上';
            } else if (points[0].x > 0 && points[0].y > 0) {
                position = '第一象限';
            } else if (points[0].x < 0 && points[0].y > 0) {
                position = '第二象限';
            } else if (points[0].x < 0 && points[0].y < 0) {
                position = '第三象限';
            } else {
                position = '第四象限';
            }

            explanation = `點 $${points[0].label}(${points[0].x}, ${points[0].y})$ 的位置判斷：\n\n`;
            
            if (points[0].x === 0 && points[0].y === 0) {
                explanation += `因為 $x = 0$ 且 $y = 0$，所以點 $${points[0].label}$ 在原點。`;
            } else if (points[0].x === 0) {
                explanation += `因為 $x = 0$，所以點 $${points[0].label}$ 在 y 軸上。`;
            } else if (points[0].y === 0) {
                explanation += `因為 $y = 0$，所以點 $${points[0].label}$ 在 x 軸上。`;
            } else {
                explanation += `因為 $x ${points[0].x > 0 ? '> 0' : '< 0'}$ 且 $y ${points[0].y > 0 ? '> 0' : '< 0'}$，\n所以點 $${points[0].label}$ 在${position}。`;
            }
        }

        return `
${explanation}\n
<div style="text-align: center;">\n${system.toString()}\n</div>
        `.trim();
    }

    private getLabelOffset(point: Point): { x: number; y: number } {
        const offsetDistance = 0.3; // 减小偏移距离，使标签更靠近点

        if (point.x === 0 && point.y === 0) {
            return { x: offsetDistance, y: -offsetDistance };  // 原点时标签放在右上
        }

        if (point.x === 0) {
            return { x: offsetDistance, y: 0 };  // y轴上时标签放在右边
        }

        if (point.y === 0) {
            return { x: 0, y: offsetDistance };  // x轴上时标签放在上方
        }

        // 根据象限决定标签位置
        if (point.x > 0 && point.y > 0) {
            return { x: offsetDistance, y: -offsetDistance };  // 第一象限
        }
        if (point.x < 0 && point.y > 0) {
            return { x: -offsetDistance, y: -offsetDistance };  // 第二象限
        }
        if (point.x < 0 && point.y < 0) {
            return { x: -offsetDistance, y: offsetDistance };  // 第三象限
        }
        return { x: offsetDistance, y: offsetDistance };  // 第四象限
    }

    private convertToChineseNumber(num: number): string {
        const chineseNumbers = ['一', '二', '三', '四'];
        return chineseNumbers[num - 1];
    }

    private getRandomNonZeroInt(min: number, max: number): number {
        let result;
        do {
            result = getRandomInt(min, max);
        } while (result === 0);
        return result;
    }

    private getDistinctRegions(questionType: string): string[] {
        switch (questionType) {
            case 'x坐標為正數':
                return ['negative_x', 'zero_x', 'zero_x'];
            case 'x坐標為負數':
                return ['positive_x', 'zero_x', 'zero_x'];
            case 'y坐標為正數':
                return ['negative_y', 'zero_y', 'zero_y'];
            case 'y坐標為負數':
                return ['positive_y', 'zero_y', 'zero_y'];
            default:
                throw new Error('Invalid question type');
        }
    }

    private generateWrongPoint(
        questionType: string,
        label: string,
        color: string,
        existingPoints: Point[],
        region: string
    ): Point {
        let x: number, y: number;
        
        switch (questionType) {
            case 'x坐標為正數':
                if (region === 'negative_x') {
                    x = getRandomInt(-5, -1);
                    y = getRandomInt(-5, 5);
                } else { // zero_x
                    x = 0;
                    y = getRandomInt(-5, 5);
                }
                break;
            case 'x坐標為負數':
                if (region === 'positive_x') {
                    x = getRandomInt(1, 5);
                    y = getRandomInt(-5, 5);
                } else { // zero_x
                    x = 0;
                    y = getRandomInt(-5, 5);
                }
                break;
            case 'y坐標為正數':
                if (region === 'negative_y') {
                    x = getRandomInt(-5, 5);
                    y = getRandomInt(-5, -1);
                } else { // zero_y
                    x = getRandomInt(-5, 5);
                    y = 0;
                }
                break;
            case 'y坐標為負數':
                if (region === 'positive_y') {
                    x = getRandomInt(-5, 5);
                    y = getRandomInt(1, 5);
                } else { // zero_y
                    x = getRandomInt(-5, 5);
                    y = 0;
                }
                break;
            default:
                throw new Error('Invalid question type');
        }

        return { x, y, label, color };
    }
} 