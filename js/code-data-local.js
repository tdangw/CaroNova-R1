// code-data-local.js
// 📦 Quản lý mã thưởng lưu offline (localStorage)

const STORAGE_KEY = 'adminOfflineCodes';

/**
 * 📥 Lấy toàn bộ mã hiện tại từ localStorage
 */
function getAllCodes() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
}

/**
 * 🔍 Truy vấn mã và trả về thông tin phần thưởng (code viết hoa)
 * @param {string} code
 */
export function getCodeInfo(code) {
  const codes = getAllCodes();
  return codes[code.toUpperCase()] || null;
}

/**
 * 🧠 Kiểm tra người dùng đã dùng mã chưa
 * @param {string} code
 * @param {string} uid
 */
export function hasUsedCode(code, uid) {
  const info = getCodeInfo(code);
  return info?.usedBy?.includes(uid) || false;
}

/**
 * ✅ Đánh dấu mã đã được người dùng sử dụng
 * @param {string} code
 * @param {string} uid
 */
export function markCodeUsed(code, uid) {
  const codes = getAllCodes();
  const upperCode = code.toUpperCase();

  if (!codes[upperCode]) return;

  if (!codes[upperCode].usedBy) codes[upperCode].usedBy = [];
  if (!codes[upperCode].usedBy.includes(uid)) {
    codes[upperCode].usedBy.push(uid);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(codes));
  }
}

/**
 * 🪙 Áp dụng phần thưởng – luôn cộng tiếp vào localStorage (không ghi đè)
 * @param {object} reward
 */
export function applyReward(reward) {
  if (!reward || typeof reward !== 'object') return;

  // 🎯 Cộng coin nếu có
  const rewardCoin = parseInt(reward.coin);
  if (!isNaN(rewardCoin) && rewardCoin > 0) {
    const raw = localStorage.getItem('coin'); // chỉ lấy, không gán mặc định
    const current = parseInt(raw ?? '0', 10); // nếu null thì hiểu là 0

    console.log('[DEBUG] Coin từ localStorage:', raw);
    console.log('[DEBUG] Sau khi parseInt:', current);
    console.log('[DEBUG] Coin nhận từ mã:', rewardCoin);

    const total = current + rewardCoin;
    localStorage.setItem('coin', total); // ghi lại tổng mới

    console.log(`[DEBUG] Cập nhật coin: ${current} + ${rewardCoin} = ${total}`);
  }

  // 🌟 Cộng sao nếu có
  const rewardStars = parseInt(reward.stars);
  if (!isNaN(rewardStars) && rewardStars > 0) {
    const currentStars = parseInt(localStorage.getItem('stars') ?? '0', 10);
    localStorage.setItem('stars', currentStars + rewardStars);
  }

  // 🎨 Mở khóa skin nếu có
  if (reward.skin && typeof reward.skin === 'string') {
    const raw = localStorage.getItem('unlockedSkins') || '[]';
    const skins = JSON.parse(raw);
    if (!skins.includes(reward.skin)) {
      skins.push(reward.skin);
      localStorage.setItem('unlockedSkins', JSON.stringify(skins));
    }
  }
}

/**
 * 🆔 Trả về UID giả định (bản offline không có đăng nhập)
 */
export function getCurrentUID() {
  return 'offline-user';
}
