import { QuestionGenerator, IGeneratorOutput } from '../../../QuestionGenerator';

interface Term {
    coefficient: number;
    variables: Map<string, number>;
    hasMissing?: boolean;  // 標記是否包含缺失的指數
    missingVar?: string;   // 記錄哪個變量的指數缺失
}

export default class F1L12_1_Generator_Q2_F_MQ extends QuestionGenerator {
    protected readonly VARIABLES = ['x', 'y', 'z', 'a', 'b', 'm', 'n', 'p', 'q', 'r'];
    protected missingExponent: number = 0;  // 記錄缺失的指數值

    constructor(difficulty: number = 1) {
        super(difficulty, 'F1L12.1');
    }

    generate(): IGeneratorOutput {
        let terms: Term[] = [];
        let result: Term;
        
        switch (this.difficulty) {
            case 1: // 簡單：單一變量，缺少一個指數
                [terms, result] = this.generateLevel1();
                break;
            case 2: // 中等：單一變量，缺少一個較大的指數
                [terms, result] = this.generateLevel2();
                break;
            case 3: // 較難：單一變量，包含係數
                [terms, result] = this.generateLevel3();
                break;
            case 4: // 進階：雙變量
                [terms, result] = this.generateLevel4();
                break;
            case 5: // 挑戰：多變量，包含係數
                [terms, result] = this.generateLevel5();
                break;
            default:
                throw new Error(`難度等級 ${this.difficulty} 不可用`);
        }

        const [question, answer, steps] = this.formatQuestion(terms, result);
        const wrongAnswers = this.generateWrongAnswers(this.missingExponent, this.difficulty);
        
        return {
            content: question,
            correctAnswer: this.missingExponent.toString(),
            options: [this.missingExponent.toString(), ...wrongAnswers],
            correctIndex: 0,
            explanation: steps
        };
    }

    protected generateLevel1(): [Term[], Term] {
        const variable = this.VARIABLES[Math.floor(Math.random() * 3)]; // 只使用 x, y, z
        const exp1 = Math.floor(Math.random() * 3) + 2; // 2-4
        const exp2 = Math.floor(Math.random() * 3) + 2; // 2-4
        this.missingExponent = exp2;

        const result: Term = {
            coefficient: 1,
            variables: new Map([[variable, exp1 + exp2]])
        };

        return [
            [
                { coefficient: 1, variables: new Map([[variable, exp1]]) },
                { coefficient: 1, variables: new Map([[variable, exp2]]), hasMissing: true, missingVar: variable }
            ],
            result
        ];
    }

    protected generateLevel2(): [Term[], Term] {
        const variable = this.VARIABLES[Math.floor(Math.random() * 3)];
        const exp1 = Math.floor(Math.random() * 4) + 5; // 5-8
        const exp2 = Math.floor(Math.random() * 4) + 5; // 5-8
        this.missingExponent = exp2;

        const result: Term = {
            coefficient: 1,
            variables: new Map([[variable, exp1 + exp2]])
        };

        return [
            [
                { coefficient: 1, variables: new Map([[variable, exp1]]) },
                { coefficient: 1, variables: new Map([[variable, exp2]]), hasMissing: true, missingVar: variable }
            ],
            result
        ];
    }

    protected generateLevel3(): [Term[], Term] {
        const variable = this.VARIABLES[Math.floor(Math.random() * 5)];
        const coef1 = Math.floor(Math.random() * 4) + 2; // 2-5
        const exp1 = Math.floor(Math.random() * 3) + 2; // 2-4
        const exp2 = Math.floor(Math.random() * 3) + 2; // 2-4
        this.missingExponent = exp2;

        const result: Term = {
            coefficient: coef1,
            variables: new Map([[variable, exp1 + exp2]])
        };

        return [
            [
                { coefficient: coef1, variables: new Map([[variable, exp1]]) },
                { coefficient: 1, variables: new Map([[variable, exp2]]), hasMissing: true, missingVar: variable }
            ],
            result
        ];
    }

