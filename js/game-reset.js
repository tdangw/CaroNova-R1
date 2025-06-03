// 📁 game-reset.js
import {
  doc,
  getDoc,
  updateDoc,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { db } from './firebase.js';
import { updateLevelDisplay } from './level.js';

/**
 * ✅ Dọn dẹp bàn cờ và giao diện (dùng chung cho AI và Online)
 */
export function clearBoardUI(boardSize = 15) {
  document.querySelectorAll('.cell').forEach((cell) => {
    cell.textContent = '';
    cell.classList.remove('win', 'player-x', 'player-o', 'ai-move');
  });

  // Luôn reset lại mảng window.board
  window.board = Array.from({ length: boardSize }, () =>
    Array(boardSize).fill('')
  );

  const boardEl = document.getElementById('board');
  if (boardEl) boardEl.style.pointerEvents = '';
}

/**
 * ✅ Hàm reset lại ván chơi online (xóa toàn bộ moves, trạng thái kết thúc, reset UI)
 * @param {string} roomId - Mã phòng cần reset
 */
export async function resetOnlineGame(roomId) {
  const roomRef = doc(db, 'rooms', roomId);

  // Lấy dữ liệu room hiện tại để biết firstTurn
  const snap = await getDoc(roomRef);
  const roomData = snap.data();
  const firstTurn = roomData?.firstTurn || 'X';

  await updateDoc(roomRef, {
    moves: {},
    lastMove: null,
    status: 'active',
    ready: { creator: false, joined: false },
    finishedAt: null,
    firstTurn, // 👈 Đảm bảo vẫn lưu trường này
  });

  clearBoardUI();

  // ✅ Dọn giao diện client
  clearBoardUI();

  // Ẩn kết quả nếu còn
  const overlay = document.querySelector('.result-overlay');
  if (overlay) overlay.remove();

  // Ẩn nút chơi lại
  const resetBtn = document.getElementById('reset-online-btn');
  if (resetBtn) resetBtn.classList.add('hidden');

  // Cho phép tương tác lại bàn cờ
  document.getElementById('board').style.pointerEvents = '';
  document.getElementById('turn-indicator').textContent = 'Lượt: ❌ Bạn';

  // Reset thời gian
  window.totalTime = 600;
  updateLevelDisplay(
    Number(localStorage.getItem('playerWins') || 0),
    Number(localStorage.getItem('playerLosses') || 0)
  );
}
