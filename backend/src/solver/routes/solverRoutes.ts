import express from 'express';
import { AdditionGenerator } from '../arithmetic/Addition';
import { FractionReductionGenerator } from '../arithmetic/FractionReduction';
import { DecimalFractionConversionGenerator } from '../arithmetic/DecimalFractionConversion';
import { NumberTheoryGenerator } from '../arithmetic/NumberTheory';
import { Solver } from '../Solver';
import { analyzeExpression } from '../controllers/analyzeController';
import { ExpressionAnalyzer, NumberCalculator } from '../../utils/mathUtils';
import { IndicesGenerator } from '../arithmetic/Indices';
import { MultiplicationGenerator } from '../arithmetic/Multiplication';

const router = express.Router();

router.post('/generate', async (req, res) => {
    try {
        const { type, difficulty } = req.body;

        switch (type) {
            case 'addition':
                const additionGenerator = new AdditionGenerator(difficulty);
                const additionOperation = additionGenerator.generate();
                const additionQuestion = additionOperation.operands.join(' + ') + ' = ?';
                res.json({
                    question: formatToLatex(additionQuestion),
                    operation: additionOperation
                });
                break;

            case 'fraction-reduction':
                const fractionGenerator = new FractionReductionGenerator(difficulty);
                const fractionOperation = fractionGenerator.generate();
                const fractionQuestion = fractionGenerator.getLatexQuestion(fractionOperation);
                res.json({
                    question: fractionQuestion,
                    operation: fractionOperation
                });
                break;

            case 'decimal-fraction-conversion':
                const conversionGenerator = new DecimalFractionConversionGenerator(difficulty);
                const conversionOperation = conversionGenerator.generate();
                const conversionQuestion = `${conversionOperation.value} = ?`;
                res.json({
                    question: conversionQuestion,
                    operation: conversionOperation
                });
                break;

            case 'gcd':
            case 'lcm':
            case 'prime-factorization':
                const numberTheoryGenerator = new NumberTheoryGenerator(type, difficulty);
                const numberTheoryOperation = numberTheoryGenerator.generate();
                let numberTheoryQuestion = '';
                
                if (type === 'gcd') {
                    numberTheoryQuestion = `\\gcd(${numberTheoryOperation.numbers.join(', ')})`;
                } else if (type === 'lcm') {
                    numberTheoryQuestion = `\\operatorname{lcm}(${numberTheoryOperation.numbers.join(', ')})`;
                } else {
                    numberTheoryQuestion = `${numberTheoryOperation.numbers[0]} = ?`;
                }
                
                res.json({
                    question: numberTheoryQuestion,
                    operation: numberTheoryOperation
                });
                break;

            case 'indices':
                const indicesGenerator = new IndicesGenerator(difficulty);
                const indicesOperation = indicesGenerator.generate();
                const indicesQuestion = indicesGenerator.getLatexQuestion(indicesOperation);
                res.json({
                    question: indicesQuestion,
                    operation: indicesOperation
                });
                break;

            case 'multiplication':
                const multiplicationGenerator = new MultiplicationGenerator(difficulty);
                const multiplicationOperation = multiplicationGenerator.generate();
                res.json({
                    question: multiplicationOperation.expression,
                    operation: multiplicationOperation
                });
                break;

            case 'normalize':
                const normalizedResult = ExpressionAnalyzer.normalizePolynomial(req.body.latex);
                res.json({
                    question: normalizedResult,
                    operation: { type: 'normalize' }
                });
                break;

            default:
                res.status(400).json({ error: '不支援的運算類型' });
        }
    } catch (error) {
        console.error('Generate Error:', error);
        res.status(500).json({ error: '生成失敗' });
    }
});

router.get('/difficulties/:type', async (req, res) => {
    try {
        const { type } = req.params;
        
        switch (type) {
            case 'addition':
                res.json(AdditionGenerator.getDifficultyInfos());
                break;
            case 'fraction-reduction':
                res.json(FractionReductionGenerator.getDifficultyInfos());
                break;
            case 'decimal-fraction-conversion':
                res.json(DecimalFractionConversionGenerator.getDifficultyInfos());
                break;
            case 'gcd':
            case 'lcm':
            case 'prime-factorization':
                res.json(NumberTheoryGenerator.getDifficultyInfos(type));
                break;
            case 'indices':
                res.json(IndicesGenerator.getDifficultyInfos());
                break;
            case 'multiplication':
                res.json(MultiplicationGenerator.getDifficultyInfos());
                break;
            default:
                res.status(400).json({ error: '不支援的運算類型' });
        }
    } catch (error) {
        console.error('Get Difficulties Error:', error);
        res.status(500).json({ error: '獲取難度信息失敗' });
    }
});

router.post('/solve', async (req, res) => {
    try {
        const { equation } = req.body;
        const solution = Solver.solve(equation);
        res.json(solution);
    } catch (error) {
        console.error('Solve Error:', error);
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: '未知錯誤' });
        }
    }
});

