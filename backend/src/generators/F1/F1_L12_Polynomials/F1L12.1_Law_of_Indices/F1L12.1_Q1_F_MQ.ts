import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import { LaTeX } from '@/utils/mathUtils';

interface Term {
    coefficient: number;
    variables: Map<string, number>;
}

export default class F1L12_1_Generator_Q1_F_MQ extends QuestionGenerator {
    protected readonly VARIABLES = ['x', 'y', 'z', 'a', 'b', 'm', 'n', 'p', 'q', 'r'];

    constructor(difficulty: number = 1) {
        super(difficulty, 'F1L12.1_Q1_F_MQ');
    }

    generate(): IGeneratorOutput {
        let terms: Term[] = [];
        
        switch (this.difficulty) {
            case 1: // 簡單：兩個單項式相乘
                terms = this.generateLevel1();
                break;
            case 2: // 中等：三個單項式相乘
                terms = this.generateLevel2();
                break;
            case 3: // 較難：包含係數的單項式相乘
                terms = this.generateLevel3();
                break;
            case 4: // 進階：兩個變量的運算
                terms = this.generateLevel4();
                break;
            case 5: // 挑戰：三個變量和係數的運算
                terms = this.generateLevel5();
                break;
            default:
                throw new Error(`難度等級 ${this.difficulty} 不可用`);
        }

        const [question, answer, steps] = this.formatQuestion(terms);
        const wrongAnswers = this.generateWrongAnswers(answer, this.difficulty);
        
        return this.getGeneratorOutput({
            content: question,
            correctAnswer: answer,
            wrongAnswers: wrongAnswers,
            explanation: steps
        });
    }

    private generateLevel1(): Term[] {
        const variable = this.VARIABLES[Math.floor(Math.random() * 3)]; // 只使用 x, y, z
        const exp1 = Math.floor(Math.random() * 4) + 1; // 1-4
        const exp2 = Math.floor(Math.random() * 4) + 1; // 1-4

        return [
            { coefficient: 1, variables: new Map([[variable, exp1]]) },
            { coefficient: 1, variables: new Map([[variable, exp2]]) }
        ];
    }

    private generateLevel2(): Term[] {
        const variable = this.VARIABLES[Math.floor(Math.random() * 3)];
        const exp1 = Math.floor(Math.random() * 5) + 2; // 2-6
        const exp2 = Math.floor(Math.random() * 5) + 2; // 2-6
        const exp3 = Math.floor(Math.random() * 5) + 2; // 2-6

        return [
            { coefficient: 1, variables: new Map([[variable, exp1]]) },
            { coefficient: 1, variables: new Map([[variable, exp2]]) },
            { coefficient: 1, variables: new Map([[variable, exp3]]) }
        ];
    }

    private generateLevel3(): Term[] {
        const variable = this.VARIABLES[Math.floor(Math.random() * 5)]; // 使用更多變量
        const coef = Math.floor(Math.random() * 8) + 2; // 2-9
        const exp1 = Math.floor(Math.random() * 5) + 2; // 2-6
        const exp2 = Math.floor(Math.random() * 5) + 2; // 2-6

        return [
            { coefficient: coef, variables: new Map([[variable, exp1]]) },
            { coefficient: 1, variables: new Map([[variable, exp2]]) }
        ];
    }

    private generateLevel4(): Term[] {
        // 隨機選擇兩個不同的變量
        const vars = this.shuffleArray(this.VARIABLES.slice()).slice(0, 2);
        const exp1 = Math.floor(Math.random() * 4) + 2; // 2-5
        const exp2 = Math.floor(Math.random() * 4) + 2; // 2-5
        const exp3 = Math.floor(Math.random() * 4) + 2; // 2-5
        const exp4 = Math.floor(Math.random() * 4) + 2; // 2-5

        return [
            { 
                coefficient: 1, 
                variables: new Map([
                    [vars[0], exp1],
                    [vars[1], exp2]
                ]) 
            },
            { 
                coefficient: 1, 
                variables: new Map([
                    [vars[0], exp3],
                    [vars[1], exp4]
                ]) 
            }
        ];
    }

