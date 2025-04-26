import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import { getRandomInt } from '@/utils/mathUtils';

// 定義題目所需的接口
interface PointsToCircleData {
    points: {x: number, y: number}[];  // 給定的點
    centerX: number;     // 圓心 x 坐標
    centerY: number;     // 圓心 y 坐標
    radius: number;      // 半徑
    equation: string;    // 圓的方程式
    equationType: 'standard' | 'general'; // 方程類型
    problemType: 'diameter' | 'three_points' | 'right_triangle'; // 題目類型
}

export default class PointsToCircleEquationGenerator extends QuestionGenerator {
    // 定義常量和配置
    private readonly COORDINATE_RANGE = {
        EASY: { MIN: 1, MAX: 7 },       // 難度1的坐標範圍
        MEDIUM: { MIN: -8, MAX: 8 },    // 難度2的坐標範圍
        HARD: { MIN: -10, MAX: 10 }     // 難度3和4的坐標範圍
    };

    // 預設問題類型 - 使用確保半徑為整數的點對
    private readonly PREDEFINED_PROBLEMS = {
        // 直徑端點 (選擇半徑為整數的點對)
        DIAMETER_EASY: [
            {points: [{x: 3, y: 1}, {x: 7, y: 5}]}, // 半徑為√8 = 2√2，整數半徑值為2√2
            {points: [{x: 1, y: 3}, {x: 7, y: 5}]}, // 半徑為√16+1 = √17
            {points: [{x: 2, y: 4}, {x: 6, y: 8}]}  // 半徑為√16+4 = √20 = 2√5，整數半徑值為2√5
        ],
        DIAMETER_MEDIUM: [
            {points: [{x: 3, y: 3}, {x: -3, y: -3}]}, // 半徑為3√2，整數半徑值為3√2
            {points: [{x: -4, y: 0}, {x: 4, y: 0}]},  // 半徑為4，整數半徑值為4
            {points: [{x: 0, y: -5}, {x: 0, y: 5}]}   // 半徑為5，整數半徑值為5
        ],
        // 符合畢達哥拉斯三元組的三點，確保形成直角三角形且半徑為整數
        THREE_POINTS: [
            {points: [{x: 0, y: 0}, {x: 8, y: 0}, {x: 0, y: 6}]},   // 半徑為5，整數半徑值為5
            {points: [{x: 0, y: 0}, {x: 5, y: 0}, {x: 0, y: 12}]},  // 半徑為6.5，整數半徑值為13/2
            {points: [{x: 0, y: 0}, {x: 12, y: 0}, {x: 0, y: 5}]}   // 半徑為6.5，整數半徑值為13/2
        ],
        // 直角三角形問題 (3-4-5, 5-12-13, 等畢達哥拉斯三元組)
        RIGHT_TRIANGLE: [
            {points: [{x: 0, y: 0}, {x: 8, y: 0}, {x: 0, y: 6}]},   // 3-4-5直角三角形的比例，半徑為5
            {points: [{x: 0, y: 0}, {x: 5, y: 12}, {x: 5, y: 0}]},  // 5-12-13直角三角形，半徑為6.5
            {points: [{x: 0, y: 0}, {x: 7, y: 24}, {x: 7, y: 0}]}   // 7-24-25直角三角形，半徑為12.5
        ]
    };

    constructor(difficulty: number = 1) {
        // 設置難度和題目ID
        super(difficulty, 'F5L7.1_Q4_F_MQ');
    }

    // 主要生成方法
    generate(): IGeneratorOutput {
        // 生成題目組合
        const pointsData = this.generateValidCombination();
        
        // 構建問題文本
        const questionText = this.generateQuestionText(pointsData);
        
        // 格式化正確答案
        const correctAnswer = this.formatAnswer(pointsData);
        
        // 生成錯誤答案
        const wrongAnswers = this.generateWrongAnswers(pointsData);
        
        // 生成解釋
        const explanation = this.generateExplanation(pointsData);

        return {
            content: questionText,
            correctAnswer: correctAnswer,
            wrongAnswers: wrongAnswers,
            explanation: explanation,
            type: 'text',
            displayOptions: {
                latex: true
            }
        };
    }

