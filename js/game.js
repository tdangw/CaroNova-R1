// game.js
// Quản lý trò chơi, bao gồm logic trò chơi, AI và đồng hồ đếm ngược
import { reactToPlayerMove, reactToAIMove } from './novaReaction.js';
import { playSound } from './soundManager.js';
import { updateLevelDisplay } from './level.js';
import { resetAIMoveCount } from './ai/ai.js';
import { openShop } from './shop-ui.js';
import { getActiveSkin, getAISkin, addCoin } from './inventory.js';
import { SKINS } from './skins.js';
import { updateQuestProgress } from './quests.js';
import { getSelectedItem, getAISelectedItem } from './inventory.js';
import { getEffectClassById } from './effect.js';
function checkResetTotalGamesDaily() {
  const today = new Date().toDateString();
  const lastDate = localStorage.getItem('lastPlayDate');
  if (lastDate !== today) {
    localStorage.setItem('lastPlayDate', today);
    localStorage.setItem('totalGames', 0); // reset ván chơi mỗi ngày
  }
}

let playerSymbol = 'X';
let aiSymbol = 'O';

let firstTurn = 'X'; // mặc định người chơi
function decideFirstTurn() {
  return Math.random() < 0.5 ? 'X' : 'O';
}
function getSkinIconById(id) {
  const skin = SKINS.find((s) => s.id === id);
  return skin ? skin.icon : '❓';
}
// Lấy biểu tượng skin mặc định của người chơi

function getPlayerSkinIcon() {
  return getSkinIconById(getActiveSkin());
}
function getAISkinIcon() {
  return getSkinIconById(getAISkin());
}
// Hiển thị biểu tượng skin người chơi và AI

const shopBtn = document.getElementById('shop-btn');
if (shopBtn) {
  shopBtn.addEventListener('click', () => {
    openShop();
  });
}

function showFirstTurnAnimation(callback) {
  playSound('dice');
  const overlay = document.createElement('div');
  overlay.className = 'overlay-message';
  overlay.innerHTML = `
    <div class="overlay-box" style="font-size: 1.6rem; text-align:center;">
      <div class="dice-container">
        <div class="dice toss" id="dice1">🎲</div>
        <div class="dice toss" id="dice2">🎲</div>
        <div class="dice toss" id="dice3">🎲</div>
      </div>
      <p>Đang tung xúc xắc...</p>
    </div>
  `;
  document.body.appendChild(overlay);

  setTimeout(() => {
    firstTurn = decideFirstTurn();

    // Gán currentPlayer trực tiếp, không dùng playerSymbol
    currentPlayer = firstTurn;

    const resultText =
      firstTurn === 'X'
        ? `${getPlayerSkinIcon()} Bạn sẽ đi trước!`
        : `${getAISkinIcon()} AI sẽ đi trước!`;

    document.getElementById('dice1').textContent = '🎲';
    document.getElementById('dice2').textContent =
      firstTurn === 'X' ? '❌' : '⭕';
    document.getElementById('dice3').textContent = '🎲';
    document
      .querySelectorAll('.dice')
      .forEach((d) => d.classList.remove('toss'));
    overlay.querySelector('p').textContent = resultText;

    setTimeout(() => {
      overlay.remove();
      callback();
    }, 1000);
  }, 1200);
}

function showResultOverlay(message = 'You win!') {
  const overlay = document.createElement('div');
  overlay.className = 'result-overlay';
  overlay.innerHTML = `<span>${message}</span>`;
  document.body.appendChild(overlay);

  setTimeout(() => overlay.remove(), 2500);
}

const boardSize = 15;
const board = [];
let currentPlayer = 'X';
let gameOver = false;

const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const resetBtn = document.getElementById('reset-btn');
const timerElement = document.getElementById('timer');
const turnProgress = document.getElementById('turn-progress-bar');

let playerWins = 0;
let aiWins = 0;

let totalTime = 600;
let turnTime = 30;
let totalTimerId = null;
let turnTimerId = null;

window.createBoard = function createBoard() {
  document.getElementById('game-container').style.display = 'block';
  boardElement.innerHTML = '';
  board.length = 0;

  for (let row = 0; row < boardSize; row++) {
    board[row] = [];
    for (let col = 0; col < boardSize; col++) {
      board[row][col] = '';
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener('click', handleCellClick);
      boardElement.appendChild(cell);
    }
  }

  gameOver = false;
  resetAIMoveCount();

  showFirstTurnAnimation(() => {
    updateTurnLabel(currentPlayer === 'X');
    if (currentPlayer === 'O') {
      runAI();
    } else {
      resetTimers(); // người chơi đi trước thì bắt đầu đồng hồ
    }
  });
};

