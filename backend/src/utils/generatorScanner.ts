import fs from 'fs';
import path from 'path';
import { 
    GeneratorInfo, 
    DirectoryStructure, 
    ChapterStructure, 
    SectionStructure,
    GeneratorList 
} from '../types/GeneratorTypes';

// 将接口定义移到类的外部
interface FolderContent {
    subFolders: {
        id: string;
        title: string;
        path: string;
    }[];
    generators: GeneratorList[];
}

export class GeneratorScanner {
    private readonly GENERATORS_PATH: string;
    private static structureCache: DirectoryStructure | null = null;

    constructor() {
        this.GENERATORS_PATH = path.resolve(__dirname, '..', 'generators');
        if (!fs.existsSync(this.GENERATORS_PATH)) {
            const altPath = path.resolve(process.cwd(), 'src', 'generators');
            if (fs.existsSync(altPath)) {
                this.GENERATORS_PATH = altPath;
            } else {
                throw new Error('无法找到生成器目录');
            }
        }
    }

    // 只扫描基本结构
    async scanBasicStructure() {
        try {
            const structure = await this.scanDirectory(this.GENERATORS_PATH);
            return structure;
        } catch (error) {
            console.error('扫描目录失败:', error);
            throw error;
        }
    }

    // 递归扫描目录
    private async scanDirectory(dirPath: string): Promise<DirectoryStructure> {
        const structure: DirectoryStructure = {};
        
        try {
            const items = await fs.promises.readdir(dirPath);
            
            for (const item of items) {
                const fullPath = path.join(dirPath, item);
                const stat = await fs.promises.stat(fullPath);
                
                if (stat.isDirectory()) {
                    // 对于目录，递归扫描
                    structure[item] = {
                        title: item,
                        type: 'directory',
                        children: await this.scanDirectory(fullPath)
                    };
                } else if (item.endsWith('.ts') || item.endsWith('.desc.txt')) {
                    const baseName = item.replace(/\.(ts|desc\.txt)$/, '');
                    const fileType = item.endsWith('.ts') ? 'ts' : 'desc';
                    
                    // 如果是 .ts 文件，尝试读取对应的 .desc.txt
                    if (fileType === 'ts') {
                        const descPath = fullPath.replace('.ts', '.desc.txt');
                        if (fs.existsSync(descPath)) {
                            const content = await fs.promises.readFile(descPath, 'utf-8');
                            const lines = content.split('\n');
                            
                            structure[item] = {
                                title: lines[1]?.trim() || baseName,
                                type: 'file',
                                fileType: 'ts',
                                path: path.relative(this.GENERATORS_PATH, fullPath),
                                difficulty: lines[0]?.trim() || '1',
                                description: lines[2]?.trim()
                            };
                        }
                    }
                }
            }
            
            return structure;
        } catch (error) {
            console.error(`扫描目录失败 ${dirPath}:`, error);
            return {};
        }
    }

    private async scanChaptersBasic(formPath: string) {
        const chapters: { [key: string]: ChapterStructure } = {};
        const items = await fs.promises.readdir(formPath);

        const sortedItems = items.sort((a, b) => {
            const getNumber = (str: string) => {
                const match = str.match(/L(\d+)/);
                return match ? parseInt(match[1]) : 0;
            };
            return getNumber(a) - getNumber(b);
        });

        for (const item of sortedItems) {
            const chapterPath = path.join(formPath, item);
            const stat = await fs.promises.stat(chapterPath);
            
            if (stat.isDirectory()) {
                // 检查目录中的生成器文件
                const generators = await this.scanGeneratorsInPath(chapterPath);
                const sections: { [key: string]: SectionStructure } = {};

                // 直接将生成器添加到根部分，不创建额外的子目录
                if (generators.length > 0) {
                    sections[''] = {
                        title: item,
                        generators: generators,
                        path: chapterPath
                    };
                }

                // 只有当子目录名称与当前目录名称不同时才扫描
                const dirItems = await fs.promises.readdir(chapterPath);
                for (const dirItem of dirItems) {
                    const dirItemPath = path.join(chapterPath, dirItem);
                    const dirItemStat = await fs.promises.stat(dirItemPath);
                    
                    if (dirItemStat.isDirectory() && dirItem !== item) {  // 添加这个检查
                        const subGenerators = await this.scanGeneratorsInPath(dirItemPath);
                        if (subGenerators.length > 0) {
                            sections[dirItem] = {
                                title: dirItem,
                                generators: subGenerators,
                                path: dirItemPath
                            };
                        }
                    }
                }

                chapters[item] = {
                    title: item,
                    sections: sections
                };
            }
        }
        return chapters;
    }