    // 將式子包裝為LaTeX格式
    private wrapWithLatex(equation: string): string {
        return `\\(${equation}\\)`;
    }

    // 生成有效組合的方法
    private generateValidCombination(): PointsToCircleData {
        switch (this.difficulty) {
            case 1:
                return this.generateLevel2Combination();
            case 2:
                return this.generateLevel1Combination();
            case 3:
                return this.generateLevel3Combination();
            case 4:
                return this.generateLevel4Combination();
            default:
                return this.generateLevel2Combination();
        }
    }

    // 難度1（現在是原難度2）：從直徑端點求圓方程（複雜整數坐標，可能含負數）
    private generateLevel1Combination(): PointsToCircleData {
        // 從預設問題中隨機選擇一個
        const randomProblem = this.getRandomElement(this.PREDEFINED_PROBLEMS.DIAMETER_MEDIUM);
        const pointA = randomProblem.points[0];
        const pointB = randomProblem.points[1];
        
        // 計算圓心（直徑中點）
        const centerX = (pointA.x + pointB.x) / 2;
        const centerY = (pointA.y + pointB.y) / 2;
        
        // 計算半徑（中點到端點的距離）
        const radius = Math.sqrt(
            Math.pow(centerX - pointA.x, 2) + Math.pow(centerY - pointA.y, 2)
        );
        
        // 生成標準形式或一般形式的圓方程
        const equation = this.generateCircleEquation(centerX, centerY, radius);
        
        return {
            points: [pointA, pointB],
            centerX,
            centerY,
            radius,
            equation,
            equationType: Math.random() > 0.5 ? 'standard' : 'general',
            problemType: 'diameter'
        };
    }

    // 難度2：已知圓的直徑端點，求圓方程，使用較複雜的整數坐標
    private generateLevel2Combination(): PointsToCircleData {
        // 生成兩個端點作為直徑
        const pointA = {
            x: getRandomInt(this.COORDINATE_RANGE.MEDIUM.MIN, this.COORDINATE_RANGE.MEDIUM.MAX),
            y: getRandomInt(this.COORDINATE_RANGE.MEDIUM.MIN, this.COORDINATE_RANGE.MEDIUM.MAX)
        };
        
        const pointB = {
            x: getRandomInt(this.COORDINATE_RANGE.MEDIUM.MIN, this.COORDINATE_RANGE.MEDIUM.MAX),
            y: getRandomInt(this.COORDINATE_RANGE.MEDIUM.MIN, this.COORDINATE_RANGE.MEDIUM.MAX)
        };
        
        // 確保兩點不重合
        while (pointA.x === pointB.x && pointA.y === pointB.y) {
            pointB.x = getRandomInt(this.COORDINATE_RANGE.MEDIUM.MIN, this.COORDINATE_RANGE.MEDIUM.MAX);
            pointB.y = getRandomInt(this.COORDINATE_RANGE.MEDIUM.MIN, this.COORDINATE_RANGE.MEDIUM.MAX);
        }
        
        // 先計算直徑的中點作為基準點
        const baseX = (pointA.x + pointB.x) / 2;
        const baseY = (pointA.y + pointB.y) / 2;
        
        // 添加隨機整數偏移（-3到3之間）
        let offsetX = getRandomInt(-3, 3);
        let offsetY = getRandomInt(-3, 3);
        
        // 確保至少有一個偏移不為0，避免圓心與直徑中點相同
        if (offsetX === 0 && offsetY === 0) {
            const randomOffset = getRandomInt(1, 3) * (Math.random() < 0.5 ? -1 : 1);
            if (Math.random() < 0.5) {
                offsetX = randomOffset;
            } else {
                offsetY = randomOffset;
            }
        }
        
        // 圓心為基準點加上偏移
        const centerX = baseX + offsetX;
        const centerY = baseY + offsetY;
        
        // 確保圓心不是(0,0)
        if (centerX === 0 && centerY === 0) {
            return this.generateLevel2Combination();
        }
        
        // 半徑等於圓心到任一點的距離
        const radius = Math.sqrt(
            Math.pow(centerX - pointA.x, 2) + Math.pow(centerY - pointA.y, 2)
        );
        
        // 生成圓方程
        const equationType = Math.random() < 0.5 ? 'standard' : 'general';
        const equation = this.generateCircleEquation(centerX, centerY, radius, equationType);
        
        return {
            points: [pointA, pointB],
            centerX,
            centerY,
            radius,
            equation,
            equationType,
            problemType: 'diameter'
        };
    }