function handleCellClick(e) {
  if (gameOver) return;

  const row = parseInt(e.target.dataset.row);
  const col = parseInt(e.target.dataset.col);
  if (board[row][col] !== '') return;

  makeMove(row, col, currentPlayer);

  /* Tương tác với người chơi */
  reactToPlayerMove(board, [row, col], currentPlayer);
  console.log('>> player move triggered');

  if (checkWin(row, col, currentPlayer)) {
    endGame(`🎉 Bạn thắng!`, 'player');
    return;
  }

  currentPlayer = aiSymbol;
  updateTurnLabel(false);
  runAI();
}
function makeMove(row, col, player) {
  board[row][col] = player;
  const index = row * boardSize + col;
  const cells = boardElement.querySelectorAll('.cell');

  // 🎨 Lấy icon theo skin tương ứng
  const icon = player === playerSymbol ? getPlayerSkinIcon() : getAISkinIcon();
  cells[index].textContent = icon;

  // 🎯 Lấy hiệu ứng move từ ID
  const effectId =
    player === playerSymbol
      ? getSelectedItem('move-effect')
      : getAISelectedItem('move-effect');
  const moveEffectClass = getEffectClassById(effectId);
  const fallback = player === playerSymbol ? 'player-move' : 'ai-move';

  // 🔁 Gỡ các class hiệu ứng cũ
  [...cells[index].classList]
    .filter(
      (cls) =>
        cls.startsWith('fx-move-') || cls === 'player-move' || cls === 'ai-move'
    )
    .forEach((cls) => cells[index].classList.remove(cls));

  // 🪪 Gán class hiệu ứng tương ứng
  if (moveEffectClass) {
    cells[index].classList.add(moveEffectClass);
    setTimeout(() => cells[index].classList.remove(moveEffectClass), 500);
  } else {
    cells[index].classList.add(fallback);
    setTimeout(() => cells[index].classList.remove(fallback), 500);
  }

  // 🔡 Gán class chữ X hoặc O
  cells[index].classList.add(player);

  // ✅ Chỉ gán player-move khi là người chơi
  if (player === playerSymbol) {
    cells[index].classList.add('player-move');
    setTimeout(() => {
      if (!cells[index].classList.contains('win')) {
        cells[index].classList.remove('player-move');
      }
    }, 500);
  }

  // 🧪 LOG Debug
  console.log('[makeMove] ➤');
  console.log('- Người chơi:', player);
  console.log('- Ô:', row, col);
  console.log('- Icon:', icon);
  console.log('- Move Effect ID:', effectId);
  console.log('- Class move:', moveEffectClass || '(fallback)');
  console.log('- Class sau khi gán:', cells[index].classList.value);
  console.log('-------------------------');

  // 🔊 Âm thanh đặt cờ
  if (typeof window.playPlaceSound === 'function') {
    window.playPlaceSound();
  }
}

// Kết thúc hàm makeMove

function checkWin(row, col, player) {
  const directions = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1],
  ];

  for (const [dRow, dCol] of directions) {
    let count = 1;
    let cells = [[row, col]];

    let r = row + dRow,
      c = col + dCol;
    while (count < 5 && inBounds(r, c) && board[r][c] === player) {
      cells.push([r, c]);
      r += dRow;
      c += dCol;
      count++;
    }

    r = row - dRow;
    c = col - dCol;
    while (count < 5 && inBounds(r, c) && board[r][c] === player) {
      cells.unshift([r, c]);
      r -= dRow;
      c -= dCol;
      count++;
    }

    if (count === 5) {
      highlightCells(cells);
      return true;
    }
  }

  return false;
}

function inBounds(row, col) {
  return row >= 0 && row < boardSize && col >= 0 && col < boardSize;
}
// Hàm này sẽ đánh dấu các ô chiến thắng bằng hiệu ứng và màu sắc
function highlightCells(cells) {
  const allCells = boardElement.querySelectorAll('.cell');

  const winEffectId =
    currentPlayer === playerSymbol
      ? getSelectedItem('win-effect')
      : getAISelectedItem('win-effect');
  const winEffectClass = getEffectClassById(winEffectId);

  console.log('[highlightCells] ➤');
  console.log('- Current player:', currentPlayer);
  console.log('- Win Effect ID:', winEffectId);
  console.log('- Win Effect Class:', winEffectClass || '(none)');
  console.log('- Ô thắng:', cells);
  console.log('-------------------------');

  cells.forEach(([r, c]) => {
    const index = r * boardSize + c;
    const cell = allCells[index];

    // Xóa tất cả class hiệu ứng cũ
    [...cell.classList]
      .filter((cls) => cls.startsWith('fx-move-') || cls.startsWith('fx-win-'))
      .forEach((cls) => cell.classList.remove(cls));

    // Xóa player-move / ai-move để ngăn animation
    cell.classList.remove('player-move', 'ai-move');

    // Gán win
    cell.classList.add('win');

    // Gán hiệu ứng nếu có
    if (winEffectClass && winEffectId !== 'default') {
      cell.classList.add(winEffectClass);
    }

    console.log(`- Ô (${r},${c}) sau khi gán:`, cell.classList.value);
  });
}

