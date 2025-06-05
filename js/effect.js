// 📦 effect.js - Danh sách hiệu ứng bán trong shop (player move, win)
export const EFFECTS = [
  // Move Effects
  // Hiệu ứng mặc định
  {
    id: 'default-move', // Hiệu ứng mặc định khi đánh quân
    type: 'move-effect', // Loại hiệu ứng
    name: '✨ Mặc định', // Tên hiệu ứng
    icon: 'X', // Biểu tượng hiệu ứng
    description: 'Hiệu ứng mặc định khi đánh quân.', // Mô tả hiệu ứng
    class: '', // Class hiệu ứng, không thêm class nào
    price: 0, // Giá hiệu ứng
  },
  {
    id: 'default-win',
    type: 'win-effect',
    name: '🏁 Mặc định',
    icon: 'X',
    description: 'Hiệu ứng mặc định khi chiến thắng.',
    class: '', // Class hiệu ứng, không thêm class nào
    price: 0,
  },
  {
    id: 'move-flare',
    type: 'move-effect',
    name: 'Loé Sáng',
    icon: '⚡',
    price: 8,
    class: 'fx-move-flare',
    description: 'Hiệu ứng loé sáng cực mạnh khi quân cờ xuất hiện.',
  },
  {
    id: 'move-bounce',
    type: 'move-effect',
    name: 'Nảy Nhẹ',
    icon: '🏀',
    price: 7,
    class: 'fx-move-bounce',
    description: 'Hiệu ứng quân nảy nhẹ sau khi chạm bàn cờ, đầy sống động.',
  },
  {
    id: 'move-ring',
    type: 'move-effect',
    name: 'Sóng Tỏa',
    icon: '💫',
    price: 9,
    class: 'fx-move-ring',
    description:
      'Quân cờ phát sóng ánh sáng lan rộng như chấn động không gian.',
  },

  {
    id: 'move-neon',
    type: 'move-effect',
    name: 'Bước Neon',
    icon: '⚡',
    price: 5,
    class: 'fx-move-neon',
    description: 'Hiệu ứng sáng xanh neon khi người chơi đặt quân.',
  },
  {
    id: 'move-retro',
    type: 'move-effect',
    name: 'Bước Retro',
    icon: '🌀',
    price: 3,
    class: 'fx-move-retro',
    description: 'Hiệu ứng rung và màu cổ điển khi đặt quân.',
  },
  {
    id: 'move-drop',
    type: 'move-effect',
    name: 'Rơi Xuống',
    icon: '🪂',
    price: 6,
    class: 'fx-move-drop',
    description: 'Quân cờ rơi từ trên xuống như đập mạnh vào bàn cờ.',
  },

  {
    id: 'move-drop2',
    type: 'move-effect',
    name: 'Rơi Xuống 2',
    icon: '💧',
    price: 6,
    class: 'fx-move-drop2',
    description: 'Quân cờ rơi từ trên xuống kèm hiệu ứng.',
  },

  {
    id: 'move-scale-in',
    type: 'move-effect',
    name: 'Từ Xa Xuất Hiện',
    icon: '🌀',
    price: 7,
    class: 'fx-move-scale-in',
    description:
      'Hiệu ứng phóng to từ xa tới gần tạo cảm giác xuất hiện bất ngờ.',
  },
  {
    id: 'move-slide-left',
    type: 'move-effect',
    name: 'Bay Từ Trái',
    icon: '💨',
    price: 7,
    class: 'fx-move-slide-left',
    description: 'Quân bay từ bên trái vào bàn, tạo cảm giác tốc độ cao.',
  },

  // Win Effects
  {
    id: 'win-spark',
    type: 'win-effect',
    name: 'Chớp Chiến Thắng',
    icon: '✨',
    price: 8,
    class: 'fx-win-spark',
    description: 'Chiến thắng sẽ phát ra hiệu ứng lấp lánh vàng.',
  },
  {
    id: 'win-firework',
    type: 'win-effect',
    name: 'Pháo Hoa',
    icon: '🎆',
    price: 10,
    class: 'fx-win-firework',
    description: 'Hiệu ứng pháo hoa bung nổ khi kết thúc ván thắng.',
  },
];

// Hàm hỗ trợ lấy class hiệu ứng từ ID
export function getEffectClassById(id) {
  const effect = EFFECTS.find((e) => e.id === id);
  return effect?.class || '';
}
