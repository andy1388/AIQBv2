import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import { getRandomInt } from '@/utils/mathUtils';

// 定義題目所需的接口
interface CircleData {
    centerX: number;     // 圓心 x 坐標
    centerY: number;     // 圓心 y 坐標
    radius: number;      // 半徑
    passingPoint?: {     // 通過的點（難度4和5使用）
        x: number;
        y: number;
    };
    questionType: 'standard' | 'general' | 'parametric'; // 標準形式、一般形式或一段式形式
}

export default class CircleEquationGenerator extends QuestionGenerator {
    // 定義常量和配置
    private readonly COORDINATE_RANGE = {
        EASY: { MIN: 1, MAX: 5 },      // 難度1的坐標範圍
        MEDIUM: { MIN: -10, MAX: 10 }, // 難度2和3的坐標範圍
        HARD: { MIN: -15, MAX: 15 }    // 難度4的坐標範圍
    };

    private readonly RADIUS_RANGE = {
        EASY: { MIN: 2, MAX: 10 },     // 難度1的半徑範圍
        MEDIUM: { MIN: 3, MAX: 12 },   // 難度2和3的半徑範圍
    };

    constructor(difficulty: number = 1) {
        // 設置難度和題目ID
        super(difficulty, 'F5L7.1_Q1_F_MQ');
    }

