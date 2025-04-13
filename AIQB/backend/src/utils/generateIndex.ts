import fs from 'fs';
import path from 'path';

export class IndexGenerator {
    static async generateIndexFiles(startPath: string) {
        try {
            const files = await fs.promises.readdir(startPath);
            
            // 收集当前目录下所有的生成器文件
            const generators = files.filter(f => 
                f.endsWith('_MQ.ts') && 
                !f.endsWith('.d.ts') && 
                !f.endsWith('index.ts')
            );

            // 如果有生成器文件，创建 index.ts
            if (generators.length > 0) {
                const imports: string[] = [];
                const exports: string[] = [];

                generators.forEach(file => {
                    const baseName = path.basename(file, '.ts');
                    const importName = baseName.replace(/\./g, '_');
                    imports.push(`import ${importName} from './${baseName}';`);
                    exports.push(`    '${baseName}': ${importName}`);
                });

                const indexContent = `${imports.join('\n')}\n\nexport const generators = {\n${exports.join(',\n')}\n};\n`;
                
                await fs.promises.writeFile(
                    path.join(startPath, 'index.ts'),
                    indexContent
                );
            }

            // 递归处理子目录
            for (const file of files) {
                const filePath = path.join(startPath, file);
                const stat = await fs.promises.stat(filePath);
                
                if (stat.isDirectory()) {
                    await this.generateIndexFiles(filePath);
                }
            }
        } catch (error) {
            console.error(`Error generating index files: ${error}`);
        }
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const generatorsPath = path.resolve(__dirname, '..', 'generators');
    IndexGenerator.generateIndexFiles(generatorsPath)
        .then(() => console.log('Index files generated successfully'))
        .catch(err => console.error('Error:', err));
} 