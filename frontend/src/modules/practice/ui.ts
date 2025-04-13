import { Question, GeneratorInfo } from './types';

export class UIManager {
    constructor() {}
    
    setupUI() {
        this.setupSidebar();
        this.setupDifficultyButtons();
        this.setupMuteButton();
    }
    
    displayQuestion(question: Question) {
        // 实现显示题目的逻辑
    }
    
    private setupSidebar() {
        // 实现侧边栏设置
    }
    
    private setupDifficultyButtons() {
        // 实现难度按钮设置
    }
    
    private setupMuteButton() {
        // 实现静音按钮设置
    }
} 