// 📦 Shop xử lý giao diện và logic mua Skin
import { SKINS } from './skins.js';
import {
  getCoin,
  spendCoin,
  saveInventory,
  getInventory,
} from './inventory.js';

const shopContainer = document.getElementById('shop');
const skinGrid = document.querySelector('.skin-grid');
const coinDisplay = document.getElementById('coin-count');

// 🎨 Render danh sách skin
export function renderShop() {
  skinGrid.innerHTML = '';
  const inventory = getInventory();

  SKINS.forEach((skin) => {
    const item = document.createElement('div');
    item.className = 'skin-item';
    item.innerHTML = `
      <div class="skin-icon">${skin.icon}</div>
      <div class="skin-name">${skin.name}</div>
      <div class="skin-desc">${skin.description}</div>
<button ${inventory.includes(skin.id) ? 'disabled' : ''} data-id="${skin.id}">
  ${
    inventory.includes(skin.id)
      ? 'Đã mua'
      : skin.price === 0
      ? 'Miễn phí'
      : `${skin.price}🪙`
  }
</button>
    `;

    // Xử lý mua
    const btn = item.querySelector('button');
    btn.addEventListener('click', () => {
      const success = spendCoin(skin.price);
      if (!success) return alert('Không đủ Xu!');
      inventory.push(skin.id);
      saveInventory(inventory);
      renderShop();
    });

    skinGrid.appendChild(item);
  });

  coinDisplay.textContent = getCoin();
}

// 👉 Mở Shop
export function openShop() {
  renderShop();
  shopContainer.style.display = 'block';
}

// 👉 Đóng Shop
export function closeShop() {
  document.getElementById('shop').style.display = 'none';
}
window.closeShop = closeShop;
