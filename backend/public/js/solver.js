document.addEventListener('DOMContentLoaded', async () => {
    // 等待 MathJax 加载完成
    if (!window.MathJax || !window.MathJax.typesetPromise) {
        await new Promise(resolve => {
            document.addEventListener('MathJaxReady', resolve);
        });
    }

    const operationType = document.getElementById('operation-type');
    const difficulty = document.getElementById('difficulty');
    const generateBtn = document.getElementById('generate-btn');
    const solveBtn = document.getElementById('solve-btn');
    const generatedQuestion = document.querySelector('.generated-question');
    const stepsContainer = document.querySelector('.steps-container');
    const equationInput = document.getElementById('equation-input');
    const previewContent = document.querySelector('.preview-content');

    // 添加加載難度信息的函數
    async function loadDifficulties(type) {
        try {
            const response = await fetch(`/api/solver/difficulties/${type}`);
            if (!response.ok) {
                throw new Error('獲取難度信息失敗');
            }

            const difficulties = await response.json();
            
            // 更新難度選擇器
            difficulty.innerHTML = difficulties.map(diff => `
                <option value="${diff.level}">Level ${diff.level} - ${diff.name} [${diff.description}]</option>
            `).join('');

            // 更新提示信息
            const infoText = document.querySelector('.info-text');
            if (infoText) {
                infoText.textContent = `選擇不同難度等級來練習不同類型的${type === 'addition' ? '加法' : ''}題目`;
            }
        } catch (error) {
            console.error('Error:', error);
            alert('加載難度信息失敗：' + error.message);
        }
    }

    // 當運算類型改變時加載相應的難度信息
    operationType.addEventListener('change', () => {
        loadDifficulties(operationType.value);
    });

    // 初始加載難度信息 - 使用當前選中的運算類型
    await loadDifficulties(operationType.value);

    // 修改所有使用 MathJax.typesetPromise 的地方
    async function typesetMath() {
        try {
            await MathJax.typesetPromise();
        } catch (error) {
            console.error('MathJax typeset error:', error);
        }
    }

    generateBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/solver/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: operationType.value,
                    difficulty: parseInt(difficulty.value)
                })
            });

            if (!response.ok) {
                throw new Error('生成失敗');
            }

            const data = await response.json();
            
            // 清空表达式历史
            const expressionHistory = document.querySelector('.expression-history');
            expressionHistory.innerHTML = '';
            
            // 添加初始表达式
            const initialStep = document.createElement('div');
            initialStep.className = 'expression-step';
            initialStep.innerHTML = `<div class="math" data-latex="${data.question}">\\[${data.question}\\]</div>`;
            expressionHistory.appendChild(initialStep);
            
            // 重新渲染数学公式
            await typesetMath();
            
            // 更新表达式属性
            await updateExpressionInfo(data.question);
            
            // 更新生成記錄
            const historyList = document.getElementById('history-list');
            const listItem = document.createElement('li');
            
            // 创建分数容器
            const fractionContainer = document.createElement('div');
            fractionContainer.className = 'fraction-container';
            fractionContainer.innerHTML = `\\[${data.question}\\]`;
            
            // 创建难度标签
            const difficultyLabel = document.createElement('span');
            difficultyLabel.className = `difficulty-label level-${difficulty.value}`;
            difficultyLabel.textContent = `Level ${difficulty.value}`;
            
            // 将元素添加到列表项（先添加分数，后添加标签）
            listItem.appendChild(fractionContainer);
            listItem.appendChild(difficultyLabel);
            
            // 添加点击事件
            listItem.addEventListener('click', async () => {
                const equation = data.question;
                equationInput.value = equation;
                previewContent.innerHTML = `\\[${equation}\\]`;
                
                // 更新表达式属性
                await updateExpressionInfo(equation);
                
                MathJax.typesetPromise();
                solveEquation(equation, operationType.value, difficulty.value);
            });

            // 将新记录添加到列表顶部
            if (historyList.firstChild) {
                historyList.insertBefore(listItem, historyList.firstChild);
            } else {
                historyList.appendChild(listItem);
            }

            // 限制记录数量为10条
            while (historyList.children.length > 10) {
                historyList.removeChild(historyList.lastChild);
            }

            // 重新渲染所有数学公式
            MathJax.typesetPromise();

            // 自动填入求解器输入框并更新预览
            document.getElementById('equation-input').value = data.question;
            previewContent.innerHTML = `\\[${data.question}\\]`;
            MathJax.typesetPromise();

        } catch (error) {
            console.error('Error:', error);
            alert('生成題目失敗：' + error.message);
        }
    });

    solveBtn.addEventListener('click', async () => {
        const equation = document.getElementById('equation-input').value.trim();
        if (!equation) {
            alert('請輸入算式');
            return;
        }
        
        // 如果輸入不是 LaTeX 格式，轉換為 LaTeX 格式
        const latexEquation = equation.startsWith('\\') ? equation : convertToLatex(equation);
        
        // 清空實驗區
        const expressionHistory = document.querySelector('.expression-history');
        expressionHistory.innerHTML = '';
        
        // 添加用戶輸入的公式作為初始表達式
        const initialStep = document.createElement('div');
        initialStep.className = 'expression-step';
        initialStep.innerHTML = `<div class="math" data-latex="${latexEquation}">\\[${latexEquation}\\]</div>`;
        expressionHistory.appendChild(initialStep);
        
        // 重新渲染數學公式並更新表達式屬性
        try {
            await MathJax.typesetPromise();
            await updateExpressionInfo();
            await updateOperationButtons(latexEquation);
        } catch (error) {
            console.error('Error in solve button click:', error);
        }
    });

    document.getElementById('equation-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            solveBtn.click();
        }
    });

    // 添加輸入監聽器來更新預覽
    equationInput.addEventListener('input', async () => {
        const input = equationInput.value.trim();
        const latex = input.startsWith('\\') ? input : convertToLatex(input);
        
        // 更新預覽區域
        previewContent.innerHTML = `\\[${latex}\\]`;
        
        // 等待 MathJax 渲染完成
        if (window.MathJax) {
            try {
                await MathJax.typesetPromise([previewContent]);
            } catch (error) {
                console.error('MathJax rendering error:', error);
            }
        }
    });

    // 添加操作按钮事件处理
    document.querySelectorAll('.op-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const operation = btn.dataset.op;
            const expressionHistory = document.querySelector('.expression-history');
            // 获取实验区最后一个表达式的 LaTeX
            const lastExpression = expressionHistory.lastElementChild?.querySelector('.math');
            const content = lastExpression?.getAttribute('data-latex');
            
            if (!content) {
                alert('請先生成或輸入題目');
                return;
            }

            console.log('Original LaTeX:', content);

            try {
                const requestData = { 
                    latex: content,  // 使用实验区最后一个表达式的 LaTeX
                    operation: operation 
                };
                console.log('Sending request data:', requestData);

                const response = await fetch('/api/solver/process', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestData)
                });

                if (!response.ok) {
                    throw new Error('處理失敗');
                }

                const result = await response.json();
                console.log('Received result:', result);
                
                // 清理 LaTeX 字符串以进行比较
                const cleanContent = content.replace(/\\[[\]]/g, '').trim();
                const cleanResult = result.latex.replace(/\\[[\]]/g, '').trim();
                
                // 如果结果与原表达式相同，不进行更新
                if (cleanContent === cleanResult) {
                    alert('表達式無需更改');
                    return;
                }
                
                // 创建新的表达式步骤
                const stepElement = document.createElement('div');
                stepElement.className = 'expression-step';
                
                // 如果是第一个表达式，不显示操作标签
                if (expressionHistory.children.length === 0) {
                    stepElement.innerHTML = `<div class="math">\\[${content}\\]</div>`;
                    expressionHistory.appendChild(stepElement);
                    
                    // 创建新步骤显示结果
                    const resultStep = document.createElement('div');
                    resultStep.className = 'expression-step';
                    resultStep.innerHTML = `
                        <span class="operation-label">${btn.title}</span>
                        <div class="math" data-latex="${result.latex}">\\[${result.latex}\\]</div>
                    `;
                    expressionHistory.appendChild(resultStep);
                } else {
                    stepElement.innerHTML = `
                        <span class="operation-label">${btn.title}</span>
                        <div class="math" data-latex="${result.latex}">\\[${result.latex}\\]</div>
                    `;
                    expressionHistory.appendChild(stepElement);
                }
                
                // 重新渲染数学公式
                await typesetMath();
                
                // 更新表达式属性和同类项信息
                await updateExpressionInfo();
                
                // 更新操作按钮状态
                await updateOperationButtons(result.latex);

            } catch (error) {
                console.error('Operation Error:', error);
                alert('操作失敗：' + error.message);
            }
        });
    });

    // 更新按鈕狀態
    function updateOperationButtons(latex) {
        document.querySelectorAll('.op-btn').forEach(btn => {
            const operation = btn.dataset.op;
            const isAvailable = checkOperationAvailability(operation, latex);
            btn.disabled = !isAvailable;
            btn.title = isAvailable ? btn.title : '當前表達式不支持此操作';
        });
    }

    // 檢查操作是否可用
    async function checkOperationAvailability(operation, latex) {
        try {
            const response = await fetch('/api/solver/check-operation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ operation, latex })
            });
            
            if (!response.ok) {
                return false;
            }
            
            const { available } = await response.json();
            return available;
        } catch (error) {
            console.error('Error checking operation availability:', error);
            return false;
        }
    }
});