    protected generateLevel4(): [Term[], Term] {
        const vars = this.shuffleArray(this.VARIABLES.slice(0, 3)).slice(0, 2);
        const [var1, var2] = vars;
        const exp1 = Math.floor(Math.random() * 3) + 2; // 2-4
        const exp2 = Math.floor(Math.random() * 3) + 2; // 2-4
        const exp3 = Math.floor(Math.random() * 3) + 2; // 2-4
        const exp4 = Math.floor(Math.random() * 3) + 2; // 2-4
        this.missingExponent = exp3;

        const result: Term = {
            coefficient: 1,
            variables: new Map([
                [var1, exp1 + exp3],
                [var2, exp2 + exp4]
            ])
        };

        return [
            [
                { 
                    coefficient: 1, 
                    variables: new Map([
                        [var1, exp1],
                        [var2, exp2]
                    ])
                },
                { 
                    coefficient: 1, 
                    variables: new Map([
                        [var1, exp3],
                        [var2, exp4]
                    ]),
                    hasMissing: true,
                    missingVar: var1
                }
            ],
            result
        ];
    }

    protected generateLevel5(): [Term[], Term] {
        const vars = this.shuffleArray(this.VARIABLES.slice(0, 3));
        const coef1 = Math.floor(Math.random() * 3) + 2; // 2-4
        const coef2 = Math.floor(Math.random() * 3) + 2; // 2-4
        const exponents = vars.map(() => Math.floor(Math.random() * 3) + 2); // 2-4
        this.missingExponent = exponents[0];

        const result: Term = {
            coefficient: coef1 * coef2,
            variables: new Map(
                vars.map((v, i) => [v, exponents[i] * 2])
            )
        };

        return [
            [
                {
                    coefficient: coef1,
                    variables: new Map(
                        vars.map((v, i) => [v, exponents[i]])
                    )
                },
                {
                    coefficient: coef2,
                    variables: new Map(
                        vars.map((v, i) => [v, exponents[i]])
                    ),
                    hasMissing: true,
                    missingVar: vars[0]
                }
            ],
            result
        ];
    }

    protected generateWrongAnswers(correctAnswer: number, difficulty: number): string[] {
        const wrongAnswers = new Set<number>();
        
        // 生成錯誤答案的策略
        const strategies = [
            () => correctAnswer + 1,
            () => correctAnswer - 1,
            () => correctAnswer * 2,
            () => Math.floor(correctAnswer / 2),
            () => correctAnswer + 2,
            () => correctAnswer - 2
        ];

        while (wrongAnswers.size < 3) {
            const strategy = strategies[Math.floor(Math.random() * strategies.length)];
            const wrongAnswer = strategy();
            if (wrongAnswer > 0 && wrongAnswer !== correctAnswer) {
                wrongAnswers.add(wrongAnswer);
            }
        }

        return Array.from(wrongAnswers).map(String);
    }

    protected formatQuestion(terms: Term[], result: Term): [string, string, string] {
        // 格式化題目，將缺失的指數用 LaTeX 的方框符號替代
        const questionParts = terms.map(term => {
            let termStr = '';
            if (term.coefficient !== 1) termStr += term.coefficient;
            term.variables.forEach((exp, variable) => {
                if (term.hasMissing && variable === term.missingVar) {
                    // 使用 LaTeX 的 \Box 符號作為空格，放在指數位置
                    termStr += variable + '^{\\Box}';
                } else {
                    termStr += variable + '^{' + exp + '}';
                }
            });
            return termStr;
        });

        // 格式化結果
        let answer = '';
        if (result.coefficient !== 1) answer += result.coefficient;
        result.variables.forEach((exp, variable) => {
            answer += variable + '^{' + exp + '}';
        });

        // 生成解題步驟
        const steps = `解題步驟：
1. 找出已知的指數：
${Array.from(terms[0].variables.entries())
    .map(([v, e]) => `   \\(${v}^{${e}}\\)`)
    .join('\n')}
2. 觀察最終答案中的指數：
${Array.from(result.variables.entries())
    .map(([v, e]) => `   \\(${v}^{${e}}\\)`)
    .join('\n')}
3. 利用指數加法原理，求出缺少的指數：
   \\(${terms[1].missingVar}^{\\Box} = ${this.missingExponent}\\)`;

        return [questionParts.join(' \\times ') + ' = ' + answer, this.missingExponent.toString(), steps];
    }

    protected shuffleArray<T>(array: T[]): T[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
} 