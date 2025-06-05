// quest-ui.js - Hiển thị giao diện nhiệm vụ với min-height cố định
import { getQuestProgress } from './quests.js';
import { selectDailyQuests, autoResetQuestsIfNeeded } from './questManager.js';
import { WEEKLY_QUESTS } from './quests-weekly.js';
import { EVENT_QUESTS } from './quests-event.js';
import { ACHIEVEMENTS } from './achievements.js';

autoResetQuestsIfNeeded(); // 🔁 Tự động reset daily/weekly nếu cần

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
        <button class="filter-btn" data-type="achievement">Thành tựu</button>
        <button class="filter-btn" data-type="completed">Hoàn thành</button>

      </div>
      <div id="quest-list" style="margin-bottom:16px; min-height: 420px;"></div>
      <button onclick="this.closest('.overlay').remove()">Đóng</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const list = overlay.querySelector('#quest-list');

  const render = (filterType = 'all') => {
    list.innerHTML = ''; // Xoá cũ
    renderQuestStats(list); // ✅ luôn gọi lại phần thống kê
    if (filterType === 'achievement') {
      renderAchievements(list);
      return; // ⛔ Không vẽ nhiệm vụ thường khi lọc thành tựu
    }

    list.innerHTML += currentQuests
      .filter((q) => {
        const id = q.id || '';
        const group = id.startsWith('daily')
          ? 'daily'
          : id.startsWith('weekly')
          ? 'weekly'
          : id.startsWith('event')
          ? 'event'
          : 'misc';

        const prog = progress[q.id] || { progress: 0, completed: false };

        if (filterType === 'completed') return prog.completed;
        if (filterType === 'all') return true;
        return group === filterType && !prog.completed;
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
  renderAchievements(list);

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

function renderQuestStats(container) {
  const progress = getQuestProgress();
  const todayKey = new Date().toISOString().slice(0, 10);

  const dailyIds = (
    JSON.parse(localStorage.getItem('quests-for-' + todayKey)) || []
  ).map((q) => q.id);
  const weeklyIds = WEEKLY_QUESTS.map((q) => q.id);
  const eventIds = EVENT_QUESTS.map((q) => q.id);
  const achievementIds = ACHIEVEMENTS.map((q) => q.id);

  const countCompleted = (ids) =>
    ids.filter((id) => progress[id]?.completed).length;

  const statsHTML = `
    <div class="quest-stats" style="display: flex; gap: 16px; justify-content: flex-start; margin-bottom: 14px; font-size: 0.95em; flex-wrap: wrap;">
      <div>📆 Ngày: ${countCompleted(dailyIds)} / ${dailyIds.length}</div>
      <div>🗓️ Tuần: ${countCompleted(weeklyIds)} / ${weeklyIds.length}</div>
      <div>🎉 Sự kiện: ${countCompleted(eventIds)} / ${eventIds.length}</div>
      <div>🏅 Thành tựu: ${countCompleted(achievementIds)} / ${
    achievementIds.length
  }</div>
    </div>
  `;

  const div = document.createElement('div');
  div.innerHTML = statsHTML;
  container.prepend(div);
}

function renderAchievements(container) {
  const progress = getQuestProgress();

  const html = ACHIEVEMENTS.map((q) => {
    const p = progress[q.id] || { progress: 0, completed: false };
    const percent = Math.min(100, Math.floor((p.progress / q.goal) * 100));
    const status = p.completed ? '✅ Hoàn thành' : `${p.progress}/${q.goal}`;

    return `
      <div style="margin-bottom:12px;">
<strong> ${q.title}</strong>
        <span style="font-size: 0.9em;">${q.description}</span><br/>
        <div style="background:#444;border-radius:4px;overflow:hidden;margin-top:4px;">
          <div style="width:${percent}%;background:#ffdf00;height:8px;"></div>
        </div>
        <span style="font-size:0.85em;color:#ccc;">${status}</span>
      </div>
    `;
  }).join('');

  const box = document.createElement('div');
  box.className = 'quest-box';
  box.innerHTML = `<h3 style="margin-top:20px;">🏅 Nhiệm vụ Thành tựu</h3>${html}`;
  container.appendChild(box);
}
