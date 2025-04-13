import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import { LaTeX } from '@/utils/mathUtils';

interface Angle {
    value: number;
    label: string;
    position: 'AOB' | 'BOC' | 'COD' | 'DOE';
}

interface IntersectingLines {
    angles: Angle[];
    points: string[];
    isVertical?: boolean;
}

export default class F1L11_1_Q1_N_MQ extends QuestionGenerator {
    constructor(difficulty: number = 1) {
        super(difficulty, 'F1L11.1_Q1_N_MQ');
    }

    generate(): IGeneratorOutput {
        // 根据难度生成不同的相交线问题
        const lines = (() => {
            switch (this.difficulty) {
                case 1:
                    return this.generateDifficulty1();
                case 2:
                    return this.generateDifficulty2();
                case 3:
                    return this.generateDifficulty3();
                case 4:
                    return this.generateDifficulty4();
                case 5:
                    return this.generateDifficulty5();
                default:
                    return this.generateDifficulty1();
            }
        })();

        // 生成问题内容
        const expression = this.formatExpression(lines);
        const answer = this.getAnswer(lines);
        const wrongAnswers = this.generateWrongAnswers(lines);
        const steps = this.generateSteps(lines);

        return this.getGeneratorOutput({
            content: expression,
            correctAnswer: answer.toString(),
            wrongAnswers: wrongAnswers,
            explanation: steps
        });
    }

    private generateDifficulty1(): IntersectingLines {
        // 生成一个已知角度
        const angle1 = Math.floor(Math.random() * 71) + 20;  // 20°到90°
        const angleX = 180 - angle1;  // 补角
        
        return {
            angles: [
                { value: angle1, label: angle1.toString(), position: 'AOB' },
                { value: angleX, label: 'x', position: 'BOC' }
            ],
            points: ['A', 'O', 'B', 'C']
        };
    }

    private generateDifficulty2(): IntersectingLines {
        // 生成两个已知角度
        const angle1 = Math.floor(Math.random() * 71) + 20;  // 20°到90°
        const angle2 = Math.floor(Math.random() * 71) + 20;  // 20°到90°
        const angleX = 180 - (angle1 + angle2);  // 确保角度和为180°
        
        return {
            angles: [
                { value: angle1, label: angle1.toString(), position: 'AOB' },
                { value: angle2, label: angle2.toString(), position: 'BOC' },
                { value: angleX, label: 'x', position: 'COD' }
            ],
            points: ['A', 'O', 'B', 'C', 'D']
        };
    }

    private generateDifficulty3(): IntersectingLines {
        // 垂直相交线，一个角为90度
        const angle1 = 90;  // 垂直角
        const angle2 = Math.floor(Math.random() * 71) + 20;  // 20°到90°
        const angleX = 90 - angle2;  // 确保和为90度
        
        return {
            angles: [
                { value: angle1, label: '90', position: 'AOB' },
                { value: angle2, label: angle2.toString(), position: 'BOC' },
                { value: angleX, label: 'x', position: 'COD' }
            ],
            points: ['A', 'O', 'B', 'C', 'D'],
            isVertical: true
        };
    }

    private generateDifficulty4(): IntersectingLines {
        // 多角度相交线
        const angle1 = Math.floor(Math.random() * 41) + 20;  // 20°到60°
        const angle2 = Math.floor(Math.random() * 41) + 20;  // 20°到60°
        const angle3 = Math.floor(Math.random() * 41) + 20;  // 20°到60°
        const angleX = 180 - (angle1 + angle2 + angle3);  // 确保总和为180°
        
        return {
            angles: [
                { value: angle1, label: angle1.toString(), position: 'AOB' },
                { value: angle2, label: angle2.toString(), position: 'BOC' },
                { value: angle3, label: angle3.toString(), position: 'COD' },
                { value: angleX, label: 'x', position: 'DOE' }
            ],
            points: ['A', 'O', 'B', 'C', 'D', 'E']
        };
    }

    private generateDifficulty5(): IntersectingLines {
        // 复杂相交线问题
        const angle1 = Math.floor(Math.random() * 31) + 30;  // 30°到60°
        const angle2 = Math.floor(Math.random() * 31) + 30;  // 30°到60°
        const angle3 = 90;  // 垂直角
        const angleX = 180 - (angle1 + angle2);  // 确保和为180°
        
        return {
            angles: [
                { value: angle1, label: angle1.toString(), position: 'AOB' },
                { value: angle2, label: angle2.toString(), position: 'BOC' },
                { value: angle3, label: '90', position: 'COD' },
                { value: angleX, label: 'x', position: 'DOE' }
            ],
            points: ['A', 'O', 'B', 'C', 'D', 'E'],
            isVertical: true
        };
    }

