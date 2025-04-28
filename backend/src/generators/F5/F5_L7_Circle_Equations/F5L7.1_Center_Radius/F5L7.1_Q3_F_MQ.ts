import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import { getRandomInt } from '@/utils/mathUtils';

// 定義題目所需的接口
interface CircleData {
    centerX: number;     // 圓心 x 坐標
    centerY: number;     // 圓心 y 坐標
    radius: number;      // 半徑
    equation: string;    // 圓的方程式
    equationType: 'standard' | 'general' | 'complex'; // 方程類型
}

export default class FindCircleCenterRadiusGenerator extends QuestionGenerator {
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
        super(difficulty, 'F5L7.1_Q3_F_MQ');
    }

    // 主要生成方法
    generate(): IGeneratorOutput {
        // 生成題目組合
        const circleData = this.generateValidCombination();
        
        // 構建問題文本
        const questionText = this.generateQuestionText(circleData);
        
        // 格式化正確答案
        const correctAnswer = this.formatAnswer(circleData);
        
        // 生成錯誤答案
        const wrongAnswers = this.generateWrongAnswers(circleData);
        
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

    // 將式子包裝為LaTeX格式
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
            default:
                return this.generateLevel1Combination();
        }
    }

    // 難度1：標準形式，非負整數坐標
    private generateLevel1Combination(): CircleData {
        const centerX = getRandomInt(this.COORDINATE_RANGE.EASY.MIN, this.COORDINATE_RANGE.EASY.MAX);
        const centerY = getRandomInt(this.COORDINATE_RANGE.EASY.MIN, this.COORDINATE_RANGE.EASY.MAX);
        const radius = getRandomInt(this.RADIUS_RANGE.EASY.MIN, this.RADIUS_RANGE.EASY.MAX);
        
        // 生成標準形式方程
        let xTerm = centerX === 0 ? 'x^2' : `(x-${centerX})^2`;
        let yTerm = centerY === 0 ? 'y^2' : `(y-${centerY})^2`;
        const equation = `${xTerm} + ${yTerm} = ${radius*radius}`;
        
        return {
            centerX,
            centerY,
            radius,
            equation,
            equationType: 'standard'
        };
    }

    // 難度2：標準形式，正負整數坐標，可能包含係數
    private generateLevel2Combination(): CircleData {
        const centerX = getRandomInt(this.COORDINATE_RANGE.MEDIUM.MIN, this.COORDINATE_RANGE.MEDIUM.MAX);
        const centerY = getRandomInt(this.COORDINATE_RANGE.MEDIUM.MIN, this.COORDINATE_RANGE.MEDIUM.MAX);
        const radius = getRandomInt(this.RADIUS_RANGE.MEDIUM.MIN, this.RADIUS_RANGE.MEDIUM.MAX);
        
        // 決定是否使用係數形式（像(2x+6)²形式）
        const useCoefficients = Math.random() < 0.7; // 提高到70%的機率使用係數
        
        let equation = '';
        let actualCenterX = centerX;
        let actualCenterY = centerY;
        
        if (useCoefficients) {
            // 選擇相同的係數，確保生成的是圓方程而非橢圓方程
            // 係數範圍從2到5，避免係數為1
            const coef = getRandomInt(2, 5); // 擴大係數範圍
            
            // 計算常數項，使方程等價於標準圓方程
            const xConstant = -centerX * coef;
            const yConstant = -centerY * coef;
            
            // 構建帶係數的方程
            let xTerm = '';
            if (xConstant === 0) {
                xTerm = `(${coef}x)^2`;
            } else if (xConstant > 0) {
                xTerm = `(${coef}x+${xConstant})^2`;
            } else {
                xTerm = `(${coef}x${xConstant})^2`;
            }
            
            let yTerm = '';
            if (yConstant === 0) {
                yTerm = `(${coef}y)^2`;
            } else if (yConstant > 0) {
                yTerm = `(${coef}y+${yConstant})^2`;
            } else {
                yTerm = `(${coef}y${yConstant})^2`;
            }
            
            equation = `${xTerm} + ${yTerm} = ${radius*radius}`;
        } else {
            // 標準形式，處理負號（原有的邏輯）
            let xTerm = '';
            if (centerX === 0) {
                xTerm = 'x^2';
            } else if (centerX > 0) {
                xTerm = `(x-${centerX})^2`;
            } else {
                xTerm = `(x+${Math.abs(centerX)})^2`;
            }
            
            let yTerm = '';
            if (centerY === 0) {
                yTerm = 'y^2';
            } else if (centerY > 0) {
                yTerm = `(y-${centerY})^2`;
            } else {
                yTerm = `(y+${Math.abs(centerY)})^2`;
            }
            
            equation = `${xTerm} + ${yTerm} = ${radius*radius}`;
        }
        
        return {
            centerX: actualCenterX,
            centerY: actualCenterY,
            radius,
            equation,
            equationType: 'standard'
        };
    }

    // 難度3：一般形式
    private generateLevel3Combination(): CircleData {
        const centerX = getRandomInt(this.COORDINATE_RANGE.MEDIUM.MIN, this.COORDINATE_RANGE.MEDIUM.MAX);
        const centerY = getRandomInt(this.COORDINATE_RANGE.MEDIUM.MIN, this.COORDINATE_RANGE.MEDIUM.MAX);
        const radius = getRandomInt(this.RADIUS_RANGE.MEDIUM.MIN, this.RADIUS_RANGE.MEDIUM.MAX);
        
        // 計算一般形式的係數
        const g = -centerX;
        const f = -centerY;
        const c = centerX*centerX + centerY*centerY - radius*radius;
        
        // 構建一般形式方程
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
        
        equation += ' = 0';
        
        return {
            centerX,
            centerY,
            radius,
            equation,
            equationType: 'general'
        };
    }

    // 難度4：複雜形式
    private generateLevel4Combination(): CircleData {
        const centerX = getRandomInt(this.COORDINATE_RANGE.HARD.MIN, this.COORDINATE_RANGE.HARD.MAX);
        const centerY = getRandomInt(this.COORDINATE_RANGE.HARD.MIN, this.COORDINATE_RANGE.HARD.MAX);
        const radius = getRandomInt(this.RADIUS_RANGE.MEDIUM.MIN, this.RADIUS_RANGE.MEDIUM.MAX);
        
        // 隨機決定方程類型
        const equationType = Math.random() < 0.7 ? 'complex' : (Math.random() < 0.5 ? 'standard' : 'general');
        
        let equation = '';
        
        if (equationType === 'standard') {
            // 標準形式但有可能帶係數
            const useCoefficients = Math.random() < 0.8; // 提高到80%的機率使用係數
            
            if (useCoefficients) {
                // 使用相同的係數確保生成圓方程而非橢圓方程
                // 係數範圍從2到5，避免係數為1
                const coef = getRandomInt(2, 5);
                
                // 計算常數項，使方程等價於標準圓方程
                const xConstant = -centerX * coef;
                const yConstant = -centerY * coef;
                
                // 構建帶係數的方程
                let xTerm = '';
                if (xConstant === 0) {
                    xTerm = `(${coef}x)^2`;
                } else if (xConstant > 0) {
                    xTerm = `(${coef}x+${xConstant})^2`;
                } else {
                    xTerm = `(${coef}x${xConstant})^2`;
                }
                
                let yTerm = '';
                if (yConstant === 0) {
                    yTerm = `(${coef}y)^2`;
                } else if (yConstant > 0) {
                    yTerm = `(${coef}y+${yConstant})^2`;
                } else {
                    yTerm = `(${coef}y${yConstant})^2`;
                }
                
                // 使用更大的右側值，如64或100等
                const radiusSquared = Math.pow(radius, 2);
                const rightSide = radiusSquared > 50 ? radiusSquared : radiusSquared * 4;
                
                equation = `${xTerm} + ${yTerm} = ${rightSide}`;
            } else {
                // 原始的標準形式
                let xTerm = '';
                if (centerX === 0) {
                    xTerm = 'x^2';
                } else if (centerX > 0) {
                    xTerm = `(x-${centerX})^2`;
                } else {
                    xTerm = `(x+${Math.abs(centerX)})^2`;
                }
                
                let yTerm = '';
                if (centerY === 0) {
                    yTerm = 'y^2';
                } else if (centerY > 0) {
                    yTerm = `(y-${centerY})^2`;
                } else {
                    yTerm = `(y+${Math.abs(centerY)})^2`;
                }
                
                equation = `${xTerm} + ${yTerm} = ${radius*radius}`;
            }
            
        } else if (equationType === 'general') {
            // 一般形式
            const g = -centerX;
            const f = -centerY;
            const c = centerX*centerX + centerY*centerY - radius*radius;
            
            // 構建一般形式方程
            equation = 'x^2 + y^2';
            
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
            
        } else {
            // 複雜形式，加入係數（確保x^2和y^2有相同係數）
            // 係數範圍從2到9，避免係數為1
            const a = getRandomInt(2, 9); // x^2和y^2的共同係數
            const g = -centerX;
            const f = -centerY;
            const c = centerX*centerX + centerY*centerY - radius*radius;
            
            // 構建一般形式方程，確保x^2和y^2有相同係數
            equation = `${a}x^2 + ${a}y^2`;
            
            if (g !== 0) {
                equation += g > 0 ? ` + ${g*a*2}x` : ` - ${Math.abs(g*a*2)}x`;
            }
            
            if (f !== 0) {
                equation += f > 0 ? ` + ${f*a*2}y` : ` - ${Math.abs(f*a*2)}y`;
            }
            
            const constant = a * c;
            if (constant !== 0) {
                equation += constant > 0 ? ` + ${constant}` : ` - ${Math.abs(constant)}`;
            }
            
            equation += ' = 0';
        }
        
        return {
            centerX,
            centerY,
            radius,
            equation,
            equationType
        };
    }

    // 生成問題文本
    private generateQuestionText(data: CircleData): string {
        let questionText = `從下列圓的方程中，求出圓心坐標和半徑。<br>(如有需要，請以根式表示答案)<br><br>`;
        questionText += this.wrapWithLatex(data.equation);
        return questionText;
    }

    // 格式化答案
    private formatAnswer(data: CircleData): string {
        return `圓心 = (${data.centerX}, ${data.centerY}), 半徑 = ${data.radius}`;
    }

    // 生成錯誤答案
    private generateWrongAnswers(data: CircleData): string[] {
        const wrongAnswers: string[] = [];
        const correctAnswer = this.formatAnswer(data);
        
        // 錯誤1：圓心x坐標符號錯誤
        const wrong1 = `圓心 = (${-data.centerX}, ${data.centerY}), 半徑 = ${data.radius}`;
        
        // 檢查答案是否與正確答案相同
        if (wrong1 !== correctAnswer) {
            wrongAnswers.push(wrong1);
        } else {
            // 如果相同，則修改半徑值
            wrongAnswers.push(`圓心 = (${-data.centerX}, ${data.centerY}), 半徑 = ${data.radius + 1}`);
        }
        
        // 錯誤2：圓心y值符號錯誤
        const wrong2 = `圓心 = (${data.centerX}, ${-data.centerY}), 半徑 = ${data.radius}`;
        
        // 檢查答案是否與正確答案相同或已存在
        if (wrong2 !== correctAnswer && !wrongAnswers.includes(wrong2)) {
            wrongAnswers.push(wrong2);
        } else {
            // 如果重複，則修改圓心x坐標和半徑
            wrongAnswers.push(`圓心 = (${data.centerX + 1}, ${-data.centerY}), 半徑 = ${data.radius}`);
        }
        
        // 錯誤3：半徑和半徑的平方混淆
        const wrong3 = `圓心 = (${data.centerX}, ${data.centerY}), 半徑 = ${data.radius * data.radius}`;
        
        // 檢查答案是否與正確答案相同或已存在
        if (wrong3 !== correctAnswer && !wrongAnswers.includes(wrong3)) {
            wrongAnswers.push(wrong3);
        } else {
            // 如果重複，則增加一個半徑誤差為1的錯誤答案
            wrongAnswers.push(`圓心 = (${data.centerX}, ${data.centerY}), 半徑 = ${data.radius + 1}`);
        }
        
        // 如果還需要更多錯誤答案
        while (wrongAnswers.length < 3) {
            // 根據不同方程類型生成不同類型的錯誤
            if (data.equationType === 'general') {
                // 對於一般形式，常見錯誤是g和f的計算錯誤
                const newX = data.centerX / 2;  // 錯誤地將-g除以2
                const newY = data.centerY / 2;  // 錯誤地將-f除以2
                const newWrong = `圓心 = (${newX}, ${newY}), 半徑 = ${data.radius}`;
                
                if (!wrongAnswers.includes(newWrong) && newWrong !== correctAnswer) {
                    wrongAnswers.push(newWrong);
                }
            } else if (data.equationType === 'complex') {
                // 對於複雜形式，常見錯誤是忘記考慮係數
                const newWrong = `圓心 = (${data.centerX * 2}, ${data.centerY * 2}), 半徑 = ${Math.round(data.radius * Math.sqrt(2))}`;
                
                if (!wrongAnswers.includes(newWrong) && newWrong !== correctAnswer) {
                    wrongAnswers.push(newWrong);
                }
            } else {
                // 對於標準形式，生成隨機偏移的錯誤
                const offsetX = getRandomInt(1, 3) * (Math.random() < 0.5 ? 1 : -1);
                const offsetY = getRandomInt(1, 3) * (Math.random() < 0.5 ? 1 : -1);
                const offsetR = getRandomInt(1, 2);
                
                const newWrong = `圓心 = (${data.centerX + offsetX}, ${data.centerY + offsetY}), 半徑 = ${data.radius + offsetR}`;
                
                if (!wrongAnswers.includes(newWrong) && newWrong !== correctAnswer) {
                    wrongAnswers.push(newWrong);
                }
            }
        }
        
        return wrongAnswers.slice(0, 3);  // 確保只返回三個錯誤答案
    }

    // 生成解釋
    private generateExplanation(data: CircleData): string {
        let explanation = `解題步驟：<br><br>`;
        explanation += `1. 給定的圓方程：<br>`;
        explanation += `   ${this.wrapWithLatex(data.equation)}<br><br>`;
        
        if (data.equationType === 'standard') {
            // 檢查是否為係數形式，如(ax+b)^2 + (cy+d)^2 = r^2
            const hasCoefficient = data.equation.includes('x+') || data.equation.includes('x-') || 
                                data.equation.includes('y+') || data.equation.includes('y-');
            
            // 標準形式解釋
            explanation += `2. 圓的標準形式為 ${this.wrapWithLatex(`(x-h)^2 + (y-k)^2 = r^2`)}<br>`;
            explanation += `   其中 ${this.wrapWithLatex(`(h,k)`)} 是圓心，${this.wrapWithLatex(`r`)} 是半徑<br><br>`;
            
            if (hasCoefficient && (data.equation.includes('(') || data.equation.includes(')'))) {
                // 對帶係數的標準形式進行解釋
                explanation += `3. 給定的方程是帶係數的標準形式。在有效的圓方程中，x^2和y^2的係數必須相同。<br>`;
                explanation += `   我們需要將其轉換成 ${this.wrapWithLatex(`(x-h)^2 + (y-k)^2 = r^2`)} 的形式。<br><br>`;
                
                // 使用正則表達式提取方程中的係數和常數
                const xMatch = data.equation.match(/\((\d+)x([+-]\d+)\)\^2/);
                const yMatch = data.equation.match(/\((\d+)y([+-]\d+)\)\^2/);
                
                if (xMatch && yMatch) {
                    const xCoef = parseInt(xMatch[1]);
                    const xConst = parseInt(xMatch[2]);
                    const yCoef = parseInt(yMatch[1]);
                    const yConst = parseInt(yMatch[2]);
                    
                    explanation += `   對於 ${this.wrapWithLatex(`(${xCoef}x${xConst})^2`)}：<br>`;
                    explanation += `   ${this.wrapWithLatex(`(${xCoef}x${xConst})^2 = ${xCoef}^2(x${xConst/xCoef > 0 ? "+" : ""}${xConst/xCoef})^2`)}。<br>`;
                    explanation += `   比較標準形式，可以看出 ${this.wrapWithLatex(`h = ${-xConst/xCoef}`)}<br><br>`;
                    
                    explanation += `   對於 ${this.wrapWithLatex(`(${yCoef}y${yConst})^2`)}：<br>`;
                    explanation += `   ${this.wrapWithLatex(`(${yCoef}y${yConst})^2 = ${yCoef}^2(y${yConst/yCoef > 0 ? "+" : ""}${yConst/yCoef})^2`)}。<br>`;
                    explanation += `   比較標準形式，可以看出 ${this.wrapWithLatex(`k = ${-yConst/yCoef}`)}<br><br>`;
                    
                    // 提取等號右側的值（半徑的平方）
                    const rSquared = data.radius * data.radius;
                    explanation += `   等號右側 ${rSquared} 表示 r^2 = ${rSquared}，所以 r = ${data.radius}<br><br>`;
                } else {
                    // 如果正則匹配失敗，提供一般性解釋
                    explanation += `3. 通過比較方程格式，我們可以確定：<br>`;
                    explanation += `   圓心坐標為 (${data.centerX}, ${data.centerY})<br>`;
                    explanation += `   半徑為 ${data.radius}<br><br>`;
                }
            } else {
                // 原有的標準形式解釋
                let xPart = '', yPart = '';
                
                if (data.centerX === 0) {
                    xPart = `x^2 表示 h = 0`;
                } else if (data.centerX > 0) {
                    xPart = `(x-${data.centerX})^2 表示 h = ${data.centerX}`;
                } else {
                    xPart = `(x+${Math.abs(data.centerX)})^2 表示 h = ${data.centerX}`;
                }
                
                if (data.centerY === 0) {
                    yPart = `y^2 表示 k = 0`;
                } else if (data.centerY > 0) {
                    yPart = `(y-${data.centerY})^2 表示 k = ${data.centerY}`;
                } else {
                    yPart = `(y+${Math.abs(data.centerY)})^2 表示 k = ${data.centerY}`;
                }
                
                explanation += `3. 對比給定的方程：<br>`;
                explanation += `   - ${xPart}<br>`;
                explanation += `   - ${yPart}<br>`;
                explanation += `   - 等號右側 ${data.radius*data.radius} 表示 r^2 = ${data.radius*data.radius}，所以 r = ${data.radius}<br><br>`;
            }
            
        } else if (data.equationType === 'general') {
            // 一般形式解釋
            explanation += `2. 圓的一般形式為 ${this.wrapWithLatex(`x^2 + y^2 + 2gx + 2fy + c = 0`)}<br>`;
            explanation += `   其中 ${this.wrapWithLatex(`g = -h, f = -k, c = h^2 + k^2 - r^2`)}<br><br>`;
            
            const g = -data.centerX;
            const f = -data.centerY;
            
            explanation += `3. 對比給定的方程，得到：<br>`;
            explanation += `   - ${this.wrapWithLatex(`2g = ${g*2}`)}, 所以 ${this.wrapWithLatex(`g = ${g}`)}<br>`;
            explanation += `   - ${this.wrapWithLatex(`2f = ${f*2}`)}, 所以 ${this.wrapWithLatex(`f = ${f}`)}<br>`;
            explanation += `   - ${this.wrapWithLatex(`c = ${data.centerX*data.centerX + data.centerY*data.centerY - data.radius*data.radius}`)}<br><br>`;
            
            explanation += `4. 根據關係式：<br>`;
            explanation += `   - ${this.wrapWithLatex(`h = -g = ${data.centerX}`)}<br>`;
            explanation += `   - ${this.wrapWithLatex(`k = -f = ${data.centerY}`)}<br>`;
            explanation += `   - ${this.wrapWithLatex(`r^2 = h^2 + k^2 - c = ${data.centerX}^2 + ${data.centerY}^2 - (${data.centerX*data.centerX + data.centerY*data.centerY - data.radius*data.radius}) = ${data.radius*data.radius}`)}<br>`;
            explanation += `   - ${this.wrapWithLatex(`r = \\sqrt{${data.radius*data.radius}} = ${data.radius}`)}<br><br>`;
            
        } else {
            // 複雜形式解釋
            explanation += `2. 觀察可以發現此方程為 ${this.wrapWithLatex(`ax^2 + ay^2 + 2agx + 2afy + ac = 0`)} 的形式<br>`;
            explanation += `   需要先將方程轉換為標準形式 ${this.wrapWithLatex(`x^2 + y^2 + 2gx + 2fy + c = 0`)}<br><br>`;
            
            const a = this.extractCoefficient(data.equation);
            
            explanation += `3. 將方程兩邊同除以 ${a}：<br>`;
            explanation += `   ${this.wrapWithLatex(`x^2 + y^2 + ${(-2*data.centerX)}x + ${(-2*data.centerY)}y + ${(data.centerX*data.centerX + data.centerY*data.centerY - data.radius*data.radius)} = 0`)}<br><br>`;
            
            explanation += `4. 現在方程是一般形式：<br>`;
            explanation += `   - ${this.wrapWithLatex(`2g = ${-2*data.centerX}`)}, 所以 ${this.wrapWithLatex(`g = ${-data.centerX}`)}<br>`;
            explanation += `   - ${this.wrapWithLatex(`2f = ${-2*data.centerY}`)}, 所以 ${this.wrapWithLatex(`f = ${-data.centerY}`)}<br>`;
            explanation += `   - ${this.wrapWithLatex(`c = ${data.centerX*data.centerX + data.centerY*data.centerY - data.radius*data.radius}`)}<br><br>`;
            
            explanation += `5. 根據關係式：<br>`;
            explanation += `   - ${this.wrapWithLatex(`h = -g = ${data.centerX}`)}<br>`;
            explanation += `   - ${this.wrapWithLatex(`k = -f = ${data.centerY}`)}<br>`;
            explanation += `   - ${this.wrapWithLatex(`r^2 = h^2 + k^2 - c = ${data.centerX}^2 + ${data.centerY}^2 - (${data.centerX*data.centerX + data.centerY*data.centerY - data.radius*data.radius}) = ${data.radius*data.radius}`)}<br>`;
            explanation += `   - ${this.wrapWithLatex(`r = \\sqrt{${data.radius*data.radius}} = ${data.radius}`)}<br><br>`;
        }
        
        explanation += `所以圓心坐標為 (${data.centerX}, ${data.centerY})，半徑為 ${data.radius}。`;
        
        return explanation;
    }

    // 從複雜方程中提取係數
    private extractCoefficient(equation: string): number {
        const match = equation.match(/^(\d+)x\^2/);
        return match ? parseInt(match[1]) : 1;
    }
} 