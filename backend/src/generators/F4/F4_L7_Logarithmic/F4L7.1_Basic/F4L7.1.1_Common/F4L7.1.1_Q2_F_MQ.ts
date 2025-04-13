import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import {
    getRandomInt,
    getRandomDecimal,
    formatNumber,
    LaTeX,
    DEFAULT_CONFIG,
    roundTo,
    ExpressionAnalyzer,
    generateFactorCombinations
} from '@/utils/mathUtils';

interface AdvancedLogQuestion {
    expression: string;  // LaTeX 格式的表达式
    number: number;      // 实际计算的数值
    result: number;      // 对数计算结果
    steps: string[];     // 计算步骤
    resultFraction?: string; // 分数形式的结果
}

export default class F4L7_1_1_Q2_F_MQ extends QuestionGenerator {
    constructor(difficulty: number) {
        super(difficulty, 'F4L7.1.1_Q2_F_MQ');
    }

    private formatLogResult(result: number): string {
        return result.toString();
    }

    generate(): IGeneratorOutput {
        let question: AdvancedLogQuestion;
        
        // 根据难度生成问题
        switch (this.difficulty) {
            case 1:
                question = this.generateLevel1();
                break;
            case 2:
                question = this.generateLevel2();
                break;
            case 3:
                question = this.generateLevel3();
                break;
            case 4:
                question = this.generateLevel4();
                break;
            case 5:
                question = this.generateLevel5();
                break;
            case 6:
                question = this.generateLevel6();
                break;
            case 7:
                question = this.generateLevel7();
                break;
            default:
                throw new Error(`不支援的難度等級: ${this.difficulty}`);
        }

        // 格式化结果
        const correctAnswer = this.isIntegerResult(question.result) ? 
            question.result.toString() :  // 整数结果直接显示
            roundTo(question.result, 3).toFixed(3); // 非整数结果四舍五入到3位小数

        // 生成错误答案
        const wrongAnswers = this.generateWrongAnswers(question);

        return {
            content: `\\[${question.expression}\\]`,
            correctAnswer: correctAnswer,
            wrongAnswers: wrongAnswers.map(x => 
                this.isIntegerResult(x) ? 
                x.toString() : // 整数结果直接显示
                roundTo(x, 3).toFixed(3)
            ),
            explanation: this.generateExplanation(question),
            type: 'text',
            displayOptions: {
                latex: true
            }
        };
    }

    private generateLevel1(): AdvancedLogQuestion {
        // 10的正负次方
        const power = getRandomInt(-5, 5);
        return {
            expression: `\\log 10^{${power}}`,
            number: Math.pow(10, power),
            result: power,
            steps: [
                `\\log 10^{${power}}`,
                `= ${power}`
            ]
        };
    }

    private generateLevel2(): AdvancedLogQuestion {
        // 10的整数次方
        const power = getRandomInt(1, 4);
        const number = Math.pow(10, power);
        return {
            expression: `\\log ${number}`,
            number: number,
            result: power,
            steps: [
                `\\log ${number}`,
                `\\log 10^{${power}}`,
                `= ${power}`
            ]
        };
    }

    private generateLevel3(): AdvancedLogQuestion {
        // 生成 -5 到 5 的随机整数作为指数
        const power = getRandomInt(-5, 5);
        const number = Math.pow(10, power);
        
        // 格式化数字，避免使用科学计数法
        const formattedNumber = power >= 0 ? 
            '1' + '0'.repeat(power) :  // 对于正指数，如 100, 1000 等
            '0.' + '0'.repeat(-power - 1) + '1';  // 对于负指数，如 0.01, 0.001 等
        
        return {
            expression: `\\log ${formattedNumber}`,
            number: number,
            result: power,
            steps: [
                `\\log ${formattedNumber}`,
                `\\log 10^{${power}}`,
                `= ${power}`
            ]
        };
    }

