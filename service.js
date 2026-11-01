/**
 * service.js
 * 修理羅針盤 - お問い合わせフォーム
 */
document.addEventListener('DOMContentLoaded', () => {

    /* =========================================================
       設定：API エンドポイント
       ========================================================= */
    const API_URL = 'send.php';


    /* =========================================================
       0. URLパラメータによる自動選択
       ========================================================= */
    const urlParams = new URLSearchParams(window.location.search);
    const typeParam = urlParams.get('type');

    const cardConsult   = document.getElementById('cardConsult');
    const cardDocument  = document.getElementById('cardDocument');
    const radioConsult  = document.getElementById('radioConsult');
    const radioDocument = document.getElementById('radioDocument');

    function selectCard(target) {
        if (!cardConsult || !cardDocument) return;

        if (target === 'document') {
            cardDocument.classList.add('selected');
            cardConsult.classList.remove('selected');
            if (radioDocument) radioDocument.checked = true;
            if (radioConsult)  radioConsult.checked  = false;
        } else if (target === 'consult') {
            cardConsult.classList.add('selected');
            cardDocument.classList.remove('selected');
            if (radioConsult)  radioConsult.checked  = true;
            if (radioDocument) radioDocument.checked = false;
        }
    }

    if (typeParam === 'document') {
        selectCard('document');
    } else {
        selectCard('consult');
    }


    /* =========================================================
       1. Card Selection Logic
       ========================================================= */
    const typeCards = document.querySelectorAll('.type-card');

    typeCards.forEach(card => {
        card.addEventListener('click', () => {
            const radio = card.querySelector('input[type="radio"]');
            if (!radio) return;

            typeCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            radio.checked = true;
        });
    });

    if (radioConsult) {
        radioConsult.addEventListener('change', () => {
            if (radioConsult.checked) selectCard('consult');
        });
    }
    if (radioDocument) {
        radioDocument.addEventListener('change', () => {
            if (radioDocument.checked) selectCard('document');
        });
    }


    /* =========================================================
       2. Character Counter Logic
       ========================================================= */
    const textarea = document.querySelector('textarea');
    const charCountDisplay = document.querySelector('.char-count');
    const maxChars = 500;

    if (textarea && charCountDisplay) {
        textarea.addEventListener('input', () => {
            const currentLength = textarea.value.length;
            charCountDisplay.textContent = `${currentLength} / ${maxChars}`;
            charCountDisplay.style.color = (currentLength >= maxChars) ? '#e74c3c' : '#999';
        });
    }


    /* =========================================================
       3. File Upload Logic
       ========================================================= */
    const fileInput         = document.getElementById('fileInput');
    const btnSelectFile     = document.getElementById('btnSelectFile');
    const dropZone          = document.getElementById('dropZone');
    const fileListContainer = document.getElementById('fileList');

    let selectedFiles = [];

    if (btnSelectFile && fileInput) {
        btnSelectFile.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            fileInput.click();
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            handleFiles(e.target.files);
            fileInput.value = '';
        });
    }

    if (dropZone && fileInput) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        dropZone.addEventListener('dragover', () => {
            dropZone.style.borderColor = '#0070c0';
            dropZone.style.background = 'rgba(255, 255, 255, 0.7)';
        });
        dropZone.addEventListener('dragleave', () => {
            dropZone.style.borderColor = 'rgba(0, 112, 192, 0.4)';
            dropZone.style.background = 'rgba(255, 255, 255, 0.4)';
        });

        dropZone.addEventListener('drop', (e) => {
            dropZone.style.borderColor = 'rgba(0, 112, 192, 0.4)';
            dropZone.style.background = 'rgba(255, 255, 255, 0.4)';
            handleFiles(e.dataTransfer.files);
        });
    }

    function handleFiles(files) {
        if (!fileListContainer) return;

        Array.from(files).forEach(file => {
            if (file.size > 10 * 1024 * 1024) {
                alert(`ファイル「${file.name}」は10MBを超えているため追加できません。`);
                return;
            }

            selectedFiles.push(file);

            let iconClass = 'fa-solid fa-file';
            let iconColorClass = '';

            if (file.type.includes('pdf') || file.name.endsWith('.pdf')) {
                iconClass = 'fa-solid fa-file-pdf';
                iconColorClass = 'pdf';
            } else if (file.type.includes('image') || /\.(jpg|jpeg|png)$/i.test(file.name)) {
                iconClass = 'fa-solid fa-file-image';
                iconColorClass = 'img';
            } else if (file.type.includes('sheet') || file.name.endsWith('.xlsx')) {
                iconClass = 'fa-solid fa-file-excel';
                iconColorClass = 'excel';
            } else if (file.type.includes('word') || file.name.endsWith('.docx')) {
                iconClass = 'fa-solid fa-file-word';
                iconColorClass = 'word';
            }

            const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
            const sizeText = sizeInMB > 0.1
                ? `${sizeInMB}MB`
                : `${(file.size / 1024).toFixed(0)}KB`;

            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <i class="${iconClass} file-icon ${iconColorClass}"></i>
                <span class="file-name">${file.name}</span>
                <span class="file-size">${sizeText}</span>
                <button type="button" class="btn-remove"><i class="fa-solid fa-xmark"></i></button>
            `;

            fileItem.querySelector('.btn-remove').addEventListener('click', () => {
                selectedFiles = selectedFiles.filter(f => f !== file);
                fileItem.remove();
            });

            fileListContainer.appendChild(fileItem);
        });
    }


    /* =========================================================
       4. Progress Bar 制御
       ========================================================= */
    const progressBar   = document.getElementById('progressBar');
    const progressSteps = progressBar ? progressBar.querySelectorAll('.progress-step') : [];
    const progressLines = progressBar ? progressBar.querySelectorAll('.progress-line') : [];

    function goToStep(step) {
        if (!progressBar) return;

        progressSteps.forEach((el, index) => {
            const stepNum = index + 1;
            if (stepNum <= step) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });

        progressLines.forEach((line, index) => {
            const lineNum = index + 1;
            if (lineNum < step) {
                line.style.background = 'var(--primary-blue)';
            } else {
                line.style.background = 'rgba(255, 255, 255, 0.5)';
            }
        });
    }

    goToStep(1);


    /* =========================================================
       5. Form Submission & Validation
       ========================================================= */
    const form = document.getElementById('contactForm');
    const submitBtn = document.querySelector('.btn-submit');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // ---- name 属性ベースで取得 ----
            const contactType = form.querySelector('input[name="contact_type"]:checked');
            const name        = form.querySelector('input[name="name"]');
            const furigana    = form.querySelector('input[name="furigana"]');
            const mail        = form.querySelector('input[name="mail"]');
            const phonenumber = form.querySelector('input[name="phonenumber"]');
            const region      = form.querySelector('select[name="region"]');
            const scale       = form.querySelector('select[name="scale"]');
            const message     = form.querySelector('textarea[name="message"]');

            let isValid = true;
            const errors = [];

            if (!contactType)                          { isValid = false; errors.push('お問い合わせの種類'); }
            if (!name || !name.value.trim())           { isValid = false; errors.push('お名前'); }
            if (!furigana || !furigana.value.trim())   { isValid = false; errors.push('ふりがな'); }
            if (!mail || !mail.value.trim())           { isValid = false; errors.push('メールアドレス'); }
            if (!region || !region.value)              { isValid = false; errors.push('お住まいの地域'); }

            if (!isValid) {
                alert('必須項目を入力してください：' + errors.join('、'));
                return;
            }

            // ---- Progress Bar を Step2 へ ----
            goToStep(2);

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '送信中 <i class="fa-solid fa-spinner fa-spin"></i>';
            }

            // ---- FormData を構築 ----
            const formData = new FormData();
            formData.append('contact_type',  contactType.value);
            formData.append('name',          name.value.trim());
            formData.append('furigana',      furigana.value.trim());
            formData.append('mail',          mail.value.trim());
            formData.append('phonenumber',   phonenumber ? phonenumber.value.trim() : '');
            formData.append('region',        region.value);
            formData.append('scale',         scale ? scale.value : '');
            formData.append('message',       message ? message.value : '');

            // ★ 選択済みファイルを追加
            selectedFiles.forEach(file => {
                formData.append('attachments[]', file);
            });

            // ---- API へ送信 ----
            try {
                const res = await fetch(API_URL, {
                    method: 'POST',
                    body: formData
                });

                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }

                const json = await res.json();
                if (!json.success) {
                    throw new Error(json.message || '保存に失敗しました');
                }

                // ---- 成功：Step3 へ → reply.html へ ----
                goToStep(3);

                if (submitBtn) {
                    submitBtn.innerHTML = '送信完了 <i class="fa-solid fa-check"></i>';
                }

                setTimeout(() => {
                    window.location.href = './reply.html';
                }, 900);

            } catch (err) {
                console.error(err);

                // 失敗時は Step1 に戻す
                goToStep(1);
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '確認画面へ進む <i class="fa-solid fa-arrow-right"></i>';
                }

                alert('送信に失敗しました。時間をおいて再度お試しください。\n（' + err.message + '）');
            }
        });
    }

});






/**
 * service.js
 * 修理羅針盤 - お問い合わせフォーム
 * Windows XAMPP Environment
 */
document.addEventListener('DOMContentLoaded', () => {

    /* =========================================================
       設定：API エンドポイント
       ========================================================= */
    const API_URL = '../php/send.php';

    /* =========================================================
       0. URLパラメータによる自動選択
       ========================================================= */
    const urlParams = new URLSearchParams(window.location.search);
    const typeParam = urlParams.get('type');

    const cardConsult   = document.getElementById('cardConsult');
    const cardDocument  = document.getElementById('cardDocument');
    const radioConsult  = document.getElementById('radioConsult');
    const radioDocument = document.getElementById('radioDocument');

    function selectCard(target) {
        if (!cardConsult || !cardDocument) return;

        if (target === 'document') {
            cardDocument.classList.add('selected');
            cardConsult.classList.remove('selected');
            if (radioDocument) radioDocument.checked = true;
            if (radioConsult)  radioConsult.checked  = false;
        } else if (target === 'consult') {
            cardConsult.classList.add('selected');
            cardDocument.classList.remove('selected');
            if (radioConsult)  radioConsult.checked  = true;
            if (radioDocument) radioDocument.checked = false;
        }
    }

    if (typeParam === 'document') {
        selectCard('document');
    } else {
        selectCard('consult');
    }

    /* =========================================================
       1. Card Selection Logic
       ========================================================= */
    const typeCards = document.querySelectorAll('.type-card');

    typeCards.forEach(card => {
        card.addEventListener('click', () => {
            const radio = card.querySelector('input[type="radio"]');
            if (!radio) return;

            typeCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            radio.checked = true;
        });
    });

    if (radioConsult) {
        radioConsult.addEventListener('change', () => {
            if (radioConsult.checked) selectCard('consult');
        });
    }
    if (radioDocument) {
        radioDocument.addEventListener('change', () => {
            if (radioDocument.checked) selectCard('document');
        });
    }

    /* =========================================================
       2. Character Counter Logic
       ========================================================= */
    const textarea = document.querySelector('textarea');
    const charCountDisplay = document.querySelector('.char-count');
    const maxChars = 500;

    if (textarea && charCountDisplay) {
        textarea.addEventListener('input', () => {
            const currentLength = textarea.value.length;
            charCountDisplay.textContent = `${currentLength} / ${maxChars}`;
            charCountDisplay.style.color = (currentLength >= maxChars) ? '#e74c3c' : '#999';
        });
    }

    /* =========================================================
       3. File Upload Logic
       ========================================================= */
    const fileInput         = document.getElementById('fileInput');
    const btnSelectFile     = document.getElementById('btnSelectFile');
    const dropZone          = document.getElementById('dropZone');
    const fileListContainer = document.getElementById('fileList');

    let selectedFiles = [];

    if (btnSelectFile && fileInput) {
        btnSelectFile.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            fileInput.click();
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            handleFiles(e.target.files);
            fileInput.value = '';
        });
    }

    if (dropZone && fileInput) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        dropZone.addEventListener('dragover', () => {
            dropZone.style.borderColor = '#0070c0';
            dropZone.style.background = 'rgba(255, 255, 255, 0.7)';
        });
        dropZone.addEventListener('dragleave', () => {
            dropZone.style.borderColor = 'rgba(0, 112, 192, 0.4)';
            dropZone.style.background = 'rgba(255, 255, 255, 0.4)';
        });

        dropZone.addEventListener('drop', (e) => {
            dropZone.style.borderColor = 'rgba(0, 112, 192, 0.4)';
            dropZone.style.background = 'rgba(255, 255, 255, 0.4)';
            handleFiles(e.dataTransfer.files);
        });
    }

    function handleFiles(files) {
        if (!fileListContainer) return;

        Array.from(files).forEach(file => {
            if (file.size > 10 * 1024 * 1024) {
                alert(`ファイル「${file.name}」は10MBを超えているため追加できません。`);
                return;
            }

            selectedFiles.push(file);

            let iconClass = 'fa-solid fa-file';
            let iconColorClass = '';

            if (file.type.includes('pdf') || file.name.endsWith('.pdf')) {
                iconClass = 'fa-solid fa-file-pdf';
                iconColorClass = 'pdf';
            } else if (file.type.includes('image') || /\.(jpg|jpeg|png)$/i.test(file.name)) {
                iconClass = 'fa-solid fa-file-image';
                iconColorClass = 'img';
            } else if (file.type.includes('sheet') || file.name.endsWith('.xlsx')) {
                iconClass = 'fa-solid fa-file-excel';
                iconColorClass = 'excel';
            } else if (file.type.includes('word') || file.name.endsWith('.docx')) {
                iconClass = 'fa-solid fa-file-word';
                iconColorClass = 'word';
            }

            const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
            const sizeText = sizeInMB > 0.1
                ? `${sizeInMB}MB`
                : `${(file.size / 1024).toFixed(0)}KB`;

            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <i class="${iconClass} file-icon ${iconColorClass}"></i>
                <span class="file-name">${file.name}</span>
                <span class="file-size">${sizeText}</span>
                <button type="button" class="btn-remove"><i class="fa-solid fa-xmark"></i></button>
            `;

            fileItem.querySelector('.btn-remove').addEventListener('click', () => {
                selectedFiles = selectedFiles.filter(f => f !== file);
                fileItem.remove();
            });

            fileListContainer.appendChild(fileItem);
        });
    }

    /* =========================================================
       4. Progress Bar 制御
       ========================================================= */
    const progressBar   = document.getElementById('progressBar');
    const progressSteps = progressBar ? progressBar.querySelectorAll('.progress-step') : [];
    const progressLines = progressBar ? progressBar.querySelectorAll('.progress-line') : [];

    function goToStep(step) {
        if (!progressBar) return;

        progressSteps.forEach((el, index) => {
            const stepNum = index + 1;
            if (stepNum <= step) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });

        progressLines.forEach((line, index) => {
            const lineNum = index + 1;
            if (lineNum < step) {
                line.style.background = 'var(--primary-blue)';
            } else {
                line.style.background = 'rgba(255, 255, 255, 0.5)';
            }
        });
    }

    goToStep(1);

    /* =========================================================
       5. Form Submission & Validation
       ========================================================= */
    const form = document.getElementById('contactForm');
    const submitBtn = document.querySelector('.btn-submit');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            console.log('=== Form Submit Started ===');

            const contactType = form.querySelector('input[name="contact_type"]:checked');
            const name        = form.querySelector('input[name="name"]');
            const furigana    = form.querySelector('input[name="furigana"]');
            const mail        = form.querySelector('input[name="mail"]');
            const phonenumber = form.querySelector('input[name="phonenumber"]');
            const region      = form.querySelector('select[name="region"]');
            const scale       = form.querySelector('select[name="scale"]');
            const message     = form.querySelector('textarea[name="message"]');

            let isValid = true;
            const errors = [];

            if (!contactType)                          { isValid = false; errors.push('お問い合わせの種類'); }
            if (!name || !name.value.trim())           { isValid = false; errors.push('お名前'); }
            if (!furigana || !furigana.value.trim())   { isValid = false; errors.push('ふりがな'); }
            if (!mail || !mail.value.trim())           { isValid = false; errors.push('メールアドレス'); }
            if (!region || !region.value)              { isValid = false; errors.push('お住まいの地域'); }

            if (!isValid) {
                alert('必須項目を入力してください：' + errors.join('、'));
                return;
            }

            console.log('Validation OK');

            goToStep(2);

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '送信中 <i class="fa-solid fa-spinner fa-spin"></i>';
            }

            const formData = new FormData();
            formData.append('contact_type',  contactType.value);
            formData.append('name',          name.value.trim());
            formData.append('furigana',      furigana.value.trim());
            formData.append('mail',          mail.value.trim());
            formData.append('phonenumber',   phonenumber ? phonenumber.value.trim() : '');
            formData.append('region',        region.value);
            formData.append('scale',         scale ? scale.value : '');
            formData.append('message',       message ? message.value : '');

            selectedFiles.forEach(file => {
                formData.append('attachments[]', file);
            });

            console.log('Sending to:', API_URL);

            try {
                const res = await fetch(API_URL, {
                    method: 'POST',
                    body: formData
                });

                console.log('Response Status:', res.status);

                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }

                const json = await res.json();
                console.log('Response JSON:', json);

                if (!json.success) {
                    throw new Error(json.message || '保存に失敗しました');
                }

                console.log('=== Success! Redirecting to reply.html ===');

                goToStep(3);

                if (submitBtn) {
                    submitBtn.innerHTML = '送信完了 <i class="fa-solid fa-check"></i>';
                }

                window.location.href = './reply.html';

            } catch (err) {
                console.error('=== ERROR ===');
                console.error(err);

                goToStep(1);
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '確認画面へ進む <i class="fa-solid fa-arrow-right"></i>';
                }

                alert('送信に失敗しました。時間をおいて再度お試しください。\n（' + err.message + '）');
            }
        });
    }

});