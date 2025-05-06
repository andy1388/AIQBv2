import { QuestionGenerator, IGeneratorOutput } from '../../../QuestionGenerator';
import { FractionUtils } from '../../../../utils/FractionUtils';

interface Term {
    coefficient: number;
    variables: Map<string, number>;
    operation?: 'multiply' | 'divide';
}

export default class F1L12_1_Generator_Q6_N_MQ extends QuestionGenerator {
    protected readonly VARIABLES = ['x', 'y', 'z', 'a', 'b', 'm', 'n', 'p', 'q', 'r'];
    protected readonly EASY_COEFFICIENTS = [2, 3, 4, 6, 8, 9, 12, 15, 16, 18, 20];

    constructor(difficulty: number = 1) {
        super(difficulty, 'F1L12.1');
    }

    generate(): IGeneratorOutput {
        let terms: Term[] = [];
        
        switch (this.difficulty) {
            case 1: // 简单：两步运算，单一变量
                terms = this.generateLevel1();
                break;
            case 2: // 中等：三步运算，单一变量
                terms = this.generateLevel2();
                break;
            case 3: // 较难：两步运算，双变量
                terms = this.generateLevel3();
                break;
            case 4: // 进阶：三步运算，双变量
                terms = this.generateLevel4();
                break;
            case 5: // 挑战：多步运算，多变量和系数
                terms = this.generateLevel5();
                break;
            default:
                throw new Error(`难度等级 ${this.difficulty} 不可用`);
        }

        const [question, answer, steps] = this.formatQuestion(terms);
        const wrongAnswers = this.generateWrongAnswers(answer, terms);
        
        // 随机打乱选项并记录正确答案的新位置
        const options = [answer, ...wrongAnswers];
        const shuffledOptions = this.shuffleArray([...options]);
        const correctIndex = shuffledOptions.indexOf(answer);

        // 从答案中提取需要填空的部分（指数）
        const [questionWithBlank, blankPart] = this.createQuestionWithBlank(answer, terms);

        return {
            content: questionWithBlank,
            correctAnswer: blankPart,
            options: shuffledOptions.map(opt => this.extractBlankPart(opt, answer)),
            correctIndex: correctIndex,
            explanation: steps
        };
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
        const vars = this.shuffleArray(this.VARIABLES.slice(0, 3)).slice(0, 2);
        const [var1, var2] = vars;
        
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
        const vars = this.shuffleArray(this.VARIABLES.slice(0, 3)).slice(0, 2);
        const [var1, var2] = vars;
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
        const vars = this.shuffleArray(this.VARIABLES.slice(0, 3));
        const coef1 = this.EASY_COEFFICIENTS[Math.floor(Math.random() * this.EASY_COEFFICIENTS.length)];
        const coef2 = this.EASY_COEFFICIENTS[Math.floor(Math.random() * this.EASY_COEFFICIENTS.length)];
        const coef3 = this.EASY_COEFFICIENTS[Math.floor(Math.random() * this.EASY_COEFFICIENTS.length)];
        
        return [
            {
                coefficient: coef1,
                variables: new Map(
                    vars.map(v => [v, Math.floor(Math.random() * 3) + 2])
                ),
                operation: 'multiply'
            },
            {
                coefficient: coef2,
                variables: new Map(
                    vars.map(v => [v, Math.floor(Math.random() * 3) + 2])
                ),
                operation: 'multiply'
            },
            {
                coefficient: coef3,
                variables: new Map(
                    vars.map(v => [v, Math.floor(Math.random() * 2) + 1])
                ),
                operation: 'divide'
            }
        ];
    }

