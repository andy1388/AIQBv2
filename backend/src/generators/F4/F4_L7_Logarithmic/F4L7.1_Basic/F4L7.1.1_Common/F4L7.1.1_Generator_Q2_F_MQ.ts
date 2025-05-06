import { QuestionGenerator, IGeneratorOutput } from '../../../../QuestionGenerator';

interface LogQuestion {
    expression: string;
    answer: string;
}

export default class F4L7_1_1_Generator_Q2_F_MQ extends QuestionGenerator {
    static readonly MAX_DIFFICULTY = 4;

    constructor(difficulty: number = 1) {
        super(difficulty, 'F4L7.1.1_Common');
        this.difficulty = difficulty;
    }

    private generateLevel1Question(): LogQuestion {
        // Level 1: log(10^n), n的範圍：1-5
        const n = Math.floor(Math.random() * 5) + 1;  // 1 to 5
        return {
            expression: `\\log(10^{${n}})`,
            answer: `${n}`
        };
    }

    private generateLevel2Question(): LogQuestion {
        // Level 2: log(10^n), n的範圍：-1至-6
        const n = -(Math.floor(Math.random() * 6) + 1);  // -1 to -6
        
        // 随机选择使用小数或分数形式
        const useDecimal = Math.random() < 0.5;
        
        if (useDecimal) {
            // 小数形式：0.1, 0.01, 0.001 等
            return {
                expression: `\\log(${Math.pow(10, n)})`,
                answer: `${n}`
            };
        } else {
            // 分数形式：1/10, 1/100, 1/1000 等
            return {
                expression: `\\log(\\frac{1}{${Math.pow(10, -n)}})`,
                answer: `${n}`
            };
        }
    }

    private generateLevel3Question(): LogQuestion {
        // Level 3: log(a×b×c)，结果必须是10的整数次方
        
        // 预定义一些常见的因子组合，确保乘积是10的整数次方
        const combinations = [
            // 结果为 1000 (10^3)
            { a: 2, b: 5, c: 100 },
            { a: 4, b: 25, c: 10 },
            { a: 2, b: 2, c: 250 },
            { a: 8, b: 125, c: 1 },
            // 结果为 100 (10^2)
            { a: 2, b: 5, c: 10 },
            { a: 4, b: 25, c: 1 },
            // 结果为 10000 (10^4)
            { a: 2, b: 5, c: 1000 },
            { a: 4, b: 25, c: 100 },
        ];
        
        const combo = combinations[Math.floor(Math.random() * combinations.length)];
        const power = Math.log10(combo.a * combo.b * combo.c);
        
        return {
            expression: `\\log(${combo.a}\\times${combo.b}\\times${combo.c})`,
            answer: `${power}`
        };
    }

    private generateLevel4Question(): LogQuestion {
        // 根式对数和复合运算
        const options = [
            { expression: '\\log\\sqrt{1000}', answer: '\\frac{3}{2}' },
            { expression: '\\log\\sqrt[4]{100000}', answer: '\\frac{5}{4}' },
            { expression: '\\log\\sqrt{0.01}', answer: '-1' }
        ];
        return options[Math.floor(Math.random() * options.length)];
    }

    private generateQuestion(): LogQuestion {
        switch (this.difficulty) {
            case 1:
                return this.generateLevel1Question();
            case 2:
                return this.generateLevel2Question();
            case 3:
                return this.generateLevel3Question();
            case 4:
                return this.generateLevel4Question();
            default:
                return this.generateLevel1Question();
        }
    }

    private generateWrongAnswers(correctAnswer: string): string[] {
        const wrongAnswers: string[] = [];
        
        // 生成错误答案的策略
        const strategies = [
            // 正负号错误
            (ans: string) => ans.startsWith('-') ? ans.slice(1) : `-${ans}`,
            // 分数计算错误
            (ans: string) => {
                if (ans.includes('\\frac{')) {
                    const [num, den] = ans.match(/\\frac\{(\d+)\}\{(\d+)\}/)!.slice(1);
                    return `\\frac{${parseInt(num) + 1}}{${den}}`;
                }
                return String(Number(ans) + 1);
            },
            // 常见错误
            (ans: string) => String(Math.abs(Number(ans)) * 2)
        ];

        // 生成三个错误答案
        while (wrongAnswers.length < 3) {
            const strategy = strategies[Math.floor(Math.random() * strategies.length)];
            const wrongAns = strategy(correctAnswer);
            if (!wrongAnswers.includes(wrongAns) && wrongAns !== correctAnswer) {
                wrongAnswers.push(wrongAns);
            }
        }

        return wrongAnswers;
    }

    generate(): IGeneratorOutput {
        const question = this.generateQuestion();
        const wrongAnswers = this.generateWrongAnswers(question.answer);
        
        // 创建所有选项数组
        let options = ['', '', '', ''];  // 创建固定长度为4的数组
        
        // 随机选择位置放置正确答案
        const correctIndex = Math.floor(Math.random() * 4);
        options[correctIndex] = question.answer;
        
        // 填充错误答案
        let wrongIndex = 0;
        for (let i = 0; i < 4; i++) {
            if (i !== correctIndex) {
                options[i] = wrongAnswers[wrongIndex++];
            }
        }

        return {
            content: question.expression,
            options: options,
            correctAnswer: question.answer,
            correctIndex,
            explanation: `
                <div class="explanation-content">
                    解題步驟：

                    1. 觀察題目：
                    ${question.expression}

                    2. 使用對數運算法則：
                    ${question.expression} = ${question.answer}
                </div>

                <div class="next-question-container">
                    <button onclick="window.nextQuestion()" class="next-btn">
                        下一題 <span class="arrow">→</span>
                    </button>
                </div>
            `
        };
    }
} 