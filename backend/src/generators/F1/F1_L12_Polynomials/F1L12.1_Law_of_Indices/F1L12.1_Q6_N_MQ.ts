import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import { LaTeX } from '@/utils/mathUtils';

interface Term {
    coefficient: number;
    variables: Map<string, number>;
    operation?: 'multiply' | 'divide';
}

export default class F1L12_1_Generator_Q6_N_MQ extends QuestionGenerator {
    protected readonly VARIABLES = ['x', 'y', 'z', 'a', 'b', 'm', 'n', 'p', 'q', 'r'];
    protected readonly EASY_COEFFICIENTS = [2, 3, 4, 6, 8, 9, 12, 15, 16, 18, 20];

    constructor(difficulty: number = 1) {
        super(difficulty, 'F1L12.1_Q6_N_MQ');
    }

    generate(): IGeneratorOutput {
        let terms: Term[] = [];
        
        switch (this.difficulty) {
            case 1: // 簡單：兩步運算，單一變量
                terms = this.generateLevel1();
                break;
            case 2: // 中等：三步運算，單一變量
                terms = this.generateLevel2();
                break;
            case 3: // 較難：兩步運算，雙變量
                terms = this.generateLevel3();
                break;
            case 4: // 進階：三步運算，雙變量
                terms = this.generateLevel4();
                break;
            case 5: // 挑戰：多步運算，多變量和係數
                terms = this.generateLevel5();
                break;
            default:
                throw new Error(`難度等級 ${this.difficulty} 不可用`);
        }

        const [question, answer, steps] = this.formatQuestion(terms);
        const wrongAnswers = this.generateWrongAnswers(answer, terms);
        
        return this.getGeneratorOutput({
            content: question,
            correctAnswer: answer,
            wrongAnswers: wrongAnswers,
            explanation: steps,
            type: 'text',
            displayOptions: {
                latex: true
            }
        });
    }

    protected generateLevel1(): Term[] {
        const variable = this.VARIABLES[Math.floor(Math.random() * 3)]; // 只使用 x, y, z
        const exp1 = Math.floor(Math.random() * 4) + 2; // 2-5
        const exp2 = Math.floor(Math.random() * 4) + 2; // 2-5
        const exp3 = Math.floor(Math.random() * 2) + 1; // 1-2，确保除法后指数为正

        return [
            { coefficient: 1, variables: new Map([[variable, exp1]]), operation: 'multiply' },
            { coefficient: 1, variables: new Map([[variable, exp2]]), operation: 'multiply' },
            { coefficient: 1, variables: new Map([[variable, exp3]]), operation: 'divide' }
        ];
    }

    protected generateLevel2(): Term[] {
        const variable = this.VARIABLES[Math.floor(Math.random() * 3)];
        const exponents = Array.from({length: 4}, () => Math.floor(Math.random() * 3) + 2); // 2-4
        
        return [
            { coefficient: 1, variables: new Map([[variable, exponents[0]]]), operation: 'multiply' },
            { coefficient: 1, variables: new Map([[variable, exponents[1]]]), operation: 'multiply' },
            { coefficient: 1, variables: new Map([[variable, exponents[2]]]), operation: 'divide' },
            { coefficient: 1, variables: new Map([[variable, exponents[3]]]), operation: 'multiply' }
        ];
    }

    protected generateLevel3(): Term[] {
        // 使用前两个变量，不需要随机打乱
        const [var1, var2] = this.VARIABLES.slice(0, 2);
        
        return [
            { 
                coefficient: 1, 
                variables: new Map([
                    [var1, Math.floor(Math.random() * 3) + 2],
                    [var2, Math.floor(Math.random() * 3) + 2]
                ]),
                operation: 'multiply'
            },
            { 
                coefficient: 1, 
                variables: new Map([
                    [var1, Math.floor(Math.random() * 3) + 2],
                    [var2, Math.floor(Math.random() * 3) + 2]
                ]),
                operation: 'multiply'
            },
            { 
                coefficient: 1, 
                variables: new Map([
                    [var1, Math.floor(Math.random() * 2) + 1],
                    [var2, Math.floor(Math.random() * 2) + 1]
                ]),
                operation: 'divide'
            }
        ];
    }