async function solveEquation(equation, type, difficulty) {
    try {
        // 如果输入是 LaTeX 格式，保持原样；如果是普通分数格式，转换为 LaTeX
        const latexEquation = equation.startsWith('\\') ? equation : convertToLatex(equation);
        
        const response = await fetch('/api/solver/solve', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                equation: latexEquation,
                type: type || 'addition',
                difficulty: parseInt(difficulty || '1')
            })
        });

        if (!response.ok) {
            throw new Error('求解失敗');
        }

        const solution = await response.json();
        displaySolution(solution);
    } catch (error) {
        console.error('Error:', error);
        alert('求解失敗：' + error.message);
    }
}

function displaySolution(solution) {
    const stepsContainer = document.querySelector('.steps-container');
    stepsContainer.innerHTML = '';

    solution.steps.forEach((step, index) => {
        const stepElement = document.createElement('div');
        stepElement.className = 'step';
        stepElement.innerHTML = `
            <div class="step-header">
                <span class="step-number">步驟 ${index + 1}</span>
                <span class="step-description">${step.description}</span>
            </div>
            <div class="step-equation">
                <div class="math">\\[${step.operation}\\]</div>
            </div>
            ${step.result ? `<div class="step-result">\\[${step.result}\\]</div>` : ''}
        `;
        stepsContainer.appendChild(stepElement);
    });

    // 重新渲染數學公式
    MathJax.typesetPromise();
}