    protected formatQuestion(terms: Term[]): [string, string, string] {
        // 计算结果，使用分数运算
        let resultCoefficient: [number, number] = [terms[0].coefficient, 1];
        
        // 从第二项开始计算，每个数都作为分数处理
        for (let i = 1; i < terms.length; i++) {
            const term = terms[i];
            if (term.operation === 'divide') {
                resultCoefficient = FractionUtils.divide(
                    resultCoefficient,
                    [term.coefficient, 1]
                );
            } else {
                resultCoefficient = FractionUtils.multiply(
                    resultCoefficient,
                    [term.coefficient, 1]
                );
            }
        }

        const result: Term = {
            coefficient: resultCoefficient[0] / resultCoefficient[1],
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

        // 格式化题目和答案
        const questionParts = terms.map((term, index) => {
            let termStr = '';
            if (term.coefficient !== 1) termStr += term.coefficient;
            
            const sortedVars = Array.from(term.variables.entries())
                .sort(([a], [b]) => a.localeCompare(b));
            
            sortedVars.forEach(([variable, exp]) => {
                termStr += variable + (exp !== 1 ? '^{' + exp + '}' : '');
            });
            
            return index === 0 ? termStr : (term.operation === 'divide' ? ' \\div ' + termStr : ' \\times ' + termStr);
        });

        // 格式化答案时使用分数形式
        const answer = this.formatTermWithFraction(result, resultCoefficient);

        // 直接在答案中添加方框，而不是在整个表达式中
        const [answerWithBlank, blankPart] = this.createQuestionWithBlank(answer, terms);

        // 生成完整的题目字符串
        const fullQuestion = questionParts.join('');

        // 生成解题步骤
        const steps = `解題步驟：
1. 係數運算：
   \\[${terms.reduce((str, term, index) => {
       if (index === 0) return term.coefficient.toString();
       return str + (term.operation === 'divide' ? ' \\div ' : ' \\times ') + term.coefficient;
   }, '')} = ${FractionUtils.toLatex(resultCoefficient[0], resultCoefficient[1])}\\]

2. 指數運算：
${Array.from(allVars).sort().map(v => {
    const exps = terms.map(t => t.variables.get(v) || 0);
    return `   \\[${v}: ${exps.reduce((str, exp, index) => {
        if (index === 0) return exp.toString();
        const op = terms[index].operation === 'divide' ? ' - ' : ' + ';
        return str + op + exp;
    }, '')} = ${result.variables.get(v) || 0}\\]`;
}).join('\n')}

3. 最終答案：\\[${answer}\\]`;

        return [fullQuestion, answer, steps];
    }

    private formatTermWithFraction(term: Term, coefficient: [number, number]): string {
        let coefficientStr = '';
        if (term.coefficient !== 1) {
            coefficientStr = FractionUtils.toLatex(coefficient[0], coefficient[1]);
        }
        
        if (term.variables.size === 0) return coefficientStr || '1';
        
        const sortedVars = Array.from(term.variables.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([variable, exp]) => {
                return exp === 1 ? variable : variable + '^{' + exp + '}';
            })
            .join('');
        
        return coefficientStr ? coefficientStr + sortedVars : sortedVars;
    }

    protected generateWrongAnswers(correctAnswer: string, terms: Term[]): string[] {
        const wrongAnswers = new Set<string>();
        
        // 收集题目中出现的所有变量
        const questionVars = new Set<string>();
        terms.forEach(term => {
            term.variables.forEach((_, v) => questionVars.add(v));
        });

        if (this.difficulty <= 3) {
            // Level 1-3: 只修改指数，没有系数
            // 解析正确答案中的变量和指数
            const varExps = new Map<string, number>();
            Array.from(correctAnswer.matchAll(/([a-z])(?:\^{(\d+)})?/g)).forEach(match => {
                const [, variable, exp] = match;
                if (questionVars.has(variable)) {
                    varExps.set(variable, exp ? parseInt(exp) : 1);
                }
            });

            // 生成三个不同指数的错误答案
            const baseExp = varExps.get(Array.from(varExps.keys())[0]) || 1;
            const possibleExps = [baseExp - 1, baseExp + 1, baseExp + 2]
                .filter(exp => exp > 0 && exp !== baseExp);  // 确保指数为正且不等于正确答案

            // 生成错误答案
            possibleExps.forEach(exp => {
                const wrongAnswer = `y^{${exp}}`;
                wrongAnswers.add(wrongAnswer);
            });
        } else {
            // Level 4-5: 处理带分数的答案
            const fractionMatch = correctAnswer.match(/\\frac{(\d+)}{(\d+)}/);
            const isCorrectAnswerFraction = fractionMatch !== null;
            
            let [correctNum, correctDen] = fractionMatch ? 
                [parseInt(fractionMatch[1]), parseInt(fractionMatch[2])] : 
                [parseInt(correctAnswer) || 1, 1];

            // 解析变量和指数
            const varExps = new Map<string, number>();
            Array.from(correctAnswer.matchAll(/([a-z])(?:\^{(\d+)})?/g)).forEach(match => {
                const [, variable, exp] = match;
                if (questionVars.has(variable)) {
                    varExps.set(variable, exp ? parseInt(exp) : 1);
                }
            });

            // 1. 生成一个使用相同系数但不同指数的错误答案
            const newVars1 = new Map(varExps);
            const randomVar = Array.from(newVars1.keys())[0];
            const currentExp = newVars1.get(randomVar)!;
            newVars1.set(randomVar, currentExp + 1);

            const sameCoeffAnswer = (isCorrectAnswerFraction ? 
                FractionUtils.toLatex(correctNum, correctDen) : 
                correctNum.toString()) + 
                Array.from(newVars1.entries())
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([v, e]) => e === 1 ? v : `${v}^{${e}}`)
                    .join('');
            wrongAnswers.add(sameCoeffAnswer);

            // 2. 生成两个使用不同系数但相同变量组合的错误答案
            let differentNum, differentDen;
            if (isCorrectAnswerFraction) {
                [differentNum, differentDen] = FractionUtils.simplify(
                    correctNum * 3, 
                    correctDen * 2
                );
            } else {
                differentNum = correctNum + 2;
                differentDen = 1;
            }

            const differentCoeffStr = isCorrectAnswerFraction ? 
                FractionUtils.toLatex(differentNum, differentDen) : 
                differentNum.toString();

            // 生成两个使用相同系数的错误答案
            const baseVars = new Map(varExps);
            // 第一个错误答案：使用原始变量组合
            const wrongAnswer1 = differentCoeffStr + 
                Array.from(baseVars.entries())
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([v, e]) => e === 1 ? v : `${v}^{${e}}`)
                    .join('');
            wrongAnswers.add(wrongAnswer1);

            // 第二个错误答案：修改一个变量的指数
            const newVars2 = new Map(baseVars);
            const randomVar2 = Array.from(newVars2.keys())[0];
            const currentExp2 = newVars2.get(randomVar2)!;
            newVars2.set(randomVar2, currentExp2 + 1);

            const wrongAnswer2 = differentCoeffStr + 
                Array.from(newVars2.entries())
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([v, e]) => e === 1 ? v : `${v}^{${e}}`)
                    .join('');
            wrongAnswers.add(wrongAnswer2);
        }

        return Array.from(wrongAnswers);
    }

    private createQuestionWithBlank(answer: string, terms: Term[]): [string, string] {
        // 收集所有可能的指数位置
        const allExponents: {term: number, variable: string, exp: number}[] = [];
        
        terms.forEach((term, termIndex) => {
            term.variables.forEach((exp, variable) => {
                allExponents.push({
                    term: termIndex,
                    variable,
                    exp
                });
            });
        });

        // 随机选择一个位置
        const selectedExp = allExponents[Math.floor(Math.random() * allExponents.length)];
        
        // 构建带有方块的问题
        const questionParts = terms.map((term, termIndex) => {
            let termStr = '';
            if (term.coefficient !== 1) termStr += term.coefficient;
            
            const sortedVars = Array.from(term.variables.entries())
                .sort(([a], [b]) => a.localeCompare(b));
            
            sortedVars.forEach(([variable, exp]) => {
                if (termIndex === selectedExp.term && variable === selectedExp.variable) {
                    // 在选中的位置放置方块
                    termStr += variable + '^{\\Box}';
                } else {
                    termStr += variable + (exp !== 1 ? '^{' + exp + '}' : '');
                }
            });
            
            return termIndex === 0 ? termStr : 
                (term.operation === 'divide' ? ' \\div ' + termStr : ' \\times ' + termStr);
        });

        return [questionParts.join('') + ' = ' + answer, selectedExp.exp.toString()];
    }

    private extractBlankPart(option: string, answer: string): string {
        // 只提取指数部分的数字
        const expMatch = option.match(/\^{(\d+)}/);
        return expMatch ? expMatch[1] : option;
    }
} 