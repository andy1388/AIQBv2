import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import {
    getRandomInt,
    LaTeX,
    getNonZeroRandomInt
} from '@/utils/mathUtils';

interface TemplateEquation {
    leftSide: string;
    rightSide: string;
    solution: number;
}

export default class F2L1_1_1_Q1_F_MQ extends QuestionGenerator {
    constructor(difficulty: number) {
        super(difficulty, 'F2L1.1.1_Q1_F_MQ');
    }

    generate(): IGeneratorOutput {
        let equation: TemplateEquation;
        
        // 根据难度生成方程
        switch (this.difficulty) {
            case 1:
                equation = this.generateLevel1();
                break;
            case 2:
                equation = this.generateLevel2();
                break;
            default:
                throw new Error(`不支援的难度等级: ${this.difficulty}`);
        }

        // 生成错误答案
        const wrongAnswers = this.generateWrongAnswers(equation.solution);

        // 格式化题目和答案
        const content = `\\[${equation.leftSide} = ${equation.rightSide}\\]`;
        const correctAnswer = equation.solution.toString();
        const explanation = this.generateExplanation(equation);

        return {
            content: content,
            correctAnswer: correctAnswer,
            wrongAnswers: wrongAnswers,
            explanation: explanation,
            type: 'text',
            displayOptions: {
                latex: true
            }
        };
    }

    private generateLevel1(): TemplateEquation {
        // 简单形式：x ± b = c
        const solution = getRandomInt(-10, 10);
        const b = getNonZeroRandomInt(-10, 10);
        const c = solution + b;

        return {
            leftSide: `x ${LaTeX.formatConstant(b)}`,
            rightSide: c.toString(),
            solution
        };
    }

    private generateLevel2(): TemplateEquation {
        // 标准形式：ax ± b = c
        const solution = getRandomInt(-10, 10);
        const a = getNonZeroRandomInt(-5, 5);
        const b = getNonZeroRandomInt(-10, 10);
        const c = a * solution + b;

        return {
            leftSide: `${LaTeX.formatLinearTerm(a, 'x')} ${LaTeX.formatConstant(b)}`,
            rightSide: c.toString(),
            solution
        };
    }

    private generateWrongAnswers(correctAnswer: number): string[] {
        const wrongAnswers: string[] = [];
        
        while (wrongAnswers.length < 3) {
            const wrong = correctAnswer + (Math.floor(Math.random() * 5) + 1) * 
                         (Math.random() < 0.5 ? 1 : -1);
            
            if (!wrongAnswers.includes(wrong.toString()) && wrong !== correctAnswer) {
                wrongAnswers.push(wrong.toString());
            }
        }
        
        return wrongAnswers;
    }

    private generateExplanation(equation: TemplateEquation): string {
        const steps: string[] = [];
        
        if (this.difficulty === 1) {
            // Level 1: x + b = c
            const matches = equation.leftSide.match(/-?\d+/g)?.map(Number);
            const c = parseInt(equation.rightSide);
            const b = matches?.[0] || 0;
            
            steps.push(
                '1. 移项：将常数项移到等号右边',
                `\\[${equation.leftSide} = ${equation.rightSide}\\]`,
                `\\[x = ${c} ${LaTeX.formatConstant(-b)}\\]`,
                '2. 计算：解出变量的值',
                `\\[x = ${equation.solution}\\]`
            );
        } else {
            // Level 2: ax + b = c
            const matches = equation.leftSide.match(/-?\d+/g)?.map(Number);
            const c = parseInt(equation.rightSide);
            const [a, b] = matches || [1, 0];
            
            steps.push(
                '1. 移项：将常数项移到等号右边',
                `\\[${equation.leftSide} = ${equation.rightSide}\\]`,
                `\\[${LaTeX.formatLinearTerm(a, 'x')} = ${c} ${LaTeX.formatConstant(-b)}\\]`,
                '2. 计算：解出变量的值',
                `\\[x = \\frac{${c - b}}{${a}}\\]`,
                `\\[x = ${equation.solution}\\]`
            );
        }

        return steps.join('\n');
    }
} 