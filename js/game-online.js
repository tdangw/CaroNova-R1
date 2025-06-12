// game-online.js
import { updateLevelDisplay } from './level.js';
import { resetOnlineGame } from './game-reset.js';
import { db } from './firebase.js';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
window.board = null;

const ROOMS_COLLECTION = 'rooms';
const MAX_ROOMS = 10;

// Tạo mã phòng gồm 4 ký tự (chữ in hoa + số)
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // bỏ O, 0, I, 1 các ký tự dễ nhầm
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Tạo phòng mới với trạng thái rõ ràng hơn
export async function createRoom(playerName) {
  const roomsRef = collection(db, ROOMS_COLLECTION);
  const snapshot = await getDocs(roomsRef);
  const currentRooms = snapshot.docs.filter(
    (doc) => doc.data().status === 'waiting'
  );
  if (currentRooms.length >= MAX_ROOMS) {
    showTempPopup('⚠️ Đã có tối đa 10 phòng đang mở. Vui lòng chờ!');
    return;
  }

  let roomId = '';
  let exists = true;
  while (exists) {
    roomId = generateRoomCode();
    exists = snapshot.docs.some((doc) => doc.id === roomId);
  }

  const newRoom = {
    roomId,
    creatorName: playerName,
    createdAt: serverTimestamp(),
    status: 'waiting',
    isLocked: false,
    ready: { creator: false },
  };

  await setDoc(doc(db, ROOMS_COLLECTION, roomId), newRoom);
  showReadyScreen(newRoom, playerName, roomId);

  // Tự động xóa nếu sau 2 phút vẫn ở trạng thái waiting và chưa có ai vào
  setTimeout(async () => {
    const roomSnap = await getDoc(doc(db, ROOMS_COLLECTION, roomId));
    if (roomSnap.exists()) {
      const data = roomSnap.data();
      if (!data.joinedName && data.status === 'waiting') {
        await deleteDoc(doc(db, ROOMS_COLLECTION, roomId));
      }
    }
  }, 120000);
}

// ==========================
// Hệ thống đếm thời gian & kết thúc ván cho Online
// ==========================
let totalTime = 600;
let turnTime = 30;
let totalTimerId = null;
let turnTimerId = null;

function updateTimerUI() {
  const min = String(Math.floor(totalTime / 60)).padStart(2, '0');
  const sec = String(totalTime % 60).padStart(2, '0');
  const timer = document.getElementById('timer-online');
  if (timer) timer.textContent = `⏱️ ${min}:${sec}`;
}

function resetTimers(currentTurn, playerSymbol, roomId) {
  clearInterval(turnTimerId);
  clearInterval(totalTimerId);

  let turnRemaining = turnTime;
  const bar = document.getElementById('turn-progress-bar');
  bar.style.width = '100%';
  bar.classList.remove('warning', 'danger');

  totalTimerId = setInterval(() => {
    totalTime--;
    updateTimerUI();
    if (totalTime <= 0) {
      clearInterval(totalTimerId);
      clearInterval(turnTimerId);
      showEndGame('⏱️ Hết giờ!', false, roomId || window.currentOnlineRoomId);
    }
  }, 1000);

  turnTimerId = setInterval(() => {
    turnRemaining--;
    bar.style.width = `${(turnRemaining / turnTime) * 100}%`;
    bar.classList.remove('warning', 'danger');
    if (turnRemaining <= 10) bar.classList.add('danger');
    else if (turnRemaining <= 20) bar.classList.add('warning');
    if (turnRemaining <= 0) {
      clearInterval(turnTimerId);
      showEndGame(
        '⏱️ Hết lượt!',
        currentTurn !== playerSymbol,
        roomId || window.currentOnlineRoomId
      );
    }
  }, 1000);
}