// 修改 convertToLatex 函数，使其更智能地处理各种输入
function convertToLatex(input) {
    // 移除多餘的空格
    input = input.trim();
    
    // 如果已經是 LaTeX 格式，直接返回
    if (input.includes('\\')) {
        return input;
    }
    
    // 檢查是否是分數格式 (例如: 12/28)
    const fractionMatch = input.match(/^(-?\d+)\/(-?\d+)$/);
    if (fractionMatch) {
        return `\\frac{${fractionMatch[1]}}{${fractionMatch[2]}}`;
    }
    
    // 檢查是否包含變量和指數 (例如: x^2)
    input = input.replace(/([a-zA-Z])(\^?)(\d*)/g, (match, variable, power, exponent) => {
        if (power && exponent) {
            return `${variable}^{${exponent}}`;
        }
        return match;
    });
    
    // 如果是普通數字或表達式，直接返回
    return input;
}

// 類型文字轉換
function getTypeText(type) {
    if (!type) return '-';  // 如果類型為空，返回 '-'
    
    const typeMap = {
        'constant': '常數',
        'numerical': '數值多項式',
        'monomial': '單項式',
        'polynomial': '多項式'
    };
    return typeMap[type] || '-';  // 如果找不到對應的類型，返回 '-'
}

// 更新表達式屬性的函數
async function updateExpressionInfo(latex = null) {
    try {
        // 總是從實驗區獲取最新表達式，忽略傳入的參數
        const expressionHistory = document.querySelector('.expression-history');
        const lastStep = expressionHistory?.lastElementChild;
        if (!lastStep) {
            // 如果實驗區沒有表達式，清空所有屬性
            document.querySelectorAll('.status-value').forEach(el => {
                if (el) el.textContent = '-';
            });
            return;
        }

        const mathElement = lastStep.querySelector('.math');
        const latestExpression = mathElement?.getAttribute('data-latex') || 
                                mathElement?.textContent.trim().replace(/\\[|\[|\\]|\]/g, '');

        if (!latestExpression) {
            throw new Error('找不到表達式');
        }

        console.log('Analyzing latest expression:', latestExpression); // 調試日誌

        const response = await fetch('/api/solver/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                latex: latestExpression
            })
        });

        if (!response.ok) {
            throw new Error('分析失敗');
        }

        const info = await response.json();
        console.log('Expression info:', info); // 調試日誌

        // 使用安全的更新函數
        const safeUpdateElement = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value || '-';  // 如果值為空，顯示 '-'
            } else {
                console.warn(`Element with id '${id}' not found`);  // 添加警告日誌
            }
        };

        // 更新表達式屬性顯示
        safeUpdateElement('expression-type', getTypeText(info.type));
        safeUpdateElement('term-count', info.termCount);
        safeUpdateElement('fraction-count', info.fractionInfo.fractionCount);
        
        // 更新分數相關信息
        safeUpdateElement('fraction-status', info.fractionInfo.hasFraction ? '有' : '無');
        safeUpdateElement('nested-fraction', info.fractionInfo.hasNestedFraction ? '有' : '無');
        safeUpdateElement('nested-level', info.fractionInfo.nestedLevel);
        
        // 更新無理數相關信息
        safeUpdateElement('irrational-status', info.irrationalInfo.hasIrrational ? '有' : '無');
        safeUpdateElement('sqrt-status', info.irrationalInfo.types.hasSquareRoot ? '有' : '無');
        safeUpdateElement('pi-status', info.irrationalInfo.types.hasPi ? '有' : '無');
        safeUpdateElement('e-status', info.irrationalInfo.types.hasE ? '有' : '無');
        
        // 更新變量相關信息
        safeUpdateElement('variable-status', 
            info.variables.hasVariables ? `有 (${info.variables.count}個)` : '無');
        safeUpdateElement('variable-list', 
            info.variables.list.length > 0 ? info.variables.list.join(', ') : '-');

        // 更新同類項信息
        safeUpdateElement('like-terms-status', info.likeTerms.hasLikeTerms ? '有' : '無');
        
        // 顯示同類項組信息
        const groupsText = info.likeTerms.groups.map(group => 
            `${group.variable}: ${group.count}項`
        ).join(', ');
        
        safeUpdateElement('like-terms-groups', groupsText || '-');

        // 更新括號相關信息
        safeUpdateElement('bracket-status', 
            info.bracketInfo.hasBrackets ? '有' : '無');
        safeUpdateElement('bracket-count', 
            info.bracketInfo.hasBrackets ? `${info.bracketInfo.bracketCount}對` : '-');
        safeUpdateElement('expansion-status', 
            info.bracketInfo.needsExpansion ? '需要' : '不需要');
        safeUpdateElement('bracket-terms', 
            info.bracketInfo.bracketTerms.length > 0 ? 
            info.bracketInfo.bracketTerms.join(', ') : '-');

    } catch (error) {
        console.error('Error updating expression info:', error);
        // 清空所有狀態顯示
        document.querySelectorAll('.status-value').forEach(el => {
            if (el) el.textContent = '-';
        });
    }
}

