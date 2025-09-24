# Disable User API - Cập nhật chức năng

## Tổng quan

Chức năng disable/enable user đã được cập nhật để sử dụng API endpoint động với URL pattern: `{{baseUrl}}/users/{userId}`

## Thay đổi chính

### 1. API Endpoint mới

- **Endpoint**: `PATCH {{baseUrl}}/users/{userId}`
- **Method**: PATCH (thay vì PUT)
- **Body**: `{ "status": "DISABLED" | "ACTIVE" }`

### 2. Files đã được cập nhật

#### `src/api/user.js`

- Thêm method `toggleUserStatus(userId, status)`
- Sử dụng PATCH method thay vì PUT
- Endpoint động: `/users/${userId}`

#### `src/hooks/useUserManagementAPI.js`

- Cập nhật `handleDisable` function
- Tự động xác định status mới dựa trên status hiện tại
- Thêm toast notifications cho success/error
- Sử dụng `userAPI.toggleUserStatus()` thay vì `userAPI.updateUser()`

## Cách sử dụng

### Trong component

```javascript
import { useUserManagementAPI } from "../hooks/useUserManagementAPI";

const { handleDisable } = useUserManagementAPI();

// Disable user
await handleDisable(user);

// Enable user (nếu user đang bị disabled)
await handleDisable(user);
```

### API call trực tiếp

```javascript
import { userAPI } from "../api/user";

// Disable user
await userAPI.toggleUserStatus(
  "de7079ff-b758-4243-8edc-833433d504f9",
  "DISABLED"
);

// Enable user
await userAPI.toggleUserStatus(
  "de7079ff-b758-4243-8edc-833433d504f9",
  "ACTIVE"
);
```

## API Request/Response

### Request

```http
PATCH {{baseUrl}}/users/de7079ff-b758-4243-8edc-833433d504f9
Content-Type: application/json
Authorization: Bearer {token}

{
  "status": "DISABLED"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "de7079ff-b758-4243-8edc-833433d504f9",
    "status": "DISABLED",
    "updatedAt": "2025-01-24T09:42:15.000Z"
  }
}
```

## Tính năng mới

1. **Toggle Status**: Tự động chuyển đổi giữa ACTIVE và DISABLED
2. **Dynamic Endpoint**: URL được tạo động dựa trên userId
3. **Better UX**: Toast notifications cho feedback
4. **Error Handling**: Xử lý lỗi tốt hơn với error mapping

## Testing

Sử dụng file `src/utils/testDisableUser.js` để test chức năng:

```javascript
import { testSpecificUser } from "../utils/testDisableUser";

// Test với user ID cụ thể
const result = await testSpecificUser();
console.log(result);
```

## Lưu ý

- API sử dụng PATCH method thay vì PUT để chỉ cập nhật status
- Endpoint được tạo động: `/users/{userId}`
- Status có thể là "ACTIVE" hoặc "DISABLED"
- Function tự động xác định action dựa trên status hiện tại
