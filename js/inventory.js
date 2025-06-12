// 📁 inventory.js - Quản lý bộ sưu tập người chơi và AI (mở rộng nhiều loại item)
import { SKINS } from './skins.js';
import { EFFECTS } from './effect.js';

const LOCKER_KEY = 'locker';
// Lưu ý: LOCKER_KEY là khóa để lưu trữ bộ sưu tập quà tặng trong localStorage
function getLocker() {
  return JSON.parse(localStorage.getItem(LOCKER_KEY) || '["gift-10coin"]');
}
function saveLocker(locker) {
  localStorage.setItem(LOCKER_KEY, JSON.stringify(locker));
}

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
  locker: 'Locker', // 🆕Tính năng mới bổ sung
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
  return selected[type] || 'default';
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

// 🔧 Quản lý số lượng ô locker đã mở (mặc định là 4)
function getUnlockedCount() {
  return parseInt(localStorage.getItem('lockerUnlockedCount') || '4');
}

function increaseUnlockedCount() {
  const count = getUnlockedCount();
  localStorage.setItem('lockerUnlockedCount', count + 1);
}

export function openInventory(currentTab = 'skin') {
  const popup = document.getElementById('inventory-popup');
  popup.innerHTML = `
    <button class="inventory-close-btn" onclick="document.getElementById('inventory-popup').style.display='none'">✖</button>
    <div class="overlay-box inventory-box">
      <h3>🎒 Bộ sưu tập của Bạn</h3>
      
      <div style="margin: 6px 0; font-size: 1.1rem; color: gold;">
      <span style="font-size:1.2rem">💰</span> ${getCoin()} Xu
      </div>

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
              }>Move Effect</button>
              <button class="inv-subtab-btn" data-subtab="win-effect" ${
                currentEffectSubTab === 'win-effect'
                  ? 'style="background:#0f0;color:black;"'
                  : ''
              }>Win Effect</button>
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
              }>Move Effect</button>
              <button class="inv-subtab-btn" data-subtab="win-effect" ${
                currentEffectSubTab === 'win-effect'
                  ? 'style="background:#0f0;color:black;"'
                  : ''
              }>Win Effect</button>
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
  if (tabKey === 'locker') {
    const locker = getLocker();
    const unlockedCount = getUnlockedCount();

    for (let i = 0; i < 24; i++) {
      const itemId = locker[i] || null;
      const div = document.createElement('div');
      div.className = 'inventory-item';

      if (i < unlockedCount) {
        // ✅ Đã mở
        div.style.opacity = itemId ? 1 : 0.3;
        div.innerHTML = `
        <div class="effect-preview-box">${itemId ? '🎁' : '🔓'}</div>
        <div class="skin-name">${itemId || 'Trống'}</div>
      `;
        if (itemId && itemId.startsWith('gift-')) {
          div.style.cursor = 'pointer';
          div.addEventListener('click', () => showGiftPopup(i, itemId));
        }
      } else if (i === unlockedCount) {
        // ✅ Được phép mở ô kế tiếp
        const price = 100 + (i - 4) * 20;
        div.style.opacity = 0.9;
        div.innerHTML = `
        <div class="effect-preview-box">🔒</div>
        <div class="skin-name">Mở: ${price} Xu</div>
      `;
        div.style.cursor = 'pointer';
        div.addEventListener('click', () => tryUnlockLocker(i, price));
      } else {
        // 🔒 Các ô còn lại bị khóa
        div.style.opacity = 0.2;
        div.innerHTML = `
        <div class="effect-preview-box">🔒</div>
        <div class="skin-name">Chưa mở</div>
      `;
      }

      list.appendChild(div);
    }

    return;
  }

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

function tryUnlockLocker(index, price) {
  const unlockedCount = getUnlockedCount();
  if (index !== unlockedCount) {
    alert('⚠️ Bạn cần mở ô trước để mở ô này!');
    return;
  }

  if (getCoin() < price) {
    alert(`⚠️ Bạn cần ${price} Xu để mở ô này!`);
    return;
  }

  const confirmBox = document.createElement('div');
  confirmBox.className = 'gift-popup';
  confirmBox.innerHTML = `
    <div class="overlay-box">
      <h3>🔓 Mở ô Locker?</h3>
      <p>Bạn sẽ mất <b>${price} Xu</b> để mở ô này.</p>
      <button id="confirm-unlock">Mở</button>
      <button id="cancel-unlock">Hủy</button>
    </div>
  `;
  document.body.appendChild(confirmBox);

  document.getElementById('confirm-unlock').onclick = () => {
    spendCoin(price);
    increaseUnlockedCount();
    confirmBox.remove();
    openInventory('locker');
  };

  document.getElementById('cancel-unlock').onclick = () => confirmBox.remove();
}

//
function showGiftPopup(index, giftId) {
  const popup = document.createElement('div');
  popup.className = 'gift-popup';

  let preview = '🎁'; // biểu tượng mặc định
  let message = 'Bạn sẽ nhận được phần thưởng đặc biệt!';

  // Xác định nội dung và biểu tượng theo loại quà
  if (giftId === 'gift-10coin') {
    preview = '💰';
    message = 'Bạn sẽ nhận được <b>10 Xu</b>.';
  } else if (giftId === 'gift-random-coin') {
    preview = '🎲💰';
    message = 'Bạn sẽ nhận <b>ngẫu nhiên từ 1–10 Xu</b>.';
  } else if (giftId.startsWith('gift-1skin-')) {
    const skinId = giftId.replace('gift-1skin-', '');
    preview = '🎨';
    message = `Bạn sẽ nhận skin mới: <b>${skinId}</b>`;
  } else if (giftId === 'gift-random-skin') {
    preview = '🎲🎨';
    message = 'Bạn sẽ nhận <b>ngẫu nhiên 1 skin chưa sở hữu</b>.';
  } else if (giftId.startsWith('gift-1emote-')) {
    const emoteId = giftId.replace('gift-1emote-', '');
    preview = '💬';
    message = `Bạn sẽ nhận emote mới: <b>${emoteId}</b>`;
  } else if (giftId === 'gift-random-emote') {
    preview = '🎲💬';
    message = 'Bạn sẽ nhận <b>ngẫu nhiên 1 emote chưa sở hữu</b>.';
  }

  popup.innerHTML = `
    <div class="overlay-box" style="text-align:center;">
      <h3>${preview} Mở hộp quà?</h3>
      <p>${message}</p>
      <button id="open-gift">🎉 Mở</button>
      <button id="cancel-gift">❌ Hủy</button>
    </div>
  `;
  document.body.appendChild(popup);

  document.getElementById('open-gift').onclick = () => {
    const locker = getLocker();
    locker[index] = null;
    saveLocker(locker);

    const inv = getInventory();

    if (giftId === 'gift-10coin') {
      addCoin(10);
    } else if (giftId === 'gift-random-coin') {
      const amount = Math.floor(Math.random() * 10) + 1;
      addCoin(amount);
    } else if (giftId.startsWith('gift-1skin-')) {
      const skinId = giftId.replace('gift-1skin-', '');
      if (!inv.includes(skinId)) {
        inv.push(skinId);
        saveInventory(inv);
      }
    } else if (giftId === 'gift-random-skin') {
      const skins = SKINS.filter(
        (s) => s.type === 'skin' && !inv.includes(s.id)
      );
      if (skins.length > 0) {
        const random = skins[Math.floor(Math.random() * skins.length)];
        inv.push(random.id);
        saveInventory(inv);
      }
    } else if (giftId.startsWith('gift-1emote-')) {
      const emoteId = giftId.replace('gift-1emote-', '');
      if (!inv.includes(emoteId)) {
        inv.push(emoteId);
        saveInventory(inv);
      }
    } else if (giftId === 'gift-random-emote') {
      const emotes = EFFECTS.filter(
        (e) => e.type === 'emote' && !inv.includes(e.id)
      );
      if (emotes.length > 0) {
        const random = emotes[Math.floor(Math.random() * emotes.length)];
        inv.push(random.id);
        saveInventory(inv);
      }
    }

    popup.remove();
    openInventory('locker');
  };

  document.getElementById('cancel-gift').onclick = () => popup.remove();
}
