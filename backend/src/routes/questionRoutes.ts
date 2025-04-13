import express from 'express';
import { GeneratorScanner } from '../utils/generatorScanner';
import { DirectoryStructure } from '../types/GeneratorTypes';
import { MC_Maker } from '../generators/MC_Maker';
import { Request, Response } from 'express';
import path from 'path';
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';

const router = express.Router();
const scanner = new GeneratorScanner();
let generatorCache: DirectoryStructure | null = null;

// 获取可用生成器列表
router.get('/available-generators', async (req, res) => {
    try {
        // 直接使用 scanBasicStructure 返回的结构
        const structure = await scanner.scanBasicStructure();
        res.json(structure);
    } catch (error) {
        console.error('获取生成器列表失败:', error);
        res.status(500).json({ error: '获取生成器列表失败' });
    }
});

// 生成题目
router.get('/generate/:generatorId', async (req, res) => {
    try {
        const { generatorId } = req.params;
        const difficulty = parseInt(req.query.difficulty as string) || 1;
        
        console.log('Generating question for:', generatorId, 'difficulty:', difficulty);
        
        // 使用新方法获取生成器路径
        const generatorPath = await scanner.getGeneratorPath(generatorId);
        
        // 动态导入生成器
        const Generator = (await import(generatorPath)).default;
        const generator = new Generator(difficulty);
        
        // 生成问题
        const rawOutput = generator.generate();
        
        // 使用 MC_Maker 创建多选题
        const question = MC_Maker.createQuestion(rawOutput, difficulty);
        
        res.json(question);
    } catch (error: any) {
        console.error('Error generating question:', error);
        res.status(500).json({ 
            error: 'Failed to generate question',
            details: error?.message || 'Unknown error'
        });
    }
});

// 获取文件夹内容
router.get('/folder-content/:path(*)', async (req, res) => {
    try {
        const folderPath = req.params.path;
        console.log('Requesting folder content for:', folderPath);
        const content = await scanner.getFolderContent(folderPath);
        console.log('Content found:', content);
        res.json(content);
    } catch (error) {
        console.error('Error scanning folder:', error);
        res.status(500).json({ error: 'Failed to scan folder' });
    }
});

// 添加新的接口來獲取生成器的難度等級
router.get('/generator-info/:generatorId', async (req, res) => {
    try {
        const { generatorId } = req.params;
        
        // 使用 scanner 获取生成器路径
        const generatorPath = await scanner.getGeneratorPath(generatorId);
        
        // 从生成器路径获取描述文件路径
        const descPath = generatorPath.replace('.ts', '.desc.txt');
        
        // 检查文件是否存在
        if (!fs.existsSync(descPath)) {
            throw new Error(`Description file not found: ${generatorId}`);
        }
        
        // 读取文件内容
        const content = await fsPromises.readFile(descPath, 'utf-8');
        
        // 解析 Level number
        const levelMatch = content.match(/Level number：(\d+)/);
        const levelNumber = levelMatch ? parseInt(levelMatch[1]) : 5;
        
        res.json({ levelNumber });
    } catch (error) {
        console.error('Error getting generator info:', error);
        res.status(500).json({ error: 'Failed to get generator info' });
    }
});

export default router; 