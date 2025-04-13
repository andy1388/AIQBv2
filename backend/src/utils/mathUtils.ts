/**
 * 數學工具模組 - 提供常用的數學運算和工具函數
 */

import { create, all } from 'mathjs';
import type { Fraction, MathJsStatic } from 'mathjs';
const algebrite = require('algebrite');
const nerdamer = require('nerdamer');
require('nerdamer/all');

// 创建一个新的 math 实例
const math: MathJsStatic = create(all);

// 常用數學常數
export const MATH_CONSTANTS = {
    PI: Math.PI,
    E: Math.E,
    SQRT2: Math.SQRT2,
    SQRT1_2: Math.SQRT1_2
} as const;

// 變量名稱集合
export const VARIABLE_NAMES = ['x', 'y', 'z', 'a', 'b', 'c'] as const;

/**
 * 數值範圍類型
 */
export interface NumberRange {
    min: number;
    max: number;
}

/**
 * 生成隨機整數
 */
export function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 生成隨機小數（指定小數位數）
 */
export function getRandomDecimal(min: number, max: number, decimals: number = 1): number {
    const num = Math.random() * (max - min) + min;
    return Number(num.toFixed(decimals));
}

/**
 * 生成非零隨機整數
 */
export function getNonZeroRandomInt(min: number, max: number): number {
    let num;
    do {
        num = getRandomInt(min, max);
    } while (num === 0);
    return num;
}

/**
 * 生成係數（排除特定數值）
 */
export function generateCoefficient(range: NumberRange, exclude: number[] = [0]): number {
    let coefficient;
    do {
        coefficient = getRandomInt(range.min, range.max);
    } while (exclude.includes(coefficient));
    return coefficient;
}

/**
 * 格式化數字（處理正負號）
 */
export function formatNumber(num: number): string {
    if (num >= 0) {
        return `+${num}`;
    }
    return num.toString();
}

/**
 * 格式化係數（省略1和-1）
 */
export function formatCoefficient(coefficient: number, variable: string): string {
    if (coefficient === 1) return variable;
    if (coefficient === -1) return `-${variable}`;
    return `${coefficient}${variable}`;
}

/**
 * 最大公約數
 */
export function gcd(a: number, b: number): number {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
        [a, b] = [b, a % b];
    }
    return a;
}

/**
 * 最小公倍數
 */
export function lcm(a: number, b: number): number {
    return Math.abs(a * b) / gcd(a, b);
}

/**
 * 約分分數
 */
export function reduceFraction(expression: string): string {
    try {
        const [expr, equals] = expression.split('=');
        
        if (!expr) {
            throw new Error('表達式為空');
        }

        console.log('Processing fraction reduction:', expr);

        let num: number, den: number;

        // 處理帶分數格式 (例如: 6\frac{20}{36})
        const mixedFractionMatch = expr.match(/(\d+)\\frac\{(\d+)\}\{(\d+)\}/);
        if (mixedFractionMatch) {
            const [_, whole, numerator, denominator] = mixedFractionMatch;
            // 將帶分數轉換為假分數
            num = parseInt(whole) * parseInt(denominator) + parseInt(numerator);
            den = parseInt(denominator);
        } else {
            // 處理普通分數格式
            const fractionMatch = expr.match(/\\frac\s*\{([\d.]+)\}\s*\{([\d.]+)\}/);
            if (fractionMatch) {
                const [_, numerator, denominator] = fractionMatch;
                num = parseFloat(numerator);
                den = parseFloat(denominator);
            } else {
                // 處理普通除法格式 (a/b)
                const divisionMatch = expr.match(/([\d.]+)\s*\/\s*([\d.]+)/);
                if (divisionMatch) {
                    const [_, numerator, denominator] = divisionMatch;
                    num = parseFloat(numerator);
                    den = parseFloat(denominator);
                } else {
                    throw new Error('不是有效的分數格式');
                }
            }
        }

        if (isNaN(num) || isNaN(den)) {
            throw new Error('無效的數字格式');
        }

        if (den === 0) {
            throw new Error('分母不能為零');
        }

        // 處理小數點
        const getDecimalPlaces = (n: number): number => {
            const str = n.toString();
            const decimalIndex = str.indexOf('.');
            return decimalIndex === -1 ? 0 : str.length - decimalIndex - 1;
        };

        // 獲取分子分母中小數位數的最大值
        const numDecimals = getDecimalPlaces(num);
        const denDecimals = getDecimalPlaces(den);
        const maxDecimals = Math.max(numDecimals, denDecimals);

        // 將分子分母同時乘以10的冪次來消除小數
        if (maxDecimals > 0) {
            const factor = Math.pow(10, maxDecimals);
            num *= factor;
            den *= factor;
        }

        // 轉換為整數
        num = Math.round(num);
        den = Math.round(den);

        // 計算最大公約數
        const gcdValue = gcd(num, den);
        
        // 約分
        const reducedNum = num / gcdValue;
        const reducedDen = den / gcdValue;

        // 如果分母為1，返回整數
        let result;
        if (reducedDen === 1) {
            result = reducedNum.toString();
        } else {
            result = `\\frac{${reducedNum}}{${reducedDen}}`;
        }
        
        console.log('Reduced fraction:', result);

        return equals ? `${result}=${equals}` : result;
    } catch (error) {
        console.error('Reduction error:', error);
        throw error;
    }
}

/**
 * 檢查是否為整數
 */
export function isInteger(num: number): boolean {
    return Number.isInteger(num);
}

/**
 * 生成指定範圍內的隨機整數解
 */
export function generateIntegerSolution(range: NumberRange): number {
    return getRandomInt(range.min, range.max);
}

/**
 * LaTeX 格式化工具
 */
export const LaTeX = {
    /**
     * 格式化一次項
     */
    formatLinearTerm(coefficient: number, variable: string = 'x'): string {
        if (coefficient === 0) return '';
        if (coefficient === 1) return variable;
        if (coefficient === -1) return `-${variable}`;
        return `${coefficient}${variable}`;
    },

    /**
     * 格式化常數項
     */
    formatConstant(constant: number): string {
        if (constant === 0) return '';
        return constant > 0 ? `+${constant}` : constant.toString();
    },

    /**
     * 格式化分數
     */
    formatFraction(numerator: number, denominator: number): string {
        return `\\frac{${numerator}}{${denominator}}`;
    }
};

/**
 * 題目難度相關工具
 */
export const DifficultyUtils = {
    /**
     * 根據難度調整數值範圍
     */
    adjustRange(baseRange: NumberRange, difficulty: number): NumberRange {
        const multiplier = 1 + (difficulty - 1) * 0.5;
        return {
            min: Math.floor(baseRange.min * multiplier),
            max: Math.ceil(baseRange.max * multiplier)
        };
    },

    /**
     * 根據難度決定是否使用小數
     */
    shouldUseDecimals(difficulty: number): boolean {
        return difficulty >= 4;
    },

    /**
     * 根據難度決定小數位數
     */
    getDecimalPlaces(difficulty: number): number {
        if (difficulty <= 3) return 0;
        return difficulty - 3;
    }
};

// 導出默認配置
export const DEFAULT_CONFIG = {
    INTEGER_RANGE: { min: -20, max: 20 },
    COEFFICIENT_RANGE: { min: -12, max: 12 },
    DECIMAL_PLACES: 1,
    VARIABLE_NAMES: ['x', 'y', 'z'] as const
} as const;

/**
 * 表達式分析工具
 */
