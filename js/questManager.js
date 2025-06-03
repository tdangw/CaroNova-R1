// questManager.js - Quản lý nhiệm vụ động (daily/random)

import { DAILY_QUESTS } from './quests-daily.js';

const DAILY_KEY_PREFIX = 'quests-for-';

// Trộn mảng
function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

// Chọn ngẫu nhiên N nhiệm vụ chưa bị chọn
export function selectDailyQuests(count = 5) {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const key = DAILY_KEY_PREFIX + today;
  const cached = localStorage.getItem(key);

  if (cached) return JSON.parse(cached);

  const selected = shuffleArray([...DAILY_QUESTS]).slice(0, count);
  localStorage.setItem(key, JSON.stringify(selected));
  return selected;
}

// Thay thế nhiệm vụ đã hoàn thành bằng nhiệm vụ chưa có trong danh sách
export function replaceCompletedQuest(
  quests,
  completedId,
  allPool = DAILY_QUESTS
) {
  const currentIds = quests.map((q) => q.id);
  const available = allPool.filter((q) => !currentIds.includes(q.id));
  const newQuest =
    available.length > 0
      ? available[Math.floor(Math.random() * available.length)]
      : null;

  return quests.map((q) => (q.id === completedId && newQuest ? newQuest : q));
}

// Lấy key nhiệm vụ ngày hiện tại
export function getTodayQuestKey() {
  return DAILY_KEY_PREFIX + new Date().toISOString().slice(0, 10);
}

// Xoá cache nhiệm vụ hôm nay (test/manual reset)
export function resetDailyQuestCache() {
  const key = getTodayQuestKey();
  localStorage.removeItem(key);
}
