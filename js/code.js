// code.js
// ✅ Module trung gian: chọn đúng file xử lý mã (local hoặc Firestore)
// ✅ Cung cấp các hàm xử lý mã thưởng dùng chung toàn game

import { USE_OFFLINE } from './config.js'; // ⬅️ cấu hình online/offline

// 🧠 Chọn module logic phù hợp theo cấu hình
const modulePath = USE_OFFLINE ? './code-data-local.js' : './code-data.js';
const codeModule = await import(modulePath);

// 🌐 Export lại các hàm xử lý chính để các module khác dùng chung
export const getCodeInfo = codeModule.getCodeInfo; // → Lấy thông tin mã từ nguồn dữ liệu
export const hasUsedCode = codeModule.hasUsedCode; // → Kiểm tra UID đã dùng mã chưa
export const markCodeUsed = codeModule.markCodeUsed; // → Đánh dấu mã đã được dùng
export const applyReward = codeModule.applyReward; // → Thực thi phần thưởng
export const getCurrentUID = codeModule.getCurrentUID; // → Lấy UID người chơi hiện tại

/**
 * 🎯 Hàm kiểm tra mã thưởng và áp dụng nếu hợp lệ
 * @param {string} code - Mã quà tặng do người dùng nhập
 * @returns {Promise<{ success: boolean, message: string }>} - Kết quả xử lý
 */
export async function validateCodeAndApplyReward(code) {
  if (!code) return { success: false, message: '⚠️ Mã trống' };

  // 🔍 Lấy thông tin mã từ dữ liệu
  const info = getCodeInfo(code);
  if (!info) return { success: false, message: '❌ Mã không tồn tại hoặc sai' };

  if (info.disabled === true) {
    return { success: false, message: '🚫 Mã này đã bị vô hiệu hóa.' };
  }

  // ⌛ Kiểm tra hạn sử dụng
  const now = new Date();
  if (info.expiresAt && new Date(info.expiresAt) < now)
    return { success: false, message: '⏳ Mã đã hết hạn' };

  // 👤 Kiểm tra người dùng đã dùng chưa
  const uid = getCurrentUID();
  if (hasUsedCode(code, uid))
    return { success: false, message: '⚠️ Mã đã dùng rồi' };

  // 🔁 Nếu mã là global, kiểm tra số lượt dùng còn lại
  if (info.type === 'global') {
    if (info.maxUses && info.usedBy && info.usedBy.length >= info.maxUses)
      return { success: false, message: '⚠️ Mã đã hết lượt' };
  }

  // ✅ Đánh dấu mã đã dùng và áp dụng phần thưởng
  markCodeUsed(code, uid);
  console.log('[DEBUG] Reward:', info.reward);
  console.log('[DEBUG] Type của reward.coin:', typeof info.reward.coin);

  applyReward(info.reward);

  return { success: true, message: '🎁 Nhận quà thành công!' };
}
