# PERM-XX Migration Plan - Complete Conversion

## 📋 BE Response Structure (NEW)

BE trả về format mới từ `/roles/{{roleId}}`:

```json
{
  "data": {
    "permissionGroups": [
      {
        "featureGroup": "Course Management",
        "permissionCount": 7,
        "permissions": [
          {
            "code": "PERM-023",
            "name": "Create Course"
          }
        ]
      }
    ]
  }
}
```

**Key Changes:**

- ✅ Permissions có `code` field (PERM-XX) thay vì UUID
- ✅ Permissions được group theo `featureGroup`
- ✅ Không còn `id` (UUID), `method`, `path`, `isActive` fields

---

## 🎯 Migration Strategy

### **Phase 1: Normalize Permissions từ BE Response**

**File:** `src/context/AuthContext.jsx`

**Tasks:**

1. Tạo function `normalizePermissionsFromResponse()` để:
   - Extract permissions từ `permissionGroups[].permissions[]`
   - Flatten thành array
   - Format: `{ code: "PERM-023", name: "Create Course", featureGroup: "Course Management" }`
   - Lưu vào `userPermissions` state

**Expected Output:**

```javascript
userPermissions = [
  {
    code: "PERM-023",
    name: "Create Course",
    featureGroup: "Course Management",
  },
  {
    code: "PERM-024",
    name: "View All Courses",
    featureGroup: "Course Management",
  },
  // ...
];
```

**Update:** `fetchUserRoleAndPermissions()` function để normalize response mới

---

### **Phase 2: Simplify hasPermission() - Chỉ Check PERM-XX**

**File:** `src/hooks/usePermissions.js`

**Tasks:**

1. Bỏ hết logic cũ (lines 213-484):

   - ❌ UUID check
   - ❌ Name normalization
   - ❌ BE → Navigation mapping
   - ❌ Fuzzy matching
   - ❌ Keyword matching
   - ❌ Fallback matching

2. Logic mới (chỉ giữ lại):

   ```javascript
   const hasPermission = useCallback(
     (permCode) => {
       if (!userPermissions || userPermissions.length === 0) {
         return false;
       }

       if (!permCode || typeof permCode !== "string") {
         return false;
       }

       // CHỈ CHECK PERM-XX CODE
       return userPermissionCodes.has(permCode);
     },
     [userPermissionCodes]
   );
   ```

3. Update `userPermissionCodes` Set:
   - Lấy từ `permission.code` field (PERM-XX)
   - Không cần UUID nữa

**Expected Behavior:**

- `hasPermission("PERM-009")` → Check `userPermissionCodes.has("PERM-009")`
- Return `true/false` immediately

---

### **Phase 3: Update Sidebar Mapping với PERM-XX**

**File:** `src/utils/sidebarUtils.js`

**Tasks:**

1. Update `getAllNavItems()`:

   - Thay tất cả UUID → PERM-XX trong `permission` và `permissions` fields
   - Thêm `excludePermissions` cho các items cần phân biệt
   - Bỏ `roleFilter` (không dùng nữa)

2. Update `getAccessibleNavItems()`:
   - Bỏ role-based hardcode filtering
   - Chỉ check permission + excludePermissions
   - Logic check children cho dropdown parents

**Mapping theo:** `SIDEBAR_PERM_MAPPING.md`

---

### **Phase 4: Update Router Protection**

**File:** `src/routes/router.jsx`

**Tasks:**

1. Tìm tất cả `<PermissionRoute>` components
2. Thay UUID → PERM-XX trong `permission` prop
3. Test từng route với các roles

**Example:**

```jsx
// Cũ
<PermissionRoute permission={PERMISSION_IDS.VIEW_ALL_USERS}>

// Mới
<PermissionRoute permission="PERM-009">
```

---

### **Phase 5: Update Component Checks**

**Files:** Tất cả components dùng `PermissionWrapper` hoặc `hasPermission()`

**Tasks:**

1. Tìm tất cả `hasPermission(UUID)` → đổi thành `hasPermission("PERM-XX")`
2. Tìm tất cả `PermissionWrapper permission={UUID}` → đổi thành PERM-XX
3. Test từng feature

**Strategy:**

- Chia theo feature groups
- Update từng component
- Test từng feature

---

### **Phase 6: Cleanup - Bỏ Code Không Dùng**

**Tasks:**

1. Xóa `src/utils/permissionNormalizer.js`
2. Xóa `src/utils/permissionNameMapper.js`
3. Xóa `src/constants/ucPermissionsMapping.js` (nếu không dùng)
4. Update `src/constants/permissionIds.js`:
   - Đổi từ UUID → PERM-XX
   - Hoặc tạo mới từ `permissions_list.json`
5. Cleanup imports, comments
6. Bỏ temporary bypass logic (TRAINEE bypass)

---

## 📝 Detailed Implementation Steps

### **Step 1: Normalize Permissions (AuthContext.jsx)**

