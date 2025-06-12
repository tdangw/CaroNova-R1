// Tạo popup nhập mã bằng JS – gắn vào index.html bằng 1 icon duy nhất

export function showCodePopup() {
  if (document.getElementById('code-popup')) return;

  const overlay = document.createElement('div');
  overlay.id = 'code-popup';
  overlay.className = 'code-popup'; // dùng đúng class CSS đã scoped

  overlay.innerHTML = `
    <div class="popup-box">
      <h2>🎁 Nhập Mã Quà Tặng</h2>
      <input id="code-input" type="text" placeholder="Nhập mã..." maxlength="30" />
      <button id="submit-code">Nhận quà</button>
      <p id="code-message" class="code-msg"></p>
      <button id="close-code-popup">Đóng</button>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById('submit-code').onclick = async () => {
    const input = document.getElementById('code-input');
    const message = document.getElementById('code-message');
    const code = input.value.trim().toUpperCase();
    if (!code) return (message.textContent = '⚠️ Vui lòng nhập mã');

    const { validateCodeAndApplyReward } = await import('./code.js');

    // Log giá trị coin trước khi nhập mã
    const coinBefore = parseInt(localStorage.getItem('coin') || '0', 10);
    console.log('[DEBUG] Xu trước khi nhập mã:', coinBefore);

    // Thực hiện nhập mã
    const result = await validateCodeAndApplyReward(code);

    // Log lại giá trị coin sau khi nhập mã
    const coinAfter = parseInt(localStorage.getItem('coin') || '0', 10);
    console.log('[DEBUG] Xu sau khi nhập mã:', coinAfter);
    console.log('[DEBUG] Số Xu thay đổi:', coinAfter - coinBefore);

    message.textContent = result.message;
    message.style.color = result.success ? 'green' : 'crimson';
  };

  document.getElementById('close-code-popup').onclick = () => {
    overlay.remove();
  };
}