// ✅ Hàm kết thúc ván (có cập nhật trạng thái phòng trên Firebase)
async function showEndGame(message, isPlayerWin, roomId) {
  clearInterval(totalTimerId);
  clearInterval(turnTimerId);
  let lastLoser = null;
  if (typeof isPlayerWin === 'boolean') {
    lastLoser = isPlayerWin
      ? window.opponentSymbol || 'O'
      : window.symbol || 'X';
  }
  // Cập nhật lên Firestore
  if (roomId && lastLoser) {
    try {
      await updateDoc(doc(db, ROOMS_COLLECTION, roomId), {
        status: 'finished',
        finishedAt: serverTimestamp(),
        firstTurn: lastLoser, // 👈 Lưu người thua
      });
    } catch (err) {
      console.warn('❌ Không thể cập nhật trạng thái phòng:', err);
    }
  }
  const overlay = document.createElement('div');
  overlay.className = 'result-overlay';
  if (!isPlayerWin) overlay.classList.add('player-lose');
  overlay.innerHTML = `<span>${message}</span>`;
  document.body.appendChild(overlay);

  // Cập nhật trạng thái phòng về "finished" và ghi lại thời điểm kết thúc
  if (roomId) {
    try {
      await updateDoc(doc(db, ROOMS_COLLECTION, roomId), {
        status: 'finished',
        finishedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('❌ Không thể cập nhật trạng thái phòng:', err);
    }
  }

  // ✅ Cập nhật thống kê level/thắng/thua local (không liên quan tới roomId)
  if (isPlayerWin) {
    const winCount = Number(localStorage.getItem('playerWins') || 0) + 1;
    localStorage.setItem('playerWins', winCount);
  } else {
    const lossCount = Number(localStorage.getItem('playerLosses') || 0) + 1;
    localStorage.setItem('playerLosses', lossCount);
  }

  updateLevelDisplay(
    Number(localStorage.getItem('playerWins') || 0),
    Number(localStorage.getItem('playerLosses') || 0)
  );

  setTimeout(() => overlay.remove(), 2500);
  document.getElementById('board').style.pointerEvents = 'none';
}

// Hiển thị danh sách phòng
export function showRoomList() {
  // Xóa overlay cũ nếu có
  const old = document.getElementById('room-list-overlay');
  if (old) old.remove();

  const overlay = document.createElement('div');
  overlay.id = 'room-list-overlay';
  overlay.className = 'overlay';
  overlay.innerHTML = `
    <div class="overlay-box" style="max-width: 600px; width: 90%; padding: 24px;">
      <h2 style="text-align:center; margin-bottom: 16px;">📋 Danh sách phòng đang mở</h2>
      <div id="room-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px;"></div>
      <div style="display:flex; justify-content: space-between; margin-top: 20px;">
        <button id="close-room-list">🔙 Quay lại</button>
        <button id="enter-room-code">🔑 Nhập mã phòng</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  document
    .getElementById('close-room-list')
    .addEventListener('click', () => overlay.remove());
  document.getElementById('enter-room-code').addEventListener('click', () => {
    const popup = document.createElement('div');
    popup.className = 'overlay';
    popup.id = 'enter-room-overlay';
    popup.innerHTML = `
    <div class="overlay-box" style="text-align:center; max-width:360px;">
      <h3>🔑 Nhập mã phòng</h3>
      <input id="room-code-input" maxlength="4" placeholder="Ví dụ: A1B2" style="text-transform:uppercase; padding:10px; font-size:1.2rem; text-align:center; border-radius:8px; border:none; margin:10px 0;" />
      <div style="margin-top:12px;">
        <button id="confirm-room-code" style="margin-right:10px;">Vào phòng</button>
        <button id="cancel-room-code">Hủy</button>
      </div>
    </div>
  `;
    document.body.appendChild(popup);

    document.getElementById('room-code-input').focus();

    // Xử lý xác nhận mã
    document
      .getElementById('confirm-room-code')
      .addEventListener('click', () => {
        const code = document
          .getElementById('room-code-input')
          .value.trim()
          .toUpperCase();
        if (code.length === 4) {
          popup.remove();
          joinRoomByCode(code);
        } else {
          showTempPopup('⚠️ Mã phòng cần đúng 4 ký tự!');
        }
      });

    // Hủy
    document
      .getElementById('cancel-room-code')
      .addEventListener('click', () => {
        popup.remove();
      });
  });

  const roomsRef = collection(db, ROOMS_COLLECTION);

  onSnapshot(roomsRef, (snapshot) => {
    const grid = document.getElementById('room-grid');
    if (!grid) return; // Nếu không có room-grid thì thoát luôn
    grid.innerHTML = '';

    const now = Date.now();
    const rooms = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    let visibleCount = 0;
    const statusLabel = {
      waiting: '🟢 Đang chờ',
      active: '🟡 Đang chơi',
      finished: '🔴 Đã kết thúc',
    };

    for (const room of rooms) {
      // 1️⃣ Ẩn phòng chỉ khi trạng thái "waiting" + đã bị khoá (tức chủ phòng không cho ai vào)
      if (room.status === 'waiting' && room.isLocked) continue;

      // 2️⃣ Xóa phòng chờ quá 2 phút mà không ai tham gia
      if (room.status === 'waiting' && !room.joinedName) {
        const created = room.createdAt?.seconds
          ? room.createdAt.seconds * 1000
          : now;
        if (now - created > 2 * 60 * 1000) {
          deleteDoc(doc(db, ROOMS_COLLECTION, room.id));
          continue;
        }
      }

      // 3️⃣ Xóa phòng đã kết thúc quá 10 phút
      if (room.status === 'finished' && room.finishedAt?.seconds) {
        const finished = room.finishedAt.seconds * 1000;
        if (now - finished > 10 * 60 * 1000) {
          deleteDoc(doc(db, ROOMS_COLLECTION, room.id));
          continue;
        }
      }

      visibleCount++;

      const item = document.createElement('div');
      item.className = 'room-item';
      item.style = `
        background: #1e1e2e;
        border-radius: 10px;
        padding: 12px;
        color: white;
        display: flex;
        flex-direction: column;
        gap: 8px;
        box-shadow: 0 0 6px rgba(0,255,255,0.3);
      `;

      // Thời gian còn lại chỉ hiển thị với phòng waiting
      let timeLeftStr = '';
      if (
        room.status === 'waiting' &&
        !room.joinedName &&
        room.createdAt?.seconds
      ) {
        const elapsed = Math.floor(
          (now - room.createdAt.seconds * 1000) / 1000
        );
        const left = Math.max(0, 120 - elapsed);
        const min = String(Math.floor(left / 60)).padStart(2, '0');
        const sec = String(left % 60).padStart(2, '0');
        timeLeftStr = `${min}:${sec}`;
      } else {
        timeLeftStr = '--:--';
      }

      item.innerHTML = `
        <div><strong>📎 Mã:</strong> ${room.roomId}</div>
        <div><strong>👤 Người tạo:</strong> ${room.creatorName}</div>
        <div><strong>⏳ Còn lại:</strong> ${timeLeftStr}</div>
        <div><strong>📌 Trạng thái:</strong> ${
          statusLabel[room.status] || 'Không rõ'
        }</div>
        <button style="padding: 6px 12px; border:none; border-radius:6px; background:#00f0ff; color:black; font-weight:bold; cursor:pointer;">
          ${
            room.status === 'waiting'
              ? 'Tham gia'
              : room.status === 'active'
              ? 'Xem'
              : 'Xem kết quả'
          }
        </button>
      `;

      // Nút tham gia chỉ cho phép join phòng waiting, các loại khác có thể tùy ý chỉ xem/tracking (mở rộng sau)
      item.querySelector('button').addEventListener('click', () => {
        if (room.status === 'waiting') {
          joinRoomByCode(room.roomId);
        } else {
          // Có thể show chi tiết phòng, lịch sử, hoặc tracking, tuỳ bạn mở rộng
          showTempPopup('🕵️‍♂️ Tính năng xem phòng/lich sử sẽ bổ sung sau!');
        }
      });

      grid.appendChild(item);
    }

    if (visibleCount === 0) {
      grid.innerHTML = `<p style="grid-column: span 2; text-align: center;">Chưa có phòng nào</p>`;
    }
  });
}

/**
 * Cập nhật tên và avatar người chơi trên UI
 * @param {string} name - Tên người chơi
 * @param {string} avatarURL - URL avatar
 * @param {boolean} isMe - true nếu là mình, false nếu là đối thủ
 */
function updatePlayerInfo(name, avatarURL, isMe = true) {
  const elId = isMe ? 'player-left' : 'player-right';
  const container = document.getElementById(elId);
  if (!container) return;

  container.innerHTML = `
    <img src="${avatarURL || 'assets/avatars/default.png'}" class="avatar">
    <div class="info">
      <div>${name || '--'}</div>
      <div>Level 1</div>
    </div>
  `;
}

// Tham gia phòng và chuyển trạng thái sang active
export async function joinRoomByCode(roomId) {
  const roomRef = doc(db, ROOMS_COLLECTION, roomId);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) {
    alert('❌ Phòng không tồn tại!');
    return;
  }

  const room = roomSnap.data();
  if (room.isLocked && !room.joinedName) {
    alert('⛔ Phòng đã bị khóa.');
    return;
  }

  const playerName = window.currentPlayerName || 'Player'; // hoặc nhập lúc vào

  await updateDoc(roomRef, {
    joinedName: playerName,
    isLocked: true,
    status: 'active',
    [`ready.joined`]: false,
  });

  const updatedSnap = await getDoc(roomRef);
  const updatedRoom = updatedSnap.data();

  document.getElementById('room-list-overlay')?.remove();
  showReadyScreen(updatedRoom, playerName, roomId);
}

// Giao diện "Sẵn sàng" cho người chơi
function showReadyScreen(roomData, playerName, roomId) {
  // Xóa nội dung bàn cờ cũ
  document.getElementById('board').innerHTML = '';

  // Tạo overlay "sẵn sàng"
  const overlay = document.createElement('div');
  overlay.id = 'ready-overlay';
  overlay.className = 'overlay';
  overlay.style.background = 'rgba(0,0,0,0.75)';
  overlay.innerHTML = `
    <div class="overlay-box" style="text-align: center;">
      <h2>🎮 Phòng: ${roomData.roomId}</h2>
      <p id="player-list">👤 ${roomData.creatorName} vs 👤 ${
    roomData.joinedName || '--'
  }</p>
      <button id="ready-btn" style="margin-top: 20px; padding: 10px 24px; font-size: 1.2rem; background:#00f0ff; color:#000; border:none; border-radius:10px; cursor:pointer;">✅ Tôi đã sẵn sàng</button>
      <button id="cancel-room-btn" style="margin-top: 10px; padding: 8px 16px; font-size: 1rem; background:#ff4444; color:#fff; border:none; border-radius:10px; cursor:pointer;">❌ Hủy</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const roomRef = doc(db, ROOMS_COLLECTION, roomId || roomData.roomId);
  const role = playerName === roomData.creatorName ? 'creator' : 'joined';

  // Biến unsubscribe để cleanup listener khi rời khỏi overlay
  let unsubscribeReady = null;

  // Sẵn sàng
  const readyBtn = document.getElementById('ready-btn');
  if (readyBtn) {
    readyBtn.addEventListener('click', async () => {
      await updateDoc(roomRef, { [`ready.${role}`]: true });
      readyBtn.disabled = true;
      readyBtn.textContent = '⏳ Đang chờ người còn lại...';
    });
  }

  // Hủy phòng hoặc rời phòng
  document
    .getElementById('cancel-room-btn')
    .addEventListener('click', async () => {
      if (unsubscribeReady) unsubscribeReady(); // Cleanup listener

      const roomSnap = await getDoc(roomRef);
      const data = roomSnap.data();
      if (role === 'creator' && !data.joinedName) {
        // Chủ phòng chưa ai vào: xóa phòng luôn
        await deleteDoc(roomRef);
      } else if (role === 'joined') {
        // Người join out: reset lại phòng cho người khác join tiếp
        await updateDoc(roomRef, {
          joinedName: null,
          status: 'waiting',
          isLocked: false,
          [`ready.joined`]: false,
        });
      }
      document.getElementById('ready-overlay')?.remove();
      document.getElementById('game-container').style.display = 'none';
      showRoomList();
    });

  // Đăng ký lắng nghe realtime Firestore
  unsubscribeReady = onSnapshot(roomRef, (snapshot) => {
    const data = snapshot.data();
    const playerList = document.getElementById('player-list');
    if (playerList && data.joinedName) {
      playerList.innerHTML = `👤 ${data.creatorName} vs 👤 ${data.joinedName}`;
    }
    // Khi cả 2 đã sẵn sàng: cleanup listener, vào game
    if (data.ready?.creator && data.ready?.joined) {
      if (unsubscribeReady) unsubscribeReady(); // Cleanup
      document.getElementById('ready-overlay')?.remove();
      startOnlineGame(data, role, roomId || data.roomId);
    }
  });
}

// Bắt đầu game online
function startOnlineGame(roomData, role, roomId) {
  document.getElementById('reset-online-btn')?.classList.add('hidden');
  document.getElementById('game-container').style.display = 'block';
  // Lưu roomId vào biến toàn cục cho mọi thao tác sau
  window.currentOnlineRoomId = roomId || roomData.roomId;
  console.log(`🎮 Vào game online - bạn là ${role}`);
  // Ẩn các overlay còn lại
  document.getElementById('ready-overlay')?.remove();
  document.getElementById('online-menu')?.classList.add('hidden');

  // Ẩn timer AI, hiện timer online
  document.getElementById('timer')?.classList.add('hidden');
  document.getElementById('timer-online')?.classList.remove('hidden');

  // Tạo động turn-indicator
  createTurnIndicator();

  const boardSize = 15;
  window.board = Array.from({ length: boardSize }, () =>
    Array(boardSize).fill('')
  );
  let currentTurn = roomData.firstTurn || 'X'; // 👈 Dùng giá trị đã lưu

  const boardEl = document.getElementById('board');
  boardEl.innerHTML = '';
  boardEl.style.display = 'grid';
  boardEl.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
  boardEl.style.gridTemplateRows = `repeat(${boardSize}, 1fr)`;
  boardEl.style.gap = '1px';

  // Ẩn nút reset nếu là online
  document.getElementById('reset-btn')?.classList.add('hidden');
  document.getElementById('reset-stats-btn')?.classList.add('hidden');
  document.getElementById('status')?.classList.add('hidden');
  document.getElementById('scoreboard')?.classList.add('hidden');
  document.getElementById('player-losses')?.classList.add('hidden');

  const symbol = role === 'creator' ? 'X' : 'O'; // vai trò của người chơi hiện tại

  // Hiển thị tên + avatar 2 bên
  const myName =
    role === 'creator' ? roomData.creatorName : roomData.joinedName;
  const enemyName =
    role === 'creator' ? roomData.joinedName : roomData.creatorName;

  document.getElementById('player-left').innerHTML = `
    <img src="images/player.png" class="avatar">
    <div class="info">
      <div>${myName}</div>
      <div>Level 1</div>
    </div>
  `;
  document.getElementById('player-right').innerHTML = `
    <img src="images/player-lumi.png" class="avatar">
    <div class="info">
      <div>${enemyName || '--'}</div>
      <div>Level 1</div>
    </div>
  `;
  const turnSymbol = currentTurn;
  const isYourTurn = currentTurn === symbol;
  document.getElementById('turn-indicator').textContent = `Lượt: ${
    turnSymbol === 'X' ? '❌' : '⭕'
  } ${isYourTurn ? 'Bạn' : 'Đối thủ'}`;

  // Vẽ bàn cờ
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = r;
      cell.dataset.col = c;
      boardEl.appendChild(cell);
    }
  }

  // Sự kiện click
  boardEl.addEventListener('click', async (e) => {
    const board = window.board;
    const cell = e.target;
    const r = Number(cell.dataset.row);
    const c = Number(cell.dataset.col);

    if (!cell.classList.contains('cell') || board[r][c] !== '') return;
    if (currentTurn !== symbol) return;

    board[r][c] = symbol;
    cell.textContent = symbol;
    cell.style.color = symbol === 'X' ? '#ffcc00' : '#00f0ff';

    const roomRef = doc(db, ROOMS_COLLECTION, roomData.roomId);
    await updateDoc(roomRef, {
      lastMove: { r, c, symbol },
      [`moves.${r}_${c}`]: symbol,
    });

    // ❌ Không cập nhật currentTurn và turn-indicator ở đây nữa!
    // resetTimers sẽ được xử lý trong onSnapshot.
  });

  // Hiển thị mã phòng trong giao diện
  const roomIdDisplay = document.getElementById('room-id-display');
  if (roomIdDisplay) {
    roomIdDisplay.textContent = `📎 Mã phòng: ${roomData.roomId}`;
  }

  // Theo dõi realtime từ Firestore
  const roomRef = doc(db, ROOMS_COLLECTION, roomData.roomId);
  onSnapshot(roomRef, (snap) => {
    const board = window.board;
    const data = snap.data();
    const move = data.lastMove;

    // Nếu có nước đi hợp lệ
    if (
      move &&
      typeof move.r === 'number' &&
      typeof move.c === 'number' &&
      typeof move.symbol === 'string'
    ) {
      // Nếu phòng đã kết thúc thì không làm gì nữa
      if (data.status === 'finished') return;

      // Cập nhật lượt
      currentTurn = move.symbol === 'X' ? 'O' : 'X';
      const turnSymbol = currentTurn;
      const isYourTurn = currentTurn === symbol;
      document.getElementById('turn-indicator').textContent = `Lượt: ${
        turnSymbol === 'X' ? '❌' : '⭕'
      } ${isYourTurn ? 'Bạn' : 'Đối thủ'}`;

      // ✅ Kiểm tra thắng
      if (checkWin(board, move.r, move.c, move.symbol)) {
        const isPlayerWin = move.symbol === symbol;
        const message = isPlayerWin ? '🏆 Bạn thắng!' : '😿 Bạn thua!';
        showEndGame(message, isPlayerWin, window.currentOnlineRoomId);

        document.getElementById('reset-online-btn')?.classList.remove('hidden');
        const resetOnlineBtn = document.getElementById('reset-online-btn');
        if (resetOnlineBtn) {
          resetOnlineBtn.onclick = async () => {
            await resetOnlineGame(window.currentOnlineRoomId);
            resetOnlineBtn.classList.add('hidden');
            showTempPopup('🔄 Đã yêu cầu bắt đầu ván mới!');
          };
        }

        return; // 🔁 Rất quan trọng để không gọi resetTimers phía dưới
      }

      // Nếu phòng chưa kết thúc thì reset thời gian
      if (!data.status || data.status !== 'finished') {
        resetTimers(currentTurn, symbol, roomId);
      }
    } else {
      // Nếu không có nước đi (ví dụ hết giờ), nhưng trạng thái đã kết thúc → xử lý overlay
      if (data.status === 'finished' && !data.lastMove) {
        const message = '⏱️ Hết giờ!';
        showEndGame(message, false, window.currentOnlineRoomId);

        document.getElementById('reset-online-btn')?.classList.remove('hidden');
        const resetOnlineBtn = document.getElementById('reset-online-btn');
        if (resetOnlineBtn) {
          resetOnlineBtn.onclick = async () => {
            await resetOnlineGame(window.currentOnlineRoomId);
            resetOnlineBtn.classList.add('hidden');
            showTempPopup('🔄 Đã yêu cầu bắt đầu ván mới!');
          };
        }

        return;
      } else {
        console.warn('[onSnapshot] Bỏ qua move không hợp lệ:', move);
      }
    }

    // Phục hồi các nước đi từ Firestore (trường hợp reload hoặc người mới vào)
    if (data.moves) {
      Object.entries(data.moves).forEach(([key, value]) => {
        const [r, c] = key.split('_').map(Number);
        if (board[r][c] === '') {
          board[r][c] = value;
          const index = r * boardSize + c;
          const cell = boardEl.children[index];
          cell.textContent = value;
          cell.style.color = value === 'X' ? '#ffcc00' : '#00f0ff';
        }
      });
    }
  });
  // Theo dõi realtime cập nhật tên người chơi chính xác
  onSnapshot(roomRef, (snap) => {
    const data = snap.data();

    if (!data) return;

    const myName = role === 'creator' ? data.creatorName : data.joinedName;
    const enemyName = role === 'creator' ? data.joinedName : data.creatorName;

    updatePlayerInfo(myName, 'images/player.png', true);
    updatePlayerInfo(enemyName, 'images/player-lumi.png', false);
  });
}