    // 難度3：從三點求圓方程
    private generateLevel3Combination(): PointsToCircleData {
        // 從預設問題中隨機選擇一個
        const randomProblem = this.getRandomElement(this.PREDEFINED_PROBLEMS.THREE_POINTS);
        const points = randomProblem.points;
        
        // 使用三點求圓心和半徑
        const {centerX, centerY, radius} = this.calculateCircleFromThreePoints(points);
        
        // 生成圓方程
        const equation = this.generateCircleEquation(centerX, centerY, radius);
        
        return {
            points,
            centerX,
            centerY,
            radius,
            equation,
            equationType: Math.random() > 0.5 ? 'standard' : 'general',
            problemType: 'three_points'
        };
    }

    // 難度4：先證明三角形是直角三角形，再求圓方程
    private generateLevel4Combination(): PointsToCircleData {
        // 從預設問題中隨機選擇一個
        const randomProblem = this.getRandomElement(this.PREDEFINED_PROBLEMS.RIGHT_TRIANGLE);
        const points = randomProblem.points;
        
        // 使用三點求圓心和半徑
        const {centerX, centerY, radius} = this.calculateCircleFromThreePoints(points);
        
        // 生成圓方程
        const equation = this.generateCircleEquation(centerX, centerY, radius);
        
        return {
            points,
            centerX,
            centerY,
            radius,
            equation,
            equationType: Math.random() > 0.5 ? 'standard' : 'general',
            problemType: 'right_triangle'
        };
    }

    // 從三點計算圓心和半徑
    private calculateCircleFromThreePoints(points: {x: number, y: number}[]): {centerX: number, centerY: number, radius: number} {
        const [A, B, C] = points;
        
        // 使用行列式方法求圓心
        // | x^2 + y^2, x, y, 1 |
        // | A.x^2 + A.y^2, A.x, A.y, 1 |
        // | B.x^2 + B.y^2, B.x, B.y, 1 |
        // | C.x^2 + C.y^2, C.x, C.y, 1 |
        
        // 簡化計算，使用三個點的垂直平分線交點求圓心
        const x1 = A.x, y1 = A.y;
        const x2 = B.x, y2 = B.y;
        const x3 = C.x, y3 = C.y;
        
        const a = 2 * (x2 - x1);
        const b = 2 * (y2 - y1);
        const c = x2*x2 + y2*y2 - x1*x1 - y1*y1;
        
        const d = 2 * (x3 - x2);
        const e = 2 * (y3 - y2);
        const f = x3*x3 + y3*y3 - x2*x2 - y2*y2;
        
        const centerX = (c*e - f*b) / (a*e - b*d);
        const centerY = (a*f - c*d) / (a*e - b*d);
        
        // 計算半徑（圓心到任一點的距離）
        const radius = Math.sqrt(
            Math.pow(centerX - x1, 2) + Math.pow(centerY - y1, 2)
        );
        
        return {centerX, centerY, radius};
    }

