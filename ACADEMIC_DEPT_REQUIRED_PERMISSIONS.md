# Permissions Cần Thiết Cho Academic Department

Dựa trên phân tích code và chức năng hiển thị trong UI, đây là các permissions cần tick để Academic Department hoạt động đầy đủ:

## ✅ Đã Selected (Cần giữ nguyên)

### Academic Management

- ✅ Create Bulk Subjects
- ✅ Create Department
- ✅ Update Department
- ✅ Enable Department
- ✅ List Department Heads
- ✅ List Courses
- ✅ View Course Detail
- ✅ Update Course
- ✅ View Department Detail
- ✅ List Course Trainees
- ✅ View Trainee Enrollments
- ✅ Create Subject
- ✅ Update Subject
- ✅ Delete Subject
- ✅ List Subjects
- ✅ Remove Subject Enrollments
- ✅ Add Trainers to Subject
- ✅ Update Subject Trainer
- ✅ Lookup Subject Trainees
- ✅ Assign Trainees to Subject
- ✅ Delete Department
- ✅ Add Trainers to Department
- ✅ Create Course
- ✅ Delete Course
- ✅ View Subject Detail
- ✅ List Available Trainers
- ✅ Remove Subject Trainer
- ✅ Remove Trainee from Subject
- ✅ Archive Subject
- ✅ List Departments
- ✅ Remove Trainers from Department
- ✅ Restore Subject
- ✅ Enroll Trainees to Subject
- ✅ Remove Trainee from Course
- ✅ Archive Course

### User & Access Management

- ✅ List Users
- ✅ View User Detail
- ✅ View Role Detail
- ✅ Lookup Trainee Users
- ✅ Bulk Create Users

### Template & Form Management

- ✅ List Department Templates

### Media Management

- ✅ Delete image/file
- ✅ Upload Images
- ✅ Create Image Presigned URL
- ✅ Upload Documents
- ✅ Create Document Presigned URL
- ✅ Serve Static Files

### Profile Management

- ✅ View My Profile
- ✅ Update My Profile
- ✅ Change Password

### Assessment Management

- ✅ Create Assessment
- ✅ Create Bulk Assessment
- ✅ View Assessments List
- ✅ View Assessment Details

---

## ⚠️ Cần Tick Thêm (Hiện chưa selected)

### Academic Management

**Không có** - Tất cả permissions cần thiết đã được selected

### Assessment Management

- ⚠️ **Get Assessment Forms list base on Subject** - Nếu Academic Department cần xem assessment forms theo subject
- ⚠️ **Get Assessment Forms list base on Course** - Nếu Academic Department cần xem assessment forms theo course

### Template & Form Management

- ⚠️ **List Templates** - Nếu cần xem danh sách templates chung
- ⚠️ **View Template Detail** - Nếu cần xem chi tiết template

### Reportings

- ⚠️ **Create Report** - Nếu Academic Department cần tạo reports

---

## 📋 Tổng Kết

### Đã có đủ để hoạt động:

- ✅ **Academic Management**: Đầy đủ 35/35 permissions đã selected
- ✅ **User & Access Management**: Có đủ permissions cơ bản (List Users, View User Detail, Lookup Trainee Users, Bulk Create Users)
- ✅ **Media Management**: Đầy đủ
- ✅ **Profile Management**: Đầy đủ
- ✅ **Assessment Management**: Có 4/6 permissions (thiếu 2 permissions về Assessment Forms)

### Cần bổ sung (tùy chọn):

- ⚠️ **Assessment Management**: 2 permissions về Assessment Forms (nếu cần xem forms theo Subject/Course)
- ⚠️ **Template & Form Management**: List Templates, View Template Detail (nếu cần xem templates chung)
- ⚠️ **Reportings**: Create Report (nếu cần tạo reports)

---

## 🔍 Permissions Được Sử Dụng Trong Code

Dựa trên phân tích code, các permissions sau được check trực tiếp:

1. **API_PERMISSIONS.COURSES.CREATE** - Nút "Add New Course"
2. **API_PERMISSIONS.COURSES.VIEW_DETAIL** - Button "View Details" trong CourseActions và CourseRow
3. **API_PERMISSIONS.COURSES.UPDATE** - Button "Archive Course" và "Edit Course"
4. **API_PERMISSIONS.COURSES.DELETE** - Button "Delete Course" trong CourseRow
5. **API_PERMISSIONS.SUBJECTS.VIEW_DETAIL** - SubjectActions, EnrolledTraineeActions
6. **API_PERMISSIONS.SUBJECTS.DELETE** - SubjectActions, EnrolledTraineeActions
7. **API_PERMISSIONS.SUBJECTS.UPDATE** - TrainerActions
8. **API_PERMISSIONS.SUBJECTS.REMOVE_INSTRUCTOR** - TrainerActions
9. **API_PERMISSIONS.TRAINEES.VIEW_DETAIL** - TraineeActions
10. **API_PERMISSIONS.TRAINEES.DELETE** - TraineeActions
11. **API_PERMISSIONS.DASHBOARD.VIEW** - Để truy cập Academic Dashboard

**Kết luận**: Với các permissions đã selected, Academic Department đã có đủ permissions để hoạt động cơ bản. Các permissions bổ sung là tùy chọn tùy theo nhu cầu cụ thể.
