import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import { LaTeX } from '@/utils/mathUtils';

interface Factor {
    m: number;  // 第一个因子
    n: number;  // 第二个因子
    type?: 'difference' | 'plusSquare' | 'minusSquare';  // 难度5的类型
}

export default class F2L2_5_Q1_F_MQ extends QuestionGenerator {
    constructor(difficulty: number = 1) {
        super(difficulty, 'F2L2.5_Q1_F_MQ');
    }

    generate(): IGeneratorOutput {
        // 生成两个因子
        const factors = this.generateFactors();
        
        // 计算系数
        const b = -(factors.m + factors.n);  // 一次项系数为 -(m+n)
        const c = factors.m * factors.n;      // 常数项为 m*n
        
        // 生成题目表达式
        const expression = this.formatExpression(b, c);
        
        // 生成正确答案
        const correctAnswer = this.formatAnswer(factors);
        
        // 生成错误选项
        const wrongAnswers = this.generateWrongAnswers(factors);
        
        // 生成解题步骤
        const explanation = this.generateSteps(b, c, factors);

        return {
            content: `\\[${expression}\\]`,
            correctAnswer,
            wrongAnswers,
            explanation,
            type: 'text',
            displayOptions: {
                latex: true
            }
        };
    }

    private generateFactors(): Factor {
        let m: number = 0;  // 初始化为0
        let n: number = 0;  // 初始化为0
        let type: 'difference' | 'plusSquare' | 'minusSquare' | undefined;
        
        switch (this.difficulty) {
            case 1: // 简单：全为负整数
                // m 范围：-1 到 -4
                m = -(Math.floor(Math.random() * 4) + 1);  // 确保 m ∈ {-1, -2, -3, -4}
                do {
                    // n 范围：-1 到 -9，且 |n| > |m|
                    n = -(Math.floor(Math.random() * 9) + 1);  // 确保 n ∈ {-1, -2, ..., -9}
                } while (n === m || Math.abs(n) <= Math.abs(m));
                break;

            case 2: // 中等：全为正整数
                // m 范围：1 到 4
                m = Math.floor(Math.random() * 4) + 1;  // 确保 m ∈ {1, 2, 3, 4}
                do {
                    // n 范围：1 到 9，且 n > m
                    n = Math.floor(Math.random() * 9) + 1;  // 确保 n ∈ {1, 2, ..., 9}
                } while (n === m || n <= m);
                break;

            case 3: // 较难：一正一负
                // m 范围：-8 到 -2
                m = -(Math.floor(Math.random() * 7) + 2);  // 确保 m ∈ {-2, -3, ..., -8}
                do {
                    // n 范围：2 到 8
                    n = Math.floor(Math.random() * 7) + 2;  // 确保 n ∈ {2, 3, ..., 8}
                } while (n === -m);  // 避免 n = -m
                break;

            case 4: // 进阶：混合范围
                // m, n 范围：-7 到 17（不含0）
                const generateNumber = () => {
                    const num = Math.floor(Math.random() * 25) - 7;  // -7 到 17
                    return num === 0 ? 1 : num;  // 如果是0，返回1
                };
                
                do {
                    m = generateNumber();
                    n = generateNumber();
                } while (m === n || m === -n);  // 避免相等和互为相反数的情况
                break;

            case 5: // 挑战：完全平方式
                // m 范围：2 到 13
                m = Math.floor(Math.random() * 12) + 2;  // 确保 m ∈ {2, 3, ..., 13}
                
                // 随机选择类型
                const typeIndex = Math.floor(Math.random() * 3);
                switch (typeIndex) {
                    case 0: // 完全平方差
                        type = 'difference';
                        n = -m;  // x² - m² = (x + m)(x - m)
                        break;
                    case 1: // 完全平方式 (x + m)²
                        type = 'plusSquare';
                        n = m;   // x² + 2mx + m² = (x + m)²
                        break;
                    case 2: // 完全平方式 (x - m)²
                        type = 'minusSquare';
                        n = m;   // x² - 2mx + m² = (x - m)²
                        break;
                }
                break;

            default:
                throw new Error(`难度等级 ${this.difficulty} 不可用`);
        }
        
        return { m, n, type };
    }

