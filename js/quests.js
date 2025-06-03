// quests.js - Quản lý hệ thống nhiệm vụ CaroNova

import { addCoin } from './inventory.js';
import { DAILY_QUESTS } from './quests-daily.js';
import { WEEKLY_QUESTS } from './quests-weekly.js';
import { EVENT_QUESTS } from './quests-event.js';

export const QUESTS = [...DAILY_QUESTS, ...WEEKLY_QUESTS, ...EVENT_QUESTS];

export function getQuestProgress() {
  return JSON.parse(localStorage.getItem('caro-quests') || '{}');
}

export function saveQuestProgress(progress) {
  localStorage.setItem('caro-quests', JSON.stringify(progress));
}

export function updateQuestProgress(type, extra = {}) {
  const progress = getQuestProgress();

  for (const quest of QUESTS) {
    if (quest.type === type) {
      const meta = quest.meta || {};
      if (meta.ai && extra.ai?.toLowerCase?.() !== meta.ai.toLowerCase?.())
        continue;
      if (meta.time && extra.time > meta.time) continue;

      if (!progress[quest.id]) {
        progress[quest.id] = { progress: 0, completed: false };
      }

      const q = progress[quest.id];
      if (!q.completed) {
        q.progress += 1;
        if (q.progress >= quest.goal) {
          q.completed = true;
          addCoin(quest.reward);
          showQuestCompleteOverlay(quest.title, quest.reward);
        }
      }
    }
  }

  saveQuestProgress(progress);
}

function showQuestCompleteOverlay(title, reward) {
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = `
    <div class="overlay-box">
      <h3>🎉 Nhiệm vụ hoàn thành!</h3>
      <p>${title}</p>
      <p>+${reward} 🪙</p>
      <button onclick="this.closest('.overlay').remove()">OK</button>
    </div>
  `;
  document.body.appendChild(overlay);
}
