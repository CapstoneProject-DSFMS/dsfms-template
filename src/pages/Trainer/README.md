# Trainer Portal

Trang Trainer được thiết kế theo mô tả trong hình, bao gồm sidebar với các chức năng chính và các trang nội dung tương ứng.

## Cấu trúc

### 1. Trainer Dashboard (`TrainerDashboardPage.jsx`)

- Trang chính với sidebar navigation
- Hiển thị nội dung tương ứng với từng sidebar item
- Quick actions cho các chức năng bổ sung

### 2. Sidebar Components

#### List Upcoming Assessment

- **Component**: `UpcomingAssessmentsList.jsx`
- **Page**: `UpcomingAssessmentsPage.jsx`
- **Route**: `/trainer/upcoming-assessments`
- **Chức năng**: Quản lý và xem các đánh giá sắp tới

#### List Assessment Result

- **Component**: `AssessmentResultsList.jsx`
- **Page**: `AssessmentResultsPage.jsx`
- **Route**: `/trainer/assessment-results`
- **Chức năng**: Xem và quản lý kết quả đánh giá

#### List Instructed Course

- **Component**: `InstructedCoursesList.jsx`
- **Page**: `InstructedCoursesPage.jsx`
- **Route**: `/trainer/instructed-courses`
- **Chức năng**: Quản lý các khóa học được giao

### 3. Additional Pages

#### Configure Signature

- **Page**: `ConfigureSignaturePage.jsx`
- **Route**: `/trainer/configure-signature`
- **Chức năng**: Cấu hình chữ ký số

#### Section Required Completion

- **Page**: `SectionCompletionPage.jsx`
- **Route**: `/trainer/section-completion`
- **Chức năng**: Quản lý các phần cần hoàn thành

## Routing

Tất cả routes được tích hợp vào `router.jsx` với prefix `/trainer`:

```javascript
{
  path: "/trainer",
  element: (
    <ProtectedRoute>
      <LayoutWrapper />
    </ProtectedRoute>
  ),
  children: [
    { path: "dashboard", element: <TrainerDashboardPage /> },
    { path: "upcoming-assessments", element: <UpcomingAssessmentsPage /> },
    { path: "assessment-results", element: <AssessmentResultsPage /> },
    { path: "instructed-courses", element: <InstructedCoursesPage /> },
    { path: "configure-signature", element: <ConfigureSignaturePage /> },
    { path: "section-completion", element: <TrainerSectionCompletionPage /> }
  ]
}
```

## Permissions

Các trang sử dụng `PermissionRoute` để kiểm tra quyền truy cập:

- `API_PERMISSIONS.TRAINEES.VIEW_ALL` - Truy cập trainer portal
- `API_PERMISSIONS.ASSESSMENTS.VIEW_ALL` - Xem upcoming assessments
- `API_PERMISSIONS.ASSESSMENTS.VIEW_RESULTS` - Xem assessment results
- `API_PERMISSIONS.COURSES.VIEW_ALL` - Xem instructed courses
- `API_PERMISSIONS.PROFILES.UPLOAD_SIGNATURE` - Cấu hình signature

## Role Integration

- Role `TRAINER` được thêm vào `RoleBasedRedirect.jsx`
- Sidebar được cập nhật để hiển thị menu items cho role `TRAINER`
- Tự động redirect đến `/trainer/dashboard` khi đăng nhập với role `TRAINER`

## Features

### Upcoming Assessments

- Danh sách các đánh giá sắp tới
- Thông tin chi tiết: tên, khóa học, học viên, ngày giờ, trạng thái
- Actions: Xem chi tiết, chỉnh sửa
- Summary cards: Tổng số, pending, scheduled, completed

### Assessment Results

- Danh sách kết quả đánh giá
- Filter theo trạng thái và tìm kiếm
- Thông tin: điểm số, grade, ngày hoàn thành
- Actions: Xem chi tiết, tải xuống
- Statistics: Completed, failed, average score

### Instructed Courses

- Danh sách khóa học được giao
- Thông tin: tiến độ, enrollment, lịch trình
- Filter và tìm kiếm
- Actions: Xem, chỉnh sửa, quản lý học viên
- Summary: Active, completed, total trainees, average progress

### Configure Signature

- Upload chữ ký số
- Preview chữ ký
- Guidelines và hướng dẫn sử dụng
- Status tracking

### Section Completion

- Quản lý các phần cần hoàn thành
- Theo dõi tiến độ của học viên
- Filter theo trạng thái và priority
- Actions: Xem chi tiết, đánh dấu hoàn thành

## Styling

- Sử dụng Bootstrap components
- Responsive design
- Consistent với design system hiện tại
- Hover effects và transitions
- Color coding cho các trạng thái khác nhau

## Mock Data

Tất cả components sử dụng mock data để demo. Trong production, cần thay thế bằng API calls thực tế.

## Usage

1. Đăng nhập với role `TRAINER`
2. Tự động redirect đến `/trainer/dashboard`
3. Sử dụng sidebar để navigate giữa các chức năng
4. Mỗi trang có đầy đủ CRUD operations và filtering












