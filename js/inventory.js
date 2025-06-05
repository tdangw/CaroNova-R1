// 📁 inventory.js - Quản lý bộ sưu tập người chơi và AI (mở rộng nhiều loại item)
import { SKINS } from './skins.js';
import { EFFECTS } from './effect.js';

const INVENTORY_KEY = 'inventory';
const ACTIVE_SKIN_KEY = 'activeSkin';
const AI_SKIN_KEY = 'aiSkin';
const COIN_KEY = 'coin';

const ALL_ITEMS = [...SKINS, ...EFFECTS];
const AI_SELECTED_ITEMS = {};

const CATEGORIES = {
  skin: 'Skin X/O',
  avatar: 'Avatar',
  border: 'Border',
  winfx: 'Effect',
  emote: 'Emote',
};

let currentEffectSubTab = 'move-effect'; // move-effect | win-effect

export function getInventory() {
  return JSON.parse(localStorage.getItem(INVENTORY_KEY) || '[]');
}
export function saveInventory(inventory) {
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
}
export function ownsItem(id) {
  return getInventory().includes(id);
}

export function getActiveSkin() {
  return localStorage.getItem(ACTIVE_SKIN_KEY) || 'default';
}
export function setActiveSkin(id) {
  localStorage.setItem(ACTIVE_SKIN_KEY, id);
  if (typeof window.updateBoardIcons === 'function') window.updateBoardIcons();
}

export function getAISkin() {
  return localStorage.getItem(AI_SKIN_KEY) || 'ai-default';
}
export function setAISkin(id) {
  localStorage.setItem(AI_SKIN_KEY, id);
  if (typeof window.updateBoardIcons === 'function') window.updateBoardIcons();
}

