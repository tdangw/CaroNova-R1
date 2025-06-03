// quest-ui.js - Hiển thị giao diện nhiệm vụ với min-height cố định
import { getQuestProgress } from './quests.js';
import { selectDailyQuests } from './questManager.js';
import { WEEKLY_QUESTS } from './quests-weekly.js';
import { EVENT_QUESTS } from './quests-event.js';

let currentQuests = [
  ...selectDailyQuests(5),
  ...WEEKLY_QUESTS,
  ...EVENT_QUESTS,
];

const questBtn = document.getElementById('quest-btn');
if (questBtn) questBtn.addEventListener('click', showQuestList);

export function showQuestList() {
  const progress = getQuestProgress();

  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = `
    <div class="overlay-box" style="max-width: 520px; text-align:left">
      <h2 style="text-align:center">📜 Nhiệm vụ</h2>
      <div style="text-align:center; margin-bottom: 10px; display: flex; justify-content: space-between; gap: 2px;">
        <button class="filter-btn active" data-type="all">Tất cả</button>
        <button class="filter-btn" data-type="daily">Ngày</button>
        <button class="filter-btn" data-type="weekly">Tuần</button>
        <button class="filter-btn" data-type="event">Sự kiện</button>
        <button class="filter-btn" data-type="completed">Hoàn thành</button>
      </div>
      <div id="quest-list" style="margin-bottom:16px; min-height: 420px;"></div>
      <button onclick="this.closest('.overlay').remove()">Đóng</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const list = overlay.querySelector('#quest-list');

  const render = (filterType = 'all') => {
    list.innerHTML = currentQuests
      .filter((q) => {
        const id = q.id || '';
        const group = id.includes('daily')
          ? 'daily'
          : id.includes('weekly')
          ? 'weekly'
          : id.includes('event')
          ? 'event'
          : 'misc';
        const prog = progress[q.id] || { progress: 0, completed: false };
        if (filterType === 'completed') return prog.completed;
        if (filterType !== 'all' && group !== filterType)
          return !prog.completed;
        return filterType === 'all' ? true : !prog.completed;
      })
      .map((q) => {
        const p = progress[q.id] || { progress: 0, completed: false };
        const percent = Math.min((p.progress / q.goal) * 100, 100);
        const done = p.completed ? '✅' : '';

        return `
        <div style="margin-bottom:12px;">
          <strong>${q.title}</strong><br/>
          <span style="font-size: 0.9em;">${q.description}</span><br/>
          <div style="background:#444;border-radius:4px;overflow:hidden;margin-top:4px;">
            <div style="width:${percent}%;background:#00f0ff;height:8px;"></div>
          </div>
          <span style="font-size:0.85em;color:#ccc;">${p.progress}/${q.goal} - ${done}</span>
        </div>
      `;
      })
      .join('');
  };

  render();

  const buttons = overlay.querySelectorAll('.filter-btn');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const type = btn.getAttribute('data-type');
      render(type);
    });
  });
}

// Gắn tự động nếu nút đã tồn tại từ HTML
window.showQuestList = showQuestList;
const iconBtn = document.getElementById('quest-icon-btn');
if (iconBtn) iconBtn.addEventListener('click', showQuestList);
