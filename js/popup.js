// popup.js – module hiển thị popup overlay dùng chung

export function showPopup({
  title = '',
  message = '',
  confirmText = 'OK',
  cancelText = '',
  onConfirm = null,
  onCancel = null,
  autoClose = 0,
  type = 'info', // future use: 'success', 'error', 'warning'
}) {
  const overlay = document.createElement('div');
  overlay.className = 'popup-overlay';

  const box = document.createElement('div');
  box.className = 'popup-box';
  box.setAttribute('data-type', type); // Đổi type để có thể tùy chỉnh kiểu hiển thị
  box.className = 'popup-box';
  box.innerHTML = `
    <h2>${title}</h2>
    <p>${message}</p>
    <div class="popup-actions"></div>
  `;

  const actions = box.querySelector('.popup-actions');

  // Nút Hủy (nếu có)
  if (cancelText) {
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'popup-btn cancel-btn';
    cancelBtn.textContent = cancelText;
    cancelBtn.onclick = () => {
      closePopup();
      if (onCancel) onCancel();
    };
    actions.appendChild(cancelBtn);
  }

  // Nút OK (chỉ thêm nếu không autoClose)
  if (autoClose <= 0) {
    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'popup-btn confirm-btn';
    confirmBtn.textContent = confirmText;
    confirmBtn.onclick = () => {
      closePopup();
      if (onConfirm) onConfirm();
    };
    actions.appendChild(confirmBtn);
  }

  // Thêm vào DOM
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  // Fade in
  setTimeout(() => overlay.classList.add('visible'), 10);

  function closePopup() {
    overlay.classList.remove('visible');
    setTimeout(() => overlay.remove(), 300);
  }

  if (autoClose > 0) {
    setTimeout(() => {
      closePopup();
      if (onConfirm) onConfirm();
    }, autoClose);
  }
}
