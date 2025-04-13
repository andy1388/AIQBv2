import { Request, Response } from 'express';
import { ExpressionAnalyzer } from '../../utils/mathUtils';

export const analyzeExpression = (req: Request, res: Response) => {
    try {
        const { latex } = req.body;
        
        if (!latex) {
            return res.status(400).json({ error: '缺少表達式' });
        }

        // 使用 ExpressionAnalyzer 分析表达式
        const analysisResult = ExpressionAnalyzer.analyze(latex);
        
        res.json(analysisResult);
    } catch (error) {
        console.error('Expression analysis error:', error);
        res.status(500).json({ error: '分析失敗' });
    }
}; 