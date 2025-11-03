# Phân Tích Permission Matching Cho Academic Department

## Vấn đề: Action "View Details" và "Archive Course" bị disabled

### Permissions Code Đang Sử Dụng:

1. **`API_PERMISSIONS.COURSES.VIEW_DETAIL`** = `"GET /courses/:id"`
2. **`API_PERMISSIONS.COURSES.UPDATE`** = `"PUT /courses/:id"`
3. **`API_PERMISSIONS.COURSES.ARCHIVE`** = `"PATCH /courses/:courseId/archive"`

### Permissions Đã Tick Trong Role:

- ✅ **View Course Detail** - Selected
- ✅ **Update Course** - Selected
- ✅ **Archive Course** - Selected

### Cách `hasPermission()` Check:

Hàm `hasPermission()` trong `usePermissions.js` check 3 cách:

1. `userPermissionNames.has(permissionName)` - So sánh với `permission.name`
2. `userPermissionPaths.has(permissionName)` - So sánh với `permission.path`
3. `userPermissionIds.has(permissionName)` - So sánh với `permission.id`

### Vấn Đề Có Thể Xảy Ra:

**Mismatch giữa Backend Permission Name và Frontend Constant:**

Backend có thể trả về permission với:

- `name`: `"View Course Detail"` (text description)
- `path`: `"/courses/:id"` hoặc `"/courses/:courseId"`
- `id`: UUID

Nhưng code check:

- `"GET /courses/:id"` (method + path format)

**Nếu backend permission có:**

- `name`: `"View Course Detail"`
- `path`: `"/courses/:id"`

Thì `hasPermission("GET /courses/:id")` sẽ:

- ❌ `userPermissionNames.has("GET /courses/:id")` = false (vì name là "View Course Detail")
- ✅ `userPermissionPaths.has("GET /courses/:id")` = ??? (phụ thuộc vào path format)

### Giải Pháp:

Cần kiểm tra format permission thực tế từ backend. Có 2 cách:

#### Cách 1: Check Console Log

Thêm debug log trong `CourseActions.jsx` để xem permissions thực tế:

```javascript
console.log("Permissions:", {
  checking: API_PERMISSIONS.COURSES.VIEW_DETAIL,
  userPermissions: userPermissions?.filter(
    (p) =>
      p.name?.toLowerCase().includes("course") || p.path?.includes("/courses")
  ),
  allUserPermissions: userPermissions?.map((p) => ({
    name: p.name,
    path: p.path,
    id: p.id,
  })),
});
```

#### Cách 2: Kiểm Tra Backend Response

Check API response từ `/roles/:roleId` hoặc `/permissions` để xem format permission name/path thực tế.

### Permissions Cần Match:

1. **View Course Detail:**

   - Code check: `"GET /courses/:id"`
   - Backend có thể có: `name: "View Course Detail"`, `path: "/courses/:id"` hoặc `/courses/:courseId`

2. **Update Course (Archive):**
   - Code check: `"PUT /courses/:id"` (cho UPDATE)
   - Nhưng Archive Course dùng: `"PATCH /courses/:courseId/archive"`
   - ⚠️ **VẤN ĐỀ**: Code check `UPDATE` permission nhưng Archive Course nên check `ARCHIVE` permission!

### Kết Luận:

Có 2 khả năng:

1. **Format mismatch**: Backend permission name/path không khớp với frontend constant
2. **Sai permission check**: Archive Course đang check `UPDATE` nhưng nên check `ARCHIVE`

### Đề Xuất Fix:

1. Sửa `CourseActions.jsx` để Archive Course check `API_PERMISSIONS.COURSES.ARCHIVE` thay vì `UPDATE`
2. Hoặc đảm bảo backend trả về permission với format đúng
