import { QuestionGenerator, IGeneratorOutput } from '../../../QuestionGenerator';

interface Factor {
    m: number;  // 第一个因子的系数
    n: number;  // 第二个因子的系数
    type?: 'difference' | 'plusSquare' | 'minusSquare';  // 难度5的类型
    var1?: string;  // 第一个变量（默认为x）
    var2?: string;  // 第二个变量（默认为y）
}

export default class F2L2_5_Generator_Q2_N_MQ extends QuestionGenerator {
    private readonly VARIABLES = ['x', 'y', 'z', 'a', 'b', 'p', 'q', 'r', 's', 't'];

    constructor(difficulty: number = 1) {
        super(difficulty, 'F2L2.5');
    }

    generate(): IGeneratorOutput {
        // 生成两个因子
        const factors = this.generateFactors();
        
        // 计算系数
        const b = -(factors.m + factors.n);  // xy项系数为 -(m+n)
        const c = factors.m * factors.n;      // y²项系数为 m*n
        
        // 生成题目表达式
        const expression = this.formatExpression(b, c, factors.var1, factors.var2);
        
        // 生成正确答案
        const answer = this.formatAnswer(factors);
        
        // 生成错误选项
        const wrongAnswers = this.generateWrongAnswers(factors);
        
        // 随机打乱选项并记录正确答案的位置
        const options = [answer, ...wrongAnswers];
        const shuffledOptions = this.shuffleArray([...options]);
        const correctIndex = shuffledOptions.indexOf(answer);

        // 生成解题步骤
        const steps = this.generateSteps(b, c, factors);

        return {
            content: expression,
            correctAnswer: answer,
            options: shuffledOptions,
            correctIndex: correctIndex,
            explanation: steps
        };
    }

    private generateFactors(): Factor {
        let m: number = 0;
        let n: number = 0;
        let type: 'difference' | 'plusSquare' | 'minusSquare' | undefined;
        let var1: string = 'x';
        let var2: string = 'y';
        
        switch (this.difficulty) {
            case 1: // 简单：全为负整数
                m = -(Math.floor(Math.random() * 4) + 1);
                do {
                    n = -(Math.floor(Math.random() * 9) + 1);
                } while (n === m || Math.abs(n) <= Math.abs(m));
                break;

            case 2: // 中等：全为正整数
                m = Math.floor(Math.random() * 4) + 1;
                do {
                    n = Math.floor(Math.random() * 9) + 1;
                } while (n === m || n <= m);
                break;

            case 3: // 较难：一正一负
                m = -(Math.floor(Math.random() * 7) + 2);
                do {
                    n = Math.floor(Math.random() * 7) + 2;
                } while (n === -m);
                break;

            case 4: // 进阶：其他变量组合
                // 随机选择两个不同的变量
                const vars = this.shuffleArray([...this.VARIABLES]);
                [var1, var2] = vars.slice(0, 2);
                
                const generateNumber = () => {
                    const num = Math.floor(Math.random() * 25) - 7;  // -7 到 17
                    return num === 0 ? 1 : num;
                };
                
                do {
                    m = generateNumber();
                    n = generateNumber();
                } while (m === n || m === -n);
                break;

            case 5: // 挑战：完全平方式
                m = Math.floor(Math.random() * 12) + 2;  // 2 到 13
                
                const typeIndex = Math.floor(Math.random() * 3);
                switch (typeIndex) {
                    case 0: // 完全平方差
                        type = 'difference';
                        n = -m;
                        break;
                    case 1: // 完全平方式 (x + my)²
                        type = 'plusSquare';
                        n = m;
                        break;
                    case 2: // 完全平方式 (x - my)²
                        type = 'minusSquare';
                        n = m;
                        break;
                }
                break;
        }
        
        return { m, n, type, var1, var2 };
    }

