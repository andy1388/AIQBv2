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

export default class F1L10_1_Q2_F_MQ extends QuestionGenerator {
    constructor(difficulty: number) {
        super(difficulty, 'F1L10.1_Q2_F_MQ');
    }

    generate(): IGeneratorOutput {
        // 生成坐标点
        const point = this.generatePoint(this.difficulty);

        // 所有難度都使用相同的範圍
        const range: [number, number] = this.difficulty === 3 ? [0, 5] : [-5, 5];
        
        // 只顯示最小和最大值
        const axisLabels = this.difficulty === 3 
            ? [5]  // level 3 只顯示 5，不顯示0
            : [-5, 5];  // level 4-5 只顯示 -5 和 5，不顯示0

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

            // 修改：添加 0 到标签中
            const xAxisLabels = [-5, 0, 5];  // 添加 0
            
            // 添加 x 軸標籤（包含 0）
            coordSystem.addAxisLabels(xAxisLabels, []);

            // 添加刻度短線（所有整數位置）
            for (let x = range[0]; x <= range[1]; x++) {
                if (x !== 5) {  // 跳過 5 位置（箭頭處）
                    coordSystem.addLineSegment(x, -0.1, x, 0.1, "black", "solid");
                }
            }

            // 只添加點，不添加紅色線段和標籤
            coordSystem.addPoint(point.x, 0, "●", "A", 15, -20, "#00cc00");

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

            // 修改：添加 0 到标签中
            explainSystem.addAxisLabels(xAxisLabels, []);

            // 添加刻度短線（所有整數位置）
            for (let x = range[0]; x <= range[1]; x++) {
                if (x !== 5) {  // 跳過 5 位置（箭頭處）
                    explainSystem.addLineSegment(x, -0.1, x, 0.1, "black", "solid");
                }
            }

            // 在解釋中添加點、紅色線段和箭头
            explainSystem.addPoint(point.x, 0, "●", "A", 15, -20, "#00cc00");
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
                explanation: `
解答：<br>
1. 從點 $A$ 看到紅色線段的長度<br>
2. 從刻度可以看出 $x = $ <span style="color: red">${point.x}</span><br>

<div style="text-align: center;">
${explainSystem.toString()}
</div>

因此，點 $A$ 的 $x$ 坐標為 <span style="color: red">${point.x}</span>
                `.trim(),
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

            // 修改：添加 0 到标签中
            const yAxisLabels = [-5, 0, 5];  // 添加 0
            
            // 添加 y 軸標籤（包含 0）
            coordSystem.addAxisLabels([], yAxisLabels);

            // 添加刻度短線（所有整數位置）
            for (let y = range[0]; y <= range[1]; y++) {
                if (y !== 5) {  // 跳過 5 位置（箭頭處）
                    coordSystem.addLineSegment(-0.1, y, 0.1, y, "black", "solid");
                }
            }

            // 只添加點，不添加藍色線段和標籤
            coordSystem.addPoint(0, point.y, "●", "A", 15, -20, "#00cc00");

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

            // 修改：添加 0 到标签中
            explainSystem.addAxisLabels([], yAxisLabels);

            // 添加刻度短線（所有整數位置）
            for (let y = range[0]; y <= range[1]; y++) {
                if (y !== 5) {  // 跳過 5 位置（箭頭處）
                    explainSystem.addLineSegment(-0.1, y, 0.1, y, "black", "solid");
                }
            }

            // 在解釋中添加點、藍色線段和箭头
            explainSystem.addPoint(0, point.y, "●", "A", 15, -20, "#00cc00");
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
                explanation: `
解答：<br>
1. 從點 $A$ 看到藍色線段的長度<br>
2. 從刻度可以看出 $y = $ <span style="color: blue">${point.y}</span><br>

<div style="text-align: center;">
${explainSystem.toString()}
</div>

因此，點 $A$ 的 $y$ 坐標為 <span style="color: blue">${point.y}</span>
                `.trim(),
                type: 'text',
                displayOptions: {
                    graph: true
                }
            };
        }

        // 根據點的位置決定標籤的偏移量
        const labelOffset = this.getLabelOffset(point);

        // 生成坐标系图形
        const coordSystem = new CoordinateSystem({
            width: 400,
            height: 400,
            xRange: range as [number, number],
            yRange: range as [number, number],
            showGrid: true,
            gridColor: '#e0e0e0',
            gridOpacity: 0.8,
            axisColor: '#333',
            axisWidth: 1.5,
            showArrows: true,
            labelColor: '#666',
            labelSize: 14,
            showAllGrids: this.difficulty !== 3  // level 3 不顯示負象限的網格
        });

        // 添加坐標軸標籤（只有最小和最大值）
        coordSystem.addAxisLabels(axisLabels, axisLabels);

        // 添加点和标签，使用動態的偏移量
        coordSystem.addPoint(point.x, point.y, "●", "A", labelOffset.x, labelOffset.y, "#00cc00");

        // 生成第一步的坐标系（顯示找 x 坐標的輔助線）
        const step1System = new CoordinateSystem({
            width: 400,
            height: 400,
            xRange: this.difficulty === 3 ? [-1, 6] : range as [number, number],  // 只在 level 3 扩大范围
            yRange: this.difficulty === 3 ? [-1, 6] : range as [number, number],  // 只在 level 3 扩大范围
            showGrid: true,
            gridColor: '#e0e0e0',
            gridOpacity: 0.8,
            axisColor: '#333',
            axisWidth: 1.5,
            showArrows: true,
            labelColor: '#666',
            labelSize: 14,
            showAllGrids: true
        });

        // 添加坐標軸標籤
        step1System.addAxisLabels(axisLabels, axisLabels);
        
        // 添加點 A
        step1System.addPoint(point.x, point.y, "●", "A", labelOffset.x, labelOffset.y, "#00cc00");
        
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
            xRange: this.difficulty === 3 ? [-1, 6] : range as [number, number],  // 只在 level 3 扩大范围
            yRange: this.difficulty === 3 ? [-1, 6] : range as [number, number],  // 只在 level 3 扩大范围
            showGrid: true,
            gridColor: '#e0e0e0',
            gridOpacity: 0.8,
            axisColor: '#333',
            axisWidth: 1.5,
            showArrows: true,
            labelColor: '#666',
            labelSize: 14,
            showAllGrids: true
        });

        // 添加坐標軸標籤
        step2System.addAxisLabels(axisLabels, axisLabels);

        // 添加點 A
        step2System.addPoint(point.x, point.y, "●", "A", labelOffset.x, labelOffset.y, "#00cc00");
        
        // 保留第一步的红色线段和箭头
        step2System.addLineSegment(0, 0, point.x, 0, "red", "solid");
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
            explanation: `
【第一步：找 $x$ 坐標】<br>
1. 從點 $A$ 向下引一條垂直虛線（綠色）<br>
2. 這條線與 $x$ 軸的交點，就是 $x$ 坐標<br>
3. 從刻度可以看出 $x = $ <span style="color: red">${point.x}</span><br>

<div style="text-align: center;">
${step1System.toString()}
</div>

【第二步：找 $y$ 坐標】<br>
1. 從點 $A$ 向左引一條水平虛線（綠色）<br>
2. 這條線與 $y$ 軸的交點，就是 $y$ 坐標<br>
3. 從刻度可以看出 $y = $ <span style="color: blue">${point.y}</span><br>

<div style="text-align: center;">
${step2System.toString()}
</div>

因此，點 $A$ 的坐標為 $($<span style="color: red">${point.x}</span>$,$ <span style="color: blue">${point.y}</span>$)$
            `.trim(),
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
                    x: getRandomInt(0, 5),  // 只在第一象限
                    y: getRandomInt(0, 5)   // 只在第一象限
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

    private getLabelOffset(point: Point): { x: number; y: number } {
        let offsetX = 15;
        let offsetY = -20;

        if (point.x <= 0) {
            offsetX = -25;
        }

        if (point.y <= 0) {
            offsetY = 25;
        }

        return { x: offsetX, y: offsetY };
    }

    private generateWrongAnswersForLevelOne(x: number): string[] {
        const wrongAnswers: string[] = [];
        while (wrongAnswers.length < 3) {
            const wrongX = getRandomInt(-5, 5);
            if (wrongX !== x && !wrongAnswers.includes(`${wrongX}`)) {
                wrongAnswers.push(`${wrongX}`);
            }
        }
        return wrongAnswers;
    }

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
} 