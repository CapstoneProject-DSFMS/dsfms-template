# API Integration Guide

## Cấu trúc API Service

### 1. Cấu hình API (`src/api/config.js`)

- Sử dụng axios để tạo HTTP client
- Tự động thêm Authorization header với JWT token
- Xử lý lỗi 401 (token hết hạn) tự động
- Timeout 10 giây

### 2. Auth API Service (`src/api/auth.js`)

Các function có sẵn:

- `login(credentials)` - Đăng nhập
- `refreshToken(refreshToken)` - Làm mới token
- `checkStatus()` - Kiểm tra trạng thái auth
- `logout()` - Đăng xuất (clear localStorage)

### 3. AuthContext (`src/context/AuthContext.jsx`)

Context cung cấp:

- `user` - Thông tin user hiện tại
- `isAuthenticated` - Trạng thái đăng nhập
- `isLoading` - Trạng thái loading
- `login(credentials)` - Function đăng nhập
- `logout()` - Function đăng xuất

## Cách sử dụng

### 1. Sử dụng trong component

```jsx
import { useAuth } from "../hooks/useAuth";

const MyComponent = () => {
  const { user, isAuthenticated, login, logout, isLoading } = useAuth();

  const handleLogin = async () => {
    const result = await login({
      email: "user@example.com",
      password: "password",
    });

    if (result.success) {
      console.log("Login successful:", result.user);
    } else {
      console.error("Login failed:", result.error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.email}</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
};
```

### 2. Gọi API trực tiếp

```jsx
import { authAPI } from "../api";

const handleDirectAPI = async () => {
  try {
    const response = await authAPI.login({
      email: "user@example.com",
      password: "password",
    });
    console.log("Response:", response);
  } catch (error) {
    console.error("Error:", error);
  }
};
```

## Setup và Cấu hình

### 1. Environment Variables

**Tạo file `.env` trong thư mục root:**

```bash
# Tạo file .env
echo "VITE_API_BASE_URL=http://localhost:4000" > .env
```

**Hoặc copy từ template:**

```bash
cp .env.example .env
```

### 2. API Base URL

- Mặc định: `http://localhost:4000`
- Có thể override bằng environment variable `VITE_API_BASE_URL` trong file `.env`
- Hoặc thay đổi trong `src/config/api.js`

**File `.env`:**

```
VITE_API_BASE_URL=http://localhost:4000
```

### 3. Test Credentials

- Email: `michael.brown@admin.com`
- Password: `Admin@123`

## Cấu trúc thư mục

```
dsfms-template/
├── .env                   # Environment variables
├── .env.example           # Environment template
├── src/
│   ├── api/
│   │   ├── config.js      # Axios configuration
│   │   ├── auth.js        # Auth API functions
│   │   └── index.js       # API exports
│   ├── config/
│   │   └── api.js         # API configuration constants
│   ├── context/
│   │   └── AuthContext.jsx # Auth context provider
│   ├── hooks/
│   │   └── useAuth.js     # Auth hook
│   └── components/
│       └── LoginForm.jsx  # Example login form
```

## Test API

### 1. Start Backend Server

```bash
cd dsfms
npm run start:dev
```

### 2. Start Frontend Server

```bash
cd dsfms-template
npm run dev
```

### 3. Test Login

- Mở browser: `http://localhost:5173`
- Sử dụng component `LoginForm` hoặc gọi API trực tiếp
- Test credentials: `michael.brown@admin.com` / `Admin@123`

### 4. Check Network Tab

- Mở Developer Tools (F12)
- Xem Network tab để kiểm tra API calls
- Verify headers có Authorization token

## Lưu ý

- Tất cả API calls đều được wrap trong try-catch
- Token được tự động thêm vào header
- Khi token hết hạn, user sẽ được redirect về login
- Loading state được quản lý tự động
- File `.env` phải được tạo trong thư mục root của frontend
