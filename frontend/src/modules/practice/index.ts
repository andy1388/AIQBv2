// 主入口文件
import { AudioManager } from './audio';
import { QuestionManager } from './question';
import { UIManager } from './ui';
import { EventManager } from './events';
import { ErrorHandler } from './error';
import { Question, GeneratorInfo } from './types';

export class PracticeManager {
    private audioManager: AudioManager;
    private questionManager: QuestionManager;
    private uiManager: UIManager;
    private eventManager: EventManager;

    constructor() {
        this.audioManager = new AudioManager();
        this.questionManager = new QuestionManager();
        this.uiManager = new UIManager();
        this.eventManager = new EventManager(
            this.audioManager,
            this.questionManager,
            this.uiManager
        );
    }

    async init() {
        try {
            await this.eventManager.setupEventListeners();
            await this.uiManager.setupUI();
        } catch (error) {
            ErrorHandler.showError(error as Error, document.querySelector('.question-area')!);
        }
    }

    // 添加一个静态方法来创建实例
    static async create() {
        const manager = new PracticeManager();
        await manager.init();
        return manager;
    }
}

// 导出所有相关类型
export type { Question, GeneratorInfo }; 