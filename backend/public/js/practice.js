const DEBUG = true;

// 声明音频变量
let correctSound;
let wrongSound;
let isMuted = false;

function log(...args) {
    if (DEBUG) {
        console.log(...args);
    }
}

let AVAILABLE_GENERATORS = [];
let isResizing = false;
let lastWidth = localStorage.getItem('sidebarWidth') || '300px';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 初始化音频元素
        correctSound = document.getElementById('correctSound');
        wrongSound = document.getElementById('wrongSound');
        
        // 预加载音频
        correctSound?.load();
        wrongSound?.load();
        
        log('Initializing practice page...');
        const response = await fetch('/api/questions/available-generators');
        if (!response.ok) {
            throw new Error('無法獲取生成器列表');
        }
        const structure = await response.json();
        
        log('Received structure:', structure);
        
        const sidebarContent = document.querySelector('.topic-nav');
        if (!sidebarContent) {
            throw new Error('找不到側邊欄容器');
        }
        
        const html = renderDirectoryStructure(structure);
        sidebarContent.innerHTML = html;
        
        log('Directory structure rendered');
        
        addEventListeners();
        log('Event listeners added');
        
        setupSidebarResize();
        log('Sidebar resize setup complete');
        
        setupDifficultyButtons();
        log('Difficulty buttons setup complete');
        
        // 初始化静音按钮
        setupMuteButton();
        
    } catch (error) {
        console.error('初始化失败:', error);
    }
});

function renderSidebar(structure) {
    const sidebarContent = document.querySelector('.topic-nav');
    if (!sidebarContent) {
        console.error('Sidebar container not found');
        return;
    }
    
    try {
        const html = renderDirectoryStructure(structure);
        sidebarContent.innerHTML = html;
        addEventListeners();
    } catch (error) {
        console.error('渲染侧边栏失败:', error);
        sidebarContent.innerHTML = '<div class="error">加載失敗，請重試</div>';
    }
}

function renderDirectoryStructure(structure) {
    if (!structure || Object.keys(structure).length === 0) {
        return '<div class="directory-structure"><p>暫無可用的練習題目</p></div>';
    }

    let html = '<div class="directory-structure">';
    
    // 將條目轉換為數組並排序
    const entries = Object.entries(structure).map(([name, item]) => {
        // 如果有描述文件内容，提取真正的标题
        if (item.description) {
            const lines = item.description.split('\n');
            // 找到第一个非空且不是分隔符的行作为标题
            const title = lines.find(line => {
                const trimmed = line.trim();
                return trimmed && !trimmed.includes('===') && !trimmed.match(/^[-=]+$/);
            });
            if (title) {
                item.title = title.trim();
            }
        }
        
        // 提取 L 後面的數字
        const levelMatch = name.match(/L(\d+)/);
        const levelNumber = levelMatch ? parseInt(levelMatch[1]) : 0;
        
        // 提取題號
        const questionMatch = name.match(/Q(\d+)/);
        const questionNumber = questionMatch ? parseInt(questionMatch[1]) : 0;
        
        return {
            name,
            item,
            levelNumber,
            questionNumber
        };
    }).sort((a, b) => {
        // 如果都是文件夾，按 L 後面的數字排序
        if (a.item.type === 'directory' && b.item.type === 'directory') {
            return a.levelNumber - b.levelNumber;
        }
        // 如果都是文件，按題號排序
        if (a.item.type === 'file' && b.item.type === 'file') {
            return a.questionNumber - b.questionNumber;
        }
        // 文件夾優先
        return a.item.type === 'directory' ? -1 : 1;
    });
    
    // 渲染排序後的條目
    entries.forEach(({name, item}) => {
        if (item.type === 'directory') {
            html += `
                <div class="folder">
                    <div class="folder-title" data-path="${item.path || name}">
                        <span class="icon folder-icon">📁</span>
                        <span class="folder-name">${item.title || name}</span>
                    </div>
                    <div class="folder-content">
                        ${renderDirectoryStructure(item.children || {})}
                    </div>
                </div>
            `;
        } else if (item.type === 'file' && item.fileType === 'ts') {
            html += `
                <div class="generator-item" data-path="${item.path}">
                    <span class="icon file-icon">📄</span>
                    <span class="generator-title">${item.title}</span>
                    ${item.difficulty ? `<span class="difficulty-badge">${item.difficulty}</span>` : ''}
                </div>
            `;
        }
    });
    
    html += '</div>';
    return html;
}

