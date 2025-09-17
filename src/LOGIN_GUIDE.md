# Hướng dẫn đăng nhập DSFMS

## Cấu trúc Routing mới

### **Trang chủ (`/`):**

- Hiển thị trang đăng nhập
- Không cần authentication

### **Trang Admin (`/admin`):**

- Yêu cầu đăng nhập
- Tự động redirect về `/` nếu chưa đăng nhập
- Chứa tất cả các trang quản lý

## Tài khoản Demo

| Role        | Email             | Password   | Quyền         |
| ----------- | ----------------- | ---------- | ------------- |
| **Admin**   | admin@dsfms.com   | admin123   | Toàn quyền    |
| **Trainer** | trainer@dsfms.com | trainer123 | Quyền trainer |
| **Trainee** | trainee@dsfms.com | trainee123 | Quyền trainee |

## Cách sử dụng

1. **Truy cập trang chủ:** `http://localhost:5173/dsfms-template/`
2. **Nhập thông tin đăng nhập** từ bảng trên
3. **Sau khi đăng nhập thành công** sẽ tự động chuyển đến `/admin`
4. **Để đăng xuất** click vào avatar ở góc phải header

## Tính năng

### **Authentication:**

- ✅ Hardcoded credentials (tạm thời)
- ✅ LocalStorage persistence
- ✅ Auto-login khi refresh page
- ✅ Protected routes
- ✅ Logout functionality

### **Routing:**

- ✅ `/` → Login page
- ✅ `/admin` → Admin dashboard (protected)
- ✅ `/admin/users` → User Management
- ✅ `/admin/roles` → Role Management
- ✅ Auto redirect nếu chưa đăng nhập

### **UI/UX:**

- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling
- ✅ Demo credentials hiển thị trên form

## Khi có Backend API

Chỉ cần thay đổi logic trong `src/pages/Auth/Login.jsx`:

```jsx
// Thay thế hardcoded credentials
const response = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});

const data = await response.json();
if (data.success) {
  // Set auth state và navigate
}
```

## Cấu trúc Files

```
src/
├── pages/Auth/
│   └── Login.jsx              # Trang đăng nhập
├── components/Common/
│   └── ProtectedRoute.jsx     # Bảo vệ routes
├── context/
│   └── AuthContext.jsx        # Quản lý auth state
├── hooks/
│   └── useAuth.js             # Hook sử dụng auth
└── routes/
    └── router.jsx             # Cấu hình routing
```
