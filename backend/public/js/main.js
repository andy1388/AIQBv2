// 主要 JavaScript 文件
document.addEventListener('DOMContentLoaded', () => {
    console.log('網站已加載完成');
    
    // 添加導航欄響應式切換
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('nav ul');
    
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
}); 