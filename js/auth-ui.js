// js/auth-ui.js
import {
  logout,
  register,
  login,
  onAuthStateChanged,
  checkUsernameAvailable,
  getEmailByUsername,
} from './auth.js';

let isRegister = false;
// ✅ Kiểm tra email thuộc các domain phổ biến
function isValidEmail(email) {
  const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com'];
  const emailRegex = /^[^@]+@([^@]+\.[^@]+)$/;
  const match = email.match(emailRegex);
  if (!match) return false;
  const domain = match[1].toLowerCase();
  return allowedDomains.includes(domain);
}

// Lấy các phần tử giao diện
const modal = document.getElementById('auth-modal');
const title = document.getElementById('auth-title');
const form = document.getElementById('auth-form');
const fullnameInput = document.getElementById('auth-fullname');
const birthdayInput = document.getElementById('auth-birthday');
const genderInput = document.getElementById('auth-gender');
const usernameInput = document.getElementById('auth-username');
const emailInput = document.getElementById('auth-email');
const passwordInput = document.getElementById('auth-password');
const agreeCheckbox = document.getElementById('auth-agree');
const ruleLabel = document.getElementById('rule-label');
const ruleLink = document.getElementById('rule-link');
const actionBtn = document.getElementById('auth-action-btn');
const toggleBtn = document.getElementById('toggle-auth-btn');
const closeBtn = document.getElementById('close-auth-modal');
const message = document.getElementById('auth-message');
const rulePopup = document.getElementById('rule-popup');

// Hiển thị/ẩn các field theo mode đăng ký hay đăng nhập
function setRegisterMode(registerMode = false) {
  isRegister = registerMode;
  title.textContent = isRegister ? 'Đăng ký' : 'Đăng nhập';
  actionBtn.textContent = isRegister ? 'Đăng ký' : 'Đăng nhập';
  toggleBtn.textContent = isRegister
    ? 'Đã có tài khoản? Đăng nhập'
    : 'Chưa có tài khoản? Đăng ký';

  // Show/hide các trường
  [fullnameInput, birthdayInput, genderInput, usernameInput, ruleLabel].forEach(
    (el) => {
      el.style.display = isRegister ? '' : 'none';
    }
  );
  // Xóa lỗi, giá trị khi đổi mode
  agreeCheckbox.required = isRegister;

  message.textContent = '';
  form.reset();
}

// Bắt đầu show modal
export function showAuthModal(registerMode = false) {
  setRegisterMode(registerMode);
  modal.classList.remove('hidden');
}

toggleBtn.onclick = () => setRegisterMode(!isRegister);
closeBtn.onclick = () => modal.classList.add('hidden');

// Hiển thị popup quy định khi rê chuột hoặc click vào link
ruleLink.onclick = function () {
  rulePopup.style.display = 'block';
};

