interface FractionOperation {
    type: 'fraction-reduction';
    numerator: number;
    denominator: number;
    difficulty: number;
}

interface DifficultyInfo {
    level: number;
    name: string;
    description: string;
}

export class FractionReductionGenerator {
    private difficulty: number;
    private static readonly difficultyInfos: DifficultyInfo[] = [
        {
            level: 1,
            name: "基礎",
            description: "簡單分數約簡 (2-10)"
        },
        {
            level: 2,
            name: "初級",
            description: "中等分數約簡 (11-50)"
        },
        {
            level: 3,
            name: "進階",
            description: "較大分數約簡 (51-100)"
        }
    ];

    constructor(difficulty: number) {
        this.difficulty = difficulty;
    }

    static getDifficultyInfos(): DifficultyInfo[] {
        return this.difficultyInfos;
    }

    generate(): FractionOperation {
        const { numerator, denominator } = this.generateFraction();
        return {
            type: 'fraction-reduction',
            numerator,
            denominator,
            difficulty: this.difficulty
        };
    }

    private generateFraction(): { numerator: number; denominator: number } {
        let range: number;
        switch (this.difficulty) {
            case 1:
                range = 10;
                break;
            case 2:
                range = 50;
                break;
            case 3:
                range = 100;
                break;
            default:
                range = 10;
        }

        let denominator = Math.floor(Math.random() * (range - 1)) + 2;
        let numerator = Math.floor(Math.random() * (range - 1)) + 1;

        const factor = Math.floor(Math.random() * 3) + 2;
        numerator *= factor;
        denominator *= factor;

        return { numerator, denominator };
    }

    static formatToLatex(numerator: number, denominator: number): string {
        return `\\frac{${numerator}}{${denominator}}`;
    }

    getLatexQuestion(operation: FractionOperation): string {
        return FractionReductionGenerator.formatToLatex(operation.numerator, operation.denominator);
    }
} 