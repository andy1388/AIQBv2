import { AudioManager } from './audio';
import { QuestionManager } from './question';
import { UIManager } from './ui';

export class EventManager {
    private eventMap: Map<HTMLElement, Set<string>> = new Map();

    constructor(
        private audioManager: AudioManager,
        private questionManager: QuestionManager,
        private uiManager: UIManager
    ) {}

    setupEventListeners() {
        this.setupGeneratorClickEvents();
        this.setupDifficultyButtonEvents();
        this.setupMuteButtonEvents();
    }

    private setupGeneratorClickEvents() {
        // 实现生成器点击事件
    }

    private setupDifficultyButtonEvents() {
        // 实现难度按钮事件
    }

    private setupMuteButtonEvents() {
        // 实现静音按钮事件
    }

    addEventOnce(element: HTMLElement, eventType: string, handler: EventListener) {
        if (!this.eventMap.has(element)) {
            this.eventMap.set(element, new Set());
        }
        
        const events = this.eventMap.get(element)!;
        const eventKey = `${eventType}-${handler.toString()}`;
        
        if (!events.has(eventKey)) {
            element.addEventListener(eventType, handler);
            events.add(eventKey);
        }
    }
} 