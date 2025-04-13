interface IndicesOperation {
    type: 'indices';
    operation: 'multiply' | 'divide' | 'basic';
    base: number;
    firstExp: number;
    secondExp: number;
    difficulty: number;
}

interface DifficultyInfo {
    level: number;
    name: string;
    description: string;
}

export class IndicesGenerator {
    private difficulty: number;
    private static readonly difficultyInfos: DifficultyInfo[] = [
        {
            level: 1,
            name: "基礎",
            description: "正整數指數 (2-5的1-3次方)"
        },
        {
            level: 2,
            name: "初級",
            description: "零指數和負整數指數"
        },
        {
            level: 3,
            name: "中級",
            description: "分數指數"
        },
        {
            level: 4,
            name: "進階",
            description: "代數指數運算"
        },
        {
            level: 5,
            name: "挑戰",
            description: "複合指數運算"
        }
    ];

    constructor(difficulty: number) {
        this.difficulty = difficulty;
    }

    static getDifficultyInfos(): DifficultyInfo[] {
        return this.difficultyInfos;
    }

    generate(): IndicesOperation {
        switch (this.difficulty) {
            case 1: // 基礎：正整數指數
                const bases = [2, 3, 4, 5];
                const base = bases[Math.floor(Math.random() * bases.length)];
                
                // 隨機選擇運算類型
                const operations: ('multiply' | 'divide' | 'basic')[] = ['multiply', 'divide', 'basic'];
                const operation = operations[Math.floor(Math.random() * operations.length)];
                
                // 生成指數
                const firstExp = Math.floor(Math.random() * 3) + 2;  // 2-4
                const secondExp = Math.floor(Math.random() * 3) + 1; // 1-3
                
                return {
                    type: 'indices',
                    operation,
                    base,
                    firstExp,
                    secondExp,
                    difficulty: this.difficulty
                };
            
            case 2: // 初級：零指數和負整數指數
                return {
                    type: 'indices',
                    operation: 'basic',
                    base: Math.floor(Math.random() * 4) + 2, // 2-5
                    firstExp: Math.floor(Math.random() * 5) - 3, // -3到1
                    secondExp: 0,
                    difficulty: this.difficulty
                };
            
            case 3: // 中級：分數指數
                const denominators = [2, 3, 4];
                return {
                    type: 'indices',
                    operation: 'basic',
                    base: Math.floor(Math.random() * 4) + 2, // 2-5
                    firstExp: 1,
                    secondExp: 1 / denominators[Math.floor(Math.random() * denominators.length)],
                    difficulty: this.difficulty
                };
            
            case 4: // 進階：代數指數運算
                return {
                    type: 'indices',
                    operation: 'basic',
                    base: Math.floor(Math.random() * 4) + 2,
                    firstExp: Math.floor(Math.random() * 3) + 2,
                    secondExp: Math.floor(Math.random() * 3) + 2,
                    difficulty: this.difficulty
                };
            
            case 5: // 挑戰：複合指數運算
                return {
                    type: 'indices',
                    operation: 'basic',
                    base: Math.floor(Math.random() * 4) + 2,
                    firstExp: Math.floor(Math.random() * 4) - 2,
                    secondExp: Math.floor(Math.random() * 4) - 2,
                    difficulty: this.difficulty
                };
            
            default:
                return {
                    type: 'indices',
                    operation: 'basic',
                    base: 2,
                    firstExp: 1,
                    secondExp: 1,
                    difficulty: this.difficulty
                };
        }
    }

    getLatexQuestion(operation: IndicesOperation): string {
        const { base, firstExp, secondExp, difficulty, operation: op } = operation;
        
        switch (difficulty) {
            case 1:
                switch (op) {
                    case 'multiply':
                        // 例如：2³ · 2⁴ = ?
                        return `${base}^{${firstExp}}\\cdot ${base}^{${secondExp}} = ?`;
                    case 'divide':
                        // 例如：3² ÷ 3³ = ?
                        return `${base}^{${firstExp}}\\div ${base}^{${secondExp}} = ?`;
                    case 'basic':
                        // 例如：2³ = ?
                        return `${base}^{${firstExp}} = ?`;
                }
                break;
            
            case 2:
                return `${base}^{${firstExp}} = ?`;
            
            case 3:
                // 处理分数指数
                const fraction = this.formatFraction(secondExp);
                return `${base}^{${firstExp}} = ?`;
            
            case 4:
                // 代数指数运算
                return `(${base}^{x})^{${firstExp}} = ?`;
            
            case 5:
                // 复合指数运算
                const op2 = Math.random() > 0.5 ? '+' : '-';
                const secondExp2 = Math.floor(Math.random() * 3) + 1;
                return `${base}^{${firstExp}} ${op2} ${base}^{${secondExp2}} = ?`;
            
            default:
                return `${base}^{${firstExp}} = ?`;
        }
    }

    private formatFraction(decimal: number): string {
        if (decimal === 1/2) return '\\frac{1}{2}';
        if (decimal === 1/3) return '\\frac{1}{3}';
        if (decimal === 1/4) return '\\frac{1}{4}';
        return decimal.toString();
    }

    /**
     * 獲取預期答案（用於驗證）
     */
    getExpectedAnswer(operation: IndicesOperation): string {
        const { base, firstExp, secondExp, operation: op } = operation;
        
        switch (op) {
            case 'multiply':
                // a^m · a^n = a^(m+n)
                return `${base}^{${firstExp + secondExp}} = ${Math.pow(base, firstExp + secondExp)}`;
            case 'divide':
                // a^m ÷ a^n = a^(m-n)
                const resultExp = firstExp - secondExp;
                if (resultExp === 0) return '1';
                if (resultExp < 0) return `\\frac{1}{${base}^{${-resultExp}}}`;
                return `${base}^{${resultExp}}`;
            case 'basic':
                // a^n
                return `${Math.pow(base, firstExp)}`;
            default:
                return '';
        }
    }
} 