function renderGenerator(generator) {
    // 从生成器ID中提取题号
    const questionMatch = generator.id.match(/Q(\d+)/);
    const questionNumber = questionMatch ? `Q${questionMatch[1]}. ` : '';
    
    return `
        <div class="generator-item" data-topic="${generator.id}">
            <span class="icon file-icon">��</span>
            <span class="generator-title">${questionNumber}${generator.title}</span>
            <span class="difficulty-badge">${generator.difficulty}</span>
        </div>
    `;
}

function addEventListeners() {
    // 文件夹点击事件
    document.querySelectorAll('.folder-title').forEach(title => {
        if (title.hasEventListener) return;
        
        title.addEventListener('click', async (e) => {
            e.stopPropagation();
            const folder = title.parentElement;
            folder.classList.toggle('expanded');
            
            // 确保父文件夹也是展开状态
            let parent = folder.parentElement;
            while (parent) {
                if (parent.classList.contains('folder')) {
                    parent.classList.add('expanded');
                }
                parent = parent.parentElement;
            }
        });
        
        title.hasEventListener = true;
    });

    // 生成器点击事件
    document.querySelectorAll('.generator-item').forEach(item => {
        if (item.hasEventListener) return;
        
        item.addEventListener('click', async () => {
            try {
                const generatorPath = item.dataset.path;
                if (!generatorPath) {
                    throw new Error('No generator path found');
                }

                // 从路径中提取生成器ID
                const generatorId = generatorPath.replace(/\\/g, '/');
                const fileName = generatorId.split('/').pop();
                if (!fileName) {
                    throw new Error('Invalid generator path');
                }

                const id = fileName.replace(/\.ts$/, '');
                console.log('Clicked generator:', id, 'Path:', generatorPath);
                
                // 移除其他生成器的活动状态
                document.querySelectorAll('.generator-item').forEach(i => 
                    i.classList.remove('active')
                );
                item.classList.add('active');

                // 先获取生成器信息
                const infoResponse = await fetch(`/api/questions/generator-info/${id}`);
                if (!infoResponse.ok) {
                    throw new Error('Failed to get generator info');
                }
                
                const { levelNumber } = await infoResponse.json();
                
                // 立即更新难度按钮
                updateDifficultyButtons(levelNumber);

                // 生成题目
                const response = await fetch(`/api/questions/generate/${id}?difficulty=1`);
                if (!response.ok) {
                    throw new Error('Failed to generate question');
                }

                const question = await response.json();
                question.maxDifficulty = parseInt(levelNumber);
                question.currentDifficulty = 1;
                
                displayQuestion(question);
                
            } catch (error) {
                console.error('生成题目失败:', error);
                alert('生成题目失败: ' + error.message);
            }
        });
        
        item.hasEventListener = true;
    });
}

// 修改生成器点击事件处理
function addGeneratorEventListeners(container) {
    container.querySelectorAll('.generator-item').forEach(item => {
        item.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Generator clicked:', item.dataset.topic);
            
            // 移除其他生成器的活动状态
            document.querySelectorAll('.generator-item').forEach(i => 
                i.classList.remove('active')
            );
            item.classList.add('active');
            
            const generatorId = item.dataset.topic;
            
            try {
                // 获取生成器信息（包含难度级别数量）
                const infoResponse = await fetch(`/api/questions/generator-info/${generatorId}`);
                if (!infoResponse.ok) {
                    throw new Error('Failed to get generator info');
                }
                
                const { levelNumber } = await infoResponse.json();
                console.log('Generator levels:', levelNumber);
                
                // 生成题目
                const questionResponse = await fetch(`/api/questions/generate/${generatorId}?difficulty=1`);
                if (!questionResponse.ok) {
                    throw new Error('Failed to generate question');
                }

                const question = await questionResponse.json();
                
                // 添加难度信息
                question.maxDifficulty = parseInt(levelNumber);
                question.currentDifficulty = 1;
                
                console.log('Question with difficulty info:', question);
                displayQuestion(question);
                
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to load question: ' + error.message);
            }
        });
    });
}

