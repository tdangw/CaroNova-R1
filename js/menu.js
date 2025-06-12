// menu.js (viết lại hoàn chỉnh, đồng bộ với ai-list.js)
import '../js/game.js';
import { setCurrentAIName } from './novaReaction.js';
import { playSound } from './soundManager.js';
import { createRoom, showRoomList } from './game-online.js';
import { requireLogin } from './auth-ui.js';
import { renderAIList } from './ai-list.js';

let selectedAI = 'basic'; // Mặc định là Meow

const nextBtn = document.getElementById('next-to-name-btn');
const nameOverlay = document.getElementById('name-input-overlay');
const confirmBtn = document.getElementById('confirm-name-btn');
const playerNameInput = document.getElementById('player-name-input');
const aiMenu = document.getElementById('ai-menu');
const gameContainer = document.getElementById('game-container');

function autoFillLastUsedName() {
  const lastName = localStorage.getItem('playerName');
  if (lastName) playerNameInput.value = lastName;
}

function setupAICardEvents() {
  const aiCards = document.querySelectorAll('.ai-card');
  console.log('[menu] Số lượng ai-card:', aiCards.length);
  aiCards.forEach((card) => {
    card.addEventListener('click', () => {
      aiCards.forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedAI = card.dataset.ai;
      console.log('[menu] Đã chọn AI:', selectedAI);
      playSound('select');
    });
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
    });
  });
}

renderAIList();
setTimeout(setupAICardEvents, 0);

nextBtn.addEventListener('click', () => {
  playSound('selectButton');
  console.log('[menu] Next to name, selectedAI:', selectedAI);
  if (selectedAI === 'online') {
    showOnlineMenuSafe();
    return;
  }
  aiMenu.style.display = 'none';
  nameOverlay.style.display = 'flex';
  autoFillLastUsedName();
});

confirmBtn.addEventListener('click', async () => {
  playSound('gameStart');
  nameOverlay.classList.add('fade-out');
  setTimeout(async () => {
    nameOverlay.style.display = 'none';
    gameContainer.style.display = 'block';

    let name = playerNameInput.value.trim();
    if (!name) name = 'Player';

    const selectedCard = document.querySelector('.ai-card.selected');
    const aiName = selectedCard.dataset.name;
    const aiAvatar = selectedCard.dataset.avatar;

    localStorage.setItem('playerName', name);
    localStorage.setItem('selectedAI', selectedAI);
    localStorage.setItem('aiName', aiName);
    localStorage.setItem('aiAvatar', aiAvatar);

    let aiModulePath = './ai/ai.js';
    if (selectedAI !== 'basic' && selectedAI !== 'online') {
      aiModulePath = `./ai/ai-${selectedAI}.js`;
    } else if (selectedAI === 'online') {
      showOnlineMenuSafe();
      return;
    }

    console.log('[menu] Import AI module:', aiModulePath);
    const mod = await import(aiModulePath);
    window.getAIMove = mod.getAIMove;
    setCurrentAIName(selectedAI);

    updatePlayerInfo(name, aiName, aiAvatar);
    window.createBoard();
    window.playPlaceSound = () => playSound('place');
  }, 2000);
});

function updatePlayerInfo(playerName, aiName, aiAvatar) {
  const leftInfo = document.createElement('div');
  leftInfo.className = 'player-info player';
  leftInfo.innerHTML = `
    <img src="assets/avatars/player.png" class="avatar" id="player-avatar" />
    <div class="player-reaction-box" id="player-reaction-box"></div>
    <div class="player-name">${playerName}<br><span id="player-level">Level 1</span></div>
  `;

  const rightInfo = document.createElement('div');
  rightInfo.className = 'player-info ai';
  rightInfo.innerHTML = `
    <img src="${aiAvatar}" class="avatar" id="ai-avatar" />
    <div class="player-name">${aiName}<br><span id="ai-level">Level 1</span></div>
  `;

  const timer = document.getElementById('timer');
  const wrapper = timer.parentElement;
  wrapper.style.display = 'flex';
  wrapper.style.alignItems = 'center';
  wrapper.style.justifyContent = 'space-between';
  wrapper.style.gap = '10px';
  wrapper.prepend(leftInfo);
  wrapper.append(rightInfo);
}

let isVoiceEnabled = false;
window.isVoiceEnabled = false;
const voiceIcon = document.createElement('div');
voiceIcon.id = 'voice-toggle-icon';
voiceIcon.className = 'tooltip';
voiceIcon.dataset.tooltip = 'Bật/Tắt giọng nói AI';
voiceIcon.innerText = '🎤';
document.body.appendChild(voiceIcon);
voiceIcon.addEventListener('click', () => {
  isVoiceEnabled = !isVoiceEnabled;
  window.isVoiceEnabled = isVoiceEnabled;
  voiceIcon.classList.toggle('active', isVoiceEnabled);
  if (!isVoiceEnabled) window.speechSynthesis.cancel();
  console.log('[menu] Voice toggled:', isVoiceEnabled);
});

document.getElementById('create-room-btn')?.addEventListener('click', () => {
  playSound('select');
  const name = localStorage.getItem('playerName') || 'Player';
  console.log('[menu] Tạo phòng với tên:', name);
  createRoom(name);
});

document.getElementById('join-room-btn')?.addEventListener('click', () => {
  playSound('select');
  console.log('[menu] Xem danh sách phòng');
  showRoomList();
});

document.getElementById('cancel-online-btn')?.addEventListener('click', () => {
  playSound('select');
  console.log('[menu] Hủy chọn online, reload trang');
  location.reload();
});

function showOnlineMenuSafe() {
  console.log('[menu] showOnlineMenuSafe()');
  requireLogin((user) => {
    localStorage.setItem('playerName', user.displayName || 'Player');
    document.getElementById('name-input-overlay').style.display = 'none';
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('ai-menu').style.display = 'none';
    document.getElementById('online-menu').classList.remove('hidden');
  });
}
