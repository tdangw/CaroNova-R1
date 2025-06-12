// ai.js
let hasMoved = false; // Biến để kiểm tra AI đã đi nước đầu chưa

export function getAIMove(board) {
  const boardSize = board.length;

  // Nếu là lượt đầu tiên của AI, random gần quân X
  if (!hasMoved) {
    const xMoves = getPlayerMoves(board, 'X');
    const nearby = [];

    for (const [xRow, xCol] of xMoves) {
      const around = getEmptyAround(board, xRow, xCol);
      nearby.push(...around);
    }

    if (nearby.length > 0) {
      hasMoved = true;
      return nearby[Math.floor(Math.random() * nearby.length)];
    }
  }

  // Sau nước đầu → dùng rule base
  let bestScore = -Infinity;
  const bestMoves = [];

  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      if (board[row][col] !== '') continue;

      const score =
        evaluatePoint(board, row, col, 'O') +
        evaluatePoint(board, row, col, 'X') * 0.8 +
        proximityBonus(board, row, col);

      if (score > bestScore) {
        bestScore = score;
        bestMoves.length = 0;
        bestMoves.push([row, col]);
      } else if (score === bestScore) {
        bestMoves.push([row, col]);
      }
    }
  }

  hasMoved = true;
  if (bestMoves.length > 0) {
    const index = Math.floor(Math.random() * bestMoves.length);
    return bestMoves[index];
  }

  return getRandomMove(board);
}

// Reset khi bắt đầu game mới
export function resetAIMoveCount() {
  hasMoved = false;
}

// Trả về các ô trống quanh (row, col)
function getEmptyAround(board, row, col) {
  const result = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = row + dr;
      const c = col + dc;
      if (inBounds(r, c, board) && board[r][c] === '') {
        result.push([r, c]);
      }
    }
  }
  return result;
}

// Lấy tất cả quân X
function getPlayerMoves(board, symbol) {
  const result = [];
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] === symbol) result.push([row, col]);
    }
  }
  return result;
}

// Đánh giá điểm
function evaluatePoint(board, row, col, player) {
  let score = 0;
  const directions = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1],
  ];

  for (const [dRow, dCol] of directions) {
    let count = 1;
    let forward = countSame(board, row, col, dRow, dCol, player);
    let backward = countSame(board, row, col, -dRow, -dCol, player);
    count += forward + backward;

    if (count >= 5) score += 1000;
    else if (count === 4) score += 500;
    else if (count === 3) score += 200;
    else if (count === 2) score += 50;
  }

  return score;
}

// Đếm số quân liên tục theo hướng
function countSame(board, row, col, dRow, dCol, player) {
  let count = 0;
  let r = row + dRow;
  let c = col + dCol;

  while (inBounds(r, c, board) && board[r][c] === player && count < 4) {
    count++;
    r += dRow;
    c += dCol;
  }

  return count;
}

// Gần quân đã có
function proximityBonus(board, row, col) {
  const dirs = [-1, 0, 1];
  for (let dx of dirs) {
    for (let dy of dirs) {
      if (dx === 0 && dy === 0) continue;
      const r = row + dx;
      const c = col + dy;
      if (inBounds(r, c, board) && board[r][c] !== '') {
        return 10;
      }
    }
  }
  return 0;
}

function getRandomMove(board) {
  const emptyCells = [];
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] === '') emptyCells.push([row, col]);
    }
  }

  const randomIndex = Math.floor(Math.random() * emptyCells.length);
  return emptyCells[randomIndex];
}

function inBounds(row, col, board) {
  return row >= 0 && row < board.length && col >= 0 && col < board.length;
}
