import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import {
    getRandomInt,
    getRandomDecimal,
    shuffleArray
} from '@/utils/mathUtils';
import { CoordinateSystem } from '@/utils/coordinates';

interface Point {
    x: number;
    y: number;
}

export default class F1L10_1_Q3_F_MQ extends QuestionGenerator {
    constructor(difficulty: number) {
        super(difficulty, 'F1L10.1_Q3_F_MQ');
    }

    generate(): IGeneratorOutput {
        // 生成正确的点
        const point = this.generatePoint(this.difficulty);
        
        // 生成错误的点
        const wrongPoints = this.generateWrongPoints(point);
        
        // 生成所有坐标平面的图形
        const allSystems = [
            this.generateCoordinateSystem(point, 'A'),
            ...wrongPoints.map((p, index) => 
                this.generateCoordinateSystem(p, 'A')
            )
        ];

        // 根据难度级别生成不同的问题内容
        let content;
        if (this.difficulty === 1) {
            content = `在下列哪一個數線中，點 $A$ 的 $x$ 座標是 $${point.x}$？`;
        } else if (this.difficulty === 2) {
            content = `在下列哪一個數線中，點 $A$ 的 $y$ 座標是 $${point.y}$？`;
        } else {
            content = `在下列哪一個坐標平面中，點 $A$ 的位置是正確的？點 $A$ 的坐標為 $(${point.x}, ${point.y})$`;
        }

        return {
            content,
            correctAnswer: allSystems[0],
            wrongAnswers: allSystems.slice(1),
            explanation: this.generateExplanation(point),
            type: 'text',
            displayOptions: {
                graph: true
            }
        };
    }

    private generatePoint(level: number): Point {
        switch (level) {
            case 1: // x 轴上的点
                return {
                    x: getRandomInt(-5, 5),
                    y: 0  // 固定在 x 轴上
                };
            
            case 2: // y 轴上的点
                return {
                    x: 0,  // 固定在 y 轴上
                    y: getRandomInt(-5, 5)
                };
            
            case 3: // 第一象限
                return {
                    x: getRandomInt(0, 5),  // 包含 0
                    y: getRandomInt(0, 5)   // 包含 0
                };
            
            case 4: // 任意象限（整数）
                const quadrant = getRandomInt(1, 4);
                const x = getRandomInt(0, 5);  // 包含 0
                const y = getRandomInt(0, 5);  // 包含 0
                
                switch (quadrant) {
                    case 1: return { x, y };
                    case 2: return { x: -x, y };
                    case 3: return { x: -x, y: -y };
                    case 4: return { x, y: -y };
                    default: return { x, y };
                }
            
            case 5: // 任意象限（小数）
                const decQuadrant = getRandomInt(1, 4);
                const decX = Number(getRandomDecimal(0, 5, 1));  // 包含 0
                const decY = Number(getRandomDecimal(0, 5, 1));  // 包含 0
                
                switch (decQuadrant) {
                    case 1: return { x: decX, y: decY };
                    case 2: return { x: -decX, y: decY };
                    case 3: return { x: -decX, y: -decY };
                    case 4: return { x: decX, y: -decY };
                    default: return { x: decX, y: decY };
                }
            
            default:
                throw new Error("Invalid level");
        }
    }

    private generateWrongPoints(correctPoint: Point): Point[] {
        const wrongPoints: Point[] = [];
        const usedPoints = new Set<string>();  // 用来追踪已使用的点
        
        // 添加正确点到已使用集合
        usedPoints.add(`${correctPoint.x},${correctPoint.y}`);
        
        const addUniquePoint = (point: Point): boolean => {
            const key = `${point.x},${point.y}`;
            if (!usedPoints.has(key)) {
                usedPoints.add(key);
                wrongPoints.push(point);
                return true;
            }
            return false;
        };

        switch (this.difficulty) {
            case 1: // x 轴上的点
                addUniquePoint({ x: -correctPoint.x, y: 0 });  // 对称点
                while (wrongPoints.length < 3) {
                    const newX = getRandomInt(-5, 5);
                    if (addUniquePoint({ x: newX, y: 0 })) continue;
                }
                break;
            
            case 2: // y 轴上的点
                addUniquePoint({ x: 0, y: -correctPoint.y });  // 对称点
                while (wrongPoints.length < 3) {
                    const newY = getRandomInt(-5, 5);
                    if (addUniquePoint({ x: 0, y: newY })) continue;
                }
                break;
            
            case 3: // 第一象限
                // 尝试添加交换 x 和 y 的点
                addUniquePoint({ x: correctPoint.y, y: correctPoint.x });
                
                // 添加其他随机点直到有3个错误点
                while (wrongPoints.length < 3) {
                    const newX = getRandomInt(0, 5);
                    const newY = getRandomInt(0, 5);
                    addUniquePoint({ x: newX, y: newY });
                }
                break;
            
            case 4: // 任意象限（整数）
            case 5: // 任意象限（小数）
                const isLevel5 = this.difficulty === 5;
                const getCoord = isLevel5 ? 
                    () => Number(getRandomDecimal(0, 5, 1)) : 
                    () => getRandomInt(0, 5);

                while (wrongPoints.length < 3) {
                    const x = getCoord();
                    const y = getCoord();
                    const quadrant = getRandomInt(1, 4);
                    
                    const point = {
                        x: quadrant === 2 || quadrant === 3 ? -x : x,
                        y: quadrant === 3 || quadrant === 4 ? -y : y
                    };
                    
                    addUniquePoint(point);
                }
                break;
        }
        
        return wrongPoints;
    }