// Xử lý đăng ký/đăng nhập khi submit form
form.onsubmit = async (e) => {
  e.preventDefault();
  message.textContent = '';

  if (isRegister) {
    // ==== VALIDATION từng trường ====
    if (!fullnameInput.value.trim()) {
      message.textContent = 'Bạn phải nhập họ tên.';
      fullnameInput.focus();
      return;
    }
    if (!birthdayInput.value) {
      message.textContent = 'Bạn phải chọn ngày sinh.';
      birthdayInput.focus();
      return;
    }
    const birthDate = new Date(birthdayInput.value);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    if (isNaN(age) || age < 10 || age > 110) {
      message.textContent =
        'Ngày sinh không hợp lệ (chỉ nhận tuổi từ 10 đến 110).';
      birthdayInput.focus();
      return;
    }
    if (!genderInput.value) {
      message.textContent = 'Bạn phải chọn giới tính.';
      genderInput.focus();
      return;
    }
    // Username
    const username = usernameInput.value.trim().toLowerCase();
    if (!/^[a-zA-Z0-9]{4,16}$/.test(username)) {
      message.textContent =
        'Tên đăng nhập phải gồm 4-16 ký tự chữ/số, không dấu, không khoảng trắng.';
      usernameInput.focus();
      return;
    }
    // Check từ nhạy cảm (cơ bản)
    const blacklist = ['admin', 'mod', 'test', 'xxx', 'sex', 'fuck'];
    if (blacklist.some((word) => username.includes(word))) {
      message.textContent = 'Tên đăng nhập không hợp lệ!';
      usernameInput.focus();
      return;
    }
    // Check username trùng
    try {
      const available = await checkUsernameAvailable(username);
      if (!available) {
        message.textContent = 'Tên đăng nhập đã tồn tại. Chọn tên khác.';
        usernameInput.focus();
        return;
      }
    } catch {
      message.textContent = 'Lỗi kiểm tra tên đăng nhập. Thử lại sau!';
      return;
    }
    // Email
    // Email
    if (!isValidEmail(emailInput.value.trim())) {
      message.textContent = 'Email không hợp lệ';
      emailInput.focus();
      return;
    }

    // Password
    const pwd = passwordInput.value;
    if (
      !/^[a-zA-Z0-9!@#$%^&*()_+\-={}|;:,.<>?[\]]{6,12}$/.test(pwd) ||
      !/[a-zA-Z]/.test(pwd) ||
      !/[0-9]/.test(pwd)
    ) {
      message.textContent =
        'Mật khẩu 6-12 ký tự, phải có chữ và số, cho phép ký tự đặc biệt.';
      passwordInput.focus();
      return;
    }
    // Đồng ý quy định
    if (!agreeCheckbox.checked) {
      message.textContent = 'Bạn cần đồng ý với Quy định sử dụng.';
      return;
    }
    // ==== ĐĂNG KÝ ====
    try {
      await register(emailInput.value, pwd, fullnameInput.value.trim(), {
        username,
        birthday: birthdayInput.value,
        gender: genderInput.value,
      });
      message.textContent = 'Đăng ký thành công!';
      setTimeout(() => modal.classList.add('hidden'), 1000);
    } catch (err) {
      message.textContent = err.message || 'Đăng ký thất bại!';
    }
  } else {
    // ==== ĐĂNG NHẬP BẰNG EMAIL HOẶC USERNAME ====
    const loginInput = emailInput.value.trim();
    const pwd = passwordInput.value;
    // Kiểm tra nhập thiếu
    if (!loginInput) {
      message.textContent = 'Bạn phải nhập email hoặc tên đăng nhập.';
      emailInput.focus();
      return;
    }
    if (!pwd) {
      message.textContent = 'Bạn phải nhập mật khẩu.';
      passwordInput.focus();
      return;
    }
    let email = loginInput;
    // Nếu không có '@', coi là username, đi tìm email tương ứng
    if (!loginInput.includes('@')) {
      message.textContent = 'Đang kiểm tra username...';
      try {
        email = await getEmailByUsername(loginInput);
      } catch {
        message.textContent = 'Lỗi kiểm tra username!';
        return;
      }
      if (!email) {
        message.textContent = 'Tên đăng nhập không tồn tại!';
        emailInput.focus();
        return;
      }
    }
    try {
      await login(email, pwd);
      message.textContent = 'Đăng nhập thành công!';
      setTimeout(() => modal.classList.add('hidden'), 700);
    } catch (err) {
      if (err.code === 'auth/wrong-password') {
        message.textContent = 'Sai mật khẩu!';
      } else if (err.code === 'auth/user-not-found') {
        message.textContent = 'Không tìm thấy tài khoản!';
      } else if (err.code === 'auth/invalid-email') {
        message.textContent = 'Email hoặc username không hợp lệ!';
      } else {
        message.textContent = err.message || 'Đăng nhập thất bại!';
      }
    }
  }
};

/**
 * Bắt buộc đăng nhập mới cho chạy callback
 */
export function requireLogin(cb) {
  import('./firebase.js').then(({ auth }) => {
    if (!auth.currentUser) {
      showAuthModal(false);
      onAuthStateChanged((user) => {
        if (user) cb(user);
      });
    } else {
      cb(auth.currentUser);
    }
  });
}
// Log out

const logoutBtn = document.getElementById('logout-btn');

// Khi user đăng nhập thành công thì hiện nút Logout
onAuthStateChanged((user) => {
  if (user) {
    logoutBtn.style.display = '';
  } else {
    logoutBtn.style.display = 'none';
  }
});

logoutBtn.onclick = async () => {
  await logout();
  // Có thể reload lại hoặc show lại giao diện đăng nhập
  location.reload();
};
// Log out sau 10 phút
let inactivityTimer;

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(async () => {
    await logout(); // Gọi hàm logout đã định nghĩa ở trên
    alert('Bạn đã bị đăng xuất do không hoạt động trong 10 phút.');
    location.reload();
  }, 10 * 60 * 1000); // 10 phút = 600000 ms
}

// Lắng nghe tất cả thao tác của người dùng
['click', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach((evt) => {
  window.addEventListener(evt, resetInactivityTimer, true);
});

// Khi đăng nhập thành công, khởi động timer:
onAuthStateChanged((user) => {
  if (user) {
    resetInactivityTimer();
  } else {
    clearTimeout(inactivityTimer);
  }
});