    private formatExpression(lines: IntersectingLines): string {
        let expression = '';
        
        // 从第一个已知角度获取斜线角度
        const knownAngle = lines.angles.find(angle => angle.label !== 'x');
        const slopeAngle = knownAngle ? knownAngle.value : 45;
        
        expression += `
<div style="text-align: center; margin: 20px 0;">
<svg width="300" height="300" viewBox="-150 -150 300 300" style="background: white;">
    <!-- 定义裁剪区域：只显示水平线上方的部分 -->
    <defs>
        <clipPath id="aboveHorizontal">
            <rect x="-150" y="-150" width="300" height="150" />
        </clipPath>
    </defs>

    <!-- 绘制水平线 -->
    <line x1="-120" y1="0" x2="120" y2="0" 
          stroke="black" stroke-width="2"/>
    
    <!-- 绘制斜线，使用实际角度 -->
    <line x1="-120" y1="${120 * Math.tan((90 - slopeAngle) * Math.PI / 180)}" 
          x2="120" y2="${-120 * Math.tan((90 - slopeAngle) * Math.PI / 180)}" 
          stroke="black" stroke-width="2"
          clip-path="url(#aboveHorizontal)"/>
    
    <!-- 绘制角度弧线和标签 -->
    ${lines.angles.map(angle => {
        const pos = this.getAnglePosition(angle.position, lines.isVertical);
        const arcPath = this.getAngleArc(0, 0, 30, angle.position, slopeAngle);
        return `
            <path d="${arcPath}" 
                  fill="none" 
                  stroke="black" 
                  stroke-width="1.5"/>
            <text x="${pos.x * 100}" y="${pos.y * 100}" 
                  text-anchor="middle" 
                  alignment-baseline="middle"
                  style="font-size: 16px;">
                  ${angle.label}${angle.label !== 'x' ? '°' : ''}
            </text>`;
    }).join('\n')}
</svg>
</div>
`;
        
        return expression;
    }

    private getAnglePosition(position: string, isVertical: boolean = false): {x: number, y: number} {
        // 调整角度标签的位置到上方
        const positions: {[key: string]: {x: number, y: number}} = {
            'AOB': {x: -0.3, y: -0.2},  // 左上方
            'BOC': {x: 0.3, y: -0.2},   // 右上方
            'COD': {x: 0.15, y: 0.15},    // 右下角（备用）
            'DOE': {x: -0.15, y: 0.15}    // 左下角（备用）
        };
        
        return positions[position] || {x: 0, y: 0};
    }

    private getAngleArc(x: number, y: number, radius: number, position: Angle['position'], slopeAngle: number): string {
        // 根据角度位置使用不同的半径
        const actualRadius = position === 'AOB' ? radius * 0.6 : radius * 1.2;  // 调整两个弧的大小差异

        // 调整角度范围，第一个弧线从0度到斜线角度
        const angles: Record<Angle['position'], { start: number; end: number }> = {
            'AOB': { start: 0, end: slopeAngle * -1 },     // 从水平线到斜线，使用负角度
            'BOC': { start: slopeAngle * -1, end: 0 },     // 从斜线到水平线
            'COD': { start: 0, end: slopeAngle },          // 备用
            'DOE': { start: slopeAngle, end: 180 }         // 备用
        };

        const startAngle = angles[position]?.start || 0;
        const endAngle = angles[position]?.end || 180;
        
        // 计算弧线路径
        const startRad = startAngle * Math.PI / 180;
        const endRad = endAngle * Math.PI / 180;
        
        const x1 = actualRadius * Math.cos(startRad);
        const y1 = actualRadius * Math.sin(startRad);
        const x2 = actualRadius * Math.cos(endRad);
        const y2 = actualRadius * Math.sin(endRad);
        
        // 调整弧线的绘制方向
        const largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
        const sweepFlag = position === 'AOB' ? 0 : 1;  // 根据位置调整绘制方向

        return `M ${x1} ${y1} A ${actualRadius} ${actualRadius} 0 ${largeArcFlag} ${sweepFlag} ${x2} ${y2}`;
    }

    private getAnswer(lines: IntersectingLines): number {
        // 找到标记为 x 的角度并返回其值
        const xAngle = lines.angles.find(angle => angle.label === 'x');
        return xAngle ? xAngle.value : 0;
    }

