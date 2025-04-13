import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import { LaTeX } from '@/utils/mathUtils';

interface Term {
    coefficient: number;
    variables: Map<string, number>;
    operation?: string;
}

export default class F1L12_1_Generator_Q5_N_MQ extends QuestionGenerator {
    protected readonly VARIABLES = ['x', 'y', 'z', 'a', 'b', 'm', 'n', 'p', 'q', 'r'];
    protected readonly EASY_COEFFICIENTS = [2, 3, 4, 6, 8, 9, 12, 15, 16, 18, 20];

    constructor(difficulty: number = 1) {
        super(difficulty, 'F1L12.1_Q5_N_MQ');
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
        const wrongAnswers = this.generateWrongAnswers(answer, this.difficulty);
        
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

    protected formatQuestion(terms: Term[]): [string, string, string] {
        // 計算結果
        const result: Term = {
            coefficient: terms.reduce((acc, term) => 
                term.operation === 'divide' ? acc / term.coefficient : acc * term.coefficient, 1),
            variables: new Map()
        };

        // 計算每個變量的最終指數
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

        // 格式化題目
        const questionParts = terms.map((term, index) => {
            const sortedVars = Array.from(term.variables.entries())
                .sort(([a], [b]) => a.localeCompare(b));
            
            const varPart = sortedVars.map(([variable, exp]) => {
                return exp === 1 ? variable : `${variable}^{${exp}}`;
            }).join('');

            const termStr = term.coefficient === 1 ? varPart : `${term.coefficient}${varPart}`;
            
            return index === 0 ? termStr : 
                (term.operation === 'divide' ? ' \\div ' + termStr : ' \\times ' + termStr);
        });

        // 格式化答案
        const sortedResultVars = Array.from(result.variables.entries())
            .sort(([a], [b]) => a.localeCompare(b));
        
        const varPart = sortedResultVars.map(([variable, exp]) => {
            return exp === 1 ? variable : `${variable}^{${exp}}`;
        }).join('');

        const answer = result.coefficient === 1 ? varPart : `${result.coefficient}${varPart}`;

        // 生成解題步驟
        const steps = `1. 係數計算：<br>` +
            `\\[${terms.map((t, i) => 
                i === 0 ? t.coefficient : 
                (t.operation === 'divide' ? '\\div ' + t.coefficient : '\\times ' + t.coefficient)
            ).join(' ')} = ${result.coefficient}\\]<br>` +
            `2. 同類項指數計算：<br>` +
            `${Array.from(allVars).sort().map(v => {
                const exps = terms.map((t, i) => {
                    const exp = t.variables.get(v) || 0;
                    return i === 0 ? exp : (t.operation === 'divide' ? `-${exp}` : `+${exp}`);
                });
                return `\\[${v}: ${exps.join(' ')} = ${result.variables.get(v) || 0}\\]`;
            }).join('<br>')}<br>` +
            `3. 最終答案：\\[${answer}\\]`;

        // 將題目轉換為 LaTeX 格式，添加 "=?"
        const question = `\\[${questionParts.join('')} = \\text{?}\\]`;

        return [question, answer, steps];
    }

    protected generateLevel1(): Term[] {
        // 簡單：兩步運算，單一變量 (如 x³ × x⁴ ÷ x²)
        const variable = this.VARIABLES[0]; // 使用 x
        return [
            { 
                coefficient: 1,
                variables: new Map([[variable, Math.floor(Math.random() * 3) + 3]]), // 3-5
                operation: 'multiply'
            },
            { 
                coefficient: 1,
                variables: new Map([[variable, Math.floor(Math.random() * 3) + 2]]), // 2-4
                operation: 'multiply'
            },
            { 
                coefficient: 1,
                variables: new Map([[variable, Math.floor(Math.random() * 2) + 1]]), // 1-2
                operation: 'divide'
            }
        ];
    }

    protected generateLevel2(): Term[] {
        // 中等：三步運算，單一變量 (如 x⁵ × x³ ÷ x² × x⁴)
        const variable = this.VARIABLES[0]; // 使用 x
        return [
            { 
                coefficient: 1,
                variables: new Map([[variable, Math.floor(Math.random() * 3) + 3]]), // 3-5
                operation: 'multiply'
            },
            { 
                coefficient: 1,
                variables: new Map([[variable, Math.floor(Math.random() * 3) + 2]]), // 2-4
                operation: 'multiply'
            },
            { 
                coefficient: 1,
                variables: new Map([[variable, Math.floor(Math.random() * 2) + 1]]), // 1-2
                operation: 'divide'
            },
            { 
                coefficient: 1,
                variables: new Map([[variable, Math.floor(Math.random() * 3) + 2]]), // 2-4
                operation: 'multiply'
            }
        ];
    }

    protected generateLevel3(): Term[] {
        // 較難：兩步運算，雙變量 (如 x³y⁴ × x²y² ÷ xy³)
        const [var1, var2] = this.VARIABLES.slice(0, 2); // 使用 x, y
        return [
            { 
                coefficient: 1,
                variables: new Map([
                    [var1, Math.floor(Math.random() * 3) + 3], // 3-5
                    [var2, Math.floor(Math.random() * 3) + 2]  // 2-4
                ]),
                operation: 'multiply'
            },
            { 
                coefficient: 1,
                variables: new Map([
                    [var1, Math.floor(Math.random() * 3) + 2], // 2-4
                    [var2, Math.floor(Math.random() * 3) + 2]  // 2-4
                ]),
                operation: 'multiply'
            },
            { 
                coefficient: 1,
                variables: new Map([
                    [var1, 1],                                // 1
                    [var2, Math.floor(Math.random() * 3) + 2] // 2-4
                ]),
                operation: 'divide'
            }
        ];
    }

    protected generateLevel4(): Term[] {
        // 進階：三步運算，雙變量 (如 x⁵y³ × x²y⁴ ÷ xy² × y)
        const [var1, var2] = this.VARIABLES.slice(0, 2); // 使用 x, y
        return [
            { 
                coefficient: 1,
                variables: new Map([
                    [var1, Math.floor(Math.random() * 3) + 3], // 3-5
                    [var2, Math.floor(Math.random() * 3) + 2]  // 2-4
                ]),
                operation: 'multiply'
            },
            { 
                coefficient: 1,
                variables: new Map([
                    [var1, Math.floor(Math.random() * 3) + 2], // 2-4
                    [var2, Math.floor(Math.random() * 3) + 2]  // 2-4
                ]),
                operation: 'multiply'
            },
            { 
                coefficient: 1,
                variables: new Map([
                    [var1, 1],                                // 1
                    [var2, Math.floor(Math.random() * 2) + 1] // 1-2
                ]),
                operation: 'divide'
            },
            { 
                coefficient: 1,
                variables: new Map([
                    [var2, 1]                                // 1
                ]),
                operation: 'multiply'
            }
        ];
    }

    protected generateLevel5(): Term[] {
        // 挑戰：多步運算，多變量和係數 (如 2x³y⁴z × 3xy²z³ ÷ 2y³z²)
        const [var1, var2, var3] = this.VARIABLES.slice(0, 3); // 使用 x, y, z
        return [
            {
                coefficient: this.EASY_COEFFICIENTS[Math.floor(Math.random() * this.EASY_COEFFICIENTS.length)],
                variables: new Map([
                    [var1, Math.floor(Math.random() * 3) + 3], // 3-5
                    [var2, Math.floor(Math.random() * 3) + 2], // 2-4
                    [var3, Math.floor(Math.random() * 3) + 2]  // 2-4
                ]),
                operation: 'multiply'
            },
            {
                coefficient: this.EASY_COEFFICIENTS[Math.floor(Math.random() * this.EASY_COEFFICIENTS.length)],
                variables: new Map([
                    [var1, Math.floor(Math.random() * 2) + 1], // 1-2
                    [var2, Math.floor(Math.random() * 2) + 1], // 1-2
                    [var3, Math.floor(Math.random() * 3) + 2]  // 2-4
                ]),
                operation: 'multiply'
            },
            {
                coefficient: this.EASY_COEFFICIENTS[Math.floor(Math.random() * this.EASY_COEFFICIENTS.length)],
                variables: new Map([
                    [var1, 1],                                 // 1
                    [var2, Math.floor(Math.random() * 3) + 2], // 2-4
                    [var3, Math.floor(Math.random() * 2) + 1]  // 1-2
                ]),
                operation: 'divide'
            }
        ];
    }

    protected generateWrongAnswers(correctAnswer: string, difficulty: number): string[] {
        const wrongAnswers = new Set<string>();
        
        // 解析正確答案中的所有變量和指數
        const varExps = new Map<string, number>();
        const varRegex = /([a-z])(?:\^{(\d+)})?/g;
        let match;
        
        // 提取係數
        const coeffMatch = correctAnswer.match(/^(\d+)?/);
        const coefficient = coeffMatch && coeffMatch[1] ? parseInt(coeffMatch[1]) : 1;
        
        // 提取所有變量和指數
        while ((match = varRegex.exec(correctAnswer)) !== null) {
            const [, variable, expStr] = match;
            const exp = expStr ? parseInt(expStr) : 1;
            varExps.set(variable, exp);
        }

        // 生成錯誤答案的策略
        const strategies = [
            // 所有指數加1
            () => {
                const newVars = new Map(varExps);
                newVars.forEach((exp, v) => newVars.set(v, exp + 1));
                return this.formatTerm(coefficient, newVars);
            },
            // 係數變為2倍
            () => this.formatTerm(2 * coefficient, varExps),
            // 係數變為3倍
            () => this.formatTerm(3 * coefficient, varExps),
            // 交換變量的指數（如果有多個變量）
            () => {
                if (varExps.size >= 2) {
                    const vars = Array.from(varExps.entries());
                    const newVars = new Map(varExps);
                    const [exp1, exp2] = [vars[0][1], vars[1][1]];
                    newVars.set(vars[0][0], exp2);
                    newVars.set(vars[1][0], exp1);
                    return this.formatTerm(coefficient, newVars);
                }
                return null;
            }
        ];

        while (wrongAnswers.size < 3) {
            const strategy = strategies[Math.floor(Math.random() * strategies.length)];
            const wrong = strategy();
            if (wrong && wrong !== correctAnswer && !wrongAnswers.has(wrong)) {
                wrongAnswers.add(wrong);
            }
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

    protected shuffleArray<T>(array: T[]): T[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
} 