    // 生成圓方程
    private generateCircleEquation(centerX: number, centerY: number, radius: number, type: 'standard' | 'general' = 'standard'): string {
        // 處理半徑平方，確保是整數
        const radiusSquared = Math.round(radius * radius);
        
        if (type === 'standard') {
            // 標準形式：(x-h)^2 + (y-k)^2 = r^2
            let xTerm = centerX === 0 ? 'x^2' : `(x${centerX > 0 ? '-' + centerX : '+' + Math.abs(centerX)})^2`;
            let yTerm = centerY === 0 ? 'y^2' : `(y${centerY > 0 ? '-' + centerY : '+' + Math.abs(centerY)})^2`;
            return `${xTerm} + ${yTerm} = ${radiusSquared}`;
        } else {
            // 一般形式：x^2 + y^2 + 2gx + 2fy + c = 0
            const g = -centerX;
            const f = -centerY;
            const c = Math.round(centerX*centerX + centerY*centerY - radiusSquared);
            
            let equation = 'x^2 + y^2';
            
            if (g !== 0) {
                equation += g > 0 ? ` + ${g*2}x` : ` - ${Math.abs(g*2)}x`;
            }
            
            if (f !== 0) {
                equation += f > 0 ? ` + ${f*2}y` : ` - ${Math.abs(f*2)}y`;
            }
            
            if (c !== 0) {
                equation += c > 0 ? ` + ${c}` : ` - ${Math.abs(c)}`;
            }
            
            return equation + ' = 0';
        }
    }

    // 生成問題文本
    private generateQuestionText(data: PointsToCircleData): string {
        let questionText = '';
        
        const pointLabels = ['A', 'B', 'C'];
        const pointsText = data.points.map((p, i) => `${pointLabels[i]}(${p.x}, ${p.y})`).join(' 和 ');
        
        if (data.problemType === 'diameter') {
            // 如果是難度2，提法需要修改，因為圓心不再是直徑中點
            if (this.difficulty === 2) {
                questionText = `已知圓通過點 ${data.points.map((p, i) => `${pointLabels[i]}(${p.x}, ${p.y})`).join(' 和 ')}，且圓心在 (${data.centerX}, ${data.centerY})，求此圓的方程。`;
            } else {
                questionText = `如果 ${pointsText} 是圓的直徑端點，求此圓的方程。`;
            }
        } else if (data.problemType === 'three_points') {
            questionText = `求過點 ${pointsText} 的圓方程。`;
        } else if (data.problemType === 'right_triangle') {
            const [A, B, C] = data.points.map((p, i) => `${pointLabels[i]}(${p.x}, ${p.y})`);
            questionText = `已知點 ${A}、${B} 和 ${C}。<br><br>a) 證明 △ABC 是直角三角形。<br>b) 求過這三點的圓方程。`;
        }
        
        return questionText;
    }

    // 格式化答案
    private formatAnswer(data: PointsToCircleData): string {
        return this.wrapWithLatex(data.equation);
    }

    // 生成錯誤答案
    private generateWrongAnswers(data: PointsToCircleData): string[] {
        const wrongAnswers: string[] = [];
        
        // 錯誤1：圓心坐標符號錯誤
        const centerXWrong = -data.centerX;
        const centerYWrong = data.centerY;
        wrongAnswers.push(this.wrapWithLatex(this.generateCircleEquation(centerXWrong, centerYWrong, data.radius)));
        
        // 錯誤2：圓心y值符號錯誤
        const centerXWrong2 = data.centerX;
        const centerYWrong2 = -data.centerY;
        wrongAnswers.push(this.wrapWithLatex(this.generateCircleEquation(centerXWrong2, centerYWrong2, data.radius)));
        
        // 錯誤3：半徑計算錯誤（如果計算出直徑而非半徑）
        const radiusWrong = data.radius * 2;
        wrongAnswers.push(this.wrapWithLatex(this.generateCircleEquation(data.centerX, data.centerY, radiusWrong)));
        
        return wrongAnswers;
    }