export const ExpressionAnalyzer = {
    /**
     * 分析表達式的完整信息
     */
    analyze(latex: string): ExpressionInfo {
        return {
            type: this.getExpressionType(latex),
            termCount: this.countTerms(latex),
            fractionInfo: this.analyzeFraction(latex),
            irrationalInfo: this.analyzeIrrational(latex),
            variables: this.findVariables(latex),
            likeTerms: this.analyzeLikeTerms(latex),
            bracketInfo: this.analyzeBrackets(latex)
        };
    },

    /**
     * 清理 LaTeX 表達式
     */
    _cleanLatex(latex: string): string {
        // 移除空格
        let clean = latex.replace(/\s+/g, '');
        // 標準化負號
        clean = clean.replace(/−/g, '-');
        // 處理開頭的負號
        clean = clean.replace(/^-/, 'NEG');  // 暫時替換開頭的負號
        return clean;
    },

    /**
     * 獲取表達式類型
     */
    getExpressionType(latex: string): ExpressionType {
        const cleanLatex = this._cleanLatex(latex);
        
        // 還原 NEG 為負號
        const finalLatex = cleanLatex.replace('NEG', '-');
        
        // 檢查是否有加號或減號（不在括號內的）
        const hasOuterOperators = this._hasOuterOperators(finalLatex);
        
        if (hasOuterOperators) {
            return 'polynomial';
        }
        
        // 檢查是否是括號表達式
        if (finalLatex.includes('(')) {
            // 檢查括號前的部分是否為單項式
            const beforeBracket = finalLatex.split('(')[0].replace('NEG', '-');
            
            // 檢查是否為單項式（包括負號情況）
            const isSingleTerm = /^-?(\d*x?|\d+)$/.test(beforeBracket);
            
            if (isSingleTerm) {
                return 'monomial';
            }
        }
        
        // 其他情況的判斷
        const hasVariable = /[a-zA-Z]/.test(finalLatex);
        const hasMultipleTerms = /[+\-]/g.test(finalLatex.replace(/^-/, '')); // 忽略開頭的負號

        if (!hasVariable && !hasMultipleTerms) return 'constant';
        if (!hasVariable && hasMultipleTerms) return 'numerical';
        if (hasVariable && !hasMultipleTerms) return 'monomial';
        return 'polynomial';
    },

    /**
     * 計算項數
     */
    countTerms(latex: string): number {
        const cleanLatex = this._cleanLatex(latex);
        const finalLatex = cleanLatex.replace('NEG', '-');
        
        // 計算外部運算符的數量
        const outerOperators = this._getOuterOperators(finalLatex);
        if (outerOperators.length > 0) {
            return outerOperators.length + 1;
        }
        
        // 如果是單項式乘以括號，返回1
        if (finalLatex.includes('(')) {
            const beforeBracket = finalLatex.split('(')[0].replace('NEG', '-');
            const isSingleTerm = /^-?(\d*x?|\d+)$/.test(beforeBracket);
            if (isSingleTerm) {
                return 1;
            }
        }
        
        // 如果是常數或單項式，返回1
        if (!this._hasMultipleTerms(finalLatex.replace(/^-/, ''))) return 1;
        
        // 計算運算符數量並加1（忽略開頭的負號）
        const operators = finalLatex.replace(/^-/, '').match(/[+\-]/g) || [];
        return operators.length + 1;
    },

    /**
     * 分析分數相關信息
     */
    analyzeFraction(latex: string): FractionInfo {
        return {
            hasFraction: latex.includes('\\frac'),
            hasNestedFraction: this._hasNestedFraction(latex),
            fractionCount: (latex.match(/\\frac/g) || []).length,
            nestedLevel: this._getNestedFractionLevel(latex)
        };
    },

    /**
     * 分析無理數相關信息
     */
    analyzeIrrational(latex: string): IrrationalInfo {
        return {
            hasIrrational: this._hasIrrational(latex),
            types: {
                hasSquareRoot: latex.includes('\\sqrt'),
                hasPi: latex.includes('\\pi'),
                hasE: latex.includes('\\e')
            },
            count: this._countIrrationalTerms(latex)
        };
    },

    /**
     * 查找所有變量
     */
    findVariables(latex: string): VariableInfo {
        // 首先清理 LaTeX 命令
        const cleanLatex = this._removeLatexCommands(latex);
        
        // 只匹配独立的字母（不是LaTeX命令的一部分）
        const variables = new Set(
            cleanLatex.match(/(?<![\\{])[a-zA-Z](?![a-zA-Z}])/g) || []
        );

        // Fix the type error in the list property
        const variableInfo: VariableInfo = {
            hasVariables: variables.size > 0,
            count: variables.size,
            list: Array.from(variables).map(String) // Convert to string array
        };

        return variableInfo;
    },

    /**
     * 移除 LaTeX 命令
     */
    _removeLatexCommands(latex: string): string {
        return latex
            // 移除 \frac 命令
            .replace(/\\frac\{[^{}]*\}\{[^{}]*\}/g, '')
            // 移除 \sqrt 命令
            .replace(/\\sqrt\{[^{}]*\}/g, '')
            // 移除其他常见的 LaTeX 命令
            .replace(/\\[a-zA-Z]+/g, '')
            // 移除花括号
            .replace(/[\{\}]/g, '')
            // 移除空格
            .replace(/\s+/g, '');
    },

    // 輔助方法
    _hasMultipleTerms(latex: string): boolean {
        return /[+\-]/.test(latex);
    },

    _hasNestedFraction(latex: string): boolean {
        const nestedPattern = /\\frac\{[^{}]*\\frac[^{}]*\}/;
        return nestedPattern.test(latex);
    },

    _getNestedFractionLevel(latex: string): number {
        let level = 0;
        let maxLevel = 0;
        for (let i = 0; i < latex.length; i++) {
            if (latex.slice(i).startsWith('\\frac')) {
                level++;
                maxLevel = Math.max(maxLevel, level);
            }
            if (latex[i] === '}') level--;
        }
        return maxLevel;
    },

    _hasIrrational(latex: string): boolean {
        return latex.includes('\\sqrt') || 
               latex.includes('\\pi') || 
               latex.includes('\\e');
    },

    _countIrrationalTerms(latex: string): number {
        const irrationalMatches = latex.match(/\\(?:sqrt|pi|e)/g) || [];
        return irrationalMatches.length;
    },

    /**
     * 分析同類項
     */
    analyzeLikeTerms(latex: string): LikeTermsInfo {
        // 移除等号及其后面的内容
        const expressionPart = latex.split('=')[0];
        const cleanLatex = this._cleanLatex(expressionPart);
        const terms = this._splitTerms(cleanLatex);
        const groups = new Map<string, string[]>();

        // 分析每个项
        terms.forEach(term => {
            // 提取变量和系数
            const { coefficient, variable } = this._parseTermParts(term);
            
            // 对于纯数字项（包括小数），使用特殊标识
            const key = this._isNumeric(term) ? 'numeric' : (variable || 'constant');
            
            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key)?.push(term);
        });

        // 构建结果
        const likeTermGroups = Array.from(groups.entries())
            .filter(([_, terms]) => terms.length > 1)  // 只保留有同类项的组
            .map(([variable, terms]) => ({
                variable: variable === 'numeric' ? '數值項' : (variable || '常數項'),
                terms,
                count: terms.length
            }));

        return {
            hasLikeTerms: likeTermGroups.length > 0,
            groups: likeTermGroups
        };
    },

    /**
     * 检查是否为数值（包括小数）
     */
    _isNumeric(term: string): boolean {
        // 移除前导的加减号
        const cleanTerm = term.replace(/^[+-]/, '');
        // 检查是否为数字（包括小数）
        return !isNaN(parseFloat(cleanTerm)) && cleanTerm.length > 0;
    },

    /**
     * 分割項
     */
    _splitTerms(latex: string): string[] {
        // 处理第一项可能的正号
        const normalized = latex.replace(/^\+/, '');
        
        // 分割并保留正负号
        return normalized
            .replace(/\s+/g, '')
            .split(/(?=[+-])/)
            .filter(term => term.length > 0)
            .map(term => term.trim());
    },

    /**
     * 解析項的各部分
     */
    _parseTermParts(term: string): { coefficient: string; variable: string } {
        // 移除前导的加号
        term = term.replace(/^\+/, '');
        
        // 如果是纯数字（包括小数），返回系数，无变量
        if (this._isNumeric(term)) {
            return {
                coefficient: term,
                variable: ''
            };
        }
        
        // 匹配系数和变量部分
        const match = term.match(/^([+-]?\d*\.?\d*)(.*?)$/);
        if (!match) {
            return { coefficient: '', variable: term };
        }

        let [, coefficient, variable] = match;
        
        // 处理特殊情况
        if (coefficient === '' || coefficient === '+') coefficient = '1';
        if (coefficient === '-') coefficient = '-1';
        
        return {
            coefficient: coefficient,
            variable: variable.trim()
        };
    },

    /**
     * 標準化變量部分
     */
    _standardizeVariables(variables: string): string {
        // 處理指數
        const parts = variables.split('^');
        if (parts.length > 1) {
            // 如果有指數，保持原樣
            return variables;
        }

        // 如果沒有指數，按字母排序
        const chars = variables.split('');
        return chars.sort().join('');
    },

    /**
     * 標準化根式
     */
    _standardizeRoot(root: string): string {
        // 移除空格
        root = root.replace(/\s+/g, '');
        // 如果是純數字的根號，保持原樣
        if (root.match(/^\\sqrt\{\d+\}$/)) {
            return root;
        }
        return root;
    },

    /**
     * 標準化函數
     */
    _standardizeFunction(term: string): string {
        // 匹配所有支持的函數
        const functions = [
            // 三角函數
            '\\sin', '\\cos', '\\tan', '\\csc', '\\sec', '\\cot',
            // 對數函數
            '\\ln', '\\log'
        ];

        // 完整匹配函數及其參數
        for (const func of functions) {
            if (term.startsWith(func)) {
                // 提取函數參數
                const paramMatch = term.match(/^\\[a-z]+\{([^{}]+)\}$/);
                if (paramMatch) {
                    const [_, param] = paramMatch;
                    return `${func}{${param}}`; // 保持完整的函數形式
                }
            }
        }
        return term;
    },

    /**
     * 合併同類項
     */
    combineTerms(expression: string): string {
        try {
            const [expr, equals] = expression.split('=');
            
            if (!expr) {
                throw new Error('表達式為空');
            }

            console.log('Processing expression:', expr);

            // 將 LaTeX 轉換為 nerdamer 可處理的格式
            let processedExpr = this._latexToNerdamer(expr);

            try {
                // 使用 nerdamer 化簡表達式
                const simplified = nerdamer(processedExpr)
                    .expand()
                    .simplify();
                
                // 將結果轉回 LaTeX 格式
                let result = this._nerdamerToLatex(simplified.text());

                // 如果結果為空，返回0
                if (!result) {
                    result = '0';
                }

                console.log('Combined result:', result);
                return equals ? `${result}=${equals}` : result;

            } catch (nerdamerError) {
                console.error('Nerdamer processing error:', nerdamerError);
                return expr; // 如果處理失敗，返回原表達式
            }

        } catch (error) {
            console.error('Combine terms error:', error);
            throw error;
        }
    },

    /**
     * 將 LaTeX 格式轉換為 nerdamer 可處理的格式
     */
    _latexToNerdamer(latex: string): string {
        return latex
            // 處理分數
            .replace(/\\frac\{(-?\d+)\}\{(\d+)\}/g, '($1/$2)')
            // 處理乘號
            .replace(/\\times/g, '*')
            .replace(/\\cdot/g, '*')
            // 處理除號
            .replace(/\\div/g, '/')
            // 處理指數
            .replace(/\^(\d+)/g, '^($1)')
            // 處理根號
            .replace(/\\sqrt\{([^{}]+)\}/g, 'sqrt($1)')
            // 處理括號
            .replace(/\\left\(/g, '(')
            .replace(/\\right\)/g, ')')
            // 處理變量
            .replace(/([a-zA-Z])([a-zA-Z])/g, '$1*$2')
            // 移除多餘的空格
            .replace(/\s+/g, '')
            // 處理連續的運算符
            .replace(/([+\-*\/])\s*([+\-*\/])/g, '$1$2');
    },

    /**
     * 將 nerdamer 結果轉換回 LaTeX 格式
     */
    _nerdamerToLatex(result: string): string {
        return result
            // 處理分數
            .replace(/\((-?\d+)\/(\d+)\)/g, '\\frac{$1}{$2}')
            // 處理乘號
            .replace(/\*/g, '\\times')
            // 處理除號
            .replace(/\//g, '\\div')
            // 處理指數
            .replace(/\^(\d+)/g, '^{$1}')
            // 處理根號
            .replace(/sqrt\(([^()]+)\)/g, '\\sqrt{$1}')
            // 處理括號
            .replace(/\(/g, '\\left(')
            .replace(/\)/g, '\\right)')
            // 處理正號（移除開頭的正號）
            .replace(/^\+/, '')
            // 處理連續的運算符
            .replace(/([+-])\s*([+-])/g, (_, op1, op2) => 
                op1 === op2 ? '+' : '-'
            )
            // 美化空格
            .replace(/([+\-])/g, ' $1 ')
            .trim();
    },

    /**
     * 格式化系数
     */
    _formatCoefficient(num: number): string {
        // 检查是否为整数
        if (Number.isInteger(num)) {
            return num.toString();
        }
        
        // 处理小数，最多保留5位小数
        const rounded = Number(num.toFixed(5));
        // 如果舍入后变成整数，返回整数
        if (Number.isInteger(rounded)) {
            return rounded.toString();
        }
        // 否则返回小数形式
        return rounded.toString();
    },

    /**
     * 计算循环小数对应的分数
     */
    calculateFractionFromRecurring(nonRepeating: string, repeating: string): [number, number] {
        // 处理整数部分和小数部分
        const parts = nonRepeating.split('.');
        const integerPart = parts[0] || '0';  // 整数部分
        const decimalPart = parts[1] || '';    // 小数部分
        
        // 计算分子和分母
        const base = Math.pow(10, decimalPart.length);
        const repLen = repeating.length;
        const factor = Math.pow(10, repLen) - 1;
        
        // 构造分数
        const decimal = parseInt(decimalPart || '0');
        const rep = parseInt(repeating);
        const numerator = (decimal * factor + rep) + (parseInt(integerPart) * base * factor);
        const denominator = factor * base;
        
        // 约分
        const gcd = this.gcd(numerator, denominator);
        return [numerator / gcd, denominator / gcd];
    },

    /**
     * 计算分数的小数表示
     */
    calculateDecimalFromFraction(numerator: number, denominator: number): string {
        let dividend = numerator;
        let quotient = Math.floor(dividend / denominator);
        let remainders: number[] = [];
        let decimals: number[] = [];
        
        dividend = (dividend % denominator) * 10;
        
        while (dividend !== 0 && !remainders.includes(dividend)) {
            remainders.push(dividend);
            decimals.push(Math.floor(dividend / denominator));
            dividend = (dividend % denominator) * 10;
        }
        
        if (dividend === 0) {
            // 有限小数
            return quotient + (decimals.length > 0 ? '.' + decimals.join('') : '');
        } else {
            // 循环小数
            const cycleStartIndex = remainders.indexOf(dividend);
            const nonRepeating = decimals.slice(0, cycleStartIndex).join('');
            const repeating = decimals.slice(cycleStartIndex).join('');
            
            return `${quotient}${nonRepeating.length > 0 ? '.' + nonRepeating : ''}.\\overline{${repeating}}`;
        }
    },

    /**
     * 辅助方法：最大公约数
     */
    gcd(a: number, b: number): number {
        return b === 0 ? Math.abs(a) : this.gcd(b, a % b);
    },

    /**
     * 将小数转换为分数
     */
    decimalToFraction(decimal: number): [number, number] {
        const precision = 1e5; // 5位小数精度
        let numerator = Math.round(decimal * precision);
        let denominator = precision;
        
        // 约分
        const gcd = this.gcd(numerator, denominator);
        return [numerator / gcd, denominator / gcd];
    },

    /**
     * 在小数和分数之间转换
     */
    convertDecimalFraction(expression: string): string {
        try {
            // 移除等号及其后面的内容
            const [expr, equals] = expression.split('=');
            
            if (!expr) {
                throw new Error('表達式為空');
            }

            console.log('Processing expression:', expr); // 添加日志

            let converted: string;
            
            // 首先尝试匹配完整的 LaTeX 分数格式
            const fractionMatch = expr.match(/\\frac\s*\{(\d+)\}\s*\{(\d+)\}/);
            if (fractionMatch) {
                console.log('Matched fraction:', fractionMatch); // 添加日志
                // 如果是分数，直接提取分子分母并计算
                const [_, numerator, denominator] = fractionMatch;
                if (!numerator || !denominator || parseInt(denominator) === 0) {
                    throw new Error('無效的分數格式');
                }
                const num = parseInt(numerator);
                const den = parseInt(denominator);
                
                // 如果分母为1，直接返回分子
                if (den === 1) {
                    converted = num.toString();
                } else {
                    const decimal = num / den;
                    
                    // 检查是否为循环小数
                    const remainders: number[] = [];
                    let dividend = (num % den) * 10;
                    let decimals: number[] = [];
                    
                    while (dividend !== 0 && !remainders.includes(dividend)) {
                        remainders.push(dividend);
                        decimals.push(Math.floor(dividend / den));
                        dividend = (dividend % den) * 10;
                    }
                    
                    if (dividend === 0) {
                        // 有限小数，保留到小数点后5位，并移除末尾的0
                        converted = decimal.toFixed(5).replace(/\.?0+$/, '');
                    } else {
                        // 循环小数
                        const cycleStartIndex = remainders.indexOf(dividend);
                        const integerPart = Math.floor(decimal);
                        const nonRepeating = decimals.slice(0, cycleStartIndex).join('');
                        const repeating = decimals.slice(cycleStartIndex).join('');
                        
                        converted = `${integerPart}${nonRepeating.length > 0 ? '.' + nonRepeating : ''}.\\overline{${repeating}}`;
                    }
                }
            } else if (expr.includes('\\overline')) {
                // 如果是循环小数，转换为分数
                converted = expr.replace(/(\d*\.?\d*)?\\overline\{(\d+)\}/g, (_, nonRepeating = '', repeating) => {
                    if (!repeating) {
                        throw new Error('無效的循環小數格式');
                    }
                    const [numerator, denominator] = this.calculateFractionFromRecurring(nonRepeating, repeating);
                    return `\\frac{${numerator}}{${denominator}}`;
                });
            } else if (expr.match(/\d+\.\d+/)) {
                // 如果是普通小数，转换为分数
                converted = expr.replace(/\d+\.\d+/g, (match) => {
                    if (isNaN(parseFloat(match))) {
                        throw new Error('無效的小數格式');
                    }
                    const [numerator, denominator] = this.decimalToFraction(parseFloat(match));
                    return `\\frac{${numerator}}{${denominator}}`;
                });
            } else if (expr.match(/^\s*\d+\s*$/)) {
                // 如果是整数，转换为分数形式
                const num = parseInt(expr.trim());
                converted = `\\frac{${num}}{1}`;
            } else {
                throw new Error('無法識別的表達式格式');
            }

            console.log('Conversion result:', converted); // 添加日志

            // 添加等号部分（如果有）
            return equals ? `${converted}=${equals}` : converted;
        } catch (error) {
            console.error('Conversion error:', error);
            throw error;
        }
    },

    /**
     * 約分分數
     */
    reduceFraction(expression: string): string {
        // 直接使用外部的 reduceFraction 函數
        return reduceFraction(expression);
    },

    /**
     * 質因數分解
     */
    primeFactorize(expression: string): string {
        try {
            // 移除等號及其後面的內容
            const [expr, equals] = expression.split('=');
            
            if (!expr) {
                throw new Error('表達式為空');
            }

            // 清理表達式,只保留數字
            const cleanExpr = expr.trim().replace(/[^\d]/g, '');
            const num = parseInt(cleanExpr);

            if (isNaN(num)) {
                throw new Error('無效的數字格式');
            }

            if (num <= 1) {
                throw new Error('請輸入大於1的整數');
            }

            // 執行質因數分解
            const factors = this._getPrimeFactors(num);
            
            // 格式化結果
            const result = this._formatPrimeFactors(factors);

            console.log('Prime factorization result:', result);

            // 添加等號部分(如果有)
            return equals ? `${result}=${equals}` : result;
        } catch (error) {
            console.error('Prime factorization error:', error);
            throw error;
        }
    },

    /**
     * 獲取質因數列表
     */
    _getPrimeFactors(n: number): number[] {
        const factors: number[] = [];
        let num = n;

        // 處理2的因數
        while (num % 2 === 0) {
            factors.push(2);
            num = num / 2;
        }

        // 處理其他質因數
        for (let i = 3; i <= Math.sqrt(num); i += 2) {
            while (num % i === 0) {
                factors.push(i);
                num = num / i;
            }
        }

        // 如果最後剩餘的數大於2,它本身就是質數
        if (num > 2) {
            factors.push(num);
        }

        return factors;
    },

    /**
     * 格式化質因數分解結果為 LaTeX 格式
     */
    _formatPrimeFactors(factors: number[]): string {
        if (factors.length === 0) return '';

        // 統計每個質因數的次數
        const countMap = new Map<number, number>();
        factors.forEach(factor => {
            countMap.set(factor, (countMap.get(factor) || 0) + 1);
        });

        // 按質因數大小排序
        const sortedFactors = Array.from(countMap.entries()).sort((a, b) => a[0] - b[0]);

        // 構建 LaTeX 格式的結果
        const terms = sortedFactors.map(([factor, count]) => {
            if (count === 1) return factor.toString();
            return `${factor}^{${count}}`;
        });

        return terms.join(' \\times ');
    },

    /**
     * 將指數表達式化簡
     */
    simplifyIndices(latex: string): string {
        try {
            const [expr, equals] = latex.split('=');
            
            if (!expr) {
                throw new Error('表達式為空');
            }

            console.log('Expression before processing:', expr);

            let result = expr;
            let previousResult;

            // 標準化乘號
            result = result.replace(/×/g, '\\times');

            do {
                previousResult = result;
                
                // 1. 首先處理相同底數的乘法
                const sameBasePattern = /\(([^()]+)\)\^{?([^{}]+?)}?\s*\\times\s*\(\1\)\^{?([^{}]+?)}?/g;
                result = result.replace(sameBasePattern, (match, base, exp1, exp2) => {
                    console.log('Processing same base:', { base, exp1, exp2 });
                    
                    // 移除可能的額外大括號
                    exp1 = exp1.replace(/[{}]/g, '');
                    exp2 = exp2.replace(/[{}]/g, '');
                    
                    // 如果兩個指數都是純數字
                    if (!isNaN(exp1) && !isNaN(exp2)) {
                        return `(${base})^{${parseInt(exp1) + parseInt(exp2)}}`;
                    }
                    
                    // 合併指數
                    return `(${base})^{(${exp1})+(${exp2})}`;
                });

                // 2. 如果沒有相同底數的合併，再處理指數的指數
                if (result === previousResult) {
                    const powerOfPowerPattern = /\(([a-zA-Z0-9]+)\^{?([^{}]+?)}?\)\^{?([^{}]+?)}?/g;
                    result = result.replace(powerOfPowerPattern, (match, base, exp1, exp2) => {
                        console.log('Processing power of power:', { base, exp1, exp2 });
                        
                        exp1 = exp1.replace(/[{}]/g, '');
                        exp2 = exp2.replace(/[{}]/g, '');
                        
                        if (!isNaN(exp1) && !isNaN(exp2)) {
                            return `${base}^{${parseInt(exp1) * parseInt(exp2)}}`;
                        }
                        
                        return `${base}^{(${exp1})(${exp2})}`;
                    });
                }

                // 3. 最後才處理分配律
                if (result === previousResult) {
                    const productPowerPattern = /\(([a-zA-Z0-9]+)([a-zA-Z0-9]+)\)\^{?([^{}]+?)}?/g;
                    result = result.replace(productPowerPattern, (match, base1, base2, exp) => {
                        console.log('Processing product power:', { base1, base2, exp });
                        
                        exp = exp.replace(/[{}]/g, '');
                        
                        return `${base1}^{${exp}}${base2}^{${exp}}`;
                    });
                }

            } while (result !== previousResult);

            // ... rest of the code for fraction patterns ...

            console.log('Final result:', result);
            return equals ? `${result}=${equals}` : result;
        } catch (error) {
            console.error('Simplify indices error:', error);
            throw error;
        }
    },

    /**
     * 展開括號
     */
    expand(latex: string): string {
        try {
            // 移除等號及其後面的內容
            const [expr, equals] = latex.split('=');
            
            if (!expr) {
                throw new Error('表達式為空');
            }

            console.log('Expanding expression:', expr);

            // 清理表達式中的空格
            let expression = expr.trim();

            // 處理兩種情況：單項式乘以括號 或 兩個括號相乘
            const bracketPattern = /^(?:(-?\d*[a-zA-Z]*)\(([^()]+)\)|(\(([^()]+)\))?\(?([^()]+)\)?)$/;
            const match = expression.match(bracketPattern);

            if (match) {
                const [, singleTerm, singleBracket, _, firstBracket, secondBracket] = match;
                console.log('Bracket expansion:', { singleTerm, singleBracket, firstBracket, secondBracket });

                if (singleTerm && singleBracket) {
                    // 處理單項式乘以括號的情況
                    return this._expandSingleTermBracket(singleTerm, singleBracket, equals);
                } else if (firstBracket && secondBracket) {
                    // 處理兩個括號相乘的情況
                    // 分割兩個括號內的項
                    const firstTerms = firstBracket.split(/(?=[+-])/).filter(term => term);
                    const secondTerms = secondBracket.split(/(?=[+-])/).filter(term => term);
                    
                    // 展開兩個括號，但不進行實際乘法運算
                    const expandedTerms: string[] = [];
                    
                    firstTerms.forEach(term1 => {
                        // 移除開頭的加號
                        term1 = term1.replace(/^\+/, '');
                        
                        secondTerms.forEach(term2 => {
                            // 移除開頭的加號
                            term2 = term2.replace(/^\+/, '');
                            
                            // 直接組合兩項，用括號表示
                            let resultTerm = `(${term1})(${term2})`;
                            
                            // 如果不是第一項，加上加號
                            if (expandedTerms.length > 0) {
                                resultTerm = '+' + resultTerm;
                            }
                            
                            expandedTerms.push(resultTerm);
                        });
                    });

                    // 組合結果
                    let result = expandedTerms.join('');
                    
                    return equals ? `${result}=${equals}` : result;
                }
            }

            // 如果不符合任何模式，返回原表達式
            return latex;
        } catch (error) {
            console.error('Expansion error:', error);
            throw error;
        }
    },

    /**
     * 處理單項式乘以括號的情況
     */
    _expandSingleTermBracket(outsideTerm: string, insideBracket: string, equals?: string): string {
        // 分割括號內的項
        const terms = insideBracket.split(/(?=[+-])/).filter(term => term);
        
        // 展開括號，但不進行實際乘法運算
        const expandedTerms: string[] = [];
        
        terms.forEach(term => {
            // 移除開頭的加號
            term = term.replace(/^\+/, '');
            
            // 直接組合兩項，用括號表示
            let resultTerm = `(${outsideTerm})(${term})`;
            
            // 如果不是第一項，加上加號
            if (expandedTerms.length > 0) {
                resultTerm = '+' + resultTerm;
            }
            
            expandedTerms.push(resultTerm);
        });

        // 組合結果
        let result = expandedTerms.join('');
        
        // 移除開頭的加號
        result = result.replace(/^\+/, '');

        return equals ? `${result}=${equals}` : result;
    },

    /**
     * 輔助方法：相乘兩個代數項
     */
    _multiplyTerms(term1: string, term2: string): string {
        // 處理係數
        const getCoefficient = (term: string): number => {
            if (term === '' || term === '+') return 1;
            if (term === '-') return -1;
            const match = term.match(/^[+-]?\d*\.?\d*/);
            if (!match || match[0] === '') return 1;
            if (match[0] === '+') return 1;
            if (match[0] === '-') return -1;
            return parseFloat(match[0] || '1');
        };

        // 處理變量部分
        const getVariable = (term: string): string => {
            const match = term.match(/[a-zA-Z].*/);
            return match ? match[0] : '';
        };

        const coef1 = getCoefficient(term1);
        const coef2 = getCoefficient(term2);
        const var1 = getVariable(term1);
        const var2 = getVariable(term2);

        // 計算係數
        const resultCoef = coef1 * coef2;

        // 組合變量，按字母順序排序
        const vars = [var1, var2].filter(v => v).sort();
        let resultVar = '';
        
        // 合併相同變量並處理指數
        const varCount = new Map<string, number>();
        vars.forEach(v => {
            varCount.set(v, (varCount.get(v) || 0) + 1);
        });
        
        // 構建結果變量部分
        varCount.forEach((count, variable) => {
            if (count === 1) {
                resultVar += variable;
            } else {
                resultVar += variable + '²';
            }
        });

        // 格式化結果
        if (resultCoef === 0) return '0';
        if (resultCoef === 1 && resultVar) return resultVar;
        if (resultCoef === -1 && resultVar) return '-' + resultVar;
        if (!resultVar) return resultCoef.toString();
        return resultCoef + resultVar;
    },

    // 新增輔助方法
    _hasOuterOperators(latex: string): boolean {
        let bracketCount = 0;
        for (let i = 0; i < latex.length; i++) {
            if (latex[i] === '(') bracketCount++;
            else if (latex[i] === ')') bracketCount--;
            else if (bracketCount === 0 && (latex[i] === '+' || latex[i] === '-' && i > 0)) {
                return true;
            }
        }
        return false;
    },

    _getOuterOperators(latex: string): string[] {
        const operators: string[] = [];
        let bracketCount = 0;
        for (let i = 0; i < latex.length; i++) {
            if (latex[i] === '(') bracketCount++;
            else if (latex[i] === ')') bracketCount--;
            else if (bracketCount === 0 && (latex[i] === '+' || latex[i] === '-' && i > 0)) {
                operators.push(latex[i]);
            }
        }
        return operators;
    },

    analyzeBrackets(latex: string): BracketInfo {
        const result = this.analyzeBracketLayers(latex);
        return {
            hasBrackets: result.innermostBrackets.length > 0,
            bracketCount: result.innermostBrackets.length,
            needsExpansion: result.innermostBrackets.some(content => /[+\-*\/]/.test(content)),
            bracketTerms: result.innermostBrackets
        };
    },

    /**
     * 計算數字運算
     */
    calculate(expr: string): string {
        try {
            console.log('Input expression:', expr);
            
            // 首先處理括號內的運算
            expr = expr.replace(/\(([^()]+)\)/g, (match, content) => {
                console.log('Processing bracket content:', content);
                // 如果括號內包含分數或運算，遞迴處理
                if (content.includes('\\frac') || content.includes('+') || 
                    content.includes('-') || content.includes('*') || 
                    content.includes('\\times')) {
                    return '(' + this.calculate(content) + ')';
                }
                return match;
            });

            // 處理數字和括號之間的隱含乘法
            expr = expr.replace(/(\d+)\s*\(([^()]+)\)/g, (match, number, bracketContent) => {
                console.log('Found implicit multiplication:', { number, bracketContent });
                
                // 移除括號
                bracketContent = bracketContent.replace(/[()]/g, '');
                
                // 解析數字和括號內的內容
                const num1 = this.parseNumber(number.trim());
                const num2 = this.parseNumber(bracketContent.trim());
                console.log('Parsed implicit numbers:', { num1, num2 });
                
                // 執行乘法運算
                const result = this.performMultiply(num1, num2);
                console.log('Implicit multiplication result:', result);
                
                return this.formatResult(result);
            });

            // 處理其他運算
            expr = this._handleMultiplicationDivision(expr);
            console.log('After multiplication/division:', expr);
            
            // 處理加減運算
            const terms = expr.match(/[+-]?\s*(?:\\frac\{\d+\}\{\d+\}|\d+(?:\/\d+)?|\d+)/g);
            console.log('Matched terms:', terms);
            
            if (!terms || terms.length === 0) {
                throw new Error('無效的運算式');
            }

            let result = this.parseNumber(terms[0]);
            console.log('First term parsed:', result);

            for (let i = 1; i < terms.length; i++) {
                const term = terms[i].trim();
                const isAdd = !term.startsWith('-');
                const number = this.parseNumber(term.replace(/^[+-]\s*/, ''));
                console.log(`Processing term ${i}:`, { term, isAdd, parsed: number });
                result = this.performAddSubtract(result, number, isAdd);
                console.log(`Result after term ${i}:`, result);
            }

            const finalResult = this.formatResult(result);
            console.log('Final formatted result:', finalResult);
            return finalResult;
        } catch (error) {
            console.error('Calculation error:', error);
            throw error;
        }
    },

    _handleMultiplicationDivision(expr: string): string {
        console.log('Handling multiplication/division for:', expr);
        
        // 首先處理數字和括號之間的隱含乘法
        expr = expr.replace(/(\d+)\s*\(([^()]+)\)/g, (match, number, bracketContent) => {
            console.log('Found implicit multiplication:', { number, bracketContent });
            
            // 移除括號
            bracketContent = bracketContent.replace(/[()]/g, '');
            
            // 解析數字和括號內的內容
            const num1 = this.parseNumber(number.trim());
            const num2 = this.parseNumber(bracketContent.trim());
            console.log('Parsed implicit numbers:', { num1, num2 });
            
            // 執行乘法運算
            const result = this.performMultiply(num1, num2);
            console.log('Implicit multiplication result:', result);
            
            return this.formatResult(result);
        });
        
        // 最後處理一般的乘除運算
        const multiDivPattern = /(\\frac\{\d+\}\{\d+\}|\d+(?:\/\d+)?|\d+)\s*(\\times|\\div|\*|\/|×|÷)\s*(\\frac\{\d+\}\{\d+\}|\d+(?:\/\d+)?|\d+)/g;
        
        return expr.replace(multiDivPattern, (match, term1, operator, term2) => {
            console.log('Found multiplication/division match:', { match, term1, operator, term2 });
            
            // 解析兩個數
            const num1 = this.parseNumber(term1.trim());
            const num2 = this.parseNumber(term2.trim());
            console.log('Parsed numbers:', { num1, num2 });
            
            // 執行乘除運算
            const result = (operator === '*' || operator === '×' || operator === '\\times') ? 
                this.performMultiply(num1, num2) : 
                this.performDivide(num1, num2);
            console.log('Operation result:', result);
            
            // 返回格式化結果
            const formattedResult = this.formatResult(result);
            console.log('Formatted result:', formattedResult);
            return formattedResult;  // 確保返回字符串
        });
    },

    parseNumber(str: string): NumberResult {
        console.log('Parsing number:', str);
        
        // 處理負號
        const isNegative = str.startsWith('-');
        str = str.replace(/^-/, '');

        let result: NumberResult = {  // 给一个默认值
            numerator: 0,
            denominator: 1,
            isNegative: false
        };

        // 檢查是否為分數
        if (str.includes('\\frac')) {
            const match = str.match(/\\frac\{(-?\d+)\}\{(-?\d+)\}/);
            if (match) {
                const [_, num, den] = match;
                result = {
                    numerator: Math.abs(parseInt(num)),
                    denominator: parseInt(den),
                    isNegative: isNegative || num.startsWith('-')
                };
            }
        }
        // 檢查是否為普通分數形式 (a/b)
        else if (str.includes('/')) {
            const [num, den] = str.split('/').map(s => parseInt(s.trim()));
            result = {
                numerator: Math.abs(num),
                denominator: den,
                isNegative: isNegative || num < 0
            };
        }
        // 處理整數
        else {
            const num = parseInt(str);
            result = {
                numerator: Math.abs(num),
                denominator: 1,
                isNegative: isNegative || num < 0
            };
        }
        
        console.log('Parse result:', result);
        return result;
    },

    performAddSubtract(a: NumberResult, b: NumberResult, isAdd: boolean): NumberResult {
        // 通分
        const lcm = this._lcm(a.denominator, b.denominator);  // 使用 _lcm
        const aNum = a.numerator * (lcm / a.denominator) * (a.isNegative ? -1 : 1);
        const bNum = b.numerator * (lcm / b.denominator) * (b.isNegative ? -1 : 1);

        // 執行加減運算
        const resultNum = isAdd ? aNum + bNum : aNum - bNum;
        const isNegative = resultNum < 0;

        // 約分結果
        const gcdValue = this._gcd(Math.abs(resultNum), lcm);  // 使用 _gcd
        
        return {
            numerator: Math.abs(resultNum / gcdValue),
            denominator: lcm / gcdValue,
            isNegative: isNegative
        };
    },

    performMultiply(a: NumberResult, b: NumberResult): NumberResult {
        // 乘法：分子相乘，分母相乘
        const numerator = a.numerator * b.numerator;
        const denominator = a.denominator * b.denominator;
        
        // 判断结果的正负
        const isNegative = a.isNegative !== b.isNegative;
        
        // 约分结果
        const gcdValue = this._gcd(numerator, denominator);  // 使用 _gcd
        
        return {
            numerator: Math.abs(numerator / gcdValue),
            denominator: denominator / gcdValue,
            isNegative: isNegative
        };
    },

    performDivide(a: NumberResult, b: NumberResult): NumberResult {
        // 除法：分子乘以除数的分母，分母乘以除数的分子
        const numerator = a.numerator * b.denominator;
        const denominator = a.denominator * b.numerator;
        
        // 判断结果的正负
        const isNegative = a.isNegative !== b.isNegative;
        
        // 约分结果
        const gcdValue = this._gcd(numerator, denominator);  // 使用 _gcd
        
        return {
            numerator: Math.abs(numerator / gcdValue),
            denominator: denominator / gcdValue,
            isNegative: isNegative
        };
    },

    formatResult(result: NumberResult): string {
        if (result.denominator === 1) {
            return `${result.isNegative ? '-' : ''}${result.numerator}`;
        }
        // 使用外部的 reduceFraction 函數來約分分數
        return reduceFraction(
            `${result.isNegative ? '-' : ''}\\frac{${result.numerator}}{${result.denominator}}`
        );
    },

    // 重命名為私有方法
    _gcd(a: number, b: number): number {
        return b === 0 ? a : this._gcd(b, a % b);
    },

    _lcm(a: number, b: number): number {
        return Math.abs(a * b) / this._gcd(a, b);  // 使用 _gcd
    },

    /**
     * 合併同底項
     */
    simplifyOneTerm(latex: string): string {
        try {
            const [expr, equals] = latex.split('=');
            
            if (!expr) {
                throw new Error('表達式為空');
            }

            console.log('Input expression:', expr);

            // 標準化表達式
            const normalizedExpr = this._normalizeExpression(expr);
            console.log('Normalized expression:', normalizedExpr);

            // 分割項並過濾空項
            const terms = normalizedExpr.split(/([*/])/).filter(term => term.trim());
            console.log('Split terms:', terms);

            const baseGroups = new Map<string, {
                multiply: string[],
                divide: string[]
            }>();

            // 收集所有項
            for (let i = 0; i < terms.length; i++) {
                let term = terms[i].trim();
                if (term === '*' || term === '/') continue;
                
                // 判斷是否為除法項
                const isDiv = i > 0 && terms[i-1] === '/';
                
                // 提取基底，移除所有指數部分
                let base = term.replace(/\^{[^}]*}|\^[a-zA-Z0-9]+/g, '');
                
                // 跳過係數為1的項
                if (base === '1') continue;
                
                if (!baseGroups.has(base)) {
                    baseGroups.set(base, {
                        multiply: [],
                        divide: []
                    });
                }

                const group = baseGroups.get(base)!;
                if (isDiv) {
                    group.divide.push(term);
                } else {
                    group.multiply.push(term);
                }
            }

            console.log('Base groups:', Object.fromEntries(baseGroups));

            // 按底數排序並組合結果
            const resultTerms: string[] = [];
            Array.from(baseGroups.entries())
                .sort(([a], [b]) => a.localeCompare(b))
                .forEach(([base, items], baseIndex) => {
                    console.log(`\nProcessing base: ${base}`);
                    console.log('Multiply items before sort:', items.multiply);
                    console.log('Divide items before sort:', items.divide);

                    // 只有当这个组有乘法项时，才考虑添加乘号
                    if (baseIndex > 0 && resultTerms.length > 0 && items.multiply.length > 0) {
                        resultTerms.push('\\times');
                    }

                    // 處理乘法項
                    items.multiply
                        .sort((a, b) => this._compareExponents(a, b))
                        .forEach((term, index) => {
                            if (index > 0) {  // 只在同一组内的非第一项前添加乘号
                                resultTerms.push('\\times');
                            }
                            resultTerms.push(term);
                        });

                    // 處理除法項
                    if (items.divide.length > 0) {
                        items.divide
                            .sort((a, b) => this._compareExponents(a, b))
                            .forEach((term) => {
                                resultTerms.push('\\div');
                                resultTerms.push(term);
                            });
                    }
                });

            console.log('Result terms array:', resultTerms);

            // 組合最終結果
            let result = resultTerms.join(' ');
            if (!result) {
                result = '1';
            }
            
            if (equals) {
                result += '=' + equals;
            }

            console.log('Final result:', result);
            return result;
        } catch (error) {
            console.error('Simplify one term error:', error);
            throw error;
        }
    },

    /**
     * 獲取指數值
     */
    _getExponent(term: string): string | number {
        const match = term.match(/\^{([^}]+)}/);
        if (match) {
            // 如果是數字，轉換為數字類型進行比較
            const exp = match[1];
            const numExp = Number(exp);
            return isNaN(numExp) ? exp : numExp;
        }
        return 1; // 如果沒有指數，默認為1
    },

    /**
     * 比較兩個項的指數
     */
    _compareExponents(term1: string, term2: string): number {
        const exp1 = this._getExponent(term1);
        const exp2 = this._getExponent(term2);
        
        // 如果都是數字，直接比較
        if (typeof exp1 === 'number' && typeof exp2 === 'number') {
            return exp2 - exp1; // 降序排列
        }
        
        // 如果有字母，字母排在數字前面
        if (typeof exp1 === 'string' && typeof exp2 === 'number') return -1;
        if (typeof exp1 === 'number' && typeof exp2 === 'string') return 1;
        
        // 如果都是字母，按字母順序排序
        return String(exp1).localeCompare(String(exp2));
    },

    /**
     * 獲取項的基底（輔助方法）
     */
    _getBase(term: string): string {
        return term.replace(/\^{[^}]*}|\^[a-zA-Z0-9]+/g, '');
    },

    /**
     * 標準化表達式，處理指數和分數的大括號
     */
    _normalizeExpression(expr: string): string {
        return expr
            .replace(/\s+/g, '')  // 移除空格
            // 保留指數的大括號
            .replace(/\^{([^{}]+)}/g, (match) => {
                // 暫時將指數大括號內的內容替換為特殊標記
                return match.replace(/[{}]/g, '§');
            })
            // 處理分數
            .replace(/\\frac{([^{}]+)}{([^{}]+)}/g, (_, num, den) => {
                // 將分數轉換為 a/b 格式，但保留括號內的內容
                return `${num}/${den}`;  // 只移除括號
            })
            // 標準化運算符
            .replace(/\\div/g, '/')   
            .replace(/\\times|\\cdot/g, '*')
            // 恢復指數大括號的內容
            .replace(/\^§([^§]+)§/g, '^{$1}')
            // 合併連續的運算符
            .replace(/\*+/g, '*')     
            .replace(/^\*|\*$/g, ''); // 移除開頭和結尾的乘號
    },

    /**
     * 分析括号层级并返回分析结果
     */
    analyzeBracketLayers(expr: string): { report: string; innermostBrackets: string[] } {
        console.log('\n=== Starting bracket layer analysis ===');
        console.log('Input expression:', expr);
        
        // 清理表达式
        expr = expr.trim()
            .replace(/\s+/g, '')
            .replace(/\[/g, '(')
            .replace(/\]/g, ')');
        console.log('Cleaned expression:', expr);
        
        let maxDepth = 0;
        let currentDepth = 0;
        let layers: { depth: number; content: string; start: number; end: number }[] = [];
        let openBrackets: number[] = [];

        // 扫描找到所有括号层级
        for (let i = 0; i < expr.length; i++) {
            const char = expr[i];
            // 处理左括号 (包括圆括号、方括号和大括号)
            if (char === '(' || char === '（' || char === '[') {
                currentDepth++;
                openBrackets.push(i);
                console.log(`Found opening bracket '${char}' at ${i}, depth: ${currentDepth}`);
                
                if (currentDepth > maxDepth) {
                    maxDepth = currentDepth;
                }
            } 
            // 处理右括号 (包括圆括号、方括号和大括号)
            else if (char === ')' || char === '）' || char === ']') {
                if (openBrackets.length > 0) {
                    const start = openBrackets.pop()!;
                    const content = expr.substring(start + 1, i);
                    layers.push({
                        depth: currentDepth,
                        content: content,
                        start: start,
                        end: i
                    });
                    console.log(`Found bracket pair at depth ${currentDepth}: ${content}`);
                }
                currentDepth--;
            }
        }

        // 按深度排序
        layers.sort((a, b) => b.depth - a.depth);

        // 获取最内层括号的内容
        const innermostBrackets = layers
            .filter(layer => layer.depth === maxDepth)
            .map(layer => layer.content);

        // 生成分析报告
        let report = '括号层级分析:\n';
        let lastDepth = -1;
        
        layers.forEach(layer => {
            if (layer.depth !== lastDepth) {
                report += `\n第 ${layer.depth} 层括号:\n`;
                lastDepth = layer.depth;
            }
            report += `  内容: ${layer.content}\n`;
        });

        console.log(report);
        return {
            report,
            innermostBrackets
        };
    },

    /**
     * 标准化多项式表达式
     */
    normalizePolynomial(latex: string): string {
        try {
            const [expr, equals] = latex.split('=');
            
            if (!expr) {
                throw new Error('表达式为空');
            }

            // 清理表达式
            let processedExpr = this._normalizeExpression(expr);
            
            // 分割各项
            const terms = processedExpr.split(/(?=[+-])/).filter(term => term.trim());
            
            // 按变量和指数排序
            terms.sort((a, b) => {
                // 获取基底
                const baseA = this._getBase(a);
                const baseB = this._getBase(b);
                
                if (baseA === baseB) {
                    // 如果基底相同，按指数降序排列
                    return this._compareExponents(a, b);
                }
                
                // 按基底字母顺序排序
                return baseA.localeCompare(baseB);
            });
            
            // 组合结果
            let result = terms.join('')
                .replace(/\+-/g, '-')  // 修正正负号
                .replace(/^\+/, '');   // 移除开头的加号
            
            // 如果结果为空，返回0
            if (!result) {
                result = '0';
            }
            
            return equals ? `${result}=${equals}` : result;
        } catch (error) {
            console.error('Normalize polynomial error:', error);
            throw error;
        }
    },
};