    private formatExpression(b: number, c: number): string {
        // 一次项处理
        let bTerm;
        if (b === 0) {
            bTerm = '';
        } else if (b === 1) {
            bTerm = '+x';  // 确保显示加号
        } else if (b === -1) {
            bTerm = '-x';
        } else if (b > 0) {
            bTerm = `+${b}x`;  // 确保显示加号
        } else {
            bTerm = `${b}x`;  // 负数会自动带负号
        }

        // 常数项处理
        let cTerm;
        if (c === 0) {
            cTerm = '';
        } else if (c > 0) {
            cTerm = `+${c}`;  // 确保显示加号
        } else {
            cTerm = `${c}`;  // 负数会自动带负号
        }

        // 移除开头的加号（如果存在）
        const expression = `x^2${bTerm}${cTerm}`;
        return expression.replace(/^\+/, '');  // 移除表达式开头的加号
    }

    private formatAnswer(factors: Factor): string {
        const { m, n, type } = factors;
        
        // 对于难度5的完全平方式
        if (this.difficulty === 5) {
            switch (type) {
                case 'difference':  // x² - m²
                    return `(x + ${m})(x - ${m})`;
                case 'plusSquare':  // (x + m)²
                    return `(x + ${m})^2`;
                case 'minusSquare': // (x - m)²
                    return `(x - ${m})^2`;
            }
        }

        // 其他难度的格式保持不变
        const firstTerm = m === 0 ? 'x' :
                         m > 0 ? `(x - ${m})` : `(x + ${-m})`;
        const secondTerm = n === 0 ? 'x' :
                          n > 0 ? `(x - ${n})` : `(x + ${-n})`;
        return `${firstTerm}${secondTerm}`;
    }

    private areFactorsEquivalent(f1: Factor, f2: Factor): boolean {
        // 检查两组因子是否等价（考虑交换顺序）
        return (f1.m === f2.m && f1.n === f2.n) || 
               (f1.m === f2.n && f1.n === f2.m);
    }