    protected generateLevel4(): Term[] {
        // 使用前两个变量，不需要随机打乱
        const [var1, var2] = this.VARIABLES.slice(0, 2);
        const coef1 = this.EASY_COEFFICIENTS[Math.floor(Math.random() * this.EASY_COEFFICIENTS.length)];
        const coef2 = this.EASY_COEFFICIENTS[Math.floor(Math.random() * this.EASY_COEFFICIENTS.length)];
        
        return [
            { 
                coefficient: coef1, 
                variables: new Map([
                    [var1, Math.floor(Math.random() * 3) + 3],
                    [var2, Math.floor(Math.random() * 3) + 3]
                ]),
                operation: 'multiply'
            },
            { 
                coefficient: coef2, 
                variables: new Map([
                    [var1, Math.floor(Math.random() * 3) + 2],
                    [var2, Math.floor(Math.random() * 3) + 2]
                ]),
                operation: 'divide'
            },
            { 
                coefficient: 1, 
                variables: new Map([
                    [var1, Math.floor(Math.random() * 2) + 1],
                    [var2, Math.floor(Math.random() * 2) + 1]
                ]),
                operation: 'multiply'
            }
        ];
    }

    protected generateLevel5(): Term[] {
        const vars = this.VARIABLES.slice(0, 3); // 使用前三个变量，不需要随机打乱
        const [var1, var2, var3] = vars;
        const coef1 = this.EASY_COEFFICIENTS[Math.floor(Math.random() * this.EASY_COEFFICIENTS.length)];
        const coef2 = this.EASY_COEFFICIENTS[Math.floor(Math.random() * this.EASY_COEFFICIENTS.length)];
        const coef3 = this.EASY_COEFFICIENTS[Math.floor(Math.random() * this.EASY_COEFFICIENTS.length)];
        
        return [
            {
                coefficient: coef1,
                variables: new Map([
                    [var1, Math.floor(Math.random() * 4) + 2],
                    [var2, Math.floor(Math.random() * 4) + 2],
                    [var3, Math.floor(Math.random() * 4) + 2]
                ]),
                operation: 'multiply'
            },
            {
                coefficient: coef2,
                variables: new Map([
                    [var1, Math.floor(Math.random() * 4) + 2],
                    [var2, Math.floor(Math.random() * 4) + 2],
                    [var3, Math.floor(Math.random() * 4) + 2]
                ]),
                operation: 'multiply'
            },
            {
                coefficient: coef3,
                variables: new Map([
                    [var1, Math.floor(Math.random() * 2) + 1],
                    [var2, Math.floor(Math.random() * 2) + 1],
                    [var3, Math.floor(Math.random() * 2) + 1]
                ]),
                operation: 'divide'
            }
        ];
    }

