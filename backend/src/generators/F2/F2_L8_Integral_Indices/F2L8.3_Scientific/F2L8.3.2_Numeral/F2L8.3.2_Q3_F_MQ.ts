import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import { getRandomInt } from '@/utils/mathUtils';

type Difficulty = 1 | 2 | 3 | 4;

export default class F2L8_3_2_Q2_F_MQ extends QuestionGenerator {
    constructor(difficulty: number) {
        super(difficulty, 'F2L8.3.2_Q2_F_MQ');
    }

    private generateBinaryNumber(difficulty: Difficulty): string {
        let result = "1"; // 確保開頭是1
        
        switch(difficulty) {
            case 1: // 3-4位
                const length1 = getRandomInt(2, 3);
                for (let i = 0; i < length1; i++) {
                    result += Math.random() < 0.5 ? "0" : "1";
                }
                break;
            case 2: // 5-6位
                const length2 = getRandomInt(4, 5);
                for (let i = 0; i < length2; i++) {
                    result += Math.random() < 0.5 ? "0" : "1";
                }
                break;
            case 3: // 7-8位
                const length3 = getRandomInt(6, 7);
                for (let i = 0; i < length3; i++) {
                    result += Math.random() < 0.5 ? "0" : "1";
                }
                break;
            case 4: // 小數
                // 整數部分（2-3位）
                const intLength = getRandomInt(2, 3);
                for (let i = 1; i < intLength; i++) { // 已經有1了，所以從1開始
                    result += Math.random() < 0.5 ? "0" : "1";
                }
                result += ".";
                
                // 小數部分（2-3位）
                const decLength = getRandomInt(2, 3);
                let hasOne = false;
                for (let i = 0; i < decLength; i++) {
                    const bit = Math.random() < 0.5 ? "0" : "1";
                    if (bit === "1") hasOne = true;
                    result += bit;
                }
                // 確保小數部分至少有一個1
                if (!hasOne && decLength > 0) {
                    const pos = getRandomInt(0, decLength - 1);
                    result = result.slice(0, result.indexOf(".") + 1 + pos) + "1" + 
                             result.slice(result.indexOf(".") + 1 + pos + 1);
                }
                return result;
        }
        
        // 確保至少有一個0（對於非小數情況）
        if (!result.includes("0")) {
            const pos = getRandomInt(1, result.length - 1); // 不改變第一位的1
            result = result.slice(0, pos) + "0" + result.slice(pos + 1);
        }
        
        return result;
    }

    private binaryToPowerNotation(binary: string): string {
        const parts = binary.split(".");
        const intPart = parts[0];
        const decPart = parts[1] || "";
        
        let terms: string[] = [];
        
        // 處理整數部分
        for (let i = 0; i < intPart.length; i++) {
            if (intPart[i] === "1") {
                const power = intPart.length - 1 - i;
                terms.push(`2^{${power}}`);
            }
        }
        
        // 處理小數部分
        for (let i = 0; i < decPart.length; i++) {
            if (decPart[i] === "1") {
                const power = -(i + 1);
                terms.push(`2^{${power}}`);
            }
        }
        
        return terms.join(" + ");
    }

    private generateWrongAnswer(binary: string, correctAnswer: string, attempt: number = 0): string {
        const terms = correctAnswer.split(" + ");
        
        if (attempt > 10) return terms[0];

        const errorTypes = [
            // 1. 只保留整數部分
            () => {
                if (!binary.includes(".")) return terms[0];
                return terms.filter(term => !term.includes("-")).join(" + ");
            },
            
            // 2. 漏掉一个负指数项
            () => {
                if (!binary.includes(".")) return terms[0];
                const negativeTerms = terms.filter(term => term.includes("-"));
                if (negativeTerms.length === 0) return terms[0];
                const skipIndex = getRandomInt(0, negativeTerms.length - 1);
                return terms.filter(term => term !== negativeTerms[skipIndex]).join(" + ");
            },
            
            // 3. 负指数变正指数
            () => {
                if (!binary.includes(".")) return terms[0];
                return terms.map(term => {
                    if (term.includes("{-")) {
                        return term.replace("{-", "{");
                    }
                    return term;
                }).join(" + ");
            },
            
            // 4. 只保留最高位和最低位
            () => {
                if (terms.length <= 2) return terms[0];
                return [terms[0], terms[terms.length - 1]].join(" + ");
            }
        ];

        const errorIndex = getRandomInt(0, errorTypes.length - 1);
        try {
            const wrongAnswer = errorTypes[errorIndex]();
            if (!wrongAnswer || wrongAnswer.includes("NaN")) {
                return this.generateWrongAnswer(binary, correctAnswer, attempt + 1);
            }
            return wrongAnswer;
        } catch (error) {
            console.error('Error generating wrong answer:', error);
            return terms[0];
        }
    }

    private generateExplanation(binary: string, answer: string): string {
        const steps: string[] = [];
        
        steps.push(
            '1. 找出二進制數中的1的位置',
            `\\[${binary}₂\\]`,
            '2. 計算每個1的位值',
            `\\[${answer}\\]`,
            '3. 確認答案'
        );

        return steps.join('\n');
    }

    generate(): IGeneratorOutput {
        const difficulty = this.difficulty as Difficulty;
        const binary = this.generateBinaryNumber(difficulty);
        const correctAnswer = this.binaryToPowerNotation(binary);
        
        // 生成3個錯誤答案，添加最大尝试次数限制
        const wrongAnswers = new Set<string>();
        let attempts = 0;
        const maxAttempts = 20;
        
        while (wrongAnswers.size < 3 && attempts < maxAttempts) {
            wrongAnswers.add(this.generateWrongAnswer(binary, correctAnswer));
            attempts++;
        }
        
        // 如果没有生成足够的错误答案，添加默认错误答案
        if (wrongAnswers.size < 3) {
            const defaultWrongs = [
                correctAnswer.split(" + ")[0],
                "2^0",
                correctAnswer.includes("⁻") ? correctAnswer.replace("⁻", "^") : "2^1"
            ];
            
            for (const wrong of defaultWrongs) {
                if (wrong !== correctAnswer && wrongAnswers.size < 3) {
                    wrongAnswers.add(wrong);
                }
            }
        }
        
        return {
            content: `將${binary}₂轉換為2的冪次表示式：`,
            correctAnswer,
            wrongAnswers: Array.from(wrongAnswers),
            explanation: this.generateExplanation(binary, correctAnswer),
            type: 'text',
            displayOptions: {
                latex: true
            }
        };
    }
}