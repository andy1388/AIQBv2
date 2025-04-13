import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import {
    getRandomInt,
    getRandomDecimal,
    getNonZeroRandomInt
} from '@/utils/mathUtils';
import { CoordinateSystem } from '@/utils/coordinates';

interface Point {
    x: number;
    y: number;
}

export default class F1L10_1_Q1_F_MQ extends QuestionGenerator {
    constructor(difficulty: number) {
        super(difficulty, 'F1L10.1_Q1_F_MQ');
    }

    generate(): IGeneratorOutput {
        // 生成坐标点
        const point = this.generatePoint(this.difficulty);

        // 定义显示范围
        const range: [number, number] = this.difficulty === 3 ? [-1, 6] : [-6, 6];
        
        // 根据难度级别设置不同的标签
        let axisLabels;
        if (this.difficulty === 1 || this.difficulty === 2) {
            // level 1-2 显示所有标签，包括 0
            axisLabels = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];
        } else if (this.difficulty === 3) {
            // level 3 显示 0-5
            axisLabels = [0, 1, 2, 3, 4, 5];
        } else {
            // level 4-5 显示除了 0 以外的所有标签
            axisLabels = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5];
        }

        // 如果是 level 1，只顯示 x 軸的坐標系
        if (this.difficulty === 1) {
            // 問題的坐標系
            const coordSystem = new CoordinateSystem({
                width: 400,
                height: 200,
                xRange: range,
                yRange: [-1, 1],
                showGrid: false,
                axisColor: '#333',
                axisWidth: 1.5,
                showArrows: true,
                labelColor: '#666',
                labelSize: 14,
                showYAxis: false
            });

            // 添加 x 軸標籤
            coordSystem.addAxisLabels(axisLabels, []);

            // 添加刻度短線（所有整數位置）
            for (let x = range[0]; x <= range[1]; x++) {
                if (x !== 5 && x !== -6 && x !== 6) {  // 跳過 5 位置（箭頭處）以及 -6 和 6 位置
                    coordSystem.addLineSegment(x, -0.1, x, 0.1, "black", "solid");
                }
            }

            // 只添加点和标签
            coordSystem.addPoint(point.x, 0, "●", "", 0, 0, "#00cc00");  // 点不带标签
            coordSystem.addText(point.x, 0.4, "A", "#00cc00");  // 标签在上方

            // 解釋用的坐標系
            const explainSystem = new CoordinateSystem({
                width: 400,
                height: 200,
                xRange: range,
                yRange: [-1, 1],
                showGrid: false,
                axisColor: '#333',
                axisWidth: 1.5,
                showArrows: true,
                labelColor: '#666',
                labelSize: 14,
                showYAxis: false
            });

            // 添加 x 軸標籤
            explainSystem.addAxisLabels(axisLabels, []);

            // 添加刻度短線（除了 5 位置）
            for (const x of axisLabels) {
                if (x !== 5 && x !== -6 && x !== 6) {  // 跳過 5 位置（箭頭處）以及 -6 和 6 位置
                    explainSystem.addLineSegment(x, -0.1, x, 0.1, "black", "solid");
                }
            }

            // 在解釋中添加點、紅色線段和箭头
            explainSystem.addPoint(point.x, 0, "●", "", 0, 0, "#00cc00");  // 点不带标签
            explainSystem.addText(point.x, 0.4, "A", "#00cc00");  // 标签在上方
            explainSystem.addLineSegment(0, 0, point.x, 0, "red", "solid");

            // 添加红色箭头
            if (point.x !== 0) {
                const arrowSize = 0.2;
                if (point.x > 0) {
                    explainSystem.addLineSegment(point.x, 0, point.x - arrowSize, arrowSize, "red", "solid");
                    explainSystem.addLineSegment(point.x, 0, point.x - arrowSize, -arrowSize, "red", "solid");
                } else {
                    explainSystem.addLineSegment(point.x, 0, point.x + arrowSize, arrowSize, "red", "solid");
                    explainSystem.addLineSegment(point.x, 0, point.x + arrowSize, -arrowSize, "red", "solid");
                }
            }

            // 添加坐标值标签（调整位置避免与箭头重叠）
            explainSystem.addTextWithBackground(point.x, -0.8, `${point.x}`, "red", 18);

            return {
                content: `在下面的數線上，請寫出點 $A$ 的 $x$ 坐標。\n${coordSystem.toString()}`,
                correctAnswer: `$${point.x}$`,
                wrongAnswers: this.generateWrongAnswersForLevelOne(point.x).map(ans => `$${ans}$`),
                explanation: this.generateExplanation(point),
                type: 'text',
                displayOptions: {
                    graph: true
                }
            };
        }

        // 如果是 level 2，只顯示 y 軸的坐標系
        if (this.difficulty === 2) {
            // 問題的坐標系
            const coordSystem = new CoordinateSystem({
                width: 200,  // y 軸系統用較窄的寬度
                height: 400,
                xRange: [-1, 1],
                yRange: range,
                showGrid: false,
                axisColor: '#333',
                axisWidth: 1.5,
                showArrows: true,
                labelColor: '#666',
                labelSize: 14,
                showXAxis: false
            });

            // 添加 y 軸標籤
            coordSystem.addAxisLabels([], axisLabels);

            // 添加刻度短線（除了 5 位置）
            for (const y of axisLabels) {
                if (y !== 5) {  // 跳過 5 位置（箭頭處）
                    coordSystem.addLineSegment(-0.1, y, 0.1, y, "black", "solid");
                }
            }

            // 只添加点和标签
            coordSystem.addPoint(0, point.y, "●", "", 0, 0, "#00cc00");  // 点不带标签
            coordSystem.addText(0.4, point.y, "A", "#00cc00");  // 标签在右边

            // 解釋用的坐標系
            const explainSystem = new CoordinateSystem({
                width: 200,
                height: 400,
                xRange: [-1, 1],
                yRange: range,
                showGrid: false,
                axisColor: '#333',
                axisWidth: 1.5,
                showArrows: true,
                labelColor: '#666',
                labelSize: 14,
                showXAxis: false
            });

            // 添加 y 軸標籤
            explainSystem.addAxisLabels([], axisLabels);

            // 添加刻度短線（除了 5 位置）
            for (const y of axisLabels) {
                if (y !== 5) {  // 跳過 5 位置（箭頭處）
                    explainSystem.addLineSegment(-0.1, y, 0.1, y, "black", "solid");
                }
            }

            // 在解釋中添加点和标签
            explainSystem.addPoint(0, point.y, "●", "", 0, 0, "#00cc00");  // 点不带标签
            explainSystem.addText(0.4, point.y, "A", "#00cc00");  // 标签在右边
            explainSystem.addLineSegment(0, 0, 0, point.y, "blue", "solid");

            // 添加箭头
            if (point.y !== 0) {
                const arrowSize = 0.2;
                if (point.y > 0) {
                    explainSystem.addLineSegment(0, point.y, arrowSize, point.y - arrowSize, "blue", "solid");
                    explainSystem.addLineSegment(0, point.y, -arrowSize, point.y - arrowSize, "blue", "solid");
                } else {
                    explainSystem.addLineSegment(0, point.y, arrowSize, point.y + arrowSize, "blue", "solid");
                    explainSystem.addLineSegment(0, point.y, -arrowSize, point.y + arrowSize, "blue", "solid");
                }
            }

            // 添加坐标值标签
            explainSystem.addTextWithBackground(-1.2, point.y, `${point.y}`, "blue", 18);

            return {
                content: `在下面的數線上，請寫出點 $A$ 的 $y$ 坐標。<br>\n${coordSystem.toString()}`,
                correctAnswer: `$${point.y}$`,
                wrongAnswers: this.generateWrongAnswersForLevelTwo(point.y).map(ans => `$${ans}$`),
                explanation: this.generateExplanation(point),
                type: 'text',
                displayOptions: {
                    graph: true
                }
            };
        }

        // 根據點的位置決定標籤的偏移量
        const offset = this.getLabelOffset(point);

        // 使用修改后的 CoordinateSystem
        const coordSystem = new CoordinateSystem({
            width: 400,
            height: 400,
            xRange: range,
            yRange: range,
            showGrid: true,
            gridColor: '#e0e0e0',
            gridOpacity: 0.8,
            axisColor: '#333',
            axisWidth: 1.5,
            showArrows: true,
            labelColor: '#666',
            labelSize: 14,
            showAllGrids: this.difficulty !== 3  // 这里控制是否显示负象限的网格
        });

        // 添加坐標軸上的數字標籤
        coordSystem.addAxisLabels(axisLabels, axisLabels);

        // 添加点和标签，使用動態的偏移量
        coordSystem.addPoint(point.x, point.y, "●", "", offset.x, offset.y, "#00cc00");
        coordSystem.addText(point.x + offset.x/20, point.y + offset.y/20, "A", "#00cc00");

        // 生成第一步的坐标系（顯示找 x 坐標的輔助線）
        const step1System = new CoordinateSystem({
            width: 400,
            height: 400,
            xRange: range,
            yRange: range,
            showGrid: true,
            gridColor: '#e0e0e0',
            gridOpacity: 0.8,
            axisColor: '#333',
            axisWidth: 1.5,
            showArrows: true,
            labelColor: '#666',
            labelSize: 14,
            showAllGrids: this.difficulty !== 3
        });

        // 添加坐標軸標籤
        step1System.addAxisLabels(axisLabels, axisLabels);
        
        // 添加點 A
        step1System.addPoint(point.x, point.y, "●", "", offset.x, offset.y, "#00cc00");
        
        // 添加垂直輔助線（綠色虛線）
        step1System.addLineSegment(point.x, 0, point.x, point.y, "green", "dotted");
        
        // 在 x 軸上添加紅色線段，從原點到 x 坐標
        step1System.addLineSegment(0, 0, point.x, 0, "red", "solid");
        
        // 添加红色箭头
        if (point.x !== 0) {
            const arrowSize = 0.2;
            if (point.x > 0) {
                step1System.addLineSegment(point.x, 0, point.x - arrowSize, arrowSize, "red", "solid");
                step1System.addLineSegment(point.x, 0, point.x - arrowSize, -arrowSize, "red", "solid");
            } else {
                step1System.addLineSegment(point.x, 0, point.x + arrowSize, arrowSize, "red", "solid");
                step1System.addLineSegment(point.x, 0, point.x + arrowSize, -arrowSize, "red", "solid");
            }
        }

        // 添加 x 坐标值标签
        step1System.addTextWithBackground(point.x, -0.8, `${point.x}`, "red", 24);

        // 生成第二步的坐标系（顯示找 y 坐標的輔助線）
        const step2System = new CoordinateSystem({
            width: 400,
            height: 400,
            xRange: range,
            yRange: range,
            showGrid: true,
            gridColor: '#e0e0e0',
            gridOpacity: 0.8,
            axisColor: '#333',
            axisWidth: 1.5,
            showArrows: true,
            labelColor: '#666',
            labelSize: 14,
            showAllGrids: this.difficulty !== 3
        });

        // 添加坐標軸標籤
        step2System.addAxisLabels(axisLabels, axisLabels);

        // 添加點 A
        step2System.addPoint(point.x, point.y, "●", "", offset.x, offset.y, "#00cc00");
        
        // 第二步：保留第一步的红色线段和箭头
        step2System.addLineSegment(0, 0, point.x, 0, "red", "solid");

        // 保留红色箭头
        if (point.x !== 0) {
            const arrowSize = 0.2;
            if (point.x > 0) {
                step2System.addLineSegment(point.x, 0, point.x - arrowSize, arrowSize, "red", "solid");
                step2System.addLineSegment(point.x, 0, point.x - arrowSize, -arrowSize, "red", "solid");
            } else {
                step2System.addLineSegment(point.x, 0, point.x + arrowSize, arrowSize, "red", "solid");
                step2System.addLineSegment(point.x, 0, point.x + arrowSize, -arrowSize, "red", "solid");
            }
        }

        // 添加水平輔助線（綠色虛線）
        step2System.addLineSegment(0, point.y, point.x, point.y, "green", "dotted");

        // 添加从 x 坐标点到目标点的蓝色线段和箭头
        if (point.y !== 0) {
            step2System.addLineSegment(point.x, 0, point.x, point.y, "blue", "solid");
            const arrowSize = 0.2;
            if (point.y > 0) {
                step2System.addLineSegment(point.x, point.y, point.x + arrowSize, point.y - arrowSize, "blue", "solid");
                step2System.addLineSegment(point.x, point.y, point.x - arrowSize, point.y - arrowSize, "blue", "solid");
            } else {
                step2System.addLineSegment(point.x, point.y, point.x + arrowSize, point.y + arrowSize, "blue", "solid");
                step2System.addLineSegment(point.x, point.y, point.x - arrowSize, point.y + arrowSize, "blue", "solid");
            }
        }

        // 添加坐标值标签
        step2System.addTextWithBackground(point.x, -0.8, `${point.x}`, "red", 24);
        step2System.addTextWithBackground(-1.2, point.y, `${point.y}`, "blue", 24);

        return {
            content: `在下面的坐標系中，請寫出點 $A$ 的坐標。\n${coordSystem.toString()}`,
            correctAnswer: `$(${point.x}, ${point.y})$`,
            wrongAnswers: this.generateWrongAnswers(point).map(ans => `$${ans}$`),
            explanation: this.generateExplanation(point),
            type: 'text',
            displayOptions: {
                graph: true
            }
        };
    }

    private generatePoint(level: number): Point {
        switch (level) {
            case 1: // 最基礎：只有 x 軸
                return {
                    x: getRandomInt(-5, 5),
                    y: 0
                };
            case 2: // 基礎：只有 y 軸
                return {
                    x: 0,
                    y: getRandomInt(-5, 5)
                };
            case 3: // 基礎坐标（第一象限整数）
                return {
                    x: getRandomInt(0, 5),  // 修改为从0到5之间的随机整数
                    y: getRandomInt(0, 5)   // 修改为从0到5之间的随机整数
                };
            case 4: // 擴展坐标（四象限整数）
                return {
                    x: getRandomInt(-5, 5),
                    y: getRandomInt(-5, 5)
                };
            case 5: // 進階坐标（四象限小数）
                return {
                    x: Number(getRandomDecimal(-5, 5, 1)),
                    y: Number(getRandomDecimal(-5, 5, 1))
                };
            default:
                throw new Error("Invalid level");
        }
    }

    private generateWrongAnswers(point: Point): string[] {
        const wrongAnswers: string[] = [];
        const isDecimal = this.difficulty === 5;
        
        while (wrongAnswers.length < 3) {
            let wrongX = isDecimal ? 
                Number(getRandomDecimal(-5, 5, 1)) :
                getNonZeroRandomInt(-5, 5);
            let wrongY = isDecimal ?
                Number(getRandomDecimal(-5, 5, 1)) :
                getNonZeroRandomInt(-5, 5);
            
            const wrongAnswer = `(${wrongX}, ${wrongY})`;
            if (!wrongAnswers.includes(wrongAnswer) && 
                wrongAnswer !== `(${point.x}, ${point.y})`) {
                wrongAnswers.push(wrongAnswer);
            }
        }
        
        return wrongAnswers;
    }

    // 修改标签位置逻辑
    private getLabelOffset(point: Point): { x: number; y: number } {
        const offsetDistance = 15;  // 保持原有的偏移距离

        // 点在 x 轴上
        if (point.y === 0) {
            return { x: 0, y: offsetDistance };  // 正下方
        }

        // 点在 y 轴上
        if (point.x === 0) {
            return { x: offsetDistance, y: 0 };   // 正右方
        }

        // 第一象限
        if (point.x > 0 && point.y > 0) {
            return { x: offsetDistance, y: offsetDistance };  // 右下
        }

        // 第二象限
        if (point.x < 0 && point.y > 0) {
            return { x: -offsetDistance, y: offsetDistance };  // 左下
        }

        // 第三象限
        if (point.x < 0 && point.y < 0) {
            return { x: -offsetDistance, y: -offsetDistance };  // 左上
        }

        // 第四象限
        if (point.x > 0 && point.y < 0) {
            return { x: offsetDistance, y: -offsetDistance };  // 右上
        }

        // 默认情况（不应该发生）
        return { x: offsetDistance, y: offsetDistance };
    }

    // 為 level 1 生成錯誤答案
    private generateWrongAnswersForLevelOne(x: number): string[] {
        const wrongAnswers: string[] = [];
        while (wrongAnswers.length < 3) {
            const wrongX = getRandomInt(-5, 5);  // 修改範圍為 -5 到 5
            if (wrongX !== x && !wrongAnswers.includes(`${wrongX}`)) {
                wrongAnswers.push(`${wrongX}`);
            }
        }
        return wrongAnswers;
    }

    // 為 level 2 生成錯誤答案
    private generateWrongAnswersForLevelTwo(y: number): string[] {
        const wrongAnswers: string[] = [];
        while (wrongAnswers.length < 3) {
            const wrongY = getRandomInt(-5, 5);
            if (wrongY !== y && !wrongAnswers.includes(`${wrongY}`)) {
                wrongAnswers.push(`${wrongY}`);
            }
        }
        return wrongAnswers;
    }

    private generateExplanation(point: Point): string {
        if (this.difficulty === 1) {
            // x轴系统
            const system = CoordinateSystem.createExplanationSystem({
                width: 400,
                height: 200,  // 减小高度
                xRange: [-5, 5] as [number, number],
                yRange: [-1, 1] as [number, number],
                point: point,
                isXAxisOnly: true,  // 只显示x轴
                axisLabels: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5],
                showGridLines: false,
                showAxisNumbers: true
            });

            // 先添加点和标签
            system.addPoint(point.x, 0, "●", "", 0, 0, "#00cc00");  // 点不带标签
            system.addText(point.x, 0.4, "A", "#00cc00");  // 标签在上方

            // 然后添加辅助线
            system.addCoordinateLocatingGuides(point, 1, true, false);

            return `
找出 $x$ 坐標：從點 $A$ 向下引一條垂直虛線，交 $x$ 軸於 <span style="color: red">$${point.x}$</span>
<div style="text-align: center;">
${system.toString()}
</div>

因此，點 $A$ 的 $x$ 坐標為 <span style="color: red">$${point.x}$</span>
            `.trim();
        }

        if (this.difficulty === 2) {
            // y轴系统
            const system = CoordinateSystem.createExplanationSystem({
                width: 200,  // 减小宽度
                height: 400,
                xRange: [-1, 1] as [number, number],
                yRange: [-5, 5] as [number, number],
                point: point,
                isYAxisOnly: true,  // 只显示y轴
                axisLabels: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5],
                showGridLines: false,
                showAxisNumbers: true
            });

            // 先添加点和标签
            system.addPoint(0, point.y, "●", "", 0, 0, "#00cc00");  // 点不带标签
            system.addText(0.4, point.y, "A", "#00cc00");  // 标签在右边

            // 然后添加辅助线
            system.addCoordinateLocatingGuides(point, 1, false, true);

            return `
找出 $y$ 坐標：從點 $A$ 向左引一條水平虛線，交 $y$ 軸於 <span style="color: blue">$${point.y}$</span>
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
            showGridLines: true,
            showAxisNumbers: true
        });

        // 先添加点和标签
        const offset = this.getLabelOffset(point);
        step1System.addPoint(point.x, point.y, "●", "", offset.x, offset.y, "#00cc00");
        step1System.addText(point.x + offset.x/20, point.y + offset.y/20, "A", "#00cc00");

        // 然后添加辅助线
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
            showGridLines: true,
            showAxisNumbers: true
        });

        // 先添加点和标签
        step2System.addPoint(point.x, point.y, "●", "", offset.x, offset.y, "#00cc00");
        step2System.addText(point.x + offset.x/20, point.y + offset.y/20, "A", "#00cc00");

        // 然后添加辅助线
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
} 