    private generateWrongAnswers(factors: Factor): string[] {
        const wrongAnswers = new Set<string>();
        const { m, n, type } = factors;

        if (this.difficulty === 5) {
            switch (type) {
                case 'difference':  // x² - m²
                    // 1. 相邻的平方数
                    wrongAnswers.add(this.formatAnswer({ m: m - 1, n: -(m - 1) }));
                    wrongAnswers.add(this.formatAnswer({ m: m + 1, n: -(m + 1) }));
                    // 2. 符号错误
                    wrongAnswers.add(this.formatAnswer({ m: m, n: m }));
                    wrongAnswers.add(this.formatAnswer({ m: -m, n: -m }));
                    // 3. 不同系数
                    wrongAnswers.add(this.formatAnswer({ m: m, n: -(m + 1) }));
                    break;

                case 'plusSquare':  // (x + m)²
                    // 1. 符号错误
                    wrongAnswers.add(`(x - ${m})^2`);
                    // 2. 系数错误
                    wrongAnswers.add(`(x + ${m - 1})^2`);
                    wrongAnswers.add(`(x + ${m + 1})^2`);
                    // 3. 展开错误
                    wrongAnswers.add(`(x + ${m/2})^2`);
                    break;

                case 'minusSquare':  // (x - m)²
                    // 1. 符号错误
                    wrongAnswers.add(`(x + ${m})^2`);
                    // 2. 系数错误
                    wrongAnswers.add(`(x - ${m - 1})^2`);
                    wrongAnswers.add(`(x - ${m + 1})^2`);
                    // 3. 展开错误
                    wrongAnswers.add(`(x - ${m/2})^2`);
                    break;
            }
        } else {
            // 其他难度的错误答案生成
            const wrongChoices: Factor[] = [
                // 1. 符号错误：反转符号
                { m: -m, n: -n },
                // 2. 系数计算错误：加减1
                { m: m + 1, n: n - 1 },
                { m: m - 1, n: n + 1 },
                // 3. 随机变化
                { m: m + 2, n: n - 2 },
                { m: m - 2, n: n + 2 },
                // 4. 其他变化
                { m: m + 1, n: n + 1 },
                { m: m - 1, n: n - 1 }
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

        // 确保返回恰好3个错误答案
        const result = Array.from(wrongAnswers).slice(0, 3);
        while (result.length < 3) {
            // 如果错误答案不够，添加一些基本的变体
            const variation = this.formatAnswer({
                m: m + result.length + 1,
                n: n - result.length - 1
            });
            if (!result.includes(variation)) {
                result.push(variation);
            }
        }

        return result;
    }

    private generateSteps(b: number, c: number, factors: Factor): string {
        const { m, n, type } = factors;

        if (this.difficulty === 5) {
            switch (type) {
                case 'difference':
                    return `解題步驟：<br><br>` +
                        `1. 觀察二次項：<br>` +
                        `\\[x^2 ${LaTeX.formatConstant(c)}\\]<br><br>` +
                        `2. 發現這是完全平方差的形式：<br>` +
                        `\\[x^2 - ${m * m}\\]<br><br>` +
                        `3. 因式分解：<br>` +
                        `   - 可以寫成 \\[x^2 - (${m})^2\\] 的形式<br>` +
                        `   - 使用公式：\\[a^2 - b^2 = (a + b)(a - b)\\]<br><br>` +
                        `4. 最終答案：<br>` +
                        `\\[(x + ${m})(x - ${m})\\]`;

                case 'plusSquare':
                    return `解題步驟：<br><br>` +
                        `1. 觀察二次項：<br>` +
                        `\\[x^2 ${LaTeX.formatLinearTerm(b, 'x')} ${LaTeX.formatConstant(c)}\\]<br><br>` +
                        `2. 發現這是完全平方式：<br>` +
                        `\\[x^2 + 2(${m})x + ${m}^2\\]\n\n` +
                        `3. 因式分解：<br>` +
                        `   - 一次項係數為 ${2*m}，是常數項 ${m*m} 的平方根的2倍<br>` +
                        `   - 這是 \\[(x + ${m})\\] 的完全平方式<br><br>` +
                        `4. 最終答案：<br>` +
                        `\\[(x + ${m})^2\\]`;

                case 'minusSquare':
                    return `解題步驟：<br><br>` +
                        `1. 觀察二次項：<br>` +
                        `\\[x^2 ${LaTeX.formatLinearTerm(b, 'x')} ${LaTeX.formatConstant(c)}\\]<br><br>` +
                        `2. 發現這是完全平方式：<br>` +
                        `\\[x^2 - 2(${m})x + ${m}^2\\]\n\n` +
                        `3. 因式分解：<br>` +
                        `   - 一次項係數為 ${-2*m}，是常數項 ${m*m} 的平方根的-2倍<br>` +
                        `   - 這是 \\[(x - ${m})\\] 的完全平方式<br><br>` +
                        `4. 最終答案：<br>` +
                        `\\[(x - ${m})^2\\]`;
            }
        }

        // 其他难度的解题步骤
        return `解題步驟：<br><br>` +
            `1. 觀察二次項：<br>` +
            `\\[x^2${b > 0 ? '+' : ''}${b}x${c > 0 ? '+' : ''}${c}\\]<br><br>` +
            `2. 找出兩個數：<br>` +
            `   - 它們的和為一次項係數的相反數：\\[${m} + ${n} = ${-b}\\]<br>` +
            `   - 它們的積為常數項：\\[${m} \\times ${n} = ${c}\\]<br><br>` +
            `3. 因式分解：<br>` +
            `   - 第一個因式：\\[(x ${m >= 0 ? '-' : '+'}${Math.abs(m)})\\]<br>` +
            `   - 第二個因式：\\[(x ${n >= 0 ? '-' : '+'}${Math.abs(n)})\\]<br><br>` +
            `4. 最終答案：<br>` +
            `\\[(x ${m >= 0 ? '-' : '+'}${Math.abs(m)})(x ${n >= 0 ? '-' : '+'}${Math.abs(n)})\\]`;
    }
} 