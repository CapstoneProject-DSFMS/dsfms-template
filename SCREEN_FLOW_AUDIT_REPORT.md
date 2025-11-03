# 📊 SCREEN FLOW AUDIT REPORT

## So sánh hệ thống hiện tại với các Screen Flow Diagrams

---

## 1️⃣ **DEPARTMENT HEAD** Screen Flow

### ✅ **Đã Có:**

1. ✅ **Department Dashboard** - `/department-head/dashboard`
2. ✅ **My Department Details** - `/department-head/my-department-details`
   - ✅ **Course List** (hiển thị trong My Department Details)
3. ✅ **Course Details** - `/department-head/my-department-details/:courseId`
   - ✅ **Subject List** (tab trong Course Details)
   - ✅ **Trainee List** (tab trong Course Details)
4. ✅ **List Assessment Review Requests** - `/department-head/assessment-review-requests`
5. ✅ **Assessment Request Details** (trong cùng page)
6. ✅ **Approve/Deny Results** (có functions: `handleApproveRequest`, `handleDenyRequest`)

### ❌ **Còn Thiếu:**

1. ❌ **Subject Details Page**

   - Có handler `handleViewSubject` nhưng chưa có route/page riêng
   - **Cần tạo**: `/department-head/courses/:courseId/subjects/:subjectId`
   - **Cần có**: Trainee List trong Subject Details

2. ❌ **Trainee Details Page**
   - Có handler `handleViewTrainee` nhưng chưa có route/page riêng
   - **Cần tạo**: `/department-head/trainees/:traineeId`

---

## 2️⃣ **ACADEMIC DEPARTMENT** Screen Flow

### ✅ **Đã Có:**

1. ✅ **Department List** - `/academic/departments` (CourseSelectionView)
2. ✅ **Department Details** - Trong CourseSelectionView
3. ✅ **Course List** - Hiển thị trong Department
4. ✅ **Course Details** - `/academic/course/:courseId` hoặc `/academic/course-detail/:courseId`
5. ✅ **Subject List** - Trong Course Details
6. ✅ **Subject Details** - `/academic/subject/:subjectId`
7. ✅ **Enroll Trainees** - `/academic/course/:courseId/enroll-trainees`
8. ✅ **Academy Dashboard** - `/academic/dashboard`

### ❌ **Còn Thiếu:**

1. ❌ **Create New Course** - Chưa có form/page riêng

   - **Cần tạo**: `/academic/courses/create` hoặc modal

2. ❌ **Edit Course Details** - Chưa có form/page riêng

   - **Cần tạo**: `/academic/courses/:courseId/edit` hoặc modal

3. ❌ **Add A Subject** - Chưa có form/page riêng

   - **Cần tạo**: Modal hoặc page để thêm subject vào course

4. ❌ **Bulk Import Subjects** - Chưa có chức năng

   - **Cần tạo**: Modal hoặc page với preview table

5. ❌ **Trainers List** - Chưa có page riêng

   - **Cần tạo**: `/academic/subjects/:subjectId/trainers` hoặc tab trong Subject Details

6. ❌ **Trainer Details** - Chưa có page riêng

   - **Cần tạo**: `/academic/trainers/:trainerId`

7. ❌ **Update Trainer's Role** - Chưa có chức năng

   - **Cần tạo**: Modal hoặc form trong Trainer Details

8. ❌ **Trainee List** - Cần kiểm tra xem có page riêng không

   - **Cần tạo**: `/academic/subjects/:subjectId/trainees` hoặc tab

9. ❌ **Bulk Import Trainees** - Chưa có chức năng
   - **Cần tạo**: Modal hoặc page với preview table

---

## 3️⃣ **TRAINER** Screen Flow

### ✅ **Đã Có (100%):**

1. ✅ **Configure Signature** - `/trainer/configure-signature`
2. ✅ **List Upcoming Assessment** - `/trainer/upcoming-assessments`
3. ✅ **Section Required Completion** - Đã được tích hợp vào tab trong Upcoming Assessments
4. ✅ **List Assessment Result** - `/trainer/assessment-results`
5. ✅ **Assessment Result Details** - `/trainer/assessment-details/:resultId`
6. ✅ **Result Approval Note** - `/trainer/approval-notes/:resultId`
7. ✅ **List Instructed Course** - `/trainer/instructed-courses`
8. ✅ **Course Detail** - `/trainer/courses/:courseId`
   - ✅ **Subject List** (tab)
   - ✅ **Trainee List** (tab)

### ⚠️ **Cần Kiểm Tra:**

1. ⚠️ **Subject Details** từ Subject List trong Course Detail

   - Có route `/trainer/subjects/:subjectId` nhưng cần verify chức năng đầy đủ

