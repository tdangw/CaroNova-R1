// quests-daily.js - Nhiệm vụ hàng ngày

export const DAILY_QUESTS = [
  {
    id: 'daily-play-2',
    type: 'play',
    title: '🎮 Chơi 2 ván',
    description: 'Chơi 2 ván bất kỳ - Thưởng: 1 💰',
    goal: 2,
    reward: 1,
  },
  {
    id: 'daily-win-1',
    type: 'win',
    title: '🏆 Thắng 1 ván',
    description: 'Thắng 1 ván - Thưởng: 2 💰',
    goal: 1,
    reward: 2,
  },
  {
    id: 'daily-win-streak',
    type: 'win_streak',
    title: '🔥 Combo 3 thắng',
    description: 'Thắng liên tiếp 3 ván - Thưởng: 5 💰',
    goal: 3,
    reward: 5,
  },
  {
    id: 'daily-win-ai-nova',
    type: 'win_ai',
    title: '🧠 Hạ gục Nova',
    description: 'Thắng Nova - Thưởng: 3 💰',
    goal: 1,
    reward: 3,
    meta: { ai: 'Nova' },
  },
  {
    id: 'daily-win-fast-45s',
    type: 'win_fast',
    title: '⚡ Thắng trong 45 giây',
    description: 'Chiến thắng trong 45 giây - Thưởng: 4 💰',
    goal: 1,
    reward: 4,
    meta: { time: 45 },
  },
];
// Thêm các nhiệm vụ hàng ngày khác nếu cần