    private formatExpression(b: number, c: number, var1: string = 'x', var2: string = 'y'): string {
        const bTerm = b === 0 ? '' : 
                     b === 1 ? `+ ${var1}${var2}` :
                     b === -1 ? `- ${var1}${var2}` :
                     b > 0 ? `+ ${b}${var1}${var2}` : `${b}${var1}${var2}`;
        const cTerm = c === 0 ? '' :
                     c > 0 ? `+ ${c}${var2}^2` : `${c}${var2}^2`;
        
        // 使用 LaTeX 格式
        return `${var1}^2 ${bTerm} ${cTerm}`;
    }

    private formatAnswer(factors: Factor): string {
        const { m, n, type, var1 = 'x', var2 = 'y' } = factors;
        
        // 对于难度5的完全平方式
        if (this.difficulty === 5) {
            switch (type) {
                case 'difference':  // x² - m²y²
                    return `(${var1} + ${m}${var2})(${var1} - ${m}${var2})`;
                case 'plusSquare':  // (x + my)²
                    return `(${var1} + ${m}${var2})^2`;
                case 'minusSquare': // (x - my)²
                    return `(${var1} - ${m}${var2})^2`;
            }
        }

        // 其他难度的格式
        const firstTerm = m === 0 ? var1 :
                         m > 0 ? `(${var1} - ${m}${var2})` : `(${var1} + ${-m}${var2})`;
        const secondTerm = n === 0 ? var1 :
                          n > 0 ? `(${var1} - ${n}${var2})` : `(${var1} + ${-n}${var2})`;
        return `${firstTerm}${secondTerm}`;
    }

    private areFactorsEquivalent(f1: Factor, f2: Factor): boolean {
        // 检查两组因子是否等价（考虑交换顺序）
        return (f1.m === f2.m && f1.n === f2.n) || 
               (f1.m === f2.n && f1.n === f2.m);
    }

    private generateWrongAnswers(factors: Factor): string[] {
        const wrongAnswers = new Set<string>();
        const { m, n, type, var1 = 'x', var2 = 'y' } = factors;

        if (this.difficulty === 5) {
            switch (type) {
                case 'difference':  // x² - m²y²
                    // 1. 相邻的平方数
                    wrongAnswers.add(`(${var1} + ${m-1}${var2})(${var1} - ${m-1}${var2})`);
                    wrongAnswers.add(`(${var1} + ${m+1}${var2})(${var1} - ${m+1}${var2})`);
                    // 2. 符号错误
                    wrongAnswers.add(`(${var1} + ${m}${var2})^2`);
                    wrongAnswers.add(`(${var1} - ${m}${var2})^2`);
                    // 3. 不同系数
                    wrongAnswers.add(`(${var1} + ${m}${var2})(${var1} - ${m+1}${var2})`);
                    break;

                case 'plusSquare':  // (x + my)²
                    // 1. 符号错误
                    wrongAnswers.add(`(${var1} - ${m}${var2})^2`);
                    // 2. 系数错误
                    wrongAnswers.add(`(${var1} + ${m-1}${var2})^2`);
                    wrongAnswers.add(`(${var1} + ${m+1}${var2})^2`);
                    // 3. 展开错误
                    wrongAnswers.add(`(${var1} + ${m/2}${var2})^2`);
                    break;

                case 'minusSquare':  // (x - my)²
                    // 1. 符号错误
                    wrongAnswers.add(`(${var1} + ${m}${var2})^2`);
                    // 2. 系数错误
                    wrongAnswers.add(`(${var1} - ${m-1}${var2})^2`);
                    wrongAnswers.add(`(${var1} - ${m+1}${var2})^2`);
                    // 3. 展开错误
                    wrongAnswers.add(`(${var1} - ${m/2}${var2})^2`);
                    break;
            }
        } else {
            // 其他难度的错误答案生成
            const wrongChoices: Factor[] = [
                // 1. 符号错误：反转符号
                { m: -m, n: -n, var1, var2 },
                // 2. 系数计算错误：加减1
                { m: m + 1, n: n - 1, var1, var2 },
                { m: m - 1, n: n + 1, var1, var2 },
                // 3. 随机变化
                { m: m + 2, n: n - 2, var1, var2 },
                { m: m - 2, n: n + 2, var1, var2 },
                // 4. 其他变化
                { m: m + 1, n: n + 1, var1, var2 },
                { m: m - 1, n: n - 1, var1, var2 }
            ];

            // 过滤掉等价的答案
            const validWrongs = wrongChoices.filter(wrong => 
                !this.areFactorsEquivalent(factors, wrong)
            );

            // 添加有效的错误答案
            validWrongs.forEach(wrong => {
                wrongAnswers.add(this.formatAnswer(wrong));
            });
        }

        return Array.from(wrongAnswers).slice(0, 3);
    }