2. ⚠️ **Trainee Details** từ Trainee List trong Course Detail
   - Có route `/trainer/trainees/:traineeId` nhưng cần verify chức năng đầy đủ

---

## 4️⃣ **TRAINEE** Screen Flow

### ✅ **Đã Có (100%):**

1. ✅ **Dashboard** - `/trainee`
2. ✅ **Academic Details** - `/trainee/academic-details`
3. ✅ **Enrolled Course List** - `/trainee/enrolled-courses`
4. ✅ **Enrolled Course Details** - `/trainee/courses/:courseId`
   - ✅ **Subject List** (tab)
   - ✅ **All Assessment Events** (tab)
5. ✅ **Enrolled Subject Details** - `/trainee/courses/:courseId/subjects/:subjectId`
   - ✅ **All Assessment Events** (tab)
6. ✅ **All Assessments** - `/trainee/assessments`
   - ✅ **Signature Required List** - `/trainee/signature-required`
   - ✅ **Section Completion Required List** - `/trainee/section-completion`
   - ✅ **Upcoming/Completed Assessments** - `/trainee/your-assessments`
7. ✅ **Assessment Section Details** - `/trainee/assessments/:assessmentId/sections/:sectionId`
8. ✅ **Signature Pad** - `/trainee/signature-pad/:sectionId`
9. ✅ **Assessment Detail** - `/trainee/assessments/:assessmentId`
10. ✅ **Create Issue Report/Feedback** - `/trainee/create-issue`

---

## 5️⃣ **SQA AUDITOR** Screen Flow

### ✅ **Đã Có:**

1. ✅ **Issue List** - `/sqa/issues`
2. ✅ **Feedback List** - `/sqa/feedback`
3. ✅ **Template List** - `/sqa/templates`
4. ✅ **Template Details** - `/sqa/templates/:templateId`
   - ✅ **Template Overview** (tab)
   - ✅ **Sections** (tab) - Hiển thị Section List
   - ✅ **Version History** (tab) - Hiển thị List History Version
   - ✅ **Export PDF** button

### ❌ **Còn Thiếu:**

1. ❌ **Issue Details Page**

   - Có handler `handleViewIssue` nhưng chưa có route/page riêng
   - **Cần tạo**: `/sqa/issues/:issueId`

2. ❌ **Issue Response Page**

   - Chưa có page riêng
   - **Cần tạo**: `/sqa/issues/:issueId/response`

3. ❌ **Feedback Acknowledgement Page**

   - Có handler `handleAcknowledgeFeedback` nhưng chưa có route/page riêng
   - **Cần tạo**: `/sqa/feedback/:feedbackId/acknowledgement`

4. ❌ **Old Template Version Details Page**

   - Có Version History tab nhưng chưa có page chi tiết cho version cũ
   - **Cần tạo**: `/sqa/templates/:templateId/versions/:versionId`

5. ❌ **Field List** - Chưa có tab/page riêng
   - **Cần thêm**: Tab "Fields" trong Template Details hoặc page riêng
   - **Cần tạo**: `/sqa/templates/:templateId/fields` hoặc tab trong Template Details

---

## 📋 **TÓM TẮT THEO PRIORITY**

### 🔴 **HIGH PRIORITY** (Core Features Missing):

1. **Department Head:**

   - Subject Details Page với Trainee List
   - Trainee Details Page

2. **Academic Department:**

   - Create New Course
   - Edit Course Details
   - Add A Subject
   - Bulk Import Subjects
   - Trainers List trong Subject Details
   - Trainer Details
   - Update Trainer's Role
   - Trainee List trong Subject Details
   - Bulk Import Trainees

3. **SQA Auditor:**
   - Issue Details Page
   - Issue Response Page
   - Feedback Acknowledgement Page
   - Old Template Version Details Page
   - Field List (tab hoặc page)

### 🟡 **MEDIUM PRIORITY** (Verify & Enhance):

1. **Trainer:**
   - Verify Subject Details page có đầy đủ chức năng
   - Verify Trainee Details page có đầy đủ chức năng

---

## 📊 **STATISTICS**

- **DEPARTMENT HEAD**: 6/8 features (75%) ✅
- **ACADEMIC DEPARTMENT**: 8/17 features (47%) ⚠️
- **TRAINER**: 8/8 features (100%) ✅
- **TRAINEE**: 10/10 features (100%) ✅
- **SQA AUDITOR**: 4/9 features (44%) ⚠️

**Overall**: 36/52 features (69%) ⚠️

---

## 🎯 **NEXT STEPS**

1. Ưu tiên implement các HIGH PRIORITY features
2. Verify các MEDIUM PRIORITY features
3. Update routes trong `router.jsx` cho các pages mới
4. Update sidebar navigation cho các pages mới
5. Add permissions mapping trong `apiPermissions.js`