// 類型定義
export type ExpressionType = 'constant' | 'numerical' | 'monomial' | 'polynomial';

export interface ExpressionInfo {
    type: ExpressionType;
    termCount: number;
    fractionInfo: FractionInfo;
    irrationalInfo: IrrationalInfo;
    variables: VariableInfo;
    likeTerms: LikeTermsInfo;
    bracketInfo: BracketInfo;
}

export interface FractionInfo {
    hasFraction: boolean;
    hasNestedFraction: boolean;
    fractionCount: number;
    nestedLevel: number;
}

export interface IrrationalInfo {
    hasIrrational: boolean;
    types: {
        hasSquareRoot: boolean;
        hasPi: boolean;
        hasE: boolean;
    };
    count: number;
}

export interface VariableInfo {
    hasVariables: boolean;
    count: number;
    list: string[];
}

export interface LikeTermsInfo {
    hasLikeTerms: boolean;
    groups: LikeTermGroup[];
}

export interface LikeTermGroup {
    variable: string;
    terms: string[];
    count: number;
}

export interface BracketInfo {
    hasBrackets: boolean;
    bracketCount: number;
    needsExpansion: boolean;
    bracketTerms: string[];
}

/**
 * 數學運算操作定義
 */
export const MathOperations = {
    COMBINE_LIKE_TERMS: 'combine',
    SIMPLIFY: 'simplify',
    REDUCE_FRACTION: 'reduce',
    COMMON_DENOMINATOR: 'common-denominator',
    EXPAND: 'expand',
    FACTORIZE: 'factorize',
    DECIMAL_FRACTION_CONVERSION: 'decimal-fraction',
    PRIME_FACTORIZE: 'prime-factorize',
    CALCULATE: 'calculate',
    NUMBER_CALCULATE: 'number-calculate'
} as const;

