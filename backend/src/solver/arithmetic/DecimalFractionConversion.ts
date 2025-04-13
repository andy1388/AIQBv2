import { getRandomInt, getNonZeroRandomInt } from '../../utils/mathUtils';

export class DecimalFractionConversionGenerator {
    private difficulty: number;

    constructor(difficulty: number) {
        this.difficulty = difficulty;
    }

    generate() {
        switch (this.difficulty) {
            case 1: // 简单小数 (一位小数)
                return this.generateSimpleDecimal();
            case 2: // 两位小数
                return this.generateTwoDecimalPlaces();
            case 3: // 假分数
                return this.generateImproperFraction();
            case 4: // 带分数
                return this.generateMixedNumber();
            case 5: // 循环小数
                return this.generateRecurringDecimal();
            default:
                return this.generateSimpleDecimal();
        }
    }

    private generateSimpleDecimal() {
        const numerator = getRandomInt(1, 9);
        const denominator = 10;
        return {
            value: `${numerator/denominator}`,
            answer: `\\frac{${numerator}}{${denominator}}`
        };
    }

    private generateTwoDecimalPlaces() {
        const numerator = getRandomInt(1, 99);
        const denominator = 100;
        return {
            value: `${(numerator/denominator).toFixed(2)}`,
            answer: `\\frac{${numerator}}{${denominator}}`
        };
    }

    private generateImproperFraction() {
        const denominator = getNonZeroRandomInt(2, 12);
        const numerator = getRandomInt(denominator + 1, denominator * 2);
        const decimal = (numerator / denominator).toFixed(5);
        return {
            value: `\\frac{${numerator}}{${denominator}}`,
            answer: decimal
        };
    }

    private generateMixedNumber() {
        const denominator = getNonZeroRandomInt(2, 12);
        const properNumerator = getRandomInt(1, denominator - 1);
        const wholeNumber = getRandomInt(1, 5);
        const totalNumerator = wholeNumber * denominator + properNumerator;
        
        return {
            value: `${wholeNumber}\\frac{${properNumerator}}{${denominator}}`,
            answer: (totalNumerator / denominator).toFixed(5)
        };
    }

    private generateRecurringDecimal() {
        // 使用能产生简单循环小数的分母
        const denominators = [3, 9, 11];  // 使用简单的分母以产生容易识别的循环小数
        const denominator = denominators[Math.floor(Math.random() * denominators.length)];
        const numerator = getNonZeroRandomInt(1, denominator - 1);
        
        // 计算循环小数
        const decimal = this.calculateRecurringDecimal(numerator, denominator);
        
        return {
            value: decimal,  // 直接返回循环小数形式
            answer: `\\frac{${numerator}}{${denominator}}`  // 答案是分数形式
        };
    }

    private calculateRecurringDecimal(numerator: number, denominator: number): string {
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
            // 如果是有限小数（不应该发生，因为我们选择的分母会产生循环小数）
            return quotient + (decimals.length > 0 ? '.' + decimals.join('') : '');
        } else {
            // 循环小数
            const cycleStartIndex = remainders.indexOf(dividend);
            const nonRepeating = decimals.slice(0, cycleStartIndex).join('');
            const repeating = decimals.slice(cycleStartIndex).join('');
            
            // 使用 \overline 来表示循环部分
            return `${quotient}${nonRepeating.length > 0 ? '.' + nonRepeating : ''}.\\overline{${repeating}}`;
        }
    }

    static getDifficultyInfos() {
        return [
            {
                level: 1,
                name: '基礎',
                description: '一位小數 (0.1 ~ 0.9)'
            },
            {
                level: 2,
                name: '進階',
                description: '兩位小數 (0.01 ~ 0.99)'
            },
            {
                level: 3,
                name: '假分數',
                description: '分子大於分母的分數'
            },
            {
                level: 4,
                name: '帶分數',
                description: '整數加真分數'
            },
            {
                level: 5,
                name: '循環小數',
                description: '循環小數與分數轉換'
            }
        ];
    }
} 