router.post('/analyze', analyzeExpression);

router.post('/process', (req, res) => {
    try {
        const { latex, operation } = req.body;
        
        console.log('Received request:', {
            latex,
            operation
        });

        if (!latex) {
            return res.status(400).json({ error: '缺少表達式' });
        }

        let result;
        switch (operation) {
            case 'combine':
                result = ExpressionAnalyzer.combineTerms(latex);
                break;
            case 'decimal-fraction':
                result = ExpressionAnalyzer.convertDecimalFraction(latex);
                break;
            case 'reduce':
                result = ExpressionAnalyzer.reduceFraction(latex);
                break;
            case 'prime-factorize':
                result = ExpressionAnalyzer.primeFactorize(latex);
                break;
            case 'simplify-indices':
                result = ExpressionAnalyzer.simplifyIndices(latex);
                break;
            case 'expand':
                result = ExpressionAnalyzer.expand(latex);
                break;
            case 'calculate':
                result = ExpressionAnalyzer.calculate(latex);
                break;
            case 'number-calculate':
                result = NumberCalculator.calculate(latex);
                break;
            case 'simplify-one-term':
                result = ExpressionAnalyzer.simplifyOneTerm(latex);
                break;
            case 'find-innermost':
                result = ExpressionAnalyzer.analyzeBracketLayers(latex);
                break;
            case 'normalize':
                result = ExpressionAnalyzer.normalizePolynomial(latex);
                break;
            default:
                return res.status(400).json({ error: '不支持的操作' });
        }

        if (!result) {
            return res.status(500).json({ error: '處理結果為空' });
        }

        res.json({ latex: result });
    } catch (error) {
        console.error('Process error:', error);
        res.status(500).json({ 
            error: error instanceof Error ? error.message : '處理失敗'
        });
    }
});

router.post('/check-operation', (req, res) => {
    try {
        const { operation, latex } = req.body;
        
        if (!latex || !operation) {
            return res.status(400).json({ error: '缺少必要參數' });
        }

        let available = false;
        switch (operation) {
            case 'combine':
                // 检查是否有同类项
                const likeTerms = ExpressionAnalyzer.analyzeLikeTerms(latex);
                available = likeTerms.hasLikeTerms;
                break;
            case 'simplify':
                // 简化操作总是可用
                available = true;
                break;
            case 'reduce':
                // 检查是否有分数
                const fractionInfo = ExpressionAnalyzer.analyzeFraction(latex);
                available = fractionInfo.hasFraction;
                break;
            case 'common-denominator':
                // 检查是否有分数
                const fractionInfo2 = ExpressionAnalyzer.analyzeFraction(latex);
                available = fractionInfo2.hasFraction;
                break;
            case 'expand':
                // 检查是否有括号
                available = latex.includes('(') || latex.includes('\\left(');
                break;
            case 'factorize':
                // 检查是否是多项式
                const type = ExpressionAnalyzer.getExpressionType(latex);
                available = type === 'polynomial';
                break;
            case 'prime-factorize':
                // 檢查是否為正整數
                const num = parseInt(latex.replace(/[^\d]/g, ''));
                available = !isNaN(num) && num > 1;
                break;
            case 'simplify-indices':
                // 檢查是否包含指數運算
                available = latex.includes('^') || 
                          latex.includes('\\sqrt') || 
                          /\d+\^\{[^}]+\}/.test(latex);
                break;
            case 'calculate':
                // 检查是否包含数字运算
                available = /\([0-9+\-*/\s]+\)/.test(latex);
                break;
            case 'number-calculate':
                // 检查是否包含数字或分数
                available = /(\d+|\\frac\{\d+\}\{\d+\}|\/)\s*[+\-]\s*(\d+|\\frac\{\d+\}\{\d+\}|\/)/.test(latex);
                break;
            case 'simplify-one-term':
                // 檢查是否包含指數和運算符
                available = (latex.includes('^') || latex.includes('\\sqrt')) && 
                           (latex.includes('\\times') || latex.includes('\\div'));
                break;
            case 'normalize':
                try {
                    const normalizedResult = ExpressionAnalyzer.normalizePolynomial(latex);
                    available = !!normalizedResult;
                } catch (error) {
                    available = false;
                }
                break;
            default:
                available = false;
        }

        res.json({ available });
    } catch (error) {
        console.error('Check operation error:', error);
        res.status(500).json({ error: '檢查操作可用性失敗' });
    }
});

function formatToLatex(expression: string): string {
    return expression
        .replace(/\+/g, ' + ')
        .replace(/\-/g, ' - ')
        .replace(/\*/g, ' \\times ')
        .replace(/\//g, ' \\div ')
        .replace(/(\d+)\s*\^\s*(\d+)/g, '$1^{$2}')
        .replace(/\=/g, ' = ')
        .trim();
}

export default router; 