    private generateCoordinateSystem(point: Point, label: string): string {
        if (this.difficulty === 1) {
            const coordSystem = new CoordinateSystem({
                width: 400,
                height: 150,
                xRange: [-5, 5],
                yRange: [-2, 2],
                showGrid: false,
                axisColor: '#333',
                axisWidth: 1.5,
                showArrows: true,
                labelColor: '#666',
                labelSize: 14,
                showYAxis: false
            });

            // 1. 添加所有刻度线
            for (let x = -5; x <= 5; x++) {
                if (x !== 5) {
                    coordSystem.addLineSegment(x, -0.2, x, 0.2, "black", "solid");
                }
            }

            // 2. 只添加 -5、0、5 的标签
            const mainLabels = [-5, 0, 5];
            mainLabels.forEach(x => {
                coordSystem.addText(x, -0.6, `${x}`);
            });

            // 只添加点，不添加箭头和标签
            coordSystem.addPoint(point.x, 0, "●", "A", 15, 40, "#00cc00");

            return coordSystem.toString();
        } else if (this.difficulty === 2) {
            const coordSystem = new CoordinateSystem({
                width: 150,
                height: 400,
                xRange: [-2, 2],
                yRange: [-5, 5],
                showGrid: false,
                axisColor: '#333',
                axisWidth: 1.5,
                showArrows: true,
                labelColor: '#666',
                labelSize: 14,
                showXAxis: false
            });

            // 1. 添加所有刻度线
            for (let y = -5; y <= 5; y++) {
                if (y !== 5) {
                    coordSystem.addLineSegment(-0.2, y, 0.2, y, "black", "solid");
                }
            }

            // 2. 只添加 -5、0、5 的标签
            const mainLabels = [-5, 0, 5];
            mainLabels.forEach(y => {
                coordSystem.addText(-0.8, y, `${y}`);
            });

            // 只添加点，不添加箭头和标签
            coordSystem.addPoint(0, point.y, "●", "A", -40, 0, "#00cc00");

            return coordSystem.toString();
        }

        if (this.difficulty === 3) {
            // 只显示第一象限
            const coordSystem = new CoordinateSystem({
                width: 200,
                height: 200,
                xRange: [0, 5],  // 只显示正 x 轴部分
                yRange: [0, 5],  // 只显示正 y 轴部分
                showGrid: true,
                gridColor: '#e0e0e0',
                gridOpacity: 0.8,
                axisColor: '#333',
                axisWidth: 1.5,
                showArrows: true,
                labelColor: '#666',
                labelSize: 14
            });

            // 只添加 0 和 5 的标签
            const axisLabels = [0, 5];
            coordSystem.addAxisLabels(axisLabels, axisLabels);

            // 添加点
            coordSystem.addPoint(point.x, point.y, "●", "A", 15, -20, "#00cc00");

            return coordSystem.toString();
        }

        // 难度 4-5 的完整坐标系配置
        const coordSystem = new CoordinateSystem({
            width: 200,  // 减小尺寸以适应选项框
            height: 200,
            xRange: [-5, 5],
            yRange: [-5, 5],
            showGrid: true,
            gridColor: '#e0e0e0',
            gridOpacity: 0.8,
            axisColor: '#333',
            axisWidth: 1.5,
            showArrows: true,
            labelColor: '#666',
            labelSize: 14,
            showAllGrids: true  // 显示所有象限的网格
        });

        // 添加坐标轴标签
        const axisLabels = [-5, 5];
        coordSystem.addAxisLabels(axisLabels, axisLabels);

        // 添加刻度线（每个整数位置）
        for (let i = -5; i <= 5; i++) {
            if (i !== 0) {  // 跳过原点
                // 添加 x 轴刻度线
                coordSystem.addLineSegment(i, -0.2, i, 0.2, "#333", "solid");
                // 添加 y 轴刻度线
                coordSystem.addLineSegment(-0.2, i, 0.2, i, "#333", "solid");
            }
        }

        // 添加点
        coordSystem.addPoint(point.x, point.y, "●", "A", 15, -20, "#00cc00");

        return coordSystem.toString();
    }

