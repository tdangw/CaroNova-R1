// ✅ admin-code.js (hoàn chỉnh) – Quản lý mã quà tặng offline
import { USE_OFFLINE } from './config.js';
import { showPopup } from './popup.js';

const form = document.getElementById('code-form');
const tableBody = document.getElementById('code-list-body');
const overlay = document.getElementById('code-form-overlay');
const openBtn = document.getElementById('btn-add-code');
const closeBtn = document.getElementById('close-form');
const searchInput = document.getElementById('search-input');
const statusFilter = document.getElementById('status-filter');

openBtn.onclick = () => overlay.classList.remove('hidden');
closeBtn.onclick = () => overlay.classList.add('hidden');

function generateRandomSegment(length = 4) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

function generateCode(prefix = '', length = 12) {
  const remain = Math.max(length - prefix.length, 0);
  const core = Array.from({ length: remain }, () =>
    generateRandomSegment(1)
  ).join('');
  return prefix + core; // Trả về mã hoàn chỉnh
}

function getAllCodes() {
  return JSON.parse(localStorage.getItem('adminOfflineCodes') || '{}');
}

function saveAllCodes(codes) {
  localStorage.setItem('adminOfflineCodes', JSON.stringify(codes));
}

function renderCodeTable(codesList) {
  tableBody.innerHTML = '';

  codesList.forEach(({ code, data }, idx) => {
    const isExpired = data.expiresAt && new Date(data.expiresAt) < new Date();
    const isDisabled = data.disabled === true;

    let statusClass = 'active';
    let statusText = 'Hoạt động';

    if (isExpired) {
      statusClass = 'expired';
      statusText = 'Hết hạn';
    } else if (isDisabled) {
      statusClass = 'inactive';
      statusText = 'Không hoạt động';
    }

    const createdAt = data.createdAt
      ? new Date(data.createdAt).toLocaleString('vi-VN')
      : '--';

    const expires = data.expiresAt
      ? new Date(data.expiresAt).toLocaleString('vi-VN')
      : '--';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td><strong>${code}</strong></td>
      <td><code>${JSON.stringify(data.reward)}</code></td>
      <td>${data.type}</td>
      <td>${data.maxUses || '∞'}</td>
      <td>${createdAt}</td>
      <td>${expires}</td>
      <td>
        <span class="status-label ${statusClass}">${statusText}</span>
      </td>
      <td>
        <button class="toggle-status-btn" data-code="${code}">
          ${isDisabled ? 'Bật' : 'Tắt'}
        </button>
        <button class="delete-btn" data-code="${code}">Xoá</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  // Sự kiện xoá mã
  document.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.onclick = () => {
      const code = btn.dataset.code;
      const codes = getAllCodes();
      delete codes[code];
      saveAllCodes(codes);
      filterCodes();
    };
  });

  // Sự kiện bật/tắt trạng thái mã
  document.querySelectorAll('.toggle-status-btn').forEach((btn) => {
    btn.onclick = () => {
      const code = btn.dataset.code;
      const codes = getAllCodes();
      if (codes[code]) {
        codes[code].disabled = !codes[code].disabled;
        saveAllCodes(codes);
        filterCodes();
      }
    };
  });
}

function filterCodes() {
  const keyword = searchInput.value.trim().toLowerCase();
  const status = statusFilter.value;
  const all = getAllCodes();
  const result = [];

  Object.entries(all).forEach(([code, data]) => {
    const isExpired = data.expiresAt && new Date(data.expiresAt) < new Date();
    const isDisabled = data.disabled === true;
    const matchStatus =
      status === '' ||
      (status === 'active' && !isExpired && !isDisabled) ||
      (status === 'inactive' && isDisabled) ||
      (status === 'expired' && isExpired);

    const rewardText = JSON.stringify(data.reward).toLowerCase();
    const codeText = code.toLowerCase();
    const matchText =
      codeText.includes(keyword) || rewardText.includes(keyword);

    if (matchStatus && matchText) result.push({ code, data });
  });

  renderCodeTable(result);
}

searchInput.oninput = () => setTimeout(filterCodes, 200);
statusFilter.onchange = filterCodes;