function endGame(message, winner) {
  gameOver = true;
  statusElement.textContent = message;
  clearInterval(totalTimerId);
  clearInterval(turnTimerId);

  const aiName = localStorage.getItem('selectedAI') || '';
  const elapsedTime = 600 - totalTime;

  // ✅ Gọi play cho mọi trường hợp (thắng/thua)
  updateQuestProgress('play');

  if (winner === 'player') {
    // Cộng chuỗi thắng
    let winStreak = Number(localStorage.getItem('winStreak') || 0);
    winStreak++;
    localStorage.setItem('winStreak', winStreak);

    showResultOverlay('🏆 You win!');
    playSound('win');
    playerWins++;

    // ✅ Gọi win-related quests
    updateQuestProgress('win');
    updateQuestProgress('win_streak');
    updateQuestProgress('win_ai', { ai: aiName });
    //updateQuestProgress('win_fast', { time: elapsedTime });
    updateQuestProgress('win_fast', { ai: aiName, time: elapsedTime });

    // 🎁 Thưởng Xu khi thắng
    const reward = 1;
    addCoin(reward);

    // Hiệu ứng hiện xu
    const rewardBox = document.createElement('div');
    rewardBox.className = 'reward-popup';
    rewardBox.textContent = `+${reward} 💰`;
    document.body.appendChild(rewardBox);
    setTimeout(() => rewardBox.remove(), 3500);
  } else if (winner === 'ai') {
    localStorage.setItem('winStreak', 0);
    updateQuestProgress('lose'); // 🆕 Gọi khi thua

    showResultOverlay('😿 You lose!');
    playSound('lose');
    aiWins++;

    setTimeout(() => {
      const overlay = document.querySelector('.result-overlay');
      if (overlay && overlay.textContent.includes('You lose')) {
        overlay.classList.add('player-lose');
      }
    }, 50);
  }
  // 🆕 Tăng số ván đã chơi
  const totalGames = Number(localStorage.getItem('totalGames') || 0);
  localStorage.setItem('totalGames', totalGames + 1);

  updateLevelDisplay(playerWins, aiWins);
  updateScoreboard();
  saveScoreboard();
}

function updateTurnLabel(isPlayerTurn) {
  statusElement.textContent = `Lượt: ${
    isPlayerTurn ? getPlayerSkinIcon() + ' Bạn' : getAISkinIcon() + ' AI'
  }`;
}

function updateScoreboard() {
  const winsEl = document.getElementById('player-wins');
  const lossesEl = document.getElementById('player-losses');

  if (winsEl) {
    winsEl.textContent = playerWins;
    winsEl.classList.add('score-pop'); /* Thêm lớp CSS để tạo hiệu ứng */
    setTimeout(() => winsEl.classList.remove('score-pop'), 300);
  }

  if (lossesEl) {
    lossesEl.textContent = aiWins;
    lossesEl.classList.add('score-pop'); /* Thêm lớp CSS để tạo hiệu ứng */
    setTimeout(() => lossesEl.classList.remove('score-pop'), 300);
  }
}

function saveScoreboard() {
  localStorage.setItem(
    'caro-scoreboard',
    JSON.stringify({
      playerWins,
      aiWins,
    })
  );
}

function loadScoreboard() {
  const saved = JSON.parse(localStorage.getItem('caro-scoreboard'));
  if (saved) {
    playerWins = saved.playerWins || 0;
    aiWins = saved.aiWins || 0;
    updateScoreboard();
  }
}

function resetTimers() {
  clearInterval(turnTimerId);
  clearInterval(totalTimerId);

  let turnRemaining = turnTime;
  turnProgress.style.width = '100%';
  turnProgress.classList.remove('warning', 'danger'); // Reset màu

  // Đếm ngược thời gian mỗi lượt
  turnTimerId = setInterval(() => {
    turnRemaining--;
    turnProgress.style.width = `${(turnRemaining / turnTime) * 100}%`;

    // Cập nhật màu cảnh báo
    turnProgress.classList.remove('warning', 'danger');
    if (turnRemaining <= 10) {
      if (turnRemaining === 10) {
        playSound('timeout'); // 🔊 Phát âm thanh cảnh báo còn 10s
      }

      turnProgress.classList.add('danger');
    } else if (turnRemaining <= 20) {
      turnProgress.classList.add('warning');
    }

    if (turnRemaining <= 0) {
      clearInterval(turnTimerId);
      handleTurnTimeout();
    }
  }, 1000);

  // Đếm ngược tổng thời gian ván
  totalTimerId = setInterval(() => {
    totalTime--;
    updateTotalTimer();

    if (totalTime <= 0) {
      clearInterval(totalTimerId);
      clearInterval(turnTimerId);
      endGame('⏱️ Hết giờ!', 'ai');
    }
  }, 1000);
}