    // 新增：递归扫描目录中的所有生成器文件
    private async scanAllGeneratorsInDirectory(dirPath: string): Promise<GeneratorList[]> {
        const generators: GeneratorList[] = [];
        const items = await fs.promises.readdir(dirPath);

        for (const item of items) {
            const fullPath = path.join(dirPath, item);
            const stat = await fs.promises.stat(fullPath);

            if (stat.isDirectory()) {
                // 递归扫描子目录
                const subGenerators = await this.scanAllGeneratorsInDirectory(fullPath);
                generators.push(...subGenerators);
            } else if (item.endsWith('_MQ.ts')) {
                const baseName = item.replace('.ts', '');
                const descFileName = `${baseName}.desc.txt`;
                
                if (items.includes(descFileName)) {
                    const descPath = path.join(dirPath, descFileName);
                    const content = fs.readFileSync(descPath, 'utf-8');
                    const lines = content.split('\n');
                    
                    generators.push({
                        id: baseName,
                        title: lines[1]?.trim() || item,
                        difficulty: lines[0]?.trim() || '1',
                        path: path.relative(this.GENERATORS_PATH, path.join(dirPath, item))
                    });
                }
            }
        }

        return generators;
    }

    // 新增：扫描第4层子目录
    private async scanSubSections(sectionPath: string) {
        const subSections: { [key: string]: SectionStructure } = {};
        const items = await fs.promises.readdir(sectionPath);

        // 按编号排序（支持 x.x.x 格式）
        const sortedItems = items.sort((a, b) => {
            const numA = a.match(/\d+\.\d+\.\d+/)?.[0] || a;
            const numB = b.match(/\d+\.\d+\.\d+/)?.[0] || b;
            return numA.localeCompare(numB);
        });

        for (const item of sortedItems) {
            const subSectionPath = path.join(sectionPath, item);
            const stat = await fs.promises.stat(subSectionPath);
            
            if (stat.isDirectory()) {
                const generators = await this.scanGeneratorsInPath(subSectionPath);
                subSections[item] = {
                    title: item,
                    generators: generators,
                    path: subSectionPath
                };
            }
        }
        return Object.keys(subSections).length > 0 ? subSections : undefined;
    }

    // 新增：扫描指定路径下的生成器文件
    private async scanGeneratorsInPath(dirPath: string): Promise<GeneratorList[]> {
        try {
            const generators: GeneratorList[] = [];
            const files = await fs.promises.readdir(dirPath);
            
            // 只检查当前目录中的生成器文件
            const tsFiles = files.filter(file => file.endsWith('.ts'));
            for (const tsFile of tsFiles) {
                const baseName = tsFile.replace('.ts', '');
                const descFileName = `${baseName}.desc.txt`;
                
                if (files.includes(descFileName)) {
                    const tsPath = path.join(dirPath, tsFile);
                    const descPath = path.join(dirPath, descFileName);
                    
                    const content = fs.readFileSync(descPath, 'utf-8');
                    const lines = content.split('\n');
                    const title = lines[1]?.trim() || tsFile;
                    const difficulty = lines[0]?.trim() || '1';
                    
                    generators.push({
                        id: path.basename(tsFile, '.ts'),
                        title,
                        difficulty,
                        path: path.relative(this.GENERATORS_PATH, tsPath)
                    });
                }
            }
            
            return generators;
        } catch (error) {
            console.error(`Error scanning generators in ${dirPath}:`, error);
            return [];
        }
    }

    // 修改扫描文件夹生成器的方法
    async scanFolderGenerators(folderPath: string) {
        const fullPath = path.join(this.GENERATORS_PATH, folderPath);
        if (!fs.existsSync(fullPath)) {
            throw new Error('Folder not found');
        }

        const generators: GeneratorInfo[] = [];
        
        // 递归搜索所有目录
        const scanDir = async (dirPath: string) => {
            const files = await fs.promises.readdir(dirPath);
            
            for (const file of files) {
                const filePath = path.join(dirPath, file);
                const stat = await fs.promises.stat(filePath);
                
                if (stat.isDirectory()) {
                    // 递归搜索子目录
                    await scanDir(filePath);
                } else if (file.endsWith('_MQ.ts')) {
                    // 检查是否存在对应的 .desc.txt 文件
                    const descPath = filePath.replace('.ts', '.desc.txt');
                    
                    if (fs.existsSync(descPath)) {
                        // 读取描述文件
                        const content = fs.readFileSync(descPath, 'utf-8');
                        const lines = content.split('\n');
                        const title = lines[1]?.trim() || file;
                        const difficulty = lines[0]?.trim() || '1';

                        // 获取相对路径
                        const relativePath = path.relative(this.GENERATORS_PATH, filePath);
                        
                        generators.push({
                            id: path.basename(file, '.ts'),
                            title,
                            difficulty,
                            path: relativePath,
                            chapter: {
                                id: '',
                                title: '',
                                number: ''
                            },
                            section: {
                                id: '',
                                title: '',
                                number: ''
                            }
                        });
                    }
                }
            }
        };

        await scanDir(fullPath);
        return generators;
    }