// 更新難度按鈕
function updateDifficultyButtons(maxDifficulty) {
    const difficultySelector = document.querySelector('.difficulty-selector');
    if (!difficultySelector) return;

    // 清空現有按鈕
    const buttonsContainer = difficultySelector.querySelector('.difficulty-buttons');
    if (!buttonsContainer) return;
    
    buttonsContainer.innerHTML = '';

    // 生成新的難度按鈕
    for (let i = 1; i <= maxDifficulty; i++) {
        const button = document.createElement('button');
        button.className = 'difficulty-btn' + (i === 1 ? ' active' : '');
        button.dataset.level = i;
        button.textContent = i;
        button.addEventListener('click', () => {
            // 移除其他按鈕的 active 類
            buttonsContainer.querySelectorAll('.difficulty-btn').forEach(btn => 
                btn.classList.remove('active')
            );
            // 添加當前按鈕的 active 類
            button.classList.add('active');
            
            // 重新生成題目
            const activeGenerator = document.querySelector('.generator-item.active');
            if (activeGenerator) {
                startPractice(activeGenerator.dataset.path, i);
            }
        });
        buttonsContainer.appendChild(button);
    }
}

// 更新 CSS - 合併所有樣式
const style = document.createElement('style');
style.textContent = `
    /* 導航相關樣式 */
    .topic-nav {
        padding: 0;
        background: #2c3e50;
        height: 100%;
        overflow-y: auto;
    }

    .directory {
        padding: 0;
        margin: 0;
    }
    
    .directory-item {
        margin: 0;
        padding: 0;
        background: #2c3e50;
    }
    
    .directory-name {
        cursor: pointer;
        padding: 0.75rem 1rem;
        color: white;
        background: rgba(255,255,255,0.1);
        display: flex;
        align-items: center;
        font-size: 0.9rem;
        margin: 0;
        border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    
    .directory-name:before {
        content: '▶';
        display: inline-block;
        margin-right: 0.5rem;
        transition: transform 0.2s;
        font-size: 0.8em;
    }
    
    .directory-name.expanded:before {
        transform: rotate(90deg);
    }
    
    .directory-content {
        display: none;
        background: #2c3e50;
    }
    
    .directory-content.expanded {
        display: block;
    }
    
    .generator-item {
        cursor: pointer;
        padding: 0.75rem 1rem;
        color: rgba(255,255,255,0.8);
        display: flex;
        align-items: center;
        font-size: 0.9rem;
        background: #2c3e50;
        border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    
    .generator-item:hover {
        background: rgba(255,255,255,0.1);
        color: white;
    }
    
    .generator-item.active {
        background: #3498db;
        color: white;
    }

    /* 答案輸入相關樣式 */
    .answer-input {
        padding: 8px 12px;
        font-size: 16px;
        border: 2px solid #ddd;
        border-radius: 4px;
        margin-right: 10px;
        width: 200px;
    }

    .check-btn {
        padding: 8px 16px;
        background-color: #2196F3;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    }

    .check-btn:hover {
        background-color: #1976D2;
    }

    .check-btn:disabled {
        background-color: #BDBDBD;
        cursor: not-allowed;
    }

    .explanation {
        margin-top: 20px;
        padding: 15px;
        background-color: #F5F5F5;
        border-radius: 4px;
    }

    /* 選項相關樣式 */
    .options {
        margin: 20px 0;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
    }

    .option {
        display: flex;
        align-items: center;
        padding: 15px;
        border: 2px solid #ddd;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        background: white;
    }

    .option:hover {
        background: #f5f5f5;
        border-color: #bbb;
    }

    .option input[type="radio"] {
        margin-right: 10px;
    }

    .option span {
        font-size: 16px;
    }

    .option.correct {
        background: #E8F5E9;
        border-color: #4CAF50;
    }

    .option.wrong {
        background: #FFEBEE;
        border-color: #F44336;
    }

    /* 下一題按鈕樣式 */
    .next-btn {
        background: #2196F3;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        display: flex;
        align-items: center;
        margin-top: 20px;
    }

    .next-btn:hover {
        background: #1976D2;
    }

    .next-btn .arrow {
        margin-left: 8px;
    }

    /* 解釋區域樣式 */
    .explanation {
        margin-top: 20px;
        padding: 20px;
        background: #F5F5F5;
        border-radius: 8px;
        border-left: 4px solid #2196F3;
    }

    .explanation h4 {
        margin-bottom: 10px;
        color: #333;
    }

    .error-message {
        text-align: center;
        padding: 20px;
        background: #fff3f3;
        border: 1px solid #ffcdd2;
        border-radius: 4px;
        margin: 20px 0;
    }

    .retry-btn {
        background: #f44336;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        margin-top: 10px;
        cursor: pointer;
    }

    .retry-btn:hover {
        background: #d32f2f;
    }

    /* 難度按鈕樣式 */
    .diff-btn {
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .diff-btn:hover {
        transform: scale(1.1);
    }

    .diff-btn.active {
        background: #33ccff;
        color: white;
        border-color: #33ccff;
    }

    /* 載入提示樣式 */
    .loading {
        text-align: center;
        padding: 20px;
        color: #666;
    }

    /* 錯誤提示樣式 */
    .error-message {
        text-align: center;
        padding: 20px;
        background: #fff3f3;
        border: 1px solid #ffcdd2;
        border-radius: 4px;
        margin: 20px 0;
    }
`;
document.head.appendChild(style);

