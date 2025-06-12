// quests-daily.js - Nhiệm vụ hàng ngày
// id -- định danh duy nhất, dùng để xác định nhiệm vụ. Không được trùng. Hệ thống lưu tiến trình theo id
// type -- loại nhiệm vụ (play, win, win_streak, win_ai, win_fast, ...)
// title -- tiêu đề hiển thị trên giao diện - tùy chỉnh
// description -- mô tả chi tiết nhiệm vụ, hiển thị trên giao diện - tùy chỉnh
// goal -- số lần cần hoàn thành để hoàn thành nhiệm vụ
// reward -- phần thưởng
// meta -- thông tin bổ sung nếu cần (ví dụ: ai: 'Nova', time: 45 giây)
export const DAILY_QUESTS = [
  {
    id: 'daily-lose-2',
    type: 'lose',
    title: '🧯 Lỗi tại đối thủ mạnh!',
    description: 'Thua 2 ván trong ngày (cũng là một cách học hỏi).',
    goal: 2,
    reward: 3,
  },
  {
    id: 'daily-lose-first',
    type: 'lose',
    title: '💀 Thua cũng là trải nghiệm',
    description: 'Thua 1 ván đầu tiên để biết mình đang đối đầu với ai.',
    goal: 1,
    reward: 2,
    meta: {
      first: true,
    },
  },
  {
    id: 'daily-play-2',
    type: 'play',
    title: '🎮 Chơi 2 ván',
    description: 'Chơi 2 ván bất kỳ - Thưởng: 1 💰',
    goal: 2,
    reward: 1,
  },
  {
    id: 'daily-play-3',
    type: 'play',
    title: '🎮 Chơi 3 ván',
    description: 'Chơi 3 ván bất kỳ - Thưởng: 1 💰',
    goal: 3,
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
  {
    id: 'daily-Aera-speed-kill',
    type: 'win_fast',
    title: '⚡️ Hạ gục Aera siêu nhanh',
    description: 'Thắng Aera trong 30 giây - Thưởng: 6 💰',
    goal: 1,
    reward: 6,
    meta: { ai: 'Aera', time: 30 },
  },
];
// Thêm các nhiệm vụ hàng ngày khác nếu cần
