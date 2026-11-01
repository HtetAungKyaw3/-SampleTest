document.addEventListener('DOMContentLoaded', () => {
    
    const returnButton = document.querySelector('.btn-return');

    if (returnButton) {
        returnButton.addEventListener('click', () => {
            console.log('トップページへ戻るボタンがクリックされました。');
            returnButton.style.opacity = '0.8';
            setTimeout(() => {
                returnButton.style.opacity = '1';
            }, 200);
        });
    }

    const elements = ['.icon-circle', '.title', '.text-content', '.mail-icon', '.footer-text', '.btn-return'];
    
    elements.forEach((selector, index) => {
        const el = document.querySelector(selector);
        if (el) {
            el.style.opacity = '0';
            el.style.animation = `fadeIn 0.6s ease-out forwards`;
            el.style.animationDelay = `${index * 0.1}s`;
        }
    });
});