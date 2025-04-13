export class FractionUtils {
    /**
     * 约简分数
     * @param numerator 分子
     * @param denominator 分母
     * @returns [约简后的分子, 约简后的分母]
     */
    static simplify(numerator: number, denominator: number): [number, number] {
        // 处理负数
        const sign = (numerator < 0) !== (denominator < 0) ? -1 : 1;
        numerator = Math.abs(numerator);
        denominator = Math.abs(denominator);

        // 计算最大公因数
        const gcd = this.findGCD(numerator, denominator);
        
        // 分子分母都除以最大公因数
        return [
            sign * (numerator / gcd), 
            denominator / gcd
        ];
    }

    /**
     * 计算最大公因数（使用辗转相除法）
     */
    static findGCD(a: number, b: number): number {
        // 确保输入为正整数
        a = Math.abs(Math.round(a));
        b = Math.abs(Math.round(b));
        
        // 辗转相除法
        while (b !== 0) {
            const temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    }

    /**
     * 分数乘法
     */
    static multiply(
        [num1, den1]: [number, number], 
        [num2, den2]: [number, number]
    ): [number, number] {
        // 先乘后约分，避免中间结果过大
        const numerator = num1 * num2;
        const denominator = den1 * den2;
        return this.simplify(numerator, denominator);
    }

    /**
     * 分数除法
     */
    static divide(
        [num1, den1]: [number, number], 
        [num2, den2]: [number, number]
    ): [number, number] {
        // 除法转换为乘法：a/b ÷ c/d = (a*d)/(b*c)
        const numerator = num1 * den2;
        const denominator = den1 * num2;
        return this.simplify(numerator, denominator);
    }

    /**
     * 将分数转换为 LaTeX 格式
     */
    static toLatex(numerator: number, denominator: number): string {
        if (denominator === 1) return numerator.toString();
        return `\\frac{${numerator}}{${denominator}}`;
    }
} 