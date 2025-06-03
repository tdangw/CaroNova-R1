// inventory-ui.js - Gộp toàn bộ xử lý UI và logic Inventory
import { SKINS } from './skins.js';

// ===================== INVENTORY STORAGE =====================
const INVENTORY_KEY = 'inventory';
const ACTIVE_SKIN_KEY = 'activeSkin';
const AI_SKIN_KEY = 'aiSkin';
const COIN_KEY = 'coin';

export function getInventory() {
  return JSON.parse(localStorage.getItem(INVENTORY_KEY) || '[]');
}

export function saveInventory(inventory) {
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
}

export function ownsSkin(id) {
  return getInventory().includes(id);
}

export function getActiveSkin() {
  return localStorage.getItem(ACTIVE_SKIN_KEY) || 'default';
}

export function setActiveSkin(id) {
  localStorage.setItem(ACTIVE_SKIN_KEY, id);
  if (typeof window.updateBoardIcons === 'function') {
    window.updateBoardIcons();
  }
}

export function getAISkin() {
  return localStorage.getItem(AI_SKIN_KEY) || 'ai-default';
}

export function setAISkin(id) {
  localStorage.setItem(AI_SKIN_KEY, id);
  if (typeof window.updateBoardIcons === 'function') {
    window.updateBoardIcons();
  }
}
// ===================== COIN STORAGE =====================
//10k Xu để test
export function getCoin() {
  return parseInt(localStorage.getItem(COIN_KEY) || '10000', 10);
}

export function addCoin(amount) {
  localStorage.setItem(COIN_KEY, getCoin() + amount);
}

export function spendCoin(amount) {
  const current = getCoin();
  if (current >= amount) {
    localStorage.setItem(COIN_KEY, current - amount);
    return true;
  }
  return false;
}

// ===================== INVENTORY UI =====================
export function openInventory() {
  const popup = document.getElementById('inventory-popup');
  const list = document.getElementById('inventory-list');
  list.innerHTML = '';

  const inventory = getInventory();
  const active = getActiveSkin();

  inventory.forEach((id) => {
    const skin = SKINS.find((s) => s.id === id);
    const item = document.createElement('div');
    item.className = 'inventory-item';
    item.innerHTML = `
      <div class="skin-icon">${skin.icon}</div>
      <div class="skin-name">${skin.name}</div>
      <button ${id === active ? 'disabled' : ''}>${
      id === active ? 'Đang dùng' : 'Dùng'
    }</button>
    `;

    item.querySelector('button').addEventListener('click', () => {
      setActiveSkin(id);
      openInventory();
    });

    list.appendChild(item);
  });
  document.querySelector('#inventory-popup h3').innerHTML =
    '🎒 Bộ sưu tập của Bạn';

  popup.style.display = 'block';
}
// ===================== AI INVENTORY =====================
// Hàm mở kho AI
export function openAIInventory() {
  const popup = document.getElementById('inventory-popup');
  const list = document.getElementById('inventory-list');
  list.innerHTML = '';

  const current = getAISkin();

  SKINS.forEach((skin) => {
    const item = document.createElement('div');
    item.className = 'inventory-item';
    item.innerHTML = `
      <div class="skin-icon">${skin.icon}</div>
      <div class="skin-name">${skin.name}</div>
      <button ${skin.id === current ? 'disabled' : ''}>${
      skin.id === current ? 'Đang dùng' : 'Dùng'
    }</button>
    `;

    item.querySelector('button').addEventListener('click', () => {
      setAISkin(skin.id);
      openAIInventory();
    });

    list.appendChild(item);
  });
  document.querySelector('#inventory-popup h3').innerHTML =
    '🤖 Bộ sưu tập của <span style="color:#ffcc00;">AI</span>';

  popup.style.display = 'block';
}

// ===================== GẮN SỰ KIỆN NÚT =====================
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('inventory-btn');
  if (btn) btn.addEventListener('click', openInventory);
});
// Gắn sự kiện nút mở kho AI
const aiBtn = document.getElementById('ai-inventory-btn');
if (aiBtn) aiBtn.addEventListener('click', openAIInventory);
