interface MultiplicationOperation {
    type: 'multiplication';
    expression: string;
    difficulty: number;
}

interface DifficultyInfo {
    level: number;
    name: string;
    description: string;
}

export class MultiplicationGenerator {
    private difficulty: number;
    private static readonly difficultyInfos: DifficultyInfo[] = [
        {
            level: 1,
            name: "基礎",
            description: "單項式與括號的乘法"
        },
        {
            level: 2,
            name: "初級",
            description: "二次項與括號的乘法"
        },
        {
            level: 3,
            name: "中級",
            description: "雙括號乘法"
        },
        {
            level: 4,
            name: "進階",
            description: "複雜係數的展開"
        },
        {
            level: 5,
            name: "挑戰",
            description: "高次項與多項式的乘法"
        }
    ];

    constructor(difficulty: number) {
        this.difficulty = difficulty;
    }

    static getDifficultyInfos(): DifficultyInfo[] {
        return this.difficultyInfos;
    }

    generate(): MultiplicationOperation {
        const expression = this.generateExpression();
        return {
            type: 'multiplication',
            expression,
            difficulty: this.difficulty
        };
    }

    private generateExpression(): string {
        switch (this.difficulty) {
            case 1: // 單項式與括號的乘法
                return this.generateLevel1();
            case 2: // 二次項與括號的乘法
                return this.generateLevel2();
            case 3: // 雙括號乘法
                return this.generateLevel3();
            case 4: // 複雜係數的展開
                return this.generateLevel4();
            case 5: // 高次項與多項式的乘法
                return this.generateLevel5();
            default:
                return "x(x+1)";
        }
    }

    private generateLevel1(): string {
        const coefficient = Math.random() < 0.5 ? "-" : "";
        const constant = Math.floor(Math.random() * 20) - 10;
        return `${coefficient}x(x${constant >= 0 ? '+' : ''}${constant})`;
    }

    private generateLevel2(): string {
        const coefficient = Math.floor(Math.random() * 5) + 1;
        const constant = Math.floor(Math.random() * 10) - 5;
        return `${coefficient}x(${Math.floor(Math.random() * 5) + 1}${constant >= 0 ? '+' : ''}${constant}x)`;
    }

    private generateLevel3(): string {
        const variables = ['x', 'y'];
        const var1 = variables[Math.floor(Math.random() * 2)];
        const var2 = variables[Math.floor(Math.random() * 2)];
        const coef1 = Math.floor(Math.random() * 7) - 3;
        const coef2 = Math.floor(Math.random() * 7) - 3;
        return `(${var1}${coef1 >= 0 ? '+' : ''}${coef1}${var2})(${coef2}${var2})`;
    }

    private generateLevel4(): string {
        const coefficient = Math.floor(Math.random() * 9) + 1;
        const x2Coef = Math.floor(Math.random() * 5) + 1;
        const xCoef = Math.floor(Math.random() * 10) - 5;
        const constant = Math.floor(Math.random() * 20) - 10;
        return `${coefficient}x(${x2Coef}x²${xCoef >= 0 ? '+' : ''}${xCoef}x${constant >= 0 ? '+' : ''}${constant})`;
    }

    private generateLevel5(): string {
        // 第一個括號的係數
        const x2Coef = Math.floor(Math.random() * 9) + 1;
        const xCoef = Math.floor(Math.random() * 10) - 5;
        const constant = Math.floor(Math.random() * 10) - 5;
        
        // 第二個括號的係數 (確保至少有兩項)
        const x2Coef2 = Math.floor(Math.random() * 7) + 1;
        const xCoef2 = Math.floor(Math.random() * 10) - 5;
        const constant2 = Math.floor(Math.random() * 10) - 5;
        
        // 構建第一個括號
        const firstBracket = `(${x2Coef}x²${xCoef >= 0 ? '+' : ''}${xCoef}x${constant >= 0 ? '+' : ''}${constant})`;
        
        // 構建第二個括號 (確保至少有兩項)
        let secondBracket = `(${x2Coef2}x²${xCoef2 >= 0 ? '+' : ''}${xCoef2}x`;
        if (Math.random() < 0.7) { // 70% 的機率加入常數項
            secondBracket += `${constant2 >= 0 ? '+' : ''}${constant2}`;
        }
        secondBracket += ')';
        
        return `${firstBracket}${secondBracket}`;
    }
} 