```javascript
// Function để normalize permissions từ BE response mới
const normalizePermissionsFromResponse = (roleData) => {
  if (
    !roleData?.permissionGroups ||
    !Array.isArray(roleData.permissionGroups)
  ) {
    return [];
  }

  const permissions = [];

  roleData.permissionGroups.forEach((group) => {
    if (group.permissions && Array.isArray(group.permissions)) {
      group.permissions.forEach((perm) => {
        permissions.push({
          code: perm.code, // PERM-XX
          name: perm.name, // Permission name
          featureGroup: group.featureGroup,
        });
      });
    }
  });

  return permissions;
};

// Update fetchUserRoleAndPermissions()
const fullRoleData = await roleAPI.getRoleById(roleId);
const permissions = normalizePermissionsFromResponse(
  fullRoleData.data || fullRoleData
);
```

---

### **Step 2: Simplify hasPermission() (usePermissions.js)**

```javascript
// Create Set of permission codes for O(1) lookup
const userPermissionCodes = useMemo(() => {
  if (!userPermissions || userPermissions.length === 0) return new Set();
  return new Set(userPermissions.map((p) => p.code).filter(Boolean));
}, [userPermissions]);

// Simplified hasPermission()
const hasPermission = useCallback(
  (permCode) => {
    if (!userPermissions || userPermissions.length === 0) {
      return false;
    }

    if (!permCode || typeof permCode !== "string") {
      return false;
    }

    // CHỈ CHECK PERM-XX CODE
    return userPermissionCodes.has(permCode);
  },
  [userPermissionCodes]
);
```

---

### **Step 3: Update Sidebar (sidebarUtils.js)**

```javascript
// Example: Admin Departments
{
  id: "departments",
  label: "Departments",
  path: ROUTES.DEPARTMENTS,
  permissions: ["PERM-019", "PERM-021"],
  requireAll: true
}

// Example: Academic Department dropdown
{
  id: "department",
  label: "Department",
  path: ROUTES.DEPARTMENTS,
  permission: "PERM-019",
  excludePermissions: ["PERM-021"]  // Không có Update Department
}

// Example: Trainee All Assessments (dropdown)
{
  id: "all-assessments",
  label: "All Assessments",
  path: ROUTES.ASSESSMENTS_MY_ASSESSMENTS,
  // Không có permission - chỉ check children
  children: [
    {
      id: "your-assessments",
      permission: "PERM-059",  // Chỉ cần PERM-059 (không cần PERM-062 nữa)
    }
  ]
}
```

---

## ✅ Testing Checklist

### **Phase 1 Testing:**

- [ ] Login với Admin → check permissions được normalize đúng
- [ ] Check `userPermissions` array có format đúng
- [ ] Check `userPermissionCodes` Set có đầy đủ PERM-XX

### **Phase 2 Testing:**

- [ ] `hasPermission("PERM-009")` return đúng
- [ ] `hasPermission("PERM-999")` return false (không có)
- [ ] `hasAnyPermission(["PERM-009", "PERM-010"])` return đúng
- [ ] `hasAllPermissions(["PERM-019", "PERM-021"])` return đúng

### **Phase 3 Testing:**

- [ ] Login với từng role → check sidebar items hiển thị đúng
- [ ] Check dropdown parents hiển thị khi có child
- [ ] Check children filter đúng
- [ ] Check excludePermissions logic

### **Phase 4 Testing:**

- [ ] Login với role không có permission → check route bị block
- [ ] Login với role có permission → check route access được
- [ ] Direct URL access → check protection hoạt động

### **Phase 5 Testing:**

- [ ] Check từng component với permission
- [ ] Buttons hiện/ẩn đúng
- [ ] Actions hoạt động đúng
- [ ] Modals hiện/ẩn đúng

### **Phase 6 Testing:**

- [ ] Regression test toàn bộ app
- [ ] Check không còn lỗi import
- [ ] Check console không có warnings

---

## 🚨 Risks & Mitigation

### **Risk 1: BE Response Structure Thay Đổi**

- **Mitigation:** Validate response structure, log warnings nếu thiếu fields

### **Risk 2: Migration Không Đồng Bộ**

- **Mitigation:** Test từng phase, có rollback plan

### **Risk 3: Miss Edge Cases**

- **Mitigation:** Test kỹ với các roles, review code

### **Risk 4: Performance Regression**

- **Mitigation:** Benchmark, optimize Set lookup

---

## 📊 Success Criteria

1. ✅ Tất cả sidebar items hiển thị đúng theo PERM-XX
2. ✅ Router protection hoạt động đúng
3. ✅ Component checks hoạt động đúng
4. ✅ Code đơn giản hơn (giảm ~70% complexity)
5. ✅ Performance tốt hơn (O(1) lookup)
6. ✅ Không còn code không dùng

---

## 🎯 Timeline Estimate

- **Phase 1:** 1-2 hours (Normalize permissions)
- **Phase 2:** 2-3 hours (Simplify hasPermission)
- **Phase 3:** 3-4 hours (Update sidebar)
- **Phase 4:** 2-3 hours (Update router)
- **Phase 5:** 4-6 hours (Update components)
- **Phase 6:** 1-2 hours (Cleanup)

**Total:** ~13-20 hours

---

## 📝 Notes

- Migration từng phase để dễ test và rollback
- Test kỹ từng phase trước khi chuyển phase tiếp theo
- Giữ backward compatibility tạm thời nếu cần
- Document changes cho team