    private generateWrongAnswers(lines: IntersectingLines): string[] {
        const correctAnswer = this.getAnswer(lines);
        const wrongAnswers = new Set<string>();
        
        // 生成错误答案的策略
        const strategies = [
            // 基本计算错误
            () => (180 - correctAnswer).toString(),  // 补角错误
            () => (correctAnswer + 10).toString(),   // 加10度
            () => (correctAnswer - 10).toString(),   // 减10度
            () => (90).toString(),                  // 假设是直角
            
            // 常见概念错误
            () => (360 - correctAnswer).toString(),  // 误用圆周角
            () => (correctAnswer / 2).toString(),    // 误以为是一半
            () => (180 + correctAnswer).toString(),  // 误加180度
            
            // 运算错误
            () => (Math.floor(correctAnswer * 1.5)).toString(),  // 乘1.5错误
            () => (correctAnswer * 2).toString(),    // 乘2错误
            () => (Math.abs(90 - correctAnswer)).toString(),  // 与90度的差
            
            // 相关角度错误
            () => (lines.angles[0].value).toString(),  // 直接使用其他已知角
            () => (180 - lines.angles[0].value).toString()  // 使用其他角的补角
        ];
        
        // 根据难度选择错误答案策略
        const difficultyStrategies = strategies.slice(0, 3 + this.difficulty * 2);
        
        // 随机使用策略生成错误答案
        while (wrongAnswers.size < 3) {
            const strategy = difficultyStrategies[Math.floor(Math.random() * difficultyStrategies.length)];
            const wrongAnswer = strategy();
            const wrongNum = parseInt(wrongAnswer);
            
            if (wrongAnswer !== correctAnswer.toString() && 
                wrongNum > 0 && 
                wrongNum < 180 && 
                !Array.from(wrongAnswers).includes(wrongAnswer)) {
                wrongAnswers.add(wrongAnswer);
            }
        }
        
        return Array.from(wrongAnswers);
    }

    private generateSteps(lines: IntersectingLines): string {
        let steps = `解題步驟：<br><br>`;
        
        switch (this.difficulty) {
            case 1:
                steps += `1. 觀察圖形：<br>` +
                    `   - 兩條直線相交<br>` +
                    `   - 已知一個角為 ${lines.angles[0].value}°<br><br>` +
                    `2. 應用相鄰補角原理：<br>` +
                    `   - 相鄰兩角和為 180°<br>` +
                    `   - ${lines.angles[0].value}° + x = 180°<br><br>` +
                    `3. 求解：<br>` +
                    `   x = 180° - ${lines.angles[0].value}°<br>` +
                    `   x = ${lines.angles[1].value}°`;
                break;

            case 2:
                steps += `1. 觀察圖形：<br>` +
                    `   - 兩條直線相交<br>` +
                    `   - 已知兩個角分別為 ${lines.angles[0].value}° 和 ${lines.angles[1].value}°<br><br>` +
                    `2. 應用相鄰補角原理：<br>` +
                    `   - 相鄰三角的和為 180°<br>` +
                    `   - ${lines.angles[0].value}° + ${lines.angles[1].value}° + x = 180°<br><br>` +
                    `3. 求解：<br>` +
                    `   x = 180° - (${lines.angles[0].value}° + ${lines.angles[1].value}°)<br>` +
                    `   x = 180° - ${lines.angles[0].value + lines.angles[1].value}°<br>` +
                    `   x = ${lines.angles[2].value}°`;
                break;

            case 3:
                steps += `1. 觀察圖形：<br>` +
                    `   - 兩條直線垂直相交<br>` +
                    `   - 垂直角為 90°<br>` +
                    `   - 已知一個角為 ${lines.angles[1].value}°<br><br>` +
                    `2. 應用垂直線原理：<br>` +
                    `   - 垂直相交形成的相鄰兩角和為 90°<br>` +
                    `   - ${lines.angles[1].value}° + x = 90°<br><br>` +
                    `3. 求解：<br>` +
                    `   x = 90° - ${lines.angles[1].value}°<br>` +
                    `   x = ${lines.angles[2].value}°`;
                break;

            case 4:
                steps += `1. 觀察圖形：<br>` +
                    `   - 兩條直線相交<br>` +
                    `   - 已知三個角分別為：<br>` +
                    `     ${lines.angles[0].value}°, ${lines.angles[1].value}°, ${lines.angles[2].value}°<br><br>` +
                    `2. 應用相鄰補角原理：<br>` +
                    `   - 相鄰四角的和為 180°<br>` +
                    `   - ${lines.angles[0].value}° + ${lines.angles[1].value}° + ${lines.angles[2].value}° + x = 180°<br><br>` +
                    `3. 求解：<br>` +
                    `   x = 180° - (${lines.angles[0].value}° + ${lines.angles[1].value}° + ${lines.angles[2].value}°)<br>` +
                    `   x = 180° - ${lines.angles[0].value + lines.angles[1].value + lines.angles[2].value}°<br>` +
                    `   x = ${lines.angles[3].value}°`;
                break;

            case 5:
                steps += `1. 觀察圖形：<br>` +
                    `   - 兩組相交線<br>` +
                    `   - 已知角度：<br>` +
                    `     ${lines.angles[0].value}°, ${lines.angles[1].value}°, 90°<br><br>` +
                    `2. 應用垂直線和相鄰補角原理：<br>` +
                    `   - 第一組相鄰角：${lines.angles[0].value}° + ${lines.angles[1].value}° + x = 180°<br>` +
                    `   - 其中一條線與垂直線相交<br><br>` +
                    `3. 求解：<br>` +
                    `   x = 180° - (${lines.angles[0].value}° + ${lines.angles[1].value}°)<br>` +
                    `   x = 180° - ${lines.angles[0].value + lines.angles[1].value}°<br>` +
                    `   x = ${lines.angles[3].value}°`;
                break;
        }
        
        return steps;
    }
} 