export interface OperationButton {
    id: string;
    label: string;
    description: string;
    operation: keyof typeof MathOperations;
    isAvailable: (latex: string) => boolean;
}

/**
 * 運算按鈕配置
 */
export const OPERATION_BUTTONS: OperationButton[] = [
    {
        id: 'combine',
        label: '合併同類項',
        description: '合併表達式中的同類項',
        operation: 'COMBINE_LIKE_TERMS',
        isAvailable: (latex: string) => ExpressionAnalyzer.getExpressionType(latex) === 'polynomial'
    },
    {
        id: 'simplify',
        label: '化簡',
        description: '化簡表達式',
        operation: 'SIMPLIFY',
        isAvailable: () => true
    },
    {
        id: 'reduce',
        label: '約分',
        description: '約分分數',
        operation: 'REDUCE_FRACTION',
        isAvailable: (latex: string) => ExpressionAnalyzer.analyzeFraction(latex).hasFraction
    },
    {
        id: 'common-denominator',
        label: '通分',
        description: '將分數轉換為同分母',
        operation: 'COMMON_DENOMINATOR',
        isAvailable: (latex: string) => ExpressionAnalyzer.analyzeFraction(latex).hasFraction
    },
    {
        id: 'expand',
        label: '展開',
        description: '展開括號',
        operation: 'EXPAND',
        isAvailable: (latex: string) => latex.includes('(') || latex.includes('\\left(')
    },
    {
        id: 'factorize',
        label: '因式分解',
        description: '將表達式分解為因式',
        operation: 'FACTORIZE',
        isAvailable: (latex: string) => ExpressionAnalyzer.getExpressionType(latex) === 'polynomial'
    },
    {
        id: 'decimal-fraction',
        label: '小數分數轉換',
        description: '在小數和分數之間轉換',
        operation: 'DECIMAL_FRACTION_CONVERSION',
        isAvailable: (latex: string) => {
            return latex.includes('.') || latex.includes('\\frac');
        }
    },
    {
        id: 'prime-factorize',
        label: '質因數分解',
        description: '將數字分解為質因數的乘積',
        operation: 'PRIME_FACTORIZE',
        isAvailable: (latex: string) => {
            const num = parseInt(latex.replace(/[^\d]/g, ''));
            return !isNaN(num) && num > 1;
        }
    },
    {
        id: 'calculate',
        label: '計算',
        description: '計算括號內的數字運算',
        operation: 'CALCULATE',
        isAvailable: (latex: string) => {
            return /\([0-9+\-*/\s]+\)/.test(latex);
        }
    },
    {
        id: 'number-calculate',
        label: '數字運算',
        description: '計算數字和分數的加減',
        operation: 'NUMBER_CALCULATE',
        isAvailable: (latex: string) => {
            return /(\d+|\\frac\{\d+\}\{\d+\}|\/)\s*[+\-]\s*(\d+|\\frac\{\d+\}\{\d+\}|\/)/.test(latex);
        }
    },
];