    private generatePowerFactorQuestion(
        targetPower: number,
        options: {
            rootPower?: number,
            isInverse?: boolean
        } = {}
    ): AdvancedLogQuestion {
        const { rootPower = 1, isInverse = false } = options;
        const base = Math.pow(10, targetPower);
        
        // 获取所有可能的因子组合
        const possibleFactors = generateFactorCombinations(base, {
            minFactor: 2,
            maxFactor: 9,
            maxQuotient: 9,
            maxFactors: rootPower === 1 ? 3 : 2
        });

        // 计算分数形式的结果
        const numerator = isInverse ? -targetPower : targetPower;
        const denominator = rootPower;
        const resultValue = numerator / denominator;  // 用于计算实际数值
        const resultFraction = `\\frac{${numerator}}{${denominator}}`;  // LaTeX分数形式

        // 如果没有找到合适的组合，使用默认的2和5组合
        if (possibleFactors.length === 0) {
            // 对于10的幂，总是可以用2和5的组合
            const defaultFactors = ['2', '5'];
            if (targetPower > 1) {
                // 如果幂次大于1，添加剩余的10的幂
                defaultFactors.push(String(Math.pow(10, targetPower - 1)));
            }
            const defaultExpression = defaultFactors.join('\\times');

            const rootSymbol = rootPower === 2 ? '\\sqrt' : rootPower > 2 ? `\\sqrt[${rootPower}]` : '';
            const expression = isInverse 
                ? `\\log \\frac{1}{${rootSymbol}{${defaultExpression}}}` 
                : rootPower === 1 
                    ? `\\log(${defaultExpression})`
                    : `\\log ${rootSymbol}{${defaultExpression}}`;

            const steps = this.generateSteps(defaultExpression, targetPower, rootPower, isInverse, resultFraction);

            return {
                expression,
                number: Math.pow(10, resultValue),  // 使用数值进行计算
                result: resultValue,                // 存储数值结果
                steps,
                resultFraction                      // 添加分数形式的结果
            };
        }

        // 随机选择一个因子组合
        const randomIndex = getRandomInt(0, possibleFactors.length - 1);
        const { factors } = possibleFactors[randomIndex];
        const factorExpression = factors.join('\\times');

        // 构建表达式
        const rootSymbol = rootPower === 2 ? '\\sqrt' : rootPower > 2 ? `\\sqrt[${rootPower}]` : '';
        const expression = isInverse 
            ? `\\log \\frac{1}{${rootSymbol}{${factorExpression}}}` 
            : rootPower === 1 
                ? `\\log(${factorExpression})`
                : `\\log ${rootSymbol}{${factorExpression}}`;

        const steps = this.generateSteps(factorExpression, targetPower, rootPower, isInverse, resultFraction);

        return {
            expression,
            number: Math.pow(10, resultValue),  // 使用数值进行计算
            result: resultValue,                // 存储数值结果
            steps,
            resultFraction                      // 添加分数形式的结果
        };
    }

    private generateSteps(
        expression: string,
        targetPower: number,
        rootPower: number,
        isInverse: boolean,
        resultFraction: string
    ): string[] {
        const getRootSymbol = (power: number): string => {
            return power === 2 ? '\\sqrt' : `\\sqrt[${power}]`;
        };

        if (rootPower === 1) {
            return [
                `\\log(${expression})`,
                `= \\log ${String(Math.pow(10, targetPower))}`,
                `= \\log 10^{${targetPower}}`,
                `= ${targetPower}`
            ];
        }

        const rootSymbol = getRootSymbol(rootPower);
        if (isInverse) {
            return [
                `\\log \\frac{1}{${expression}}`,
                `= \\log 1 - \\log ${rootSymbol} ${expression}`,
                `= 0 - \\log ${rootSymbol} ${expression}`,
                `= 0 - \\log (${expression})^{\\frac{1}{${rootPower}}}`,
                `= 0 - \\log (10^{${targetPower}})^{\\frac{1}{${rootPower}}}`,
                `= 0 - \\log 10^{\\frac{${targetPower}}{${rootPower}}}`,
                `= ${resultFraction}`  // 使用分数形式
            ];
        }

        return [
            `\\log ${rootSymbol} ${expression}`,
            `= \\log (${expression})^{\\frac{1}{${rootPower}}}`,
            `= \\log (10^{${targetPower}})^{\\frac{1}{${rootPower}}}`,
            `= \\log 10^{\\frac{${targetPower}}{${rootPower}}}`,
            `= ${resultFraction}`  // 使用分数形式
        ];
    }