    private generateLevel5(): Term[] {
        // 隨機選擇三個不同的變量
        const vars = this.shuffleArray(this.VARIABLES.slice()).slice(0, 3);
        const coef1 = Math.floor(Math.random() * 4) + 2; // 2-5
        const coef2 = Math.floor(Math.random() * 4) + 2; // 2-5

        return [
            { 
                coefficient: coef1, 
                variables: new Map([
                    [vars[0], Math.floor(Math.random() * 3) + 2], // 2-4
                    [vars[1], Math.floor(Math.random() * 3) + 2],
                    [vars[2], Math.floor(Math.random() * 3) + 2]
                ]) 
            },
            { 
                coefficient: coef2, 
                variables: new Map([
                    [vars[0], Math.floor(Math.random() * 3) + 2],
                    [vars[1], Math.floor(Math.random() * 3) + 2],
                    [vars[2], Math.floor(Math.random() * 3) + 2]
                ]) 
            }
        ];
    }

    protected shuffleArray<T>(array: T[]): T[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    protected generateWrongAnswers(correctAnswer: string, difficulty: number): string[] {
        const wrongAnswers = new Set<string>();
        
        try {
            // 解析正确答案中的系数和变量
            const varExps = new Map<string, number>();
            const varRegex = /([a-z])(?:\^{(\d+)})?/g;
            let match;
            
            // 提取系数
            const coeffMatch = correctAnswer.match(/^(\d+)?/);
            const coefficient = coeffMatch && coeffMatch[1] ? parseInt(coeffMatch[1]) : 1;
            
            // 提取所有变量和指数
            while ((match = varRegex.exec(correctAnswer)) !== null) {
                const [, variable, expStr] = match;
                const exp = expStr ? parseInt(expStr) : 1;
                varExps.set(variable, exp);
            }

            // 如果没有成功解析到任何变量，返回默认错误答案
            if (varExps.size === 0) {
                return ['ERROR1', 'ERROR2', 'ERROR3'];
            }

            // 根据难度选择不同的错误答案生成策略
            const strategies = difficulty >= 3 ? [
                // Level 3-5 的策略
                // 1. 保持指数，改变系数
                () => {
                    if (coefficient !== 1) {
                        return this.formatTerm(coefficient * 2, varExps);
                    }
                    return this.formatTerm(2, varExps);
                },
                // 2. 保持系数，修改指数
                () => {
                    const newVars = new Map(varExps);
                    const firstVar = Array.from(varExps.keys())[0];
                    const firstExp = varExps.get(firstVar) || 1;
                    newVars.set(firstVar, firstExp + 1);
                    return this.formatTerm(coefficient, newVars);
                },
                // 3. 修改系数和指数
                () => {
                    const newVars = new Map(varExps);
                    const firstVar = Array.from(varExps.keys())[0];
                    const firstExp = varExps.get(firstVar) || 1;
                    newVars.set(firstVar, firstExp - 1);
                    return this.formatTerm(coefficient * 3, newVars);
                },
                // 4. 指数加倍
                () => {
                    const newVars = new Map(varExps);
                    newVars.forEach((exp, v) => {
                        newVars.set(v, exp * 2);
                    });
                    return this.formatTerm(coefficient, newVars);
                }
            ] : [
                // Level 1-2 的简单策略
                () => this.formatTerm(coefficient, new Map([[Array.from(varExps.keys())[0], Array.from(varExps.values())[0] + 1]])),
                () => this.formatTerm(coefficient, new Map([[Array.from(varExps.keys())[0], Array.from(varExps.values())[0] + 2]])),
                () => this.formatTerm(coefficient, new Map([[Array.from(varExps.keys())[0], Array.from(varExps.values())[0] * 2]])),
                () => this.formatTerm(2, varExps)
            ];

            // 生成错误答案
            let attempts = 0;
            const maxAttempts = 20;
            
            while (wrongAnswers.size < 3 && attempts < maxAttempts) {
                attempts++;
                const strategy = strategies[Math.floor(Math.random() * strategies.length)];
                try {
                    const wrong = strategy();
                    if (wrong && wrong !== correctAnswer && !wrongAnswers.has(wrong)) {
                        wrongAnswers.add(wrong);
                    }
                } catch (e) {
                    console.error('Error generating wrong answer:', e);
                    continue;
                }
            }

            // 如果没有生成足够的错误答案，添加默认答案
            if (wrongAnswers.size < 3) {
                const defaultAnswers = [
                    this.formatTerm(coefficient + 1, varExps),
                    this.formatTerm(coefficient + 2, varExps),
                    this.formatTerm(coefficient * 2, varExps)
                ];
                
                for (const ans of defaultAnswers) {
                    if (wrongAnswers.size >= 3) break;
                    if (ans !== correctAnswer) {
                        wrongAnswers.add(ans);
                    }
                }
            }

        } catch (e) {
            console.error('Error in generateWrongAnswers:', e);
            return ['ERROR1', 'ERROR2', 'ERROR3'];
        }

        return Array.from(wrongAnswers);
    }

    private formatTerm(coefficient: number, variables: Map<string, number>): string {
        if (variables.size === 0) return coefficient.toString();
        
        const sortedVars = Array.from(variables.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([variable, exp]) => {
                return exp === 1 ? variable : `${variable}^{${exp}}`;
            })
            .join('');
        
        return coefficient === 1 ? sortedVars : `${coefficient}${sortedVars}`;
    }

    protected formatQuestion(terms: Term[]): [string, string, string] {
        // 格式化題目
        const questionParts = terms.map(term => {
            let termStr = '';
            if (term.coefficient !== 1) {
                termStr += term.coefficient > 0 ? 
                    term.coefficient.toString() : 
                    LaTeX.formatConstant(term.coefficient);
            }
            term.variables.forEach((exp, variable) => {
                termStr += variable + (exp !== 1 ? `^{${exp}}` : '');
            });
            return termStr;
        });

        // 計算答案
        const result: Term = {
            coefficient: terms.reduce((acc, term) => acc * term.coefficient, 1),
            variables: new Map()
        };

        // 合併所有變量的指數
        terms.forEach(term => {
            term.variables.forEach((exp, variable) => {
                result.variables.set(
                    variable,
                    (result.variables.get(variable) || 0) + exp
                );
            });
        });

        // 格式化答案
        let answer = '';
        if (result.coefficient !== 1) {
            answer += result.coefficient > 0 ? 
                result.coefficient.toString() : 
                LaTeX.formatConstant(result.coefficient);
        }
        
        // 按字母順序排列變量
        const sortedVars = Array.from(result.variables.entries())
            .sort(([a,], [b,]) => a.localeCompare(b));
        
        sortedVars.forEach(([variable, exp]) => {
            answer += variable + (exp !== 1 ? `^{${exp}}` : '');
        });

        // 生成解題步驟
        const steps = terms.every(t => t.coefficient === 1) 
            ? `1. 同類項指數相加：<br>` +
              `${Array.from(result.variables.entries())
                  .map(([v, e]) => `\\[${v}: ${terms.map(t => t.variables.get(v) || 0).join(' + ')} = ${e}\\]`)
                  .join('<br>')}<br>` +
              `最終答案：\\[${
                  result.coefficient !== 1 ? LaTeX.formatConstant(result.coefficient) : ''
              }${sortedVars.map(([v, e]) => v + '^{' + e + '}').join('')}\\]`
            : `解題步驟：<br>` +
              `1. 係數相乘：\\[${terms.map(t => LaTeX.formatConstant(t.coefficient)).join(' \\times ')} = ${result.coefficient}\\]<br>` +
              `2. 同類項指數相加：<br>` +
              `${Array.from(result.variables.entries())
                  .map(([v, e]) => `\\[${v}: ${terms.map(t => t.variables.get(v) || 0).join(' + ')} = ${e}\\]`)
                  .join('<br>')}<br>` +
              `3. 最終答案：\\[${
                  result.coefficient !== 1 ? LaTeX.formatConstant(result.coefficient) : ''
              }${sortedVars.map(([v, e]) => v + '^{' + e + '}').join('')}\\]`;

        // 将题目转换为 LaTeX 格式，添加 "=?"
        const question = `\\[${questionParts.join(' \\times ')} = \\text{?}\\]`;

        return [question, answer, steps];
    }

    private generateExplanation(question: string, answer: number): string {
        const steps: string[] = [];
        
        steps.push(
            '1. 找出已知的指數<br>',
            `\\[${question}\\]<br>`,
            '2. 觀察運算符號為乘法，使用指數加法原理<br>',
            '3. 計算指數相加<br>',
            `\\[y^1 \\times y^3 = y^{1+3} = y^4\\]`
        );

        return steps.join('');
    }
} 