/**
 * 四捨五入到指定小數位
 * @param num 要舍入的数字
 * @param decimals 小数位数
 */
export function roundTo(num: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
}

/**
 * 向上舍入到指定小數位
 * @param num 要舍入的数字
 * @param decimals 小数位数
 */
export function roundUp(num: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.ceil(num * factor) / factor;
}

/**
 * 向下舍入到指定小數位
 * @param num 要舍入的数字
 * @param decimals 小数位数
 */
export function roundDown(num: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.floor(num * factor) / factor;
}

/**
 * 因子组合接口
 */
export interface FactorCombination {
    factors: number[];      // 所有因子的数组
}

/**
 * 获取一个数的所有质因数（包括重复的）
 * @param n 要分解的数
 * @returns 所有质因数数组
 */
function getAllPrimeFactors(n: number): number[] {
    const factors: number[] = [];
    let num = n;
    
    // 处理2的因数
    while (num % 2 === 0) {
        factors.push(2);
        num = num / 2;
    }
    
    // 处理其他质因数
    for (let i = 3; i <= Math.sqrt(num); i += 2) {
        while (num % i === 0) {
            factors.push(i);
            num = num / i;
        }
    }
    
    // 如果最后剩余的数大于2，它本身就是质数
    if (num > 2) {
        factors.push(num);
    }
    
    return factors;
}

