// js/ai-list.js
// Quản lý danh sách card AI trong menu

export const aiList = [
  {
    ai: 'basic',
    name: 'Meow',
    avatar: 'assets/avatars/meow.png',
    front: 'Một chú mèo đáng yêu đến từ Infernia.',
    back: 'Dễ thương, vui nhộn và rất thông minh. 😸',
    selected: true,
  },
  {
    ai: 'nova',
    name: 'Nova',
    avatar: 'assets/avatars/nova.png',
    front: 'Cô gái xinh đẹp, cá tính đến từ Infernia.',
    back: 'Thông minh, tinh tế, kết nối mọi người.',
  },
  {
    ai: 'zeta',
    name: 'Zeta',
    avatar: 'assets/avatars/zeta.png',
    front: 'Em gái của Nova, cá tính, thích khám phá.',
    back: 'Thích mạo hiểm và luôn tạo bất ngờ. 🌌',
  },
  {
    ai: 'lumi',
    name: 'Lumi',
    avatar: 'assets/avatars/lumi.png',
    front: 'Em gái của Nova, cute, thích du lịch.',
    back: 'Lạnh lùng ngoài mặt, nhưng ấm áp bên trong. 🧊',
  },
  {
    ai: 'online',
    name: 'Online',
    avatar: 'assets/avatars/online.png',
    front: 'Thách đấu với các chiến binh từ khắp vũ trụ!',
    back: 'Chế độ online đang phát triển.<br>Coming Soon! 🚀',
  },
  {
    ai: 'aera',
    name: 'Aera',
    avatar: 'assets/avatars/aera.png',
    front: 'Em gái nhỏ từ Infernia, năng động.',
    back: 'Tuy hơi nóng tính nhưng tâm hồn trong sáng. 💥',
  },
  {
    ai: 'kael',
    name: 'Kael',
    avatar: 'assets/avatars/kael.png',
    front: 'Cậu lập trình viên logic đến từ Infernia.',
    back: 'Không đoán mò, chỉ tính xác suất.',
  },
  {
    ai: 'sira',
    name: 'Sira',
    avatar: 'assets/avatars/sira.png',
    front: 'Có chiến lược, tầm nhìn, mục tiêu.',
    back: 'Không ai đoán được tính cách của cô. 🌌',
  },
  {
    ai: 'elos',
    name: 'Elos',
    avatar: 'assets/avatars/elos.png',
    front: 'Quá trình mới quan trọng.',
    back: 'Mỗi ngày là một khởi đầu mới để học hỏi. ❄️',
  },
  {
    ai: 'nira',
    name: 'Nira',
    avatar: 'assets/avatars/nira.png',
    front: '“Nhanh gọn lẹ” là khẩu hiệu của Nira.',
    back: 'Không quan tâm quá trình, chỉ cần kết quả. 💥',
  },
];

export function renderAIList(containerSelector = '.ai-list') {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  container.innerHTML = '';

  aiList.forEach((ai) => {
    const card = document.createElement('div');
    card.className = 'ai-card';
    if (ai.selected) card.classList.add('selected');
    card.dataset.ai = ai.ai;
    card.dataset.name = ai.name;
    card.dataset.avatar = ai.avatar;

    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front">
          <img src="${ai.avatar}" alt="${ai.name} AI" />
          <h3>${ai.name}</h3>
          <p>${ai.front}</p>
        </div>
        <div class="card-back">
          <h3>${ai.name}</h3>
          <p>${ai.back}</p>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}
