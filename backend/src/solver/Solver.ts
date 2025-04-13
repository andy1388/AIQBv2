import { gcd } from '../utils/mathUtils';

interface SolutionStep {
    description: string;
    operation: string;
    result?: string;
}

interface Solution {
    steps: SolutionStep[];
    finalAnswer?: string;
}

export class Solver {
    // 解析输入的 LaTeX 表达式
    private static parseLatex(latex: string): {
        type: 'fraction-reduction' | 'decimal-fraction-conversion' | 'unknown';
        values: any;
    } {
        // 检查是否是分数约分问题
        const fractionMatch = latex.match(/\\frac\{(\d+)\}\{(\d+)\}/);
        if (fractionMatch) {
            return {
                type: 'fraction-reduction',
                values: {
                    numerator: parseInt(fractionMatch[1]),
                    denominator: parseInt(fractionMatch[2])
                }
            };
        }

        // 后续可以添加其他类型的识别...

        return {
            type: 'unknown',
            values: null
        };
    }

    // 主求解方法
    static solve(latex: string): Solution {
        const parsed = this.parseLatex(latex);
        
        switch (parsed.type) {
            case 'fraction-reduction':
                return this.solveFractionReduction(parsed.values);
            default:
                throw new Error('無法識別的題目類型');
        }
    }

    // 分数约分求解方法
    private static solveFractionReduction(values: { numerator: number; denominator: number }): Solution {
        const steps: SolutionStep[] = [];
        const { numerator, denominator } = values;

        // 步骤1：显示原始分数
        steps.push({
            description: '原始分數',
            operation: `\\frac{${numerator}}{${denominator}}`
        });

        // 步骤2：计算最大公约数
        const gcdValue = gcd(numerator, denominator);
        steps.push({
            description: '計算最大公因數',
            operation: `\\gcd(${numerator}, ${denominator}) = ${gcdValue}`
        });

        // 如果最大公约数为1，分数已经是最简形式
        if (gcdValue === 1) {
            steps.push({
                description: '此分數已是最簡分數',
                operation: `\\frac{${numerator}}{${denominator}}`
            });
            return { steps };
        }

        // 步骤3：约分过程
        steps.push({
            description: '約分過程',
            operation: `\\frac{${numerator}}{${denominator}} = \\frac{${numerator} \\div ${gcdValue}}{${denominator} \\div ${gcdValue}}`
        });

        // 步骤4：最终结果
        const simplifiedNumerator = numerator / gcdValue;
        const simplifiedDenominator = denominator / gcdValue;
        steps.push({
            description: '最簡分數',
            operation: `\\frac{${simplifiedNumerator}}{${simplifiedDenominator}}`
        });

        return {
            steps,
            finalAnswer: `\\frac{${simplifiedNumerator}}{${simplifiedDenominator}}`
        };
    }
} 