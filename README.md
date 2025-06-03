# CaroNova

- **Đăng ký và Quản lý tài khoản online CaroNova**

  - Đăng ký tài khoản qua **Email** và **Username**
  - Mỗi email chỉ tạo được một tài khoản (chuẩn Firebase Auth)
  - Username duy nhất, kiểm tra trùng trước khi cho phép đăng ký
  - Kiểm tra, báo lỗi khi nhập thiếu, trùng, hoặc sai định dạng

- **Form đăng ký đầy đủ trường:**

  - Họ tên
  - Ngày sinh
  - Giới tính
  - Email
  - Tên đăng nhập
  - Mật khẩu
  - Bắt buộc đồng ý với **Quy định sử dụng** (chỉ hiện popup khi click)
  - Lọc từ nhạy cảm trong username, kiểm tra độ mạnh mật khẩu

- **Đăng nhập bằng email hoặc username**

  - Người dùng có thể đăng nhập bằng email hoặc tên đăng nhập
  - Hệ thống tự động tìm email theo username khi cần

- **Lưu thông tin mở rộng vào Firestore**

  - Khi đăng ký thành công, lưu profile vào `users/{uid}` trên Firestore

- **Thiết lập Firestore rules an toàn**

  - Mỗi user chỉ được phép đọc/ghi profile của chính mình
  - Cho phép tất cả user tra cứu username (chỉ để login)

- **Thông báo lỗi rõ ràng trên giao diện**

  - Hiển thị lỗi từng trường, không gửi request nếu còn lỗi
  - Thông báo chi tiết lý do thất bại khi đăng ký/đăng nhập

- **Giao diện popup Quy định sử dụng**
  - Chỉ click mới hiện popup, không hiện khi hover
  - Các thông tin như Quy định sử dụng, Version được để trực tiếp trong `index.html` (có thể tách file riêng khi cần)

---

## 🔜 Dự kiến bổ sung / TODO

- Quản lý tài khoản nâng cao (reset mật khẩu, xác thực email…)
- Trang quản lý profile người dùng (cập nhật avatar, thông tin cá nhân)
- Tính năng “Quên mật khẩu”
- Giao diện quản trị/duyệt user cho admin (nếu cần)
- Đa ngôn ngữ hoặc tách nội dung popup rule/version thành file riêng
