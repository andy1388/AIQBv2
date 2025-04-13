export class ErrorHandler {
    static showError(error: Error, container: HTMLElement) {
        container.innerHTML = `
            <div class="error-message">
                <p>操作失败</p>
                <p>错误信息：${error.message}</p>
                <button onclick="location.reload()" class="retry-btn">重试</button>
            </div>
        `;
    }
} 