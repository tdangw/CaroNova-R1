// 📁 shop-ui.js - Quản lý giao diện Shop 5 tab
import { SKINS } from './skins.js';
import { EFFECTS } from './effect.js';
import {
  getCoin,
  spendCoin,
  saveInventory,
  getInventory,
} from './inventory.js';

const ALL_ITEMS = [...SKINS, ...EFFECTS];

const CATEGORIES = {
  skin: 'Skin X/O',
  avatar: 'Avatar',
  border: 'Border',
  winfx: 'Effect',
  emote: 'Emote',
};

let currentTab = 'skin';
let currentEffectSubTab = 'move-effect'; // move-effect | win-effect

export function renderShopTabs(selectedTab = 'skin') {
  currentTab = selectedTab;
  const shopContainer = document.getElementById('shop');

  shopContainer.innerHTML = `
    <button id="shop-close-fixed" onclick="document.getElementById('shop').style.display='none'">✖</button>
    <div class="overlay-box" style="max-width: 680px; text-align:center;">
      <h2>🛒 Shop CaroNova <span id="skin-count-info" style="font-size:0.9rem"></span></h2>
      <div style="margin-bottom: 10px; font-weight: bold; font-size: 1.1rem; color: gold;">
        <span style="font-size:1.2rem">💰</span> <b id="coin-count">${getCoin()}</b> Xu
      </div>
      <div id="shop-tabs" style="display:flex; justify-content: center; gap:10px; flex-wrap:wrap; margin-bottom:12px;">
        ${Object.entries(CATEGORIES)
          .map(
            ([key, label]) => `
            <button class="shop-tab-btn" data-tab="${key}" ${
              key === currentTab
                ? 'style="background:#00f0ff;color:black;"'
                : ''
            }>${label}</button>`
          )
          .join('')}
      </div>

      ${
        currentTab === 'winfx'
          ? `
        <div id="effect-subtabs" style="margin-bottom:10px;">
          <button class="effect-subtab-btn" data-subtab="move-effect" ${
            currentEffectSubTab === 'move-effect'
              ? 'style="background:#0f0;color:black;"'
              : ''
          }>Move Effect</button>
          <button class="effect-subtab-btn" data-subtab="win-effect" ${
            currentEffectSubTab === 'win-effect'
              ? 'style="background:#0f0;color:black;"'
              : ''
          }>Win Effect</button>
        </div>`
          : ''
      }

      <div id="skin-grid" class="skin-grid" style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center; min-height:200px;"></div>
      <button onclick="document.getElementById('shop').style.display='none'" style="margin-top:14px;">Đóng</button>
    </div>
  `;

  renderShopItems(currentTab);

  if (currentTab === 'skin') {
    const inventory = getInventory();
    const totalSkins = SKINS.filter((s) => s.type === 'skin').length;
    const owned = inventory.filter((id) =>
      SKINS.some((s) => s.id === id && s.type === 'skin')
    ).length;
    const skinInfoEl = document.getElementById('skin-count-info');
    if (skinInfoEl) skinInfoEl.textContent = `(${owned}/${totalSkins})`;
  }

  document.querySelectorAll('.shop-tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      renderShopTabs(btn.dataset.tab);
    });
  });

  document.querySelectorAll('.effect-subtab-btn')?.forEach((btn) => {
    btn.addEventListener('click', () => {
      currentEffectSubTab = btn.dataset.subtab;
      renderShopTabs('winfx');
    });
  });
}

function renderShopItems(tabKey) {
  const skinGrid = document.getElementById('skin-grid');
  skinGrid.innerHTML = '';

  const inventory = getInventory();

  const items = ALL_ITEMS.filter((item) => {
    if (tabKey === 'winfx') {
      return item.type === currentEffectSubTab;
    }
    return item.type === tabKey;
  });

  items.forEach((itemData) => {
    const item = document.createElement('div');
    item.className = 'skin-item';

    // Dùng icon thật để preview trong mọi trường hợp
    const previewHTML = `
      <div class="effect-preview-box">
        <span class="preview-icon">${itemData.icon}</span>
      </div>
    `;

    item.innerHTML = `
      ${previewHTML}
      <div style="font-weight:bold;">${itemData.name}</div>
      <div style="font-size:0.85em; color:#ccc;">${itemData.description}</div>
      <button style="margin-top:6px;" ${
        inventory.includes(itemData.id) ? 'disabled' : ''
      } data-id="${itemData.id}">
        ${
          inventory.includes(itemData.id)
            ? 'Đã mua'
            : itemData.price === 0
            ? 'Miễn phí'
            : `${itemData.price} 💰`
        }
      </button>
    `;

    // Hover preview hiệu ứng (chỉ khi là effect)
    const preview = item.querySelector('.preview-icon');
    if (preview && tabKey === 'winfx' && itemData.class) {
      item.addEventListener('mouseenter', () =>
        preview.classList.add(itemData.class)
      );
      item.addEventListener('mouseleave', () =>
        preview.classList.remove(itemData.class)
      );
    }

    const btn = item.querySelector('button');
    btn.addEventListener('click', () => {
      const success = spendCoin(itemData.price);
      if (!success) return alert('Không đủ Xu!');
      inventory.push(itemData.id);
      saveInventory(inventory);
      renderShopTabs(tabKey);
    });

    skinGrid.appendChild(item);
  });

  document.getElementById('coin-count').textContent = getCoin();
}

export function openShop() {
  let shopContainer = document.getElementById('shop');

  if (!shopContainer) {
    shopContainer = document.createElement('div');
    shopContainer.id = 'shop';
    shopContainer.className = 'overlay';
    document.body.appendChild(shopContainer);
  }

  shopContainer.style.display = 'block';
  renderShopTabs();
}