    private generateSteps(b: number, c: number, factors: Factor): string {
        const { m, n, type, var1 = 'x', var2 = 'y' } = factors;

        if (this.difficulty === 5) {
            switch (type) {
                case 'difference':
                    return `解題步驟：
1. 觀察二次項：\\[${var1}^2 ${c >= 0 ? '+' : ''}${c}${var2}^2\\]
2. 發現這是完全平方差的形式：\\[${var1}^2 - (${m}${var2})^2\\]
3. 因式分解：
   - 可以寫成 \\[${var1}^2 - (${m}${var2})^2\\] 的形式
   - 使用公式：\\[a^2 - b^2 = (a + b)(a - b)\\]
4. 最終答案：\\[(${var1} + ${m}${var2})(${var1} - ${m}${var2})\\]`;

                case 'plusSquare':
                    return `解題步驟：
1. 觀察二次項：\\[${var1}^2 ${b >= 0 ? '+' : ''}${b}${var1}${var2} ${c >= 0 ? '+' : ''}${c}${var2}^2\\]
2. 發現這是完全平方式：\\[${var1}^2 + 2(${m}${var2})${var1} + (${m}${var2})^2\\]
3. 因式分解：
   - ${var1}${var2}項係數為 ${2*m}，是${var2}^2項係數 ${m*m} 的平方根的2倍
   - 這是 \\[(${var1} + ${m}${var2})\\] 的完全平方式
4. 最終答案：\\[(${var1} + ${m}${var2})^2\\]`;

                case 'minusSquare':
                    return `解題步驟：
1. 觀察二次項：\\[${var1}^2 ${b >= 0 ? '+' : ''}${b}${var1}${var2} ${c >= 0 ? '+' : ''}${c}${var2}^2\\]
2. 發現這是完全平方式：\\[${var1}^2 - 2(${m}${var2})${var1} + (${m}${var2})^2\\]
3. 因式分解：
   - ${var1}${var2}項係數為 ${-2*m}，是${var2}^2項係數 ${m*m} 的平方根的-2倍
   - 這是 \\[(${var1} - ${m}${var2})\\] 的完全平方式
4. 最終答案：\\[(${var1} - ${m}${var2})^2\\]`;
            }
        }

        // 其他难度的解题步骤
        return `解題步驟：
1. 觀察二次項：
   \\[${var1}^2 ${b >= 0 ? '+' : ''}${b}${var1}${var2} ${c >= 0 ? '+' : ''}${c}${var2}^2\\]

2. 找出兩個數：
   - 它們的和為${var1}${var2}項係數的相反數：
     \\[${m} + ${n} = ${-b}\\]
   - 它們的積為${var2}^2項係數：
     \\[${m} \\times ${n} = ${c}\\]

3. 因式分解：
   - 第一個因式：
     \\[(${var1} ${m >= 0 ? '- ' + m : '+ ' + (-m)}${var2})\\]
   - 第二個因式：
     \\[(${var1} ${n >= 0 ? '- ' + n : '+ ' + (-n)}${var2})\\]

4. 最終答案：
   \\[(${var1} ${m >= 0 ? '- ' + m : '+ ' + (-m)}${var2})(${var1} ${n >= 0 ? '- ' + n : '+ ' + (-n)}${var2})\\]`;
    }
} 