    protected formatQuestion(terms: Term[]): [string, string, string] {
        // 计算结果
        const result: Term = {
            coefficient: terms.reduce((acc, term) => 
                term.operation === 'divide' ? acc / term.coefficient : acc * term.coefficient, 1),
            variables: new Map()
        };

        // 计算每个变量的最终指数
        const allVars = new Set<string>();
        terms.forEach(term => term.variables.forEach((_, v) => allVars.add(v)));

        allVars.forEach(variable => {
            let finalExp = 0;
            terms.forEach(term => {
                const exp = term.variables.get(variable) || 0;
                finalExp = term.operation === 'divide' ? 
                    finalExp - exp : 
                    finalExp + exp;
            });
            if (finalExp !== 0) {
                result.variables.set(variable, finalExp);
            }
        });

        // 随机选择一个项和其中的一个变量来放置方框
        const termIndex = Math.floor(Math.random() * terms.length);
        const selectedTerm = terms[termIndex];
        const variables = Array.from(selectedTerm.variables.keys());
        const selectedVar = variables[Math.floor(Math.random() * variables.length)];
        const selectedExp = selectedTerm.variables.get(selectedVar)!;

        // 格式化题目，包含方框
        const questionParts = terms.map((term, index) => {
            let termStr = '';
            if (term.coefficient !== 1) {
                termStr += term.coefficient;
            }
            
            const sortedVars = Array.from(term.variables.entries())
                .sort(([a], [b]) => a.localeCompare(b));
            
            sortedVars.forEach(([variable, exp]) => {
                if (index === termIndex && variable === selectedVar) {
                    termStr += `${variable}^{\\Box}`; // 放置方框
                } else {
                    termStr += variable + (exp !== 1 ? `^{${exp}}` : '');
                }
            });
            
            return index === 0 ? termStr : 
                (term.operation === 'divide' ? ' \\div ' + termStr : ' \\times ' + termStr);
        });

        // 格式化结果
        const resultStr = (() => {
            let str = '';
            if (result.coefficient !== 1) {
                // 检查系数是否需要转换为分数
                const coefficient = result.coefficient;
                if (Number.isInteger(coefficient)) {
                    str += coefficient;
                } else {
                    // 如果小数位超过3位，转换为分数
                    const decimalPlaces = (coefficient.toString().split('.')[1] || '').length;
                    if (decimalPlaces > 3) {
                        const denominator = Math.pow(10, decimalPlaces);
                        const numerator = Math.round(coefficient * denominator);
                        str += `\\frac{${numerator}}{${denominator}}`;
                    } else {
                        str += coefficient.toFixed(decimalPlaces);
                    }
                }
            }
            
            const sortedResultVars = Array.from(result.variables.entries())
                .sort(([a], [b]) => a.localeCompare(b));
            
            sortedResultVars.forEach(([variable, exp]) => {
                str += variable + (exp !== 1 ? `^{${exp}}` : '');
            });
            return str;
        })();

        // 生成解题步骤
        const steps = `1. 找出各項的指數：<br>` +
            `${terms.map((term, index) => {
                const varStr = Array.from(term.variables.entries())
                    .map(([v, e]) => `${v}: ${e}`)
                    .join(', ');
                return `\\[\\text{第${index + 1}項：}${varStr}\\]`;
            }).join('<br>')}<br>` +
            `2. 計算指數變化：<br>` +
            `${Array.from(allVars).sort().map(v => {
                const exps = terms.map((t, i) => {
                    const exp = t.variables.get(v) || 0;
                    return i === 0 ? exp : (t.operation === 'divide' ? `-${exp}` : `+${exp}`);
                });
                return `\\[${v}: ${exps.join(' ')} = ${result.variables.get(v) || 0}\\]`;
            }).join('<br>')}<br>` +
            `3. 方框中的指數：\\[${selectedExp}\\]`;

        // 将题目转换为 LaTeX 格式，包含等号和结果
        const question = `\\[${questionParts.join('')} = ${resultStr}\\]`;

        return [question, selectedExp.toString(), steps];
    }

    protected generateWrongAnswers(correctAnswer: string, terms: Term[]): string[] {
        const wrongAnswers = new Set<string>();
        const correctExp = parseInt(correctAnswer);
        
        // 生成错误答案的策略
        const strategies = [
            () => (correctExp + 1).toString(),
            () => (correctExp + 2).toString(),
            () => correctExp > 1 ? (correctExp - 1).toString() : (correctExp + 3).toString(),
            () => Math.min(correctExp * 2, 10).toString()
        ];

        while (wrongAnswers.size < 3) {
            const strategy = strategies[Math.floor(Math.random() * strategies.length)];
            const wrong = strategy();
            if (wrong !== correctAnswer && !wrongAnswers.has(wrong)) {
                wrongAnswers.add(wrong);
            }
        }

        return Array.from(wrongAnswers);
    }
} 