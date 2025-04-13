interface NumberTheoryOperation {
    type: 'gcd' | 'lcm' | 'prime-factorization';
    numbers: number[];
    difficulty: number;
}

interface DifficultyInfo {
    level: number;
    name: string;
    description: string;
}

export class NumberTheoryGenerator {
    private difficulty: number;
    private type: 'gcd' | 'lcm' | 'prime-factorization';
    
    private static readonly difficultyInfos: Record<string, DifficultyInfo[]> = {
        gcd: [
            {
                level: 1,
                name: "基礎",
                description: "兩個數的最大公因數 (1-20)"
            },
            {
                level: 2,
                name: "初級",
                description: "三個數的最大公因數 (1-50)"
            },
            {
                level: 3,
                name: "進階",
                description: "較大數的最大公因數 (1-100)"
            }
        ],
        lcm: [
            {
                level: 1,
                name: "基礎",
                description: "兩個數的最小公倍數 (1-10)"
            },
            {
                level: 2,
                name: "初級",
                description: "三個數的最小公倍數 (1-20)"
            },
            {
                level: 3,
                name: "進階",
                description: "較大數的最小公倍數 (1-50)"
            }
        ],
        'prime-factorization': [
            {
                level: 1,
                name: "基礎",
                description: "質因數分解 (1-50)"
            },
            {
                level: 2,
                name: "初級",
                description: "質因數分解 (1-100)"
            },
            {
                level: 3,
                name: "進階",
                description: "質因數分解 (1-200)"
            }
        ]
    };

    constructor(type: 'gcd' | 'lcm' | 'prime-factorization', difficulty: number) {
        this.type = type;
        this.difficulty = difficulty;
    }

    static getDifficultyInfos(type: string): DifficultyInfo[] {
        return this.difficultyInfos[type] || [];
    }

    generate(): NumberTheoryOperation {
        return {
            type: this.type,
            numbers: this.generateNumbers(),
            difficulty: this.difficulty
        };
    }

    private generateNumbers(): number[] {
        let range: number;
        let count: number;

        switch (this.difficulty) {
            case 1:
                range = this.type === 'gcd' ? 20 : this.type === 'lcm' ? 10 : 50;
                count = 2;
                break;
            case 2:
                range = this.type === 'gcd' ? 50 : this.type === 'lcm' ? 20 : 100;
                count = 3;
                break;
            case 3:
                range = this.type === 'gcd' ? 100 : this.type === 'lcm' ? 50 : 200;
                count = this.type === 'prime-factorization' ? 1 : 3;
                break;
            default:
                range = 20;
                count = 2;
        }

        if (this.type === 'prime-factorization') {
            return [this.generateComposite(range)];
        }

        return Array.from({ length: count }, () => 
            Math.floor(Math.random() * range) + 1
        );
    }

    private generateComposite(max: number): number {
        // 生成一个合数
        let num;
        do {
            num = Math.floor(Math.random() * max) + 4; // 从4开始确保是合数
        } while (this.isPrime(num));
        return num;
    }

    private isPrime(n: number): boolean {
        if (n < 2) return false;
        for (let i = 2; i <= Math.sqrt(n); i++) {
            if (n % i === 0) return false;
        }
        return true;
    }
} 