    // 修改 getFolderContent 方法
    public async getFolderContent(folderPath: string): Promise<FolderContent> {
        try {
            const fullPath = path.join(this.GENERATORS_PATH, folderPath);
            console.log('Scanning folder:', fullPath);
            
            if (!fs.existsSync(fullPath)) {
                throw new Error(`Folder not found: ${fullPath}`);
            }

            const items = await fs.promises.readdir(fullPath);
            console.log('Found items:', items);
            
            const generators: GeneratorList[] = [];
            const subFolders: { id: string; title: string; path: string; }[] = [];

            // 处理当前目录中的所有项目
            for (const item of items) {
                const itemPath = path.join(fullPath, item);
                const stat = await fs.promises.stat(itemPath);

                if (stat.isDirectory() && !item.startsWith('.')) {
                    // 如果是目录，添加到子文件夹列表
                    subFolders.push({
                        id: item,
                        title: item,
                        path: path.join(folderPath, item)
                    });
                } else if (item.endsWith('_MQ.ts')) {
                    // 如果是生成器文件，添加到生成器列表
                    const baseName = item.replace('.ts', '');
                    const descFileName = `${baseName}.desc.txt`;
                    
                    if (items.includes(descFileName)) {
                        const descPath = path.join(fullPath, descFileName);
                        const content = fs.readFileSync(descPath, 'utf-8');
                        const lines = content.split('\n');
                        
                        generators.push({
                            id: baseName,
                            title: lines[1]?.trim() || item,
                            difficulty: lines[0]?.trim() || '1',
                            path: path.relative(this.GENERATORS_PATH, itemPath)
                        });
                    }
                }
            }

            console.log('Returning content:', { subFolders, generators });
            return { subFolders, generators };
        } catch (error) {
            console.error('Error in getFolderContent:', error);
            throw error;
        }
    }

    // 清除缓存的方法（如果需要）
    static clearCache() {
        GeneratorScanner.structureCache = null;
    }

    // 添加新的公共方法来获取生成器文件路径
    public async getGeneratorPath(generatorId: string): Promise<string> {
        try {
            // 搜索生成器文件
            const searchDir = async (dirPath: string): Promise<string | null> => {
                const items = await fs.promises.readdir(dirPath);
                
                for (const item of items) {
                    const fullPath = path.join(dirPath, item);
                    const stat = await fs.promises.stat(fullPath);
                    
                    if (stat.isDirectory()) {
                        const result = await searchDir(fullPath);
                        if (result) return result;
                    } else if (item === `${generatorId}.ts`) {
                        console.log('Found generator at:', fullPath);
                        // 确保返回的是相对于 generators 目录的路径
                        const relativePath = path.relative(this.GENERATORS_PATH, fullPath);
                        console.log('Relative path:', relativePath);
                        return relativePath;
                    }
                }
                
                return null;
            };
            
            const generatorPath = await searchDir(this.GENERATORS_PATH);
            if (!generatorPath) {
                throw new Error(`Generator not found: ${generatorId}`);
            }

            // 构建完整的模块路径
            const fullPath = path.join(this.GENERATORS_PATH, generatorPath);
            console.log('Full module path:', fullPath);
            
            // 确保文件存在
            if (!fs.existsSync(fullPath)) {
                throw new Error(`Generator file not found: ${fullPath}`);
            }

            return fullPath;
            
        } catch (error) {
            console.error('Error finding generator:', error);
            throw error;
        }
    }

    // 添加 extractInfo 方法
    private extractInfo(filePath: string) {
        const parts = filePath.split(path.sep);
        const chapterPart = parts.find(p => p.includes('_L'));
        const sectionPart = parts.find(p => p.match(/L\d+\.\d+/));
        const subSectionPart = parts.find(p => p.match(/L\d+\.\d+\.\d+/));

        const chapterMatch = chapterPart?.match(/F\d+_L(\d+)_(.+)/);
        const sectionMatch = sectionPart?.match(/F\d+L(\d+\.\d+)_(.+)/);
        const subSectionMatch = subSectionPart?.match(/F\d+L(\d+\.\d+\.\d+)_(.+)/);

        return {
            chapter: {
                id: chapterPart || '',
                title: chapterPart?.replace(/_/g, ' ') || '',
                number: chapterMatch ? `L${chapterMatch[1]}` : ''
            },
            section: {
                id: sectionPart || '',
                title: sectionMatch ? sectionMatch[2].replace(/_/g, ' ') : '',
                number: sectionMatch ? sectionMatch[1] : ''
            },
            subSection: subSectionMatch ? {
                id: subSectionPart || '',
                title: subSectionMatch[2].replace(/_/g, ' '),
                number: subSectionMatch[1]
            } : undefined
        };
    }
} 