export function getCoin() {
  return parseInt(localStorage.getItem(COIN_KEY) || '10000');
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

export function getSelectedItem(type) {
  const selected = JSON.parse(localStorage.getItem('selectedItems') || '{}');
  return selected[type] || null;
}
export function setSelectedItem(type, id) {
  const selected = JSON.parse(localStorage.getItem('selectedItems') || '{}');
  selected[type] = id;
  localStorage.setItem('selectedItems', JSON.stringify(selected));
}

export function setAISelectedItem(type, id) {
  AI_SELECTED_ITEMS[type] = id;
}
export function getAISelectedItem(type) {
  if (type === 'skin') return getAISkin();
  return AI_SELECTED_ITEMS[type] || getDefaultAIItem(type);
}

function getDefaultAIItem(type) {
  const list = ALL_ITEMS.filter((i) =>
    type === 'winfx'
      ? i.type === 'win-effect' || i.type === 'move-effect'
      : i.type === type
  );
  return list.length > 0 ? list[0].id : null;
}

export function openInventory(currentTab = 'skin') {
  const popup = document.getElementById('inventory-popup');
  popup.innerHTML = `
    <button class="inventory-close-btn" onclick="document.getElementById('inventory-popup').style.display='none'">✖</button>
    <div class="overlay-box inventory-box">
      <h3>🎒 Bộ sưu tập của Bạn</h3>
      <div class="inventory-tabs">
        ${Object.entries(CATEGORIES)
          .map(
            ([key, label]) =>
              `<button class="inv-tab-btn ${
                key === currentTab ? 'active' : ''
              }" data-tab="${key}">${label}</button>`
          )
          .join('')}
      </div>
      ${
        currentTab === 'winfx'
          ? `<div class="inventory-subtabs" style="margin:8px 0;">
              <button class="inv-subtab-btn" data-subtab="move-effect" ${
                currentEffectSubTab === 'move-effect'
                  ? 'style="background:#0f0;color:black;"'
                  : ''
              }>Hiệu ứng di chuyển</button>
              <button class="inv-subtab-btn" data-subtab="win-effect" ${
                currentEffectSubTab === 'win-effect'
                  ? 'style="background:#0f0;color:black;"'
                  : ''
              }>Hiệu ứng chiến thắng</button>
            </div>`
          : ''
      }
      <div id="inventory-list" class="inventory-list"></div>
      <div style="text-align:center;margin-top:12px;">
        <button onclick="document.getElementById('inventory-popup').style.display='none'">Đóng</button>
      </div>
    </div>
  `;
  renderInventoryItems(currentTab, false);

  document.querySelectorAll('.inv-tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => openInventory(btn.dataset.tab));
  });

  document.querySelectorAll('.inv-subtab-btn')?.forEach((btn) => {
    btn.addEventListener('click', () => {
      currentEffectSubTab = btn.dataset.subtab;
      openInventory('winfx');
    });
  });

  popup.style.display = 'block';
}

export function openAIInventory(currentTab = 'skin') {
  const popup = document.getElementById('inventory-popup');
  popup.innerHTML = `
    <button class="inventory-close-btn" onclick="document.getElementById('inventory-popup').style.display='none'">✖</button>
    <div class="overlay-box inventory-box">
      <h3>🤖 Bộ sưu tập của <span style="color:#ffcc00;">AI</span></h3>
      <div class="inventory-tabs">
        ${Object.entries(CATEGORIES)
          .map(
            ([key, label]) =>
              `<button class="inv-tab-btn ${
                key === currentTab ? 'active' : ''
              }" data-tab="${key}">${label}</button>`
          )
          .join('')}
      </div>
      ${
        currentTab === 'winfx'
          ? `<div class="inventory-subtabs" style="margin:8px 0;">
              <button class="inv-subtab-btn" data-subtab="move-effect" ${
                currentEffectSubTab === 'move-effect'
                  ? 'style="background:#0f0;color:black;"'
                  : ''
              }>Hiệu ứng di chuyển</button>
              <button class="inv-subtab-btn" data-subtab="win-effect" ${
                currentEffectSubTab === 'win-effect'
                  ? 'style="background:#0f0;color:black;"'
                  : ''
              }>Hiệu ứng chiến thắng</button>
            </div>`
          : ''
      }
      <div id="inventory-list" class="inventory-list"></div>
      <div style="text-align:center;margin-top:12px;">
        <button onclick="document.getElementById('inventory-popup').style.display='none'">Đóng</button>
      </div>
    </div>
  `;
  renderInventoryItems(currentTab, true);

  document.querySelectorAll('.inv-tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => openAIInventory(btn.dataset.tab));
  });

  document.querySelectorAll('.inv-subtab-btn')?.forEach((btn) => {
    btn.addEventListener('click', () => {
      currentEffectSubTab = btn.dataset.subtab;
      openAIInventory('winfx');
    });
  });

  popup.style.display = 'block';
}

function renderInventoryItems(tabKey, isAI = false) {
  const list = document.getElementById('inventory-list');
  list.innerHTML = '';

  const inventory = isAI ? ALL_ITEMS.map((i) => i.id) : getInventory();

  const items = ALL_ITEMS.filter(
    (i) =>
      (tabKey === 'winfx'
        ? i.type === currentEffectSubTab
        : i.type === tabKey) && inventory.includes(i.id)
  );

  if (items.length === 0) {
    list.innerHTML =
      '<p class="empty-msg">(Chưa có vật phẩm nào thuộc nhóm này)</p>';
    return;
  }

  items.forEach((item) => {
    const current =
      item.type === 'skin'
        ? isAI
          ? getAISkin()
          : getActiveSkin()
        : isAI
        ? getAISelectedItem(item.type)
        : getSelectedItem(item.type);

    const div = document.createElement('div');
    div.className = 'inventory-item';

    div.innerHTML = `
      <div class="effect-preview-box">
        <span class="preview-icon">${item.icon}</span>
      </div>
      <div class="skin-name">${item.name}</div>
      ${getRarityLabel(item.rarity)}
      <button ${item.id === current ? 'disabled' : ''}>
        ${item.id === current ? 'Đang dùng' : 'Dùng'}
      </button>
    `;

    // Nếu là hiệu ứng (winfx), kích hoạt hiệu ứng động khi hover
    const preview = div.querySelector('.preview-icon');
    if (preview && tabKey === 'winfx' && item.class) {
      div.addEventListener('mouseenter', () =>
        preview.classList.add(item.class)
      );
      div.addEventListener('mouseleave', () =>
        preview.classList.remove(item.class)
      );
    }

    div.querySelector('button').addEventListener('click', () => {
      if (item.type === 'skin') {
        isAI ? setAISkin(item.id) : setActiveSkin(item.id);
      } else {
        isAI
          ? setAISelectedItem(item.type, item.id)
          : setSelectedItem(item.type, item.id);
      }
      isAI ? openAIInventory(tabKey) : openInventory(tabKey);
    });

    list.appendChild(div);
  });
}

function getRarityLabel(rarity) {
  if (rarity === 'legendary')
    return '<div class="rarity-label legendary">Huyền thoại</div>';
  if (rarity === 'rare') return '<div class="rarity-label rare">Hiếm</div>';
  return '';
}
