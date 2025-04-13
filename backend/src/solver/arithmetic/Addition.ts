interface ArithmeticOperation {
    type: 'addition';
    operands: number[];
    difficulty: number;
}

interface DifficultyInfo {
    level: number;
    name: string;
    description: string;
}

export class AdditionGenerator {
    private difficulty: number;
    private static readonly difficultyInfos: DifficultyInfo[] = [
        {
            level: 1,
            name: "基礎",
            description: "個位數加法 (1-9)"
        },
        {
            level: 2,
            name: "初級",
            description: "雙位數加法 (10-99)"
        },
        {
            level: 3,
            name: "中級",
            description: "小數加法 (0.1-99.9)"
        },
        {
            level: 4,
            name: "進階",
            description: "分數加法"
        },
        {
            level: 5,
            name: "挑戰",
            description: "混合計算（分數與小數）"
        }
    ];

    constructor(difficulty: number) {
        this.difficulty = difficulty;
    }

    static getDifficultyInfos(): DifficultyInfo[] {
        return this.difficultyInfos;
    }

    generate(): ArithmeticOperation {
        const numbers = this.generateNumbers();
        return {
            type: 'addition',
            operands: numbers,
            difficulty: this.difficulty
        };
    }

    private generateNumbers(): number[] {
        switch (this.difficulty) {
            case 1: // 個位數加法 (1-9)
                return [
                    Math.floor(Math.random() * 9) + 1,
                    Math.floor(Math.random() * 9) + 1
                ];
            
            case 2: // 雙位數加法 (10-99)
                return [
                    Math.floor(Math.random() * 90) + 10,
                    Math.floor(Math.random() * 90) + 10
                ];
            
            case 3: // 小數加法 (0.1-99.9)
                return [
                    Number((Math.random() * 99.9).toFixed(1)),
                    Number((Math.random() * 99.9).toFixed(1))
                ];
            
            case 4: // 分數加法
                return [
                    this.generateFraction(),
                    this.generateFraction()
                ];
            
            case 5: // 混合計算（分數與小數）
                return [
                    Math.random() > 0.5 ? this.generateFraction() : Number((Math.random() * 99.9).toFixed(1)),
                    Math.random() > 0.5 ? this.generateFraction() : Number((Math.random() * 99.9).toFixed(1))
                ];
            
            default:
                return [1, 1];
        }
    }

    private generateFraction(): number {
        const numerator = Math.floor(Math.random() * 9) + 1;
        const denominator = Math.floor(Math.random() * 9) + 1;
        return numerator / denominator;
    }
} 