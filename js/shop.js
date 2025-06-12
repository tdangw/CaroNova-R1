// 📁 shop.js - chỉ giữ logic xử lý inventory và coin
import {
  getCoin,
  spendCoin,
  saveInventory,
  getInventory,
} from './inventory.js';

// Các hàm tiện ích cho các module khác gọi dùng nếu cần
export const ShopLogic = {
  getInventory,
  saveInventory,
  getCoin,
  spendCoin,
};