// 在每次操作後更新表達式屬性
async function processOperation(operation) {
    try {
        // 獲取實驗區最新的表達式
        const experimentContent = document.querySelector('.experiment-content');
        const latestExpression = experimentContent.querySelector('.MathJax').getAttribute('data-latex') || 
                                experimentContent.textContent.trim();
        
        const response = await fetch('/api/solver/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                latex: latestExpression,
                operation: operation
            })
        });

        if (!response.ok) {
            throw new Error('操作失敗');
        }

        const result = await response.json();
        
        // 更新實驗區顯示
        await updateExperimentArea(result.latex);
        
        // 更新表達式屬性
        await updateExpressionInfo();
        
    } catch (error) {
        console.error('Operation Error:', error);
        alert('操作失敗：' + error.message);
    }
}

// 更新實驗區的函數
async function updateExperimentArea(latex) {
    // 獲取表達式歷史區域
    const expressionHistory = document.querySelector('.expression-history');
    
    // 創建新的步驟元素
    const stepElement = document.createElement('div');
    stepElement.className = 'expression-step';
    stepElement.innerHTML = `<div class="math" data-latex="${latex}">\\[${latex}\\]</div>`;
    
    // 添加到歷史記錄
    expressionHistory.appendChild(stepElement);
    
    // 等待 MathJax 渲染完成
    if (window.MathJax) {
        await MathJax.typesetPromise([stepElement]);
    }
} 