function updateTotalTimer() {
  const min = String(Math.floor(totalTime / 60)).padStart(2, '0');
  const sec = String(totalTime % 60).padStart(2, '0');
  timerElement.textContent = `⏱️ ${min}:${sec}`;
}

function handleTurnTimeout() {
  if (gameOver) return;

  if (currentPlayer === playerSymbol) {
    endGame('❌ Hết giờ! Thua cuộc!', 'ai');
  } else {
    endGame('⭕ Hết giờ! ❌ Bạn thắng!', 'player');
  }
}

function runAI() {
  const aiThinkTime = Math.floor(Math.random() * 300) + 300; // Thời gian suy nghĩ của AI (300ms - 600ms)
  resetTimers();

  setTimeout(() => {
    if (!gameOver && currentPlayer === aiSymbol) {
      const [aiRow, aiCol] = window.getAIMove(board);
      makeMove(aiRow, aiCol, aiSymbol);

      /* Tương tác với AI */
      reactToAIMove(board, [aiRow, aiCol], aiSymbol);
      console.log('>> ai move triggered');

      const index = aiRow * boardSize + aiCol;
      const cells = boardElement.querySelectorAll('.cell');
      cells[index].classList.add('ai-move');

      setTimeout(() => {
        if (!cells[index].classList.contains('win')) {
          cells[index].classList.remove('ai-move');
        }
      }, 500);

      if (checkWin(aiRow, aiCol, aiSymbol)) {
        endGame('⭕ AI thắng!', 'ai');
      } else {
        currentPlayer = playerSymbol;
        updateTurnLabel(true);
        resetTimers();
      }
    }
  }, aiThinkTime);
}

resetBtn.addEventListener('click', () => {
  checkResetTotalGamesDaily(); // 🆕 Đảm bảo mỗi lần chơi mới sẽ kiểm tra reset ngày
  totalTime = 600;
  window.createBoard();
});

document.getElementById('reset-stats-btn')?.addEventListener('click', () => {
  document.getElementById('confirm-overlay')?.classList.remove('hidden');
});

function createConfirmPopup() {
  const confirmOverlay = document.createElement('div');
  confirmOverlay.id = 'confirm-overlay';
  confirmOverlay.className = 'overlay hidden';
  confirmOverlay.innerHTML = `
    <div class="confirm-box">
      <p>Bạn có chắc muốn xóa toàn bộ thống kê?</p>
      <div class="confirm-actions">
        <button id="confirm-yes">✅ Đồng ý</button>
        <button id="confirm-no">❌ Hủy</button>
      </div>
    </div>
  `;
  document.body.appendChild(confirmOverlay);

  document.getElementById('confirm-no').addEventListener('click', () => {
    confirmOverlay.classList.add('hidden');
  });

  document.getElementById('confirm-yes').addEventListener('click', () => {
    playerWins = 0;
    aiWins = 0;
    updateScoreboard();
    saveScoreboard();
    confirmOverlay.classList.add('hidden');
  });
}

createConfirmPopup();
loadScoreboard();

// Hiển thị thông tin phiên bản khi click vào biểu tượng
document.getElementById('game-version')?.addEventListener('click', () => {
  document.getElementById('version-info-popup')?.classList.remove('hidden');
});

// Đóng popup
document
  .getElementById('close-version-popup')
  ?.addEventListener('click', () => {
    document.getElementById('version-info-popup')?.classList.add('hidden');
  });
import { openInventory } from './inventory.js';
document
  .getElementById('inventory-btn')
  .addEventListener('click', openInventory);

function updateBoardIcons() {
  const cells = document.querySelectorAll('.cell');
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const symbol = board[row][col];
      if (!symbol) continue;

      const index = row * boardSize + col;
      let icon = symbol;

      if (symbol === playerSymbol) {
        icon = getPlayerSkinIcon();
      } else if (symbol === aiSymbol) {
        icon = getAISkinIcon();
      }

      cells[index].textContent = icon;
    }
  }
}
window.updateBoardIcons = updateBoardIcons;
// Cập nhật biểu tượng skin khi thay đổi skin
