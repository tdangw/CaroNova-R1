// achievements.js - Nhiệm vụ Thành tựu

export const ACHIEVEMENTS = [
  {
    id: 'achieve-100-win',
    type: 'win',
    goal: 100,
    reward: 20,
    title: '🏅 100 chiến thắng',
    description: 'Chiến thắng 100 ván bất kỳ - Thưởng: 20 💰',
  },
  {
    id: 'achieve-all-ai',
    type: 'win_ai_all',
    goal: 9,
    reward: 25,
    title: '🤖 Hạ gục tất cả AI',
    description: 'Đánh bại mỗi AI ít nhất 1 lần - Thưởng: 25 💰',
  },
  {
    id: 'achieve-combo-5',
    type: 'win_streak',
    goal: 5,
    reward: 10,
    title: '🔥 Combo 5 thắng',
    description: 'Thắng liên tiếp 5 ván mà không thua - Thưởng: 10 💰',
  },
];