async function startPractice(generatorId, difficulty) {
    try {
        console.log('Starting practice with generator:', generatorId, 'difficulty:', difficulty);
        
        // 显示加载提示，但保持难度按钮
        const questionBox = document.querySelector('.question-box');
        if (questionBox) {
            questionBox.innerHTML = '<div class="loading">載入題目中...</div>';
        }

        // 修改 API 路徑格式：移除副檔名並正確處理路徑分隔符
        const formattedGeneratorId = generatorId
            .replace(/\.ts$/, '')  // 移除 .ts 副檔名
            .replace(/\\/g, '/');  // 將反斜線替換為正斜線
            
        // 提取最後的文件名（不含路徑）
        const generatorName = formattedGeneratorId.split('/').pop();
        
        // 获取生成器信息
        const infoResponse = await fetch(`/api/questions/generator-info/${generatorName}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!infoResponse.ok) {
            throw new Error(`獲取生成器信息失敗: ${infoResponse.status}`);
        }
        
        const infoData = await infoResponse.json();
        // 使用服務器返回的最大難度，不再使用默認值
        const maxDifficulty = infoData.maxDifficulty || infoData.levelNumber;
        
        // 如果當前難度大於最大難度，調整為最大難度
        const adjustedDifficulty = Math.min(parseInt(difficulty), maxDifficulty);
        
        // 生成题目
        const response = await fetch(`/api/questions/generate/${generatorName}?difficulty=${adjustedDifficulty}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`生成題目失敗: ${response.status}`);
        }
        
        const questionData = await response.json();

        // 添加难度信息，使用實際的最大難度
        questionData.maxDifficulty = maxDifficulty;
        questionData.currentDifficulty = adjustedDifficulty;
        
        // 显示题目，第一次加載時傳入 true 以重新生成難度按鈕
        displayQuestion(questionData, true);
        
    } catch (error) {
        console.error('獲取題目失敗:', error);
        
        // 显示错误信息
        const questionArea = document.querySelector('.question-area');
        if (questionArea) {
            // 保留难度选择器
            const difficultySelector = questionArea.querySelector('.difficulty-selector');
            questionArea.innerHTML = '';
            
            if (difficultySelector) {
                questionArea.appendChild(difficultySelector);
            }
            
            // 添加错误信息
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.innerHTML = `
                <p>載入題目失敗</p>
                <p>錯誤信息：${error.message}</p>
                <button onclick="location.reload()" class="retry-btn">重試</button>
            `;
            questionArea.appendChild(errorDiv);
        }
    }
}

function displayQuestion(question, isNewGenerator = true) {
    const questionArea = document.querySelector('.question-area');
    if (!questionArea) return;

    console.log('Displaying question with difficulty:', question.maxDifficulty);

    // 生成問題內容
    const questionBox = document.querySelector('.question-box') || document.createElement('div');
    questionBox.className = 'question-box';
    questionBox.innerHTML = generateQuestionContent(question);

    if (isNewGenerator) {
        // 如果是新的生成器，更新整個區域
        questionArea.innerHTML = '';
        
        // 創建新的難度選擇器，使用生成器的最大難度
        const difficultySelector = document.createElement('div');
        difficultySelector.className = 'difficulty-selector';
        difficultySelector.innerHTML = `
            <span class="difficulty-label">難度：</span>
            <div class="difficulty-buttons">
                ${generateDifficultyButtons(question.maxDifficulty || 5, question.currentDifficulty)}
            </div>
        `;
        questionArea.appendChild(difficultySelector);
        questionArea.appendChild(questionBox);
        attachDifficultyButtonEvents();
    } else {
        // 如果只是切換難度，只更新題目內容
        const oldQuestionBox = document.querySelector('.question-box');
        if (oldQuestionBox) {
            oldQuestionBox.innerHTML = generateQuestionContent(question);
        }
        
        // 更新難度按鈕狀態
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            const btnDifficulty = parseInt(btn.dataset.level);
            btn.classList.toggle('active', btnDifficulty === question.currentDifficulty);
        });
    }

    // 添加選項點擊事件
    attachOptionEvents(question);

    // 確保 MathJax 重新渲染
    if (window.MathJax) {
        MathJax.typesetPromise([questionArea]).catch((err) => {
            console.error('MathJax rendering failed:', err);
        });
    }
}