export interface FactorCombinationOptions {
    minFactor?: number;      // 最小因子
    maxFactor?: number;      // 最大因子
    maxQuotient?: number;    // 最大商
    maxFactors?: number;     // 最多因子数量
}

export function generateFactorCombinations(
    number: number, 
    options: FactorCombinationOptions = {}
): FactorCombination[] {
    const {
        minFactor = 2,
        maxFactor = 9,
        maxQuotient = 9,
        maxFactors = 3
    } = options;

    // 获取所有质因数（包括重复的）
    const allPrimeFactors = getAllPrimeFactors(number);
    
    // 调整maxFactors为实际可能的最大因子数量
    const actualMaxFactors = Math.min(maxFactors, allPrimeFactors.length);

    const combinations: FactorCombination[] = [];
    
    // 递归函数来生成因子组合
    function generateCombinations(
        remainingNumber: number,
        currentFactors: number[],
        remainingFactors: number
    ) {
        // 如果已经达到目标因子数量
        if (remainingFactors === 1) {
            if (remainingNumber >= minFactor && remainingNumber <= maxFactor) {
                combinations.push({
                    factors: [...currentFactors, remainingNumber]
                });
            }
            return;
        }

        // 尝试不同的因子
        for (let f = minFactor; f <= Math.min(maxFactor, remainingNumber); f++) {
            if (remainingNumber % f === 0) {
                const nextNumber = remainingNumber / f;
                // 确保剩余的数不会超过maxQuotient
                if (nextNumber <= maxQuotient || remainingFactors === 2) {
                    generateCombinations(
                        nextNumber,
                        [...currentFactors, f],
                        remainingFactors - 1
                    );
                }
            }
        }
    }

    // 从2个因子开始尝试到actualMaxFactors个因子
    for (let numFactors = 2; numFactors <= actualMaxFactors; numFactors++) {
        generateCombinations(number, [], numFactors);
    }

    return combinations;
}

