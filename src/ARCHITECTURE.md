# Cấu trúc Architecture mới

## Tổng quan

Dự án đã được refactor để có cấu trúc component và routing hợp lý hơn, tuân thủ best practices của React.

## Cấu trúc thư mục

```
src/
├── components/
│   ├── Layout/
│   │   ├── LayoutWrapper.jsx    # Wrapper component cho layout
│   │   ├── MainLayout.jsx       # Layout chính
│   │   ├── Header.jsx           # Header component
│   │   ├── Sidebar.jsx          # Sidebar component
│   │   └── index.js             # Export tất cả layout components
│   ├── Dashboard/               # Các sub-components cho dashboard
│   │   ├── User/                # User-related components
│   │   ├── Role/                # Role-related components
│   │   └── ...                  # Other dashboard components
│   ├── Common/                  # Các component dùng chung
│   └── ...
├── hooks/                       # Custom hooks
│   ├── useUserManagement.js     # Hook cho quản lý user
│   ├── useRoleManagement.js     # Hook cho quản lý role
│   ├── useDashboard.js          # Hook cho dashboard
│   └── useAuth.js               # Hook cho authentication
├── pages/                       # Page components (tự chứa UI + logic)
│   ├── Auth/
│   ├── Dashboard/
│   ├── UserManagement/          # Gộp UI + logic trong một file
│   └── RoleManagement/          # Gộp UI + logic trong một file
├── routes/
│   └── router.jsx               # Router configuration
└── ...
```

## Thay đổi chính

### 1. LayoutWrapper Component

Tạo `LayoutWrapper` component để wrap các trang cần layout:

```jsx
// src/components/Layout/LayoutWrapper.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import MainLayout from "./MainLayout";

const LayoutWrapper = () => {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};
```

### 2. Router Structure

Sử dụng nested routes với LayoutWrapper:

```jsx
// src/routes/router.jsx
export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <LayoutWrapper />,
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "users",
        element: <UserManagementPage />,
      },
      {
        path: "roles",
        element: <RoleManagementPage />,
      },
    ],
  },
]);
```

### 3. Custom Hooks

Tách logic ra khỏi components thành custom hooks:

- `useUserManagement.js`: Quản lý state và logic cho User Management
- `useRoleManagement.js`: Quản lý state và logic cho Role Management
- `useDashboard.js`: Quản lý state và logic cho Dashboard

### 4. Page Components (Tối ưu hóa)

Các page components giờ tự chứa cả UI và logic, sử dụng custom hooks:

```jsx
// src/pages/UserManagement/UserManagementPage.jsx
const UserManagementPage = () => {
  const {
    users: filteredUsers,
    loading,
    error,
    // ... other state and handlers
  } = useUserManagement();

  return (
    <Container fluid className="py-4">
      <Card>
        <Card.Header>
          <h5>User Management</h5>
        </Card.Header>
        <Card.Body>{/* Search, filters, table, modals */}</Card.Body>
      </Card>
    </Container>
  );
};
```

**Lợi ích của cấu trúc mới:**

- Loại bỏ wrapper components không cần thiết
- Mỗi page tự chứa UI hoàn chỉnh
- Vẫn tách logic ra custom hooks để tái sử dụng
- Giảm số lượng files và complexity

## Lợi ích

1. **Separation of Concerns**: Logic và UI được tách biệt rõ ràng
2. **Reusability**: Custom hooks có thể tái sử dụng
3. **Maintainability**: Code dễ maintain và test hơn
4. **Consistency**: Layout được quản lý tập trung
5. **Performance**: Tránh re-render không cần thiết

## Cách sử dụng

### Thêm trang mới

1. Tạo page component trong `src/pages/`
2. Thêm route vào `src/routes/router.jsx` trong children của LayoutWrapper
3. Tạo custom hook nếu cần logic phức tạp

### Thêm layout mới

1. Tạo layout component trong `src/components/Layout/`
2. Tạo wrapper component tương tự LayoutWrapper
3. Cập nhật router để sử dụng layout mới

## Best Practices

1. **Custom Hooks**: Tách logic phức tạp ra custom hooks
2. **Component Composition**: Sử dụng composition thay vì inheritance
3. **Single Responsibility**: Mỗi component chỉ có một trách nhiệm
4. **Props Drilling**: Tránh props drilling bằng custom hooks
5. **Error Boundaries**: Sử dụng error boundaries cho error handling
