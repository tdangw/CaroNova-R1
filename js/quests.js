// quests.js - Quản lý hệ thống nhiệm vụ CaroNova

import { addCoin } from './inventory.js';
import { DAILY_QUESTS } from './quests-daily.js';
import { WEEKLY_QUESTS } from './quests-weekly.js';
import { EVENT_QUESTS } from './quests-event.js';
import { ACHIEVEMENTS } from './achievements.js';

export const QUESTS = [...DAILY_QUESTS, ...WEEKLY_QUESTS, ...EVENT_QUESTS];
export const ALL_QUESTS = [...QUESTS, ...ACHIEVEMENTS]; // dùng chung nếu cần

/**
 * 🔄 Trả về tiến trình nhiệm vụ từ localStorage
 */
export function getQuestProgress() {
  return JSON.parse(localStorage.getItem('caro-quests') || '{}');
}

/**
 * 💾 Lưu lại tiến trình nhiệm vụ
 */
export function saveQuestProgress(progress) {
  localStorage.setItem('caro-quests', JSON.stringify(progress));
}

/**
 * ✅ Cập nhật tiến trình nhiệm vụ dựa trên type hoặc điều kiện bổ sung
 * @param {string} type - Loại nhiệm vụ ("play", "win", "win_streak", "win_ai", "win_fast", ...)
 * @param {object} extra - Thông tin bổ sung nếu cần (ai: 'Nova', time: 45)
 */
export function updateQuestProgress(type, extra = {}) {
  const progress = getQuestProgress();

  // ✅ Cập nhật thành tựu (ACHIEVEMENTS)
  for (const quest of ACHIEVEMENTS) {
    if (quest.type === 'win_streak') continue; // xử lý riêng bên dưới
    if (quest.type !== type) continue;

    if (!progress[quest.id]) {
      progress[quest.id] = { progress: 0, completed: false };
    }
    const q = progress[quest.id];
    if (q.completed) continue;

    q.progress += 1;
    if (q.progress >= quest.goal) {
      q.completed = true;
      addCoin(quest.reward);
      showQuestCompleteOverlay(quest.title, quest.reward);
    }
  }

  // ✅ Cập nhật nhiệm vụ thường (QUESTS)
  for (const quest of QUESTS) {
    if (quest.type === 'win_streak') continue; // xử lý riêng bên dưới
    if (quest.type !== type) continue;

    const meta = quest.meta || {};
    if (!progress[quest.id]) {
      progress[quest.id] = { progress: 0, completed: false };
    }

    const q = progress[quest.id];
    if (q.completed) continue;

    if (
      meta.ai &&
      (extra.ai || '').toLowerCase() !== (meta.ai || '').toLowerCase()
    )
      continue;

    if (meta.time && extra.time > meta.time) continue;
    if (meta.first && Number(localStorage.getItem('totalGames') || 0) > 1)
      continue; // chỉ cho phép thua ván đầu tiên
    q.progress += 1;
    if (q.progress >= quest.goal) {
      q.completed = true;
      addCoin(quest.reward);
      showQuestCompleteOverlay(quest.title, quest.reward);
    }
  }

  // ✅ Xử lý riêng nhiệm vụ chuỗi thắng (win_streak)
  const streak = Number(localStorage.getItem('winStreak') || 0);
  const allWinStreakQuests = [...ACHIEVEMENTS, ...QUESTS].filter(
    (q) => q.type === 'win_streak'
  );
  for (const quest of allWinStreakQuests) {
    if (!progress[quest.id]) {
      progress[quest.id] = { progress: 0, completed: false };
    }
    const q = progress[quest.id];
    if (q.completed) continue;

    q.progress = Math.min(streak, quest.goal);
    if (streak >= quest.goal) {
      q.completed = true;
      addCoin(quest.reward);
      showQuestCompleteOverlay(quest.title, quest.reward);
    }
  }

  saveQuestProgress(progress);
}

/**
 * 🎉 Hiển thị overlay khi hoàn thành nhiệm vụ
 */
function showQuestCompleteOverlay(title, reward) {
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = `
    <div class="overlay-box">
      <h3>🎉 Nhiệm vụ hoàn thành!</h3>
      <p>${title}</p>
      <p>+${reward} 💰</p>
      <button onclick="this.closest('.overlay').remove()">OK</button>
    </div>
  `;
  document.body.appendChild(overlay);
}