// Check win
function checkWin(board, r, c, symbol) {
  const directions = [
    [0, 1], // ngang →
    [1, 0], // dọc ↓
    [1, 1], // chéo ↘
    [1, -1], // chéo ↙
  ];
  const size = board.length;

  for (const [dr, dc] of directions) {
    let count = 1;
    let cells = [[r, c]];

    // Đi tới
    let nr = r + dr,
      nc = c + dc;
    while (
      nr >= 0 &&
      nc >= 0 &&
      nr < size &&
      nc < size &&
      board[nr][nc] === symbol
    ) {
      cells.push([nr, nc]);
      nr += dr;
      nc += dc;
      count++;
    }

    // Đi lui
    nr = r - dr;
    nc = c - dc;
    while (
      nr >= 0 &&
      nc >= 0 &&
      nr < size &&
      nc < size &&
      board[nr][nc] === symbol
    ) {
      cells.unshift([nr, nc]);
      nr -= dr;
      nc -= dc;
      count++;
    }

    if (count >= 5) {
      highlightCells(cells); // Nổi bật ô chiến thắng
      return true;
    }
  }

  return false;
}

// Popup thông báo
function showTempPopup(message = '') {
  const popup = document.createElement('div');
  popup.className = 'overlay-message';
  popup.innerHTML = `
    <div class="overlay-box">
      <p>${message}</p>
    </div>
  `;
  document.body.appendChild(popup);

  setTimeout(() => {
    popup.remove();
  }, 2000);
}
// Highlight ô chiến thắng
function highlightCells(cells) {
  const allCells = document.querySelectorAll('#board .cell');
  const boardSize = 15; // hoặc lấy theo board.length nếu bạn muốn linh động

  cells.forEach(([r, c]) => {
    const index = r * boardSize + c;
    allCells[index]?.classList.add('win');
  });
}

// Tạo turn indicator
function createTurnIndicator() {
  // Kiểm tra nếu đã tồn tại, tránh tạo lại
  if (document.getElementById('turn-indicator')) return;

  // Tạo phần tử turn-indicator
  const turnIndicator = document.createElement('div');
  turnIndicator.id = 'turn-indicator';
  turnIndicator.textContent = 'Lượt: ❌ Bạn'; // Nội dung mặc định

  // Thêm vào body
  document.body.appendChild(turnIndicator);
}