// 修改 generateQuestionContent 函数
function generateQuestionContent(question) {
    return `
        <div class="question-content">${question.content}</div>
        
        <div class="options">
            ${['A', 'B', 'C', 'D'].map((letter, index) => `
                <div class="option" data-index="${index}">
                    <div class="option-label">${letter}.</div>
                    <div class="option-content">
                        <div class="option-value">${question.options[index]}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// 添加选项点击事件
function attachOptionEvents(question) {
    document.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', () => {
            if (option.classList.contains('disabled')) return;
            
            document.querySelectorAll('.option').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            option.classList.add('selected');
            
            const selectedIndex = parseInt(option.dataset.index);
            
            document.querySelectorAll('.option').forEach(opt => {
                opt.classList.add('disabled');
            });
            
            checkAnswer(question.correctIndex, selectedIndex, question);
        });
    });
}

// 修改播放音效函数，添加静音检查
function playSound(isCorrect) {
    if (isMuted) return; // 如果已静音，直接返回
    
    try {
        const sound = isCorrect ? correctSound : wrongSound;
        if (sound && sound.readyState >= 2) {  // 确保音频已加载
            sound.currentTime = 0;
            const playPromise = sound.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error('播放音效失败:', error);
                });
            }
        } else {
            console.warn('音频未完全加载');
        }
    } catch (error) {
        console.error('播放音效失败:', error);
    }
}

// 修改检查答案函数，添加音效
function checkAnswer(correctIndex, selectedIndex, question) {
    const options = document.querySelectorAll('.option');
    
    // 播放音效
    playSound(selectedIndex === correctIndex);
    
    // 添加正确/错误样式
    options.forEach((option, index) => {
        if (index === correctIndex) {
            option.classList.add('correct');
        } else if (index === selectedIndex && selectedIndex !== correctIndex) {
            option.classList.add('wrong');
        }
    });
    
    // 获取当前题目的解释
    const questionBox = document.querySelector('.question-box');
    if (!questionBox) return;
    
    // 移除已存在的解释区域（如果有）
    const existingExplanation = questionBox.querySelector('.explanation');
    if (existingExplanation) {
        existingExplanation.remove();
    }
    
    // 添加解释区域
    const explanationDiv = document.createElement('div');
    explanationDiv.className = 'explanation active';
    explanationDiv.innerHTML = `
        <h4>解題步驟：</h4>
        <div class="explanation-content">${question.explanation}</div>
        <div class="next-question">
            <button class="next-btn" onclick="nextQuestion()">
                下一題 <span class="arrow">→</span>
            </button>
        </div>
    `;
    
    // 将解释添加到题目框下方
    questionBox.appendChild(explanationDiv);
    
    // 重新渲染 LaTeX
    if (window.MathJax) {
        MathJax.typesetPromise([explanationDiv]).catch((err) => {
            console.error('MathJax rendering failed:', err);
        });
    }
}

// 修改生成難度按鈕的函數
function generateDifficultyButtons(maxDifficulty, currentDifficulty) {
    // 確保最大難度是有效的數字
    const max = parseInt(maxDifficulty) || 5;
    const current = parseInt(currentDifficulty) || 1;
    
    return Array.from({ length: max }, (_, i) => i + 1)
        .map(level => `
            <button class="difficulty-btn ${level === current ? 'active' : ''}" 
                    data-level="${level}">${level}</button>
        `).join('');
}

// 修改難度按鈕事件處理
function attachDifficultyButtonEvents() {
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    
    difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const difficulty = parseInt(button.dataset.level);
            const activeGenerator = document.querySelector('.generator-item.active');
            
            if (activeGenerator && activeGenerator.dataset.path) {
                // 移除所有按鈕的 active 類
                difficultyButtons.forEach(btn => btn.classList.remove('active'));
                // 添加當前按鈕的 active 類
                button.classList.add('active');
                
                startPractice(activeGenerator.dataset.path, difficulty);
            }
        });
    });
}