form.onsubmit = (e) => {
  e.preventDefault();
  const prefix = document.getElementById('code-input').value.trim();
  const amount = Math.min(
    Number(document.getElementById('code-amount').value) || 1,
    100
  );
  const type = document.getElementById('type-select').value;
  const maxUses = Number(document.getElementById('max-uses').value);
  const expiresAt = document.getElementById('expires-at').value;
  const length = Math.max(
    6,
    Math.min(16, Number(document.getElementById('code-length')?.value || 12))
  );

  let reward;
  try {
    reward = JSON.parse(document.getElementById('reward-json').value);
    if (typeof reward.coin === 'string') reward.coin = parseInt(reward.coin);
    if (reward.coin <= 0 || isNaN(reward.coin)) throw 'Coin phải > 0';
  } catch {
    showPopup({ title: '⚠️ Lỗi', message: 'Phần thưởng không hợp lệ!' });
    return;
  }

  const all = getAllCodes();
  const created = [];

  for (let i = 0; i < amount; i++) {
    const code = generateCode(prefix, length);
    all[code] = {
      reward,
      type,
      usedBy: [],
      createdAt: new Date().toISOString(),
      ...(expiresAt && { expiresAt: new Date(expiresAt).toISOString() }),
      ...(type === 'global' && { maxUses: maxUses || 1000 }),
    };
    created.push(code);
  }

  saveAllCodes(all);
  showPopup({
    title: 'Thông báo',
    message: `Đã tạo ${created.length} mã`,
    autoClose: 500,
  });
  form.reset();
  overlay.classList.add('hidden');
  filterCodes();
};

if (USE_OFFLINE) filterCodes();

const rewardList = {};
const rewardTypeEl = document.getElementById('reward-type');
const rewardValueEl = document.getElementById('reward-value');
const rewardSkinEl = document.getElementById('reward-skin');
const rewardListEl = document.getElementById('reward-list');
const rewardJsonEl = document.getElementById('reward-json');

rewardTypeEl.onchange = () => {
  const type = rewardTypeEl.value;
  rewardValueEl.style.display = type === 'skin' ? 'none' : 'inline-block';
  rewardSkinEl.style.display = type === 'skin' ? 'inline-block' : 'none';
  updateRewardFromInput();
};

rewardValueEl.oninput = updateRewardFromInput;
rewardSkinEl.onchange = updateRewardFromInput;

function updateRewardFromInput() {
  const type = rewardTypeEl.value;
  let value;

  if (type === 'skin') {
    value = rewardSkinEl.value;
    if (value) rewardList[type] = value;
    else delete rewardList[type];
  } else {
    value = parseInt(rewardValueEl.value, 10); // Luôn luôn chỉ định radix = 10
    if (!isNaN(value) && value > 0) rewardList[type] = value;
    else delete rewardList[type];
  }

  rewardJsonEl.value = JSON.stringify(rewardList);
  updateRewardListUI();
}

function updateRewardListUI() {
  rewardListEl.innerHTML = '';
  Object.entries(rewardList).forEach(([type, value]) => {
    const li = document.createElement('li');
    li.textContent = `${type} → ${value}`;
    rewardListEl.appendChild(li);
  });
}
// Kiểm tra tình trạng mã thưởng
// Nút mở popup
document.getElementById('btn-check-status').onclick = () => {
  document.getElementById('check-code-popup').classList.remove('hidden');
  document.getElementById('check-code-input').value = '';
  document.getElementById('check-code-result').innerHTML = '';
};

// Nút đóng popup
document.querySelector('.popup-close-btn').onclick = () => {
  document.getElementById('check-code-popup').classList.add('hidden');
};

// Sự kiện kiểm tra mã khi nhập xong
document.getElementById('check-code-input').oninput = () => {
  const code = document
    .getElementById('check-code-input')
    .value.trim()
    .toUpperCase();
  const all = JSON.parse(localStorage.getItem('adminOfflineCodes') || '{}');
  const info = all[code];
  const resultEl = document.getElementById('check-code-result');

  if (!code) return (resultEl.innerHTML = '');

  if (!info) {
    resultEl.innerHTML = `<span style="color:salmon">❌ Mã không tồn tại</span>`;
    return;
  }

  const usedBy = info.usedBy?.length || 0;
  const usedList = info.usedBy?.join(', ') || '--';

  const now = Date.now();
  const isDisabled = info.disabled === true;
  const isExpired = info.expiresAt && now > new Date(info.expiresAt).getTime();

  let status = 'Đang hoạt động';
  let color = 'lightgreen';
  if (isDisabled) {
    status = 'Không hoạt động';
    color = 'salmon';
  } else if (isExpired) {
    status = 'Hết hạn';
    color = 'orange';
  }

  resultEl.innerHTML = `
  <p><strong>📌 Trạng thái:</strong> <span style="color:${color}">${status}</span></p>
  <p><strong>🎁 Phần thưởng:</strong> ${JSON.stringify(info.reward)}</p>
  <p><strong>🔁 Đã dùng:</strong> ${usedBy} lượt</p>
  <p><strong>⏳ Hạn:</strong> ${
    info.expiresAt ? new Date(info.expiresAt).toLocaleString('vi-VN') : '--'
  }</p>
  <p><strong>👤 Người dùng (sau này):</strong> ${usedList}</p>
`;
};