    // 主要生成方法（實現抽象方法）
    generate(): IGeneratorOutput {
        // 生成題目組合
        const circleData = this.generateValidCombination();
        
        // 構建問題文本
        const questionText = this.generateQuestionText(circleData);
        
        // 格式化正確答案並包裝為LaTeX格式
        const correctAnswer = this.wrapWithLatex(this.formatEquation(circleData));
        
        // 生成錯誤答案並包裝為LaTeX格式
        const wrongAnswers = this.generateWrongAnswers(circleData).map(answer => this.wrapWithLatex(answer));
        
        // 生成解釋
        const explanation = this.generateExplanation(circleData);

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

    // 將方程式包裝為LaTeX格式
    private wrapWithLatex(equation: string): string {
        return `\\(${equation}\\)`;
    }

    // 生成有效組合的方法
    private generateValidCombination(): CircleData {
        switch (this.difficulty) {
            case 1:
                return this.generateLevel1Combination();
            case 2:
                return this.generateLevel2Combination();
            case 3:
                return this.generateLevel3Combination();
            case 4:
                return this.generateLevel4Combination();
            case 5:
                return this.generateLevel5Combination();
            default:
                return this.generateLevel1Combination();
        }
    }

    // 難度1：標準形式，非負整數坐標和半徑
    private generateLevel1Combination(): CircleData {
        const centerX = getRandomInt(this.COORDINATE_RANGE.EASY.MIN, this.COORDINATE_RANGE.EASY.MAX);
        const centerY = getRandomInt(this.COORDINATE_RANGE.EASY.MIN, this.COORDINATE_RANGE.EASY.MAX);
        const radius = getRandomInt(this.RADIUS_RANGE.EASY.MIN, this.RADIUS_RANGE.EASY.MAX);
        
        return {
            centerX,
            centerY,
            radius,
            questionType: 'standard'
        };
    }

    // 難度2：標準形式，正負整數坐標和正數半徑
    private generateLevel2Combination(): CircleData {
        const centerX = getRandomInt(this.COORDINATE_RANGE.MEDIUM.MIN, this.COORDINATE_RANGE.MEDIUM.MAX);
        const centerY = getRandomInt(this.COORDINATE_RANGE.MEDIUM.MIN, this.COORDINATE_RANGE.MEDIUM.MAX);
        const radius = getRandomInt(this.RADIUS_RANGE.MEDIUM.MIN, this.RADIUS_RANGE.MEDIUM.MAX);
        
        return {
            centerX,
            centerY,
            radius,
            questionType: 'standard'
        };
    }

    // 難度3：一般形式，正負整數坐標
    private generateLevel3Combination(): CircleData {
        const centerX = getRandomInt(this.COORDINATE_RANGE.MEDIUM.MIN, this.COORDINATE_RANGE.MEDIUM.MAX);
        const centerY = getRandomInt(this.COORDINATE_RANGE.MEDIUM.MIN, this.COORDINATE_RANGE.MEDIUM.MAX);
        const radius = getRandomInt(this.RADIUS_RANGE.MEDIUM.MIN, this.RADIUS_RANGE.MEDIUM.MAX);
        
        return {
            centerX,
            centerY,
            radius,
            questionType: 'general'
        };
    }

    // 難度4：給定圓心和通過的點
    private generateLevel4Combination(): CircleData {
        // 使用勾股數(畢達哥拉斯三元組)確保半徑為整數
        const PYTHAGOREAN_TRIPLES: [number, number, number][] = [
            [3, 4, 5],
            [5, 12, 13],
            [8, 15, 17],
            [7, 24, 25],
            [9, 40, 41],
            [12, 35, 37],
            [20, 21, 29],
            [28, 45, 53],
            [11, 60, 61]
        ];
        
        // 隨機選擇一個三元組，第三個數作為半徑
        const triple = PYTHAGOREAN_TRIPLES[Math.floor(Math.random() * PYTHAGOREAN_TRIPLES.length)];
        const radius = triple[2]; // 第三個數是斜邊長度，將作為半徑
        
        // 生成圓心坐標
        const centerX = getRandomInt(this.COORDINATE_RANGE.HARD.MIN, this.COORDINATE_RANGE.HARD.MAX);
        const centerY = getRandomInt(this.COORDINATE_RANGE.HARD.MIN, this.COORDINATE_RANGE.HARD.MAX);
        
        // 使用勾股數計算通過點坐標
        // 圓上任一點 = 圓心 + 向外的偏移量
        // 使用勾股數的前兩個值作為偏移量的x和y分量
        let offsetX = triple[0];
        let offsetY = triple[1];
        
        // 隨機決定偏移方向（正或負）
        if (Math.random() < 0.5) offsetX = -offsetX;
        if (Math.random() < 0.5) offsetY = -offsetY;
        
        const pointX = centerX + offsetX;
        const pointY = centerY + offsetY;
        
        // 確保點在合理範圍內
        if (pointX < this.COORDINATE_RANGE.HARD.MIN || pointX > this.COORDINATE_RANGE.HARD.MAX ||
            pointY < this.COORDINATE_RANGE.HARD.MIN || pointY > this.COORDINATE_RANGE.HARD.MAX) {
            // 如果超出範圍，遞歸重新生成
            return this.generateLevel4Combination();
        }
        
        // 隨機決定是標準形式還是一般形式
        const questionType = Math.random() < 0.5 ? 'standard' : 'general';
        
        return {
            centerX,
            centerY,
            radius,
            passingPoint: {
                x: pointX,
                y: pointY
            },
            questionType
        };
    }

    // 難度5：給定圓心和通過的點，以一般形式表示
    private generateLevel5Combination(): CircleData {
        // 使用勾股數(畢達哥拉斯三元組)確保半徑為整數
        const PYTHAGOREAN_TRIPLES: [number, number, number][] = [
            [3, 4, 5],
            [5, 12, 13],
            [8, 15, 17],
            [7, 24, 25],
            [9, 40, 41],
            [12, 35, 37],
            [20, 21, 29],
            [28, 45, 53],
            [11, 60, 61]
        ];
        
        // 隨機選擇一個三元組，第三個數作為半徑
        const triple = PYTHAGOREAN_TRIPLES[Math.floor(Math.random() * PYTHAGOREAN_TRIPLES.length)];
        const radius = triple[2]; // 第三個數是斜邊長度，將作為半徑
        
        // 生成圓心坐標
        const centerX = getRandomInt(this.COORDINATE_RANGE.HARD.MIN, this.COORDINATE_RANGE.HARD.MAX);
        const centerY = getRandomInt(this.COORDINATE_RANGE.HARD.MIN, this.COORDINATE_RANGE.HARD.MAX);
        
        // 使用勾股數計算通過點坐標
        // 圓上任一點 = 圓心 + 向外的偏移量
        // 使用勾股數的前兩個值作為偏移量的x和y分量
        let offsetX = triple[0];
        let offsetY = triple[1];
        
        // 隨機決定偏移方向（正或負）
        if (Math.random() < 0.5) offsetX = -offsetX;
        if (Math.random() < 0.5) offsetY = -offsetY;
        
        const pointX = centerX + offsetX;
        const pointY = centerY + offsetY;
        
        // 確保點在合理範圍內
        if (pointX < this.COORDINATE_RANGE.HARD.MIN || pointX > this.COORDINATE_RANGE.HARD.MAX ||
            pointY < this.COORDINATE_RANGE.HARD.MIN || pointY > this.COORDINATE_RANGE.HARD.MAX) {
            // 如果超出範圍，遞歸重新生成
            return this.generateLevel5Combination();
        }
        
        // 難度5與難度4相似，但僅使用一般形式
        return {
            centerX,
            centerY,
            radius,
            passingPoint: {
                x: pointX,
                y: pointY
            },
            questionType: 'general'
        };
    }

    // 格式化答案的輔助方法
    private formatEquation(data: CircleData): string {
        if (data.questionType === 'standard') {
            return this.formatStandardEquationLatex(data);
        } else if (data.questionType === 'general') {
            return this.formatGeneralEquationLatex(data);
        } else {
            return this.formatParametricEquationLatex(data);
        }
    }

    // 生成標準形式圓方程（直接生成LaTeX格式）
    private formatStandardEquationLatex(data: CircleData): string {
        const h = data.centerX;
        const k = data.centerY;
        const r = data.radius;
        const rSquare = r*r;
        
        // 處理不同情況的括號
        let xTerm = '';
        if (h === 0) {
            xTerm = 'x^{2}';
        } else if (h > 0) {
            xTerm = `(x-${h})^{2}`;
        } else {
            xTerm = `(x+${Math.abs(h)})^{2}`;
        }
        
        let yTerm = '';
        if (k === 0) {
            yTerm = 'y^{2}';
        } else if (k > 0) {
            yTerm = `(y-${k})^{2}`;
        } else {
            yTerm = `(y+${Math.abs(k)})^{2}`;
        }
        
        return `${xTerm} + ${yTerm} = ${rSquare}`;
    }

    // 生成一般形式圓方程（直接生成LaTeX格式）
    private formatGeneralEquationLatex(data: CircleData): string {
        const h = data.centerX;
        const k = data.centerY;
        const r = data.radius;
        
        // 計算一般形式的係數
        const g = -h;
        const f = -k;
        const c = h*h + k*k - r*r;
        
        // 構建方程
        let equation = 'x^{2} + y^{2}';
        
        if (g !== 0) {
            equation += g > 0 ? ` + ${g*2}x` : ` - ${Math.abs(g*2)}x`;
        }
        
        if (f !== 0) {
            equation += f > 0 ? ` + ${f*2}y` : ` - ${Math.abs(f*2)}y`;
        }
        
        if (c !== 0) {
            equation += c > 0 ? ` + ${c}` : ` - ${Math.abs(c)}`;
        }
        
        equation += ' = 0';
        
        return equation;
    }

    // 生成一段式形式圓方程（直接生成LaTeX格式）
    private formatParametricEquationLatex(data: CircleData): string {
        const h = data.centerX;
        const k = data.centerY;
        const r = data.radius;
        
        return `x = ${h} + ${r}\\cos t, \\; y = ${k} + ${r}\\sin t, \\; 0 \\leq t < 2\\pi`;
    }

    // 生成問題文本
    private generateQuestionText(data: CircleData): string {
        let questionText = '';
        
        if (data.passingPoint) {
            // 難度4和5：給定圓心和通過的點
            questionText = `求圓的方程式，已知圓心 C(${data.centerX}, ${data.centerY}) 且通過點 P(${data.passingPoint.x}, ${data.passingPoint.y})`;
            if (data.questionType === 'standard') {
                questionText += `，以標準形式表示。`;
            } else if (data.questionType === 'general') {
                questionText += `，以一般形式表示。`;
            } else {
                questionText += `，以一段式形式表示。`;
            }
        } else if (data.questionType === 'standard') {
            // 難度1或2：標準形式
            questionText = `求圓的方程式，已知圓心 = (${data.centerX}, ${data.centerY})，半徑 = ${data.radius}，以標準形式表示。`;
        } else if (data.questionType === 'general') {
            // 難度3：一般形式
            questionText = `求圓的方程式，已知圓心 = (${data.centerX}, ${data.centerY})，半徑 = ${data.radius}，以一般形式表示。`;
        } else {
            // 難度5：一段式形式
            questionText = `求圓的方程式，已知圓心 = (${data.centerX}, ${data.centerY})，半徑 = ${data.radius}，以一段式形式表示。`;
        }
        
        return questionText;
    }

    // 生成錯誤答案
    private generateWrongAnswers(data: CircleData): string[] {
        const wrongAnswers: string[] = [];
        const h = data.centerX;
        const k = data.centerY;
        const r = data.radius;
        
        if (data.questionType === 'standard') {
            // 錯誤1：半徑和平方混淆
            const wrong1 = h === 0 ? `x^{2}` : h > 0 ? `(x-${h})^{2}` : `(x+${Math.abs(h)})^{2}`;
            const wrong1y = k === 0 ? `y^{2}` : k > 0 ? `(y-${k})^{2}` : `(y+${Math.abs(k)})^{2}`;
            wrongAnswers.push(`${wrong1} + ${wrong1y} = ${r}`);
            
            // 錯誤2：圓心坐標符號錯誤
            const wrong2 = h === 0 ? `x^{2}` : h > 0 ? `(x+${h})^{2}` : `(x-${Math.abs(h)})^{2}`;
            const wrong2y = k === 0 ? `y^{2}` : k > 0 ? `(y+${k})^{2}` : `(y-${Math.abs(k)})^{2}`;
            wrongAnswers.push(`${wrong2} + ${wrong2y} = ${r*r}`);
            
            // 錯誤3：圓心和半徑混淆
            const wrong3 = r === 0 ? `x^{2}` : r > 0 ? `(x-${r})^{2}` : `(x+${Math.abs(r)})^{2}`;
            const wrong3y = r === 0 ? `y^{2}` : r > 0 ? `(y-${r})^{2}` : `(y+${Math.abs(r)})^{2}`;
            wrongAnswers.push(`${wrong3} + ${wrong3y} = ${h*h + k*k}`);
        } else if (data.questionType === 'general') {
            // 一般形式的錯誤
            
            // 錯誤1：係數符號錯誤
            const g1 = h; // 錯誤的符號
            const f1 = -k;
            const c1 = h*h + k*k - r*r;
            
            let wrong1 = 'x^{2} + y^{2}';
            if (g1 !== 0) wrong1 += g1 > 0 ? ` + ${g1*2}x` : ` - ${Math.abs(g1*2)}x`;
            if (f1 !== 0) wrong1 += f1 > 0 ? ` + ${f1*2}y` : ` - ${Math.abs(f1*2)}y`;
            if (c1 !== 0) wrong1 += c1 > 0 ? ` + ${c1}` : ` - ${Math.abs(c1)}`;
            wrong1 += ' = 0';
            wrongAnswers.push(wrong1);
            
            // 錯誤2：係數計算錯誤（忘記乘2）
            const g2 = -h;
            const f2 = -k;
            const c2 = h*h + k*k - r*r;
            
            let wrong2 = 'x^{2} + y^{2}';
            if (g2 !== 0) wrong2 += g2 > 0 ? ` + ${g2}x` : ` - ${Math.abs(g2)}x`; // 忘記乘2
            if (f2 !== 0) wrong2 += f2 > 0 ? ` + ${f2}y` : ` - ${Math.abs(f2)}y`; // 忘記乘2
            if (c2 !== 0) wrong2 += c2 > 0 ? ` + ${c2}` : ` - ${Math.abs(c2)}`;
            wrong2 += ' = 0';
            wrongAnswers.push(wrong2);
            
            // 錯誤3：常數項計算錯誤
            const g3 = -h;
            const f3 = -k;
            const c3 = h*h + k*k + r*r; // 加號而非減號
            
            let wrong3 = 'x^{2} + y^{2}';
            if (g3 !== 0) wrong3 += g3 > 0 ? ` + ${g3*2}x` : ` - ${Math.abs(g3*2)}x`;
            if (f3 !== 0) wrong3 += f3 > 0 ? ` + ${f3*2}y` : ` - ${Math.abs(f3*2)}y`;
            if (c3 !== 0) wrong3 += c3 > 0 ? ` + ${c3}` : ` - ${Math.abs(c3)}`;
            wrong3 += ' = 0';
            wrongAnswers.push(wrong3);
        } else {
            // 一段式形式的錯誤
            
            // 錯誤1：圓心坐標符號錯誤
            const wrong1 = `x = ${-h} + ${r}\\cos t, \\; y = ${k} + ${r}\\sin t, \\; 0 \\leq t < 2\\pi`;
            wrongAnswers.push(wrong1);
            
            // 錯誤2：半徑值錯誤
            const wrong2 = `x = ${h} + ${r+1}\\cos t, \\; y = ${k} + ${r+1}\\sin t, \\; 0 \\leq t < 2\\pi`;
            wrongAnswers.push(wrong2);
            
            // 錯誤3：使用sin和cos反了
            const wrong3 = `x = ${h} + ${r}\\sin t, \\; y = ${k} + ${r}\\cos t, \\; 0 \\leq t < 2\\pi`;
            wrongAnswers.push(wrong3);
        }
        
        return wrongAnswers;
    }

    // 生成解釋（使用LaTeX格式）
    private generateExplanation(data: CircleData): string {
        let explanation = '';
        
        if (data.passingPoint) {
            // 難度4和5：給定圓心和通過的點
            explanation = `解題步驟：<br><br>`;
            explanation += `1. 已知條件：<br>`;
            explanation += `   - 圓心 ${this.wrapWithLatex(`C(${data.centerX}, ${data.centerY})`)}<br>`;
            explanation += `   - 圓上一點 ${this.wrapWithLatex(`P(${data.passingPoint.x}, ${data.passingPoint.y})`)}<br><br>`;
            
            explanation += `2. 計算半徑：<br>`;
            explanation += `   - 半徑等於圓心到點P的距離<br>`;
            explanation += `   - ${this.wrapWithLatex(`r = \\sqrt{(${data.passingPoint.x} - ${data.centerX})^2 + (${data.passingPoint.y} - ${data.centerY})^2}`)}<br>`;
            
            // 計算差值，避免顯示負數的平方
            const xDiff = data.passingPoint.x - data.centerX;
            const yDiff = data.passingPoint.y - data.centerY;
            const xDiffSquared = xDiff * xDiff;
            const yDiffSquared = yDiff * yDiff;
            
            explanation += `   - ${this.wrapWithLatex(`r = \\sqrt{${xDiffSquared} + ${yDiffSquared}}`)}<br>`;
            explanation += `   - ${this.wrapWithLatex(`r = \\sqrt{${xDiffSquared + yDiffSquared}}`)}<br>`;
            explanation += `   - ${this.wrapWithLatex(`r = ${data.radius}`)}<br><br>`;
            
            if (data.questionType === 'standard') {
                // 標準形式
                explanation += `3. 代入標準形式方程：<br>`;
                explanation += `   - 圓的標準形式方程為 ${this.wrapWithLatex(`(x-h)^2 + (y-k)^2 = r^2`)}<br>`;
                explanation += `   - 其中 ${this.wrapWithLatex(`(h,k)`)} 是圓心，${this.wrapWithLatex(`r`)} 是半徑<br>`;
                explanation += `   - 代入 ${this.wrapWithLatex(`h=${data.centerX}, k=${data.centerY}, r=${data.radius}`)}<br><br>`;
                
                let xTerm = '';
                if (data.centerX === 0) {
                    xTerm = 'x^2';
                } else if (data.centerX > 0) {
                    xTerm = `(x-${data.centerX})^2`;
                } else {
                    xTerm = `(x+${Math.abs(data.centerX)})^2`;
                }
                
                let yTerm = '';
                if (data.centerY === 0) {
                    yTerm = 'y^2';
                } else if (data.centerY > 0) {
                    yTerm = `(y-${data.centerY})^2`;
                } else {
                    yTerm = `(y+${Math.abs(data.centerY)})^2`;
                }
                
                explanation += `   - 方程為 ${this.wrapWithLatex(`${xTerm} + ${yTerm} = ${Math.pow(data.radius, 2)}`)}<br>`;
            } else if (data.questionType === 'general') {
                // 一般形式
                explanation += `3. 轉換為一般形式方程：<br>`;
                explanation += `   - 圓的一般形式方程為 ${this.wrapWithLatex(`x^2 + y^2 + 2gx + 2fy + c = 0`)}<br>`;
                explanation += `   - 其中 ${this.wrapWithLatex(`g=-h, f=-k, c=h^2+k^2-r^2`)}<br>`;
                explanation += `   - 代入 ${this.wrapWithLatex(`h=${data.centerX}, k=${data.centerY}, r=${data.radius}`)}<br>`;
                explanation += `   - ${this.wrapWithLatex(`g = -${data.centerX}, f = -${data.centerY}, c = ${data.centerX}^2 + ${data.centerY}^2 - ${data.radius}^2`)}<br>`;
                
                // 計算係數
                const h2 = Math.pow(data.centerX, 2);
                const k2 = Math.pow(data.centerY, 2);
                const r2 = Math.pow(data.radius, 2);
                
                explanation += `   - ${this.wrapWithLatex(`c = ${h2} + ${k2} - ${r2}`)}<br>`;
                explanation += `   - ${this.wrapWithLatex(`c = ${h2 + k2 - r2}`)}<br><br>`;
                
                // 構建方程
                let equation = 'x^2 + y^2';
                const g = -data.centerX;
                const f = -data.centerY;
                const c = h2 + k2 - r2;
                
                if (g !== 0) {
                    equation += g > 0 ? ` + ${g*2}x` : ` - ${Math.abs(g*2)}x`;
                }
                
                if (f !== 0) {
                    equation += f > 0 ? ` + ${f*2}y` : ` - ${Math.abs(f*2)}y`;
                }
                
                if (c !== 0) {
                    equation += c > 0 ? ` + ${c}` : ` - ${Math.abs(c)}`;
                }
                
                equation += ' = 0';
                
                explanation += `   - 方程為 ${this.wrapWithLatex(`${equation}`)}<br>`;
            } else {
                // 一段式形式
                explanation += `3. 轉換為一段式形式：<br>`;
                explanation += `   - 圓的一段式形式為 ${this.wrapWithLatex(`x = h + r\\cos t, \\; y = k + r\\sin t, \\; 0 \\leq t < 2\\pi`)}<br>`;
                explanation += `   - 其中 ${this.wrapWithLatex(`(h,k)`)} 是圓心，${this.wrapWithLatex(`r`)} 是半徑，${this.wrapWithLatex(`t`)} 是參數<br>`;
                explanation += `   - 代入 ${this.wrapWithLatex(`h=${data.centerX}, k=${data.centerY}, r=${data.radius}`)}<br><br>`;
                
                explanation += `   - 方程為 ${this.wrapWithLatex(`x = ${data.centerX} + ${data.radius}\\cos t, \\; y = ${data.centerY} + ${data.radius}\\sin t, \\; 0 \\leq t < 2\\pi`)}<br>`;
                
                explanation += `<br>4. 一段式參數的幾何意義：<br>`;
                explanation += `   - 參數 ${this.wrapWithLatex(`t`)} 代表圓上點與圓心的連線與正x軸的夾角<br>`;
                explanation += `   - 當 ${this.wrapWithLatex(`t=0`)} 時，點在 ${this.wrapWithLatex(`(${data.centerX + data.radius}, ${data.centerY})`)}<br>`;
                explanation += `   - 當 ${this.wrapWithLatex(`t=\\frac{\\pi}{2}`)} 時，點在 ${this.wrapWithLatex(`(${data.centerX}, ${data.centerY + data.radius})`)}<br>`;
                explanation += `   - 當 ${this.wrapWithLatex(`t=\\pi`)} 時，點在 ${this.wrapWithLatex(`(${data.centerX - data.radius}, ${data.centerY})`)}<br>`;
                explanation += `   - 當 ${this.wrapWithLatex(`t=\\frac{3\\pi}{2}`)} 時，點在 ${this.wrapWithLatex(`(${data.centerX}, ${data.centerY - data.radius})`)}<br>`;
            }
        } else if (data.questionType === 'standard') {
            // 難度1或2：標準形式
            explanation = `解題步驟：<br><br>`;
            explanation += `1. 已知條件：<br>`;
            explanation += `   - 圓心 ${this.wrapWithLatex(`C(${data.centerX}, ${data.centerY})`)}<br>`;
            explanation += `   - 半徑 ${this.wrapWithLatex(`r = ${data.radius}`)}<br><br>`;
            
            explanation += `2. 圓的標準形式方程：<br>`;
            explanation += `   - 圓的標準形式方程為 ${this.wrapWithLatex(`(x-h)^2 + (y-k)^2 = r^2`)}<br>`;
            explanation += `   - 其中 ${this.wrapWithLatex(`(h,k)`)} 是圓心，${this.wrapWithLatex(`r`)} 是半徑<br><br>`;
            
            explanation += `3. 代入已知條件：<br>`;
            explanation += `   - 代入 ${this.wrapWithLatex(`h=${data.centerX}, k=${data.centerY}, r=${data.radius}`)}<br><br>`;
            
            let xTerm = '';
            if (data.centerX === 0) {
                xTerm = 'x^2';
            } else if (data.centerX > 0) {
                xTerm = `(x-${data.centerX})^2`;
            } else {
                xTerm = `(x+${Math.abs(data.centerX)})^2`;
            }
            
            let yTerm = '';
            if (data.centerY === 0) {
                yTerm = 'y^2';
            } else if (data.centerY > 0) {
                yTerm = `(y-${data.centerY})^2`;
            } else {
                yTerm = `(y+${Math.abs(data.centerY)})^2`;
            }
            
            explanation += `   - 方程為 ${this.wrapWithLatex(`${xTerm} + ${yTerm} = ${data.radius * data.radius}`)}<br>`;
        } else if (data.questionType === 'general') {
            // 難度3：一般形式（從標準形式展開）
            explanation = `解題步驟：<br><br>`;
            explanation += `1. 已知條件：<br>`;
            explanation += `   - 圓心 ${this.wrapWithLatex(`C(${data.centerX}, ${data.centerY})`)}<br>`;
            explanation += `   - 半徑 ${this.wrapWithLatex(`r = ${data.radius}`)}<br><br>`;
            
            explanation += `2. 圓的標準形式方程：<br>`;
            explanation += `   - 圓的標準形式方程為 ${this.wrapWithLatex(`(x-h)^2 + (y-k)^2 = r^2`)}<br>`;
            explanation += `   - 代入 ${this.wrapWithLatex(`h=${data.centerX}, k=${data.centerY}, r=${data.radius}`)}<br>`;
            
            // 生成標準形式方程
            let xTermStandard = '';
            if (data.centerX === 0) {
                xTermStandard = 'x^2';
            } else if (data.centerX > 0) {
                xTermStandard = `(x-${data.centerX})^2`;
            } else {
                xTermStandard = `(x+${Math.abs(data.centerX)})^2`;
            }
            
            let yTermStandard = '';
            if (data.centerY === 0) {
                yTermStandard = 'y^2';
            } else if (data.centerY > 0) {
                yTermStandard = `(y-${data.centerY})^2`;
            } else {
                yTermStandard = `(y+${Math.abs(data.centerY)})^2`;
            }
            
            explanation += `   - ${this.wrapWithLatex(`${xTermStandard} + ${yTermStandard} = ${data.radius * data.radius}`)}<br><br>`;
            
            explanation += `3. 展開標準形式方程並移項為一般形式：<br>`;
            
            // 定義係數
            const h = data.centerX;
            const k = data.centerY;
            const r = data.radius;
            const r2 = r * r;
            const h2 = h * h;
            const k2 = k * k;
            
            // 原始標準形式
            explanation += `   - ${this.wrapWithLatex(`${xTermStandard} + ${yTermStandard} = ${r2}`)}<br>`;
            
            // 展開 x 項和 y 項
            let expandedLeftSide = '';
            
            // x 項展開
            if (h === 0) {
                expandedLeftSide = 'x^2';
            } else {
                const xSign = h > 0 ? '-' : '+';
                const absH = Math.abs(h);
                explanation += `   - ${this.wrapWithLatex(`(x${xSign}${absH})^2 = x^2 ${xSign} 2 \\cdot ${absH} \\cdot x + ${absH}^2 = x^2 ${xSign} ${2*absH}x + ${h2}`)}<br>`;
                expandedLeftSide = h > 0 ? `x^2 - ${2*h}x + ${h2}` : `x^2 + ${2*Math.abs(h)}x + ${h2}`;
            }
            
            // y 項展開
            let yExpansion = '';
            if (k === 0) {
                yExpansion = 'y^2';
            } else {
                const ySign = k > 0 ? '-' : '+';
                const absK = Math.abs(k);
                explanation += `   - ${this.wrapWithLatex(`(y${ySign}${absK})^2 = y^2 ${ySign} 2 \\cdot ${absK} \\cdot y + ${absK}^2 = y^2 ${ySign} ${2*absK}y + ${k2}`)}<br>`;
                yExpansion = k > 0 ? `y^2 - ${2*k}y + ${k2}` : `y^2 + ${2*Math.abs(k)}y + ${k2}`;
            }
            
            // 展開後的完整方程
            const fullExpandedEquation = `${expandedLeftSide} + ${yExpansion} = ${r2}`;
            explanation += `   - 展開後：${this.wrapWithLatex(fullExpandedEquation)}<br>`;
            
            // 將右側移項到左側
            const afterMoving = `${expandedLeftSide} + ${yExpansion} - ${r2} = 0`;
            explanation += `   - 將右側移項到左側：${this.wrapWithLatex(afterMoving)}<br>`;
            
            // 整理成標準的一般形式 x² + y² + 2gx + 2fy + c = 0
            const g = -h;
            const f = -k;
            const c = h2 + k2 - r2;
            
            let finalEquation = `x^2 + y^2`;
            if (g !== 0) {
                finalEquation += g > 0 ? ` + ${2*g}x` : ` - ${Math.abs(2*g)}x`;
            }
            
            if (f !== 0) {
                finalEquation += f > 0 ? ` + ${2*f}y` : ` - ${Math.abs(2*f)}y`;
            }
            
            if (c !== 0) {
                finalEquation += c > 0 ? ` + ${c}` : ` - ${Math.abs(c)}`;
            }
            
            finalEquation += ' = 0';
            
            explanation += `   - 整理得到一般形式：${this.wrapWithLatex(finalEquation)}<br><br>`;
            
            explanation += `   - 最終方程為：${this.wrapWithLatex(finalEquation)}<br>`;
        } else {
            // 難度5：一段式形式
            explanation = `解題步驟：<br><br>`;
            explanation += `1. 已知條件：<br>`;
            explanation += `   - 圓心 ${this.wrapWithLatex(`C(${data.centerX}, ${data.centerY})`)}<br>`;
            explanation += `   - 半徑 ${this.wrapWithLatex(`r = ${data.radius}`)}<br><br>`;
            
            explanation += `2. 圓的一段式方程：<br>`;
            explanation += `   - 圓的一段式形式為 ${this.wrapWithLatex(`x = h + r\\cos t, \\; y = k + r\\sin t, \\; 0 \\leq t < 2\\pi`)}<br>`;
            explanation += `   - 其中 ${this.wrapWithLatex(`(h,k)`)} 是圓心，${this.wrapWithLatex(`r`)} 是半徑，${this.wrapWithLatex(`t`)} 是參數<br><br>`;
            
            explanation += `3. 代入已知條件：<br>`;
            explanation += `   - 代入 ${this.wrapWithLatex(`h=${data.centerX}, k=${data.centerY}, r=${data.radius}`)}<br>`;
            explanation += `   - ${this.wrapWithLatex(`x = ${data.centerX} + ${data.radius}\\cos t`)}<br>`;
            explanation += `   - ${this.wrapWithLatex(`y = ${data.centerY} + ${data.radius}\\sin t`)}<br><br>`;
            
            explanation += `4. 一段式參數的幾何意義：<br>`;
            explanation += `   - 參數 ${this.wrapWithLatex(`t`)} 代表圓上點與圓心的連線與正x軸的夾角<br>`;
            explanation += `   - 當 ${this.wrapWithLatex(`t=0`)} 時，點在 ${this.wrapWithLatex(`(${data.centerX + data.radius}, ${data.centerY})`)}<br>`;
            explanation += `   - 當 ${this.wrapWithLatex(`t=\\frac{\\pi}{2}`)} 時，點在 ${this.wrapWithLatex(`(${data.centerX}, ${data.centerY + data.radius})`)}<br>`;
            explanation += `   - 當 ${this.wrapWithLatex(`t=\\pi`)} 時，點在 ${this.wrapWithLatex(`(${data.centerX - data.radius}, ${data.centerY})`)}<br>`;
            explanation += `   - 當 ${this.wrapWithLatex(`t=\\frac{3\\pi}{2}`)} 時，點在 ${this.wrapWithLatex(`(${data.centerX}, ${data.centerY - data.radius})`)}<br><br>`;
            
            explanation += `   - 最終方程為： ${this.wrapWithLatex(`x = ${data.centerX} + ${data.radius}\\cos t, \\; y = ${data.centerY} + ${data.radius}\\sin t, \\; 0 \\leq t < 2\\pi`)}<br>`;
        }
        
        return explanation;
    }
}