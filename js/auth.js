// js/auth.js
import { auth, db } from './firebase.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged as firebaseOnAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

/**
 * Kiểm tra username đã tồn tại chưa
 * @param {string} username
 * @returns {Promise<boolean>} true nếu username chưa tồn tại
 */
export async function checkUsernameAvailable(username) {
  const q = query(collection(db, 'users'), where('username', '==', username));
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty;
}

/**
 * Đăng ký tài khoản mới và lưu profile vào Firestore
 * @param {string} email
 * @param {string} password
 * @param {string} fullname
 * @param {object} extra {username, birthday, gender}
 */
export async function register(email, password, fullname, extra = {}) {
  try {
    // Đăng ký Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    // Cập nhật tên hiển thị cho user
    await updateProfile(userCredential.user, { displayName: fullname });
    // Lưu thông tin profile vào Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email,
      displayName: fullname,
      ...extra,
      createdAt: new Date(),
      status: 'active',
    });
    return userCredential.user;
  } catch (error) {
    // Xử lý lỗi chi tiết
    let message = '';
    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'Email này đã được sử dụng!';
        break;
      case 'auth/invalid-email':
        message = 'Email không hợp lệ!';
        break;
      case 'auth/weak-password':
        message = 'Mật khẩu quá yếu (tối thiểu 6 ký tự)!';
        break;
      case 'auth/network-request-failed':
        message = 'Không thể kết nối tới máy chủ, kiểm tra lại internet!';
        break;
      default:
        message = 'Đăng ký thất bại: ' + error.message;
    }
    throw new Error(message);
  }
}

/**
 * Đăng nhập tài khoản
 */
export async function login(email, password) {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential.user;
}

/**
 * Đăng xuất
 */
export async function logout() {
  await signOut(auth);
}

/**
 * Theo dõi trạng thái đăng nhập
 */
export function onAuthStateChanged(cb) {
  firebaseOnAuthStateChanged(auth, cb);
}
/**
 * Truy vấn Firestore lấy email theo username
 * @param {string} username - Tên đăng nhập người dùng nhập
 * @returns {Promise<string|null>} - Trả về email nếu tìm thấy, null nếu không có
 */
export async function getEmailByUsername(username) {
  const q = query(
    collection(db, 'users'),
    where('username', '==', username.toLowerCase())
  );
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  return querySnapshot.docs[0].data().email;
}
// Hiển thị tên sau khi đăng nhập
function setupOnlineMenuUserInfo() {
  const nameLabel = document.getElementById('display-name-label');
  const logoutBtn = document.getElementById('logout-btn');
  if (!nameLabel || !logoutBtn) return;

  onAuthStateChanged((user) => {
    if (user) {
      nameLabel.textContent = user.displayName || user.email || 'Ẩn danh';
      logoutBtn.style.display = '';
    } else {
      nameLabel.textContent = '--';
      logoutBtn.style.display = 'none';
    }
  });

  logoutBtn.onclick = async () => {
    await logout();
    location.reload();
  };
}

// Gọi hàm này mỗi khi overlay online hiện ra (mỗi lần show #online-menu)
if (document.getElementById('online-menu')) {
  setupOnlineMenuUserInfo();
}
