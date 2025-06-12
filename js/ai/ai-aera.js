// 📁 js/ai-aera.js
// AI Aera: chỉ đi random (dùng để test)

export function getAIMove(board) {
  const emptyCells = [];
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] === '') emptyCells.push([row, col]);
    }
  }
  if (emptyCells.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * emptyCells.length);
  return emptyCells[randomIndex];
}