    private generateLevel4(): AdvancedLogQuestion {
        const targetPower = getRandomInt(1, 5);
        return this.generatePowerFactorQuestion(targetPower);
    }

    private generateLevel5(): AdvancedLogQuestion {
        // 为了确保结果是简单分数，我们需要合适的幂和根号
        const validCombinations = [
            { power: 1, root: 2 },  // 1/2
            { power: 2, root: 2 },  // 1
            { power: 3, root: 2 },  // 3/2
            { power: 1, root: 3 },  // 1/3
            { power: 2, root: 3 },  // 2/3
            { power: 3, root: 3 },  // 1
            { power: 1, root: 4 },  // 1/4
            { power: 2, root: 4 },  // 1/2
            { power: 3, root: 4 },  // 3/4
        ];
        
        // 随机选择一个组合
        const randomIndex = getRandomInt(0, validCombinations.length - 1);
        const { power: targetPower, root: rootPower } = validCombinations[randomIndex];
        
        return this.generatePowerFactorQuestion(targetPower, { rootPower });
    }

    private generateLevel6(): AdvancedLogQuestion {
        const targetPower = getRandomInt(1, 5);
        const rootPower = getRandomInt(2, 3);
        return this.generatePowerFactorQuestion(targetPower, { rootPower, isInverse: true });
    }

    private generateLevel7(): AdvancedLogQuestion {
        // 指数形式的对数
        const base = getRandomInt(2, 9);
        return {
            expression: `10^{\\log ${base}}`,
            number: base,
            result: base,
            steps: [
                `10^{\\log ${base}}`,
                '根據對數性質：',
                `10^{\\log x} = x`,
                `= ${base}`
            ]
        };
    }

    private generateWrongAnswers(question: AdvancedLogQuestion): number[] {
        const wrongAnswers: number[] = [];
        const correctAnswer = question.result;
        
        while (wrongAnswers.length < 3) {
            let wrongAnswer: number;
            
            // 根据不同的错误类型生成错误答案
            const errorType = getRandomInt(1, 4);
            
            switch (errorType) {
                case 1: // 正负号错误
                    wrongAnswer = -correctAnswer;
                    break;
                    
                case 2: // 运算顺序错误
                    wrongAnswer = correctAnswer + (Math.random() - 0.5);
                    break;
                    
                case 3: // 根号处理错误
                    wrongAnswer = correctAnswer * 2;
                    break;
                    
                case 4: // 指数形式错误
                    wrongAnswer = Math.pow(10, correctAnswer);
                    break;
                
                default:
                    wrongAnswer = correctAnswer + 1;
            }
            
            // 只对非整数结果进行四舍五入
            if (!this.isIntegerResult(wrongAnswer)) {
                wrongAnswer = roundTo(wrongAnswer, 3);
            }
            
            // 确保答案不重复且不等于正确答案
            if (!wrongAnswers.includes(wrongAnswer) && 
                Math.abs(wrongAnswer - correctAnswer) > 0.001) {
                wrongAnswers.push(wrongAnswer);
            }
        }
        
        return wrongAnswers;
    }

    private generateExplanation(question: AdvancedLogQuestion): string {
        const steps: string[] = [];
        
        steps.push('計算步驟：');
        
        // 修改最后一步的结果显示
        const modifiedSteps = question.steps.map((step, index) => {
            if (index === question.steps.length - 1 && step.startsWith('=')) {
                const result = this.isIntegerResult(question.result) ?
                    question.result.toString() : // 整数结果直接显示
                    roundTo(question.result, 3).toFixed(3);
                return `= ${result}`;
            }
            return step;
        });
        
        steps.push(...modifiedSteps.map(step => `\\[${step}\\]`));
        
        return steps.join('\n');
    }

    private isIntegerResult(result: number): boolean {
        return Number.isInteger(result);
    }
} 