/**
 * 數字運算結果
 */
interface NumberResult {
    numerator: number;    // 分子
    denominator: number;  // 分母
    isNegative: boolean;  // 是否為負數
}

export class NumberCalculator {
    static calculate(expression: string): string {
        try {
            // 预处理表达式
            let processedExpr = expression
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/(\d+)\s+(\d+)\/(\d+)/g, '($1+$2/$3)')
                .replace(/\s+/g, '');

            // 使用 math.js 计算结果
            const result = math.evaluate(processedExpr);

            // 如果结果是分数
            if (math.typeOf(result) === 'Fraction') {
                const fraction = result as Fraction;
                const n = Number(fraction.n);
                const d = Number(fraction.d);

                // 如果分子大于分母，转换为带分数
                if (Math.abs(n) >= Math.abs(d)) {
                    const whole = Math.floor(Math.abs(n) / Math.abs(d));
                    const remainder = Math.abs(n) % Math.abs(d);
                    if (remainder === 0) {
                        return (n < 0 ? '-' : '') + whole.toString();
                    }
                    return `${(n < 0 ? '-' : '')}${whole} ${remainder}/${Math.abs(d)}`;
                }
                return `${n}/${d}`;
            }

            // 如果结果是数字
            if (typeof result === 'number') {
                if (Number.isInteger(result)) {
                    return result.toString();
                }
                const fraction = math.fraction(result) as Fraction;
                return `${Number(fraction.n)}/${Number(fraction.d)}`;
            }

            throw new Error('Unsupported result type');
        } catch (error) {
            console.error('Calculation error:', error);
            throw error;
        }
    }

    static simplifyFraction(numerator: number, denominator: number): { numerator: number; denominator: number } {
        try {
            const fraction = math.fraction(numerator, denominator) as Fraction;
            return {
                numerator: Number(fraction.n),
                denominator: Number(fraction.d)
            };
        } catch (error) {
            console.error('Fraction simplification error:', error);
            throw error;
        }
    }

    static addFractions(n1: number, d1: number, n2: number, d2: number): { numerator: number; denominator: number } {
        try {
            const f1 = math.fraction(n1, d1) as Fraction;
            const f2 = math.fraction(n2, d2) as Fraction;
            const result = math.add(f1, f2) as Fraction;
            return {
                numerator: Number(result.n),
                denominator: Number(result.d)
            };
        } catch (error) {
            console.error('Fraction addition error:', error);
            throw error;
        }
    }

    static multiplyFractions(n1: number, d1: number, n2: number, d2: number): { numerator: number; denominator: number } {
        try {
            const f1 = math.fraction(n1, d1) as Fraction;
            const f2 = math.fraction(n2, d2) as Fraction;
            const result = math.multiply(f1, f2) as Fraction;
            return {
                numerator: Number(result.n),
                denominator: Number(result.d)
            };
        } catch (error) {
            console.error('Fraction multiplication error:', error);
            throw error;
        }
    }
}

export function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

/**
 * 代數運算工具
 */
export const AlgebraUtils = {
    /**
     * 展開代數式
     */
    expand(expression: string): string {
        try {
            return algebrite.expand(expression).toString();
        } catch (error) {
            console.error('Expansion error:', error);
            throw error;
        }
    },

    /**
     * 因式分解
     */
    factor(expression: string): string {
        try {
            return algebrite.factor(expression).toString();
        } catch (error) {
            console.error('Factorization error:', error);
            throw error;
        }
    },

    /**
     * 解方程
     */
    solveEquation(equation: string, variable: string = 'x'): string[] {
        try {
            return nerdamer.solve(equation, variable).toString().split(',');
        } catch (error) {
            console.error('Equation solving error:', error);
            throw error;
        }
    }
};