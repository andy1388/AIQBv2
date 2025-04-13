export class AudioManager {
    private correctSound: HTMLAudioElement;
    private wrongSound: HTMLAudioElement;
    private isMuted: boolean;

    constructor() {
        this.correctSound = document.getElementById('correctSound') as HTMLAudioElement;
        this.wrongSound = document.getElementById('wrongSound') as HTMLAudioElement;
        this.isMuted = localStorage.getItem('isMuted') === 'true';
        this.init();
    }

    private init() {
        this.correctSound?.load();
        this.wrongSound?.load();
        this.updateMuteState();
    }

    playSound(isCorrect: boolean) {
        if (this.isMuted) return;
        
        const sound = isCorrect ? this.correctSound : this.wrongSound;
        if (sound?.readyState >= 2) {
            sound.currentTime = 0;
            sound.play().catch(error => {
                console.error('播放音效失败:', error);
            });
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        localStorage.setItem('isMuted', String(this.isMuted));
        this.updateMuteState();
    }

    private updateMuteState() {
        if (this.correctSound) this.correctSound.muted = this.isMuted;
        if (this.wrongSound) this.wrongSound.muted = this.isMuted;
    }
} 