// 輔助函數：打亂數組順序
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 標準化答案格式
function normalizeAnswer(answer) {
    return answer.replace(/\s+/g, '')  // 移除空格
                 .replace(/\^/g, '')   // 移除 ^ 符號
                 .replace(/\{|\}/g, '') // 移除大括號
                 .toLowerCase();        // 轉為小寫
}

function nextQuestion() {
    const activeGenerator = document.querySelector('.generator-item.active');
    const activeDifficultyBtn = document.querySelector('.difficulty-btn.active');
    const difficulty = activeDifficultyBtn?.dataset.level || '1';
    
    if (activeGenerator) {
        const generatorId = activeGenerator.dataset.path;
        startPractice(generatorId, difficulty).then(() => {
            // 确保在新题目加载后重新设置难度按钮的高亮状态
            document.querySelectorAll('.difficulty-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.level === difficulty);
            });
        });
    }
}

function checkGeneratorExists(topicId) {
    // 檢查完整的主題ID是否存在
    if (AVAILABLE_GENERATORS.includes(topicId)) {
        return true;
    }
    
    // 檢查是否有子主題的生成器
    return AVAILABLE_GENERATORS.some(generator => 
        generator.startsWith(topicId + '.')
    );
}

function setupSidebarResize() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    // 恢復保存的寬度
    if (lastWidth) {
        sidebar.style.width = lastWidth;
        mainContent.style.marginLeft = lastWidth;
    }
    
    // 創建調整手柄
    const handle = document.createElement('div');
    handle.className = 'resize-handle';
    sidebar.appendChild(handle);
    
    // 監聽鼠標事件
    handle.addEventListener('mousedown', initResize);
    
    function initResize(e) {
        isResizing = true;
        handle.classList.add('active');
        document.body.classList.add('resizing');
        
        // 添加鼠標移動和鬆開事件監聽器
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
        
        e.preventDefault();
    }
    
    function resize(e) {
        if (!isResizing) return;
        
        // 計算新寬度
        let newWidth = e.clientX;
        
        // 限制最小和最大寬度
        newWidth = Math.max(200, Math.min(600, newWidth));
        
        // 更新側邊欄和主內容區域
        sidebar.style.width = `${newWidth}px`;
        mainContent.style.marginLeft = `${newWidth}px`;
        
        // 保存寬度到本地存儲
        lastWidth = `${newWidth}px`;
        localStorage.setItem('sidebarWidth', lastWidth);
    }
    
    function stopResize() {
        isResizing = false;
        handle.classList.remove('active');
        document.body.classList.remove('resizing');
        
        // 移除事件監聽器
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
    }
}

// 添加新函數：設置難度按鈕
function setupDifficultyButtons() {
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    
    difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 移除其他按钮的 active 类
            difficultyButtons.forEach(btn => btn.classList.remove('active'));
            // 添加当前按钮的 active 类
            button.classList.add('active');
            
            const difficulty = button.dataset.level;
            const activeGenerator = document.querySelector('.generator-item.active');
            
            if (activeGenerator) {
                const generatorId = activeGenerator.dataset.path;
                startPractice(generatorId, difficulty);
            }
        });
    });
}

// 添加测试函数
function testSounds() {
    console.log('测试正确音效');
    playSound(true);
    
    setTimeout(() => {
        console.log('测试错误音效');
        playSound(false);
    }, 1000);
}

// 在浏览器控制台中运行 testSounds() 来测试 

// 添加静音按钮设置函数
function setupMuteButton() {
    const muteButton = document.getElementById('muteButton');
    const muteIcon = muteButton.querySelector('.mute-icon');
    
    // 从 localStorage 读取静音状态
    isMuted = localStorage.getItem('isMuted') === 'true';
    updateMuteButtonState();
    
    muteButton.addEventListener('click', () => {
        isMuted = !isMuted;
        // 保存静音状态到 localStorage
        localStorage.setItem('isMuted', isMuted);
        updateMuteButtonState();
    });
    
    function updateMuteButtonState() {
        muteIcon.textContent = isMuted ? '🔇' : '🔊';
        muteButton.classList.toggle('muted', isMuted);
        
        // 更新音频元素的静音状态
        if (correctSound) correctSound.muted = isMuted;
        if (wrongSound) wrongSound.muted = isMuted;
    }
} 