    // 生成解釋
    private generateExplanation(data: PointsToCircleData): string {
        let explanation = `解題步驟：<br><br>`;
        
        const pointLabels = ['A', 'B', 'C'];
        const pointsText = data.points.map((p, i) => `${pointLabels[i]}(${p.x}, ${p.y})`);
        
        // 計算半徑平方，確保是整數
        const radiusSquared = Math.round(data.radius * data.radius);
        
        if (data.problemType === 'diameter') {
            // 調整難度2的解釋
            if (this.difficulty === 2) {
                explanation += `1. 給定圓通過點 ${pointsText[0]} 和 ${pointsText[1]}，且圓心在 (${data.centerX}, ${data.centerY})。<br><br>`;
                
                // 顯示半徑計算
                if (Number.isInteger(data.radius)) {
                    explanation += `2. 圓的半徑等於圓心到任一給定點的距離：<br>`;
                    explanation += `   ${this.wrapWithLatex(`r = \\sqrt{(${data.centerX} - ${data.points[0].x})^2 + (${data.centerY} - ${data.points[0].y})^2} = ${data.radius}`)}<br><br>`;
                } else {
                    explanation += `2. 圓的半徑等於圓心到任一給定點的距離：<br>`;
                    explanation += `   ${this.wrapWithLatex(`r = \\sqrt{(${data.centerX} - ${data.points[0].x})^2 + (${data.centerY} - ${data.points[0].y})^2} = \\sqrt{${radiusSquared}}`)}<br><br>`;
                }
                
                if (data.equationType === 'standard') {
                    explanation += `3. 將圓心坐標和半徑代入圓的標準方程 ${this.wrapWithLatex(`(x-h)^2 + (y-k)^2 = r^2`)}：<br>`;
                    explanation += `   ${this.wrapWithLatex(`(x-${data.centerX})^2 + (y-${data.centerY})^2 = ${radiusSquared}`)}<br><br>`;
                    
                    explanation += `4. 整理得到最終圓方程：<br>`;
                    explanation += `   ${this.wrapWithLatex(data.equation)}<br>`;
                } else {
                    explanation += `3. 將圓心坐標和半徑代入圓的一般方程 ${this.wrapWithLatex(`x^2 + y^2 + 2gx + 2fy + c = 0`)}，其中 ${this.wrapWithLatex(`g = -h, f = -k, c = h^2 + k^2 - r^2`)}：<br>`;
                    explanation += `   ${this.wrapWithLatex(`g = -${data.centerX}, f = -${data.centerY}, c = ${data.centerX}^2 + ${data.centerY}^2 - ${radiusSquared} = ${Math.round(data.centerX*data.centerX + data.centerY*data.centerY - radiusSquared)}`)}<br><br>`;
                    
                    explanation += `4. 整理得到最終圓方程：<br>`;
                    explanation += `   ${this.wrapWithLatex(data.equation)}<br>`;
                }
            } else {
                explanation += `1. 給定兩點 ${pointsText[0]} 和 ${pointsText[1]} 是圓的直徑端點。<br><br>`;
                explanation += `2. 根據圓的性質，直徑的中點就是圓心。因此圓心坐標為：<br>`;
                explanation += `   ${this.wrapWithLatex(`(h, k) = (\\frac{${data.points[0].x} + ${data.points[1].x}}{2}, \\frac{${data.points[0].y} + ${data.points[1].y}}{2}) = (${data.centerX}, ${data.centerY})`)}<br><br>`;
                
                // 顯示半徑計算
                if (Number.isInteger(data.radius)) {
                    explanation += `3. 圓的半徑等於圓心到直徑端點的距離：<br>`;
                    explanation += `   ${this.wrapWithLatex(`r = \\sqrt{(${data.centerX} - ${data.points[0].x})^2 + (${data.centerY} - ${data.points[0].y})^2} = ${data.radius}`)}<br><br>`;
                } else {
                    explanation += `3. 圓的半徑等於圓心到直徑端點的距離：<br>`;
                    explanation += `   ${this.wrapWithLatex(`r = \\sqrt{(${data.centerX} - ${data.points[0].x})^2 + (${data.centerY} - ${data.points[0].y})^2} = \\sqrt{${radiusSquared}}`)}<br><br>`;
                }
                
                if (data.equationType === 'standard') {
                    explanation += `4. 將圓心坐標和半徑代入圓的標準方程 ${this.wrapWithLatex(`(x-h)^2 + (y-k)^2 = r^2`)}：<br>`;
                    explanation += `   ${this.wrapWithLatex(`(x-${data.centerX})^2 + (y-${data.centerY})^2 = ${radiusSquared}`)}<br><br>`;
                    
                    explanation += `5. 整理得到最終圓方程：<br>`;
                    explanation += `   ${this.wrapWithLatex(data.equation)}<br>`;
                } else {
                    explanation += `4. 將圓心坐標和半徑代入圓的一般方程 ${this.wrapWithLatex(`x^2 + y^2 + 2gx + 2fy + c = 0`)}，其中 ${this.wrapWithLatex(`g = -h, f = -k, c = h^2 + k^2 - r^2`)}：<br>`;
                    explanation += `   ${this.wrapWithLatex(`g = -${data.centerX}, f = -${data.centerY}, c = ${data.centerX}^2 + ${data.centerY}^2 - ${radiusSquared} = ${Math.round(data.centerX*data.centerX + data.centerY*data.centerY - radiusSquared)}`)}<br><br>`;
                    
                    explanation += `5. 整理得到最終圓方程：<br>`;
                    explanation += `   ${this.wrapWithLatex(data.equation)}<br>`;
                }
            }
        } else if (data.problemType === 'three_points') {
            explanation += `1. 給定三點 ${pointsText[0]}、${pointsText[1]} 和 ${pointsText[2]}。<br><br>`;
            
            explanation += `2. 求過這三點的圓，可以使用三點確定圓的方法。具體來說，我們利用圓心到這三點距離相等的性質。<br><br>`;
            
            explanation += `3. 設圓心為 (h, k)，則有：<br>`;
            explanation += `   ${this.wrapWithLatex(`(h - ${data.points[0].x})^2 + (k - ${data.points[0].y})^2 = (h - ${data.points[1].x})^2 + (k - ${data.points[1].y})^2`)}<br>`;
            explanation += `   ${this.wrapWithLatex(`(h - ${data.points[1].x})^2 + (k - ${data.points[1].y})^2 = (h - ${data.points[2].x})^2 + (k - ${data.points[2].y})^2`)}<br><br>`;
            
            explanation += `4. 展開並整理得到：<br>`;
            explanation += `   ${this.wrapWithLatex(`2h(${data.points[1].x} - ${data.points[0].x}) + 2k(${data.points[1].y} - ${data.points[0].y}) = ${data.points[1].x}^2 - ${data.points[0].x}^2 + ${data.points[1].y}^2 - ${data.points[0].y}^2`)}<br>`;
            explanation += `   ${this.wrapWithLatex(`2h(${data.points[2].x} - ${data.points[1].x}) + 2k(${data.points[2].y} - ${data.points[1].y}) = ${data.points[2].x}^2 - ${data.points[1].x}^2 + ${data.points[2].y}^2 - ${data.points[1].y}^2`)}<br><br>`;
            
            explanation += `5. 解這個方程組，得到圓心坐標：<br>`;
            explanation += `   ${this.wrapWithLatex(`(h, k) = (${data.centerX}, ${data.centerY})`)}<br><br>`;
            
            if (Number.isInteger(data.radius)) {
                explanation += `6. 圓的半徑等於圓心到任一給定點的距離：<br>`;
                explanation += `   ${this.wrapWithLatex(`r = \\sqrt{(${data.centerX} - ${data.points[0].x})^2 + (${data.centerY} - ${data.points[0].y})^2} = ${data.radius}`)}<br><br>`;
            } else {
                explanation += `6. 圓的半徑等於圓心到任一給定點的距離：<br>`;
                explanation += `   ${this.wrapWithLatex(`r = \\sqrt{(${data.centerX} - ${data.points[0].x})^2 + (${data.centerY} - ${data.points[0].y})^2} = \\sqrt{${radiusSquared}}`)}<br><br>`;
            }
            
            if (data.equationType === 'standard') {
                explanation += `7. 得到圓的標準方程：<br>`;
                explanation += `   ${this.wrapWithLatex(data.equation)}<br>`;
            } else {
                explanation += `7. 得到圓的一般方程：<br>`;
                explanation += `   ${this.wrapWithLatex(data.equation)}<br>`;
            }
        } else if (data.problemType === 'right_triangle') {
            const [A, B, C] = data.points;
            
            explanation += `(a) 證明 △ABC 是直角三角形：<br><br>`;
            
            // 計算三邊長度的平方
            const AB2 = Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2);
            const BC2 = Math.pow(C.x - B.x, 2) + Math.pow(C.y - B.y, 2);
            const AC2 = Math.pow(C.x - A.x, 2) + Math.pow(C.y - A.y, 2);
            
            // 找出最長邊和其他兩邊
            let max = Math.max(AB2, BC2, AC2);
            let sum = 0;
            let angle = '';
            if (max === AB2) {
                sum = BC2 + AC2;
                angle = 'C';
            } else if (max === BC2) {
                sum = AB2 + AC2;
                angle = 'A';
            } else {
                sum = AB2 + BC2;
                angle = 'B';
            }
            
            explanation += `1. 計算三邊長度的平方：<br>`;
            explanation += `   ${this.wrapWithLatex(`|AB|^2 = (${B.x} - ${A.x})^2 + (${B.y} - ${A.y})^2 = ${AB2}`)}<br>`;
            explanation += `   ${this.wrapWithLatex(`|BC|^2 = (${C.x} - ${B.x})^2 + (${C.y} - ${B.y})^2 = ${BC2}`)}<br>`;
            explanation += `   ${this.wrapWithLatex(`|AC|^2 = (${C.x} - ${A.x})^2 + (${C.y} - ${A.y})^2 = ${AC2}`)}<br><br>`;
            
            explanation += `2. 根據畢達哥拉斯定理，如果三角形是直角三角形，則兩短邊平方和等於斜邊平方：<br>`;
            explanation += `   ${this.wrapWithLatex(`${sum} = ${max}`)}<br><br>`;
            
            explanation += `3. 由於 ${this.wrapWithLatex(`${sum} = ${max}`)}，所以 △ABC 是直角三角形，直角在 ${angle} 點。<br><br>`;
            
            explanation += `(b) 求過這三點的圓方程：<br><br>`;
            
            explanation += `4. 由於 △ABC 是直角三角形，根據圓的性質，其外接圓的圓心是斜邊的中點。<br>`;
            
            // 確定斜邊及其端點
            let p1, p2;
            if (max === AB2) {
                p1 = A;
                p2 = B;
                explanation += `   斜邊是 AB，所以圓心是 AB 的中點。<br>`;
            } else if (max === BC2) {
                p1 = B;
                p2 = C;
                explanation += `   斜邊是 BC，所以圓心是 BC 的中點。<br>`;
            } else {
                p1 = A;
                p2 = C;
                explanation += `   斜邊是 AC，所以圓心是 AC 的中點。<br>`;
            }
            
            explanation += `5. 計算圓心坐標：<br>`;
            explanation += `   ${this.wrapWithLatex(`(h, k) = (\\frac{${p1.x} + ${p2.x}}{2}, \\frac{${p1.y} + ${p2.y}}{2}) = (${data.centerX}, ${data.centerY})`)}<br><br>`;
            
            if (Number.isInteger(data.radius)) {
                explanation += `6. 圓的半徑等於圓心到任一給定點的距離：<br>`;
                explanation += `   ${this.wrapWithLatex(`r = \\sqrt{(${data.centerX} - ${A.x})^2 + (${data.centerY} - ${A.y})^2} = ${data.radius}`)}<br><br>`;
            } else {
                explanation += `6. 圓的半徑等於圓心到任一給定點的距離：<br>`;
                explanation += `   ${this.wrapWithLatex(`r = \\sqrt{(${data.centerX} - ${A.x})^2 + (${data.centerY} - ${A.y})^2} = \\sqrt{${radiusSquared}}`)}<br><br>`;
            }
            
            if (data.equationType === 'standard') {
                explanation += `7. 得到圓的標準方程：<br>`;
                explanation += `   ${this.wrapWithLatex(data.equation)}<br>`;
            } else {
                explanation += `7. 得到圓的一般方程：<br>`;
                explanation += `   ${this.wrapWithLatex(data.equation)}<br>`;
            }
        }
        
        return explanation;
    }

    // 工具方法：隨機選擇數組元素
    private getRandomElement<T>(array: T[]): T {
        const randomIndex = getRandomInt(0, array.length - 1);
        return array[randomIndex];
    }
}