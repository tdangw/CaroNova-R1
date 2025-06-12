# CaroNova

├── index.html
├── index-ai.html - Chỉ chứa chế độ chơi AI (offline)
├── index-online.html - Chỉ chứa giao diện và tính năng online (đăng nhập, tạo phòng, tham gia phòng)
├── css
│ ├── base.css - Global style, font, màu nền, button chung
│ ├── board.css - Giao diện bàn cờ, cell, animation
│ ├── menu.css - Menu AI, menu online
│ ├── overlay.css - Các lớp overlay chung (xác nhận, thắng, thua)
│ └── responsive.css - Tách riêng responsive (mobile, tablet, PC)
├── js
│ ├── auth
│ │ ├──
│ │ └── auth-ui.js
│ ├── game
│ │ ├── board.js
│ │ ├── logic.js
│ │ ├── timer.js
│ │ ├── soundManager.js
│ │ ├── game-reset.js
│ │ └── ai
│ │ ──├── ai-basic.js
│ │ ──├── ai-nova.js
│ │ ──└── ...
│ ├── firebase
│ │ ├── auth.js
│ │ ├──
│ │ ├──
│ ├── online
│ │ ├── firebase-room.js
│ │ └── online-game.js
│ ├── ui
│ │ └── novaReaction.js
│ └── shop
│ ├── shop.js - logic hiển thị shop, mua bán
│ ├── inventory.js - quản lý vật phẩm đã mua
│ └── currency.js - quản lý tiền tệ trong game
├── assets
│ ├── avatars
│ ├── sound
│ └── shop
│ ──├── avatars
│ ──├── skins
│ ──├── effects
│ ──└── emojis
└── README.md

## Tính năng cần bổ sung/cải thiện chế độ online

1. Chơi lại nhiều ván liên tục:

- Tính năng reset bàn cờ online cần rõ ràng, tránh lỗi.
- Hiện tại có file game-reset.js, cần gọi đúng khi người dùng chọn chơi lại.

2. Xóa phòng hợp lý:

- Tự động xóa phòng nếu hết hạn.

- Cho phép người tạo phòng hủy phòng dễ dàng.

3. Chuyển trạng thái: rõ ràng giữa phòng waiting, active, và finished.

4. Realtime cập nhật thông tin người chơi: Dùng onSnapshot() để cập nhật trạng thái nhanh chóng hơn.

## Tính năng nâng cao

1. Hệ thống Rank, bảng xếp hạng online (leaderboard).
2. Chế độ thử thách hằng ngày với phần thưởng đặc biệt.
3. Hệ thống Friend List để dễ dàng chơi lại cùng nhau.
4. Cho phép người dùng xem lại lịch sử trận đấu để phân tích chiến thuật.

## Tính năng Shop

1. Skin X/O (đa dạng chủ đề như Neon, Classic, Retro…)
2. Avatar người chơi
3. Khung viền bàn cờ đặc biệt
4. Hiệu ứng chiến thắng (pháo hoa, kim tuyến)
5. Biểu cảm tương tác AI đặc biệt

## Tối ưu Responsive

1. Dùng CSS Grid hoặc Flexbox hiệu quả hơn.
2. Nên sử dụng media queries rõ ràng cho từng thiết bị.
3. Test giao diện liên tục trên thiết bị thực tế.

## Clean Code

1. Tên rõ ràng – Biến, hàm, class đặt tên có ý nghĩa.
2. Hàm ngắn, một nhiệm vụ – Mỗi hàm chỉ làm một việc.
3. Tránh lặp code – Dùng hàm, vòng lặp, abstraction.
4. Tái sử dụng – Viết hàm, biến có thể tái sử dụng thay vì hard-code.
5. Comment hợp lý – Giải thích chỗ phức tạp, tránh comment dư thừa.
6. Định dạng chuẩn – Sử dụng formatter, giữ code dễ đọc.
7. Có Unit Test – Test giúp code ổn định, dễ bảo trì.
8. Theo convention – Tuân theo chuẩn ngôn ngữ/công ty.
9. Tách module rõ ràng – Không dồn hết code vào một file.
10. Không nhúng CSS vào HTML/JS – CSS phải được viết riêng trong các file `.css` tương ứng.
11. Refactor thường xuyên – Cải tiến code sau khi chạy ổn.
12. Nguyên tắc DRY / KISS / YAGNI – Giữ code đơn giản, không thừa.
13. Không dùng magic numbers hoặc strings trực tiếp – Đặt vào biến hằng số (const/enum) để dễ đọc và dễ bảo trì.
14. Hạn chế dùng biến global – Giữ phạm vi biến nhỏ nhất có thể để tránh side effect.
15. Đặt tên theo ngữ cảnh – Sử dụng tên biến sát với domain để dễ hiểu hơn.
16. Tách logic UI và logic xử lý – Trong frontend, tách rõ phần hiển thị và phần xử lý nghiệp vụ.
17. Tối ưu responsive – Sử dụng media queries, layout linh hoạt (flex/grid), đơn vị tương đối (%, rem, vh/vw) thay vì px cố định.

## 📱 Responsive Best Practices

1. **Mobile-first** – Thiết kế giao diện cho thiết bị nhỏ trước, sau đó mở rộng cho thiết bị lớn (dùng `min-width` trong media queries).
2. **Sử dụng đơn vị linh hoạt** – Dùng `%`, `vw`, `vh`, `em`, `rem` thay vì `px` để layout dễ co giãn.
3. **Dùng Flexbox hoặc Grid** – Ưu tiên Flexbox hoặc CSS Grid để tạo layout thích ứng thay vì `float` hoặc `position: absolute`.
4. **Media Queries rõ ràng** – Đặt các ngưỡng (breakpoints) hợp lý, ví dụ:
   - `max-width: 600px` (mobile)
   - `max-width: 768px` (tablet)
   - `max-width: 1024px` (small desktop)
5. **Ẩn/hiện hợp lý** – Dùng class CSS hoặc media query để thay đổi hiển thị, tránh lạm dụng `display: none` gây mất accessibility.
6. **Ảnh và video responsive** – Dùng `max-width: 100%` và `height: auto` để ảnh/video co giãn theo khung.
7. **Font chữ linh hoạt** – Dùng `em` hoặc `rem` thay vì `px` để kích cỡ chữ co giãn hợp lý theo thiết bị.
8. **Test đa thiết bị** – Kiểm tra trên nhiều kích thước màn hình thực tế hoặc dùng DevTools giả lập.
9. **Tránh tràn nội dung** – Dùng `overflow-wrap`, `word-break` để tránh text bị tràn hoặc vỡ layout.
10. **Tối ưu touch & spacing** – Trên mobile, cần tăng kích thước vùng bấm (tap area) và khoảng cách giữa các phần tử.

# nhiệm vụ

Dạng 1: Thắng ván (Victory-based)
Mã type: "win", "win_online", "win_streak"...
Dạng 2: Chơi đủ số ván (Participation-based)
Mã type: "play", "play_online", "play_ai"...
🎯 Nhiệm vụ combo (thắng 3 ván liên tiếp)

🧠 Nhiệm vụ theo AI cụ thể (đánh bại Nova/Zeta)

⏳ Nhiệm vụ giới hạn thời gian (thắng trong 30 giây)

🎁 Nhiệm vụ ẩn hoặc ngẫu nhiên mỗi ngày

# Test

🏷️ ID 📘 Mô tả nhiệm vụ 🔁 Mã type 🎁 Thưởng
daily-play-2 Chơi 2 ván bất kỳ play 1 💰
daily-win-1 Thắng 1 ván win 2 💰
daily-win-streak Thắng liên tiếp 3 ván win_streak 5 💰
daily-win-nova Đánh bại Nova win_ai_nova 3 💰
daily-win-fast Thắng trong 30 giây win_fast_30s 6 💰

Cách xáo trộn nhiệm vụ từ danh sách có sẵn
Thay thế nhiệm vụ đã hoàn thành
Tự động thay thế
Khi một nhiệm vụ hoàn thành:

Xóa khỏi danh sách hiển thị

Chọn 1 nhiệm vụ chưa xuất hiện từ danh sách dự phòng

Gợi ý cải tiến hệ thống nhiệm vụ:

1.  Nhiệm vụ có phần thưởng đặc biệt
    Một số có biểu tượng 🎁 (thêm skin/emoji ngẫu nhiên)

Một số hiếm sẽ có meta.special: true

⏳ 2. Nhiệm vụ giới hạn thời gian thực
expiresAt trong meta → sau thời gian sẽ ẩn đi

Dùng timestamp Date.now() để so sánh

📈 3. Hệ thống chuỗi nhiệm vụ (quest chain)
questA hoàn thành mới mở questB

Dùng requires: 'id-cua-quest-khac' để quản lý chuỗi

🧠 4. Nhiệm vụ cá nhân hoá
Giao cho từng người khác nhau mỗi ngày

Dựa trên AI yêu thích, skin đã sở hữu…

Tính năng Mô tả
✅ Đánh dấu nhiệm vụ hiếm Thêm q.meta?.special === true để hiển thị biểu tượng 🎁
🧠 Tooltip phần thưởng Hover để xem chi tiết (vd: Skin, emoji)
🌀 Tự động reset daily nhiệm vụ vào 00:00 Gắn setInterval để xóa cache sau nửa đêm