    private generateExplanation(point: Point): string {
        if (this.difficulty === 1) {
            const system = CoordinateSystem.createExplanationSystem({
                width: 400,
                height: 200,
                xRange: [-5, 5] as [number, number],
                yRange: [-1, 1] as [number, number],
                point: point,
                isXAxisOnly: true,
                axisLabels: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5],
                showGridLines: false,  // 不显示网格
                showAxisNumbers: true  // 显示数字
            });

            // 添加点和标签
            system.addPoint(point.x, 0, "●", "", 0, 0, "#00cc00");  // 点不带标签
            system.addText(point.x, 0.4, "A", "#00cc00");  // 标签在上方

            system.addCoordinateLocatingGuides(point, 1, true, false);

            return `
正確答案顯示的數線中，點 $A$ 的 $x$ 坐標為 <span style="color: red">$${point.x}$</span>

<div style="text-align: center;">
${system.toString()}
</div>

因此，點 $A$ 的 $x$ 坐標為 <span style="color: red">$${point.x}$</span>
            `.trim();
        }

        if (this.difficulty === 2) {
            const system = CoordinateSystem.createExplanationSystem({
                width: 200,
                height: 400,
                xRange: [-1, 1] as [number, number],
                yRange: [-5, 5] as [number, number],
                point: point,
                isYAxisOnly: true,
                axisLabels: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5],
                showGridLines: false,  // 不显示网格
                showAxisNumbers: true  // 显示数字
            });

            // 添加点和标签
            system.addPoint(0, point.y, "●", "", 0, 0, "#00cc00");  // 点不带标签
            system.addText(0.4, point.y, "A", "#00cc00");  // 标签在右边

            system.addCoordinateLocatingGuides(point, 1, false, true);

            return `
正確答案顯示的數線中，點 $A$ 的 $y$ 坐標為 <span style="color: blue">$${point.y}$</span>

<div style="text-align: center;">
${system.toString()}
</div>

因此，點 $A$ 的 $y$ 坐標為 <span style="color: blue">$${point.y}$</span>
            `.trim();
        }

        // 完整坐标系的处理（难度3-5）
        const step1System = CoordinateSystem.createExplanationSystem({
            width: 400,
            height: 400,
            xRange: [-5, 5] as [number, number],
            yRange: [-5, 5] as [number, number],
            point: point,
            showGrid: true,
            showAllGrids: true,
            axisLabels: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5],
            showGridLines: true,    // 显示网格
            showAxisNumbers: true   // 显示数字
        });

        // 添加点和标签
        step1System.addPoint(point.x, point.y, "●", "", 0, 0, "#00cc00");  // 点不带标签
        step1System.addText(point.x + 0.3, point.y + 0.3, "A", "#00cc00");  // 标签位置根据需要调整

        step1System.addCoordinateLocatingGuides(point, 1);

        const step2System = CoordinateSystem.createExplanationSystem({
            width: 400,
            height: 400,
            xRange: [-5, 5] as [number, number],
            yRange: [-5, 5] as [number, number],
            point: point,
            showGrid: true,
            showAllGrids: true,
            axisLabels: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5],
            showGridLines: true,    // 显示网格
            showAxisNumbers: true   // 显示数字
        });

        // 添加点和标签
        step2System.addPoint(point.x, point.y, "●", "", 0, 0, "#00cc00");  // 点不带标签
        step2System.addText(point.x + 0.3, point.y + 0.3, "A", "#00cc00");  // 标签位置根据需要调整

        step2System.addCoordinateLocatingGuides(point, 2);

        return `
正確答案顯示的坐標平面中，點 $A$ 的位置為 $($<span style="color: red">${point.x}</span>$,$ <span style="color: blue">${point.y}</span>$)$
<br>
【第一步】找出 $x$ 坐標：從點 $A$ 向下引一條垂直虛線（綠色），交 $x$ 軸於 <span style="color: red">$${point.x}$</span>
<div style="text-align: center;">
${step1System.toString()}
</div>

【第二步】找出 $y$ 坐標：從點 $A$ 向左引一條水平虛線（綠色），交 $y$ 軸於 <span style="color: blue">$${point.y}$</span>
<div style="text-align: center;">
${step2System.toString()}
</div>

因此，點 $A$ 的坐標為 $($<span style="color: red">${point.x}</span>$,$ <span style="color: blue">${point.y}</span>$)$
        `.trim();
    }

    private getQuadrantName(point: Point): string {
        if (point.x > 0 && point.y > 0) return "第一象限";
        if (point.x < 0 && point.y > 0) return "第二象限";
        if (point.x < 0 && point.y < 0) return "第三象限";
        if (point.x > 0 && point.y < 0) return "第四象限";
        if (point.x === 0 && point.y === 0) return "原點";
        if (point.x === 0) return "y 軸上";
        if (point.y === 0) return "x 軸上";
        return "坐標平面上";
    }
} 