# PHÂN TÍCH API CALLS TRONG TRAINER PAGES

## 1. API CALLS THỰC SỰ (Có gọi API thật)

### ✅ API Calls thuộc Trainer (Theo UC):

| File                              | API Call                                     | Endpoint                                 | UC                               | Thuộc Trainer? |
| --------------------------------- | -------------------------------------------- | ---------------------------------------- | -------------------------------- | -------------- |
| `UpcomingAssessmentsList.jsx`     | `assessmentAPI.getUserEvents()`              | `GET /assessments/user-events`           | UC-53: View All Assessments      | ✅ YES         |
| `AssessmentAssignmentsPage.jsx`   | `assessmentAPI.getCourseAssessments()`       | `GET /assessments/course?courseId=...`   | UC-51: View All Assessment Forms | ✅ YES         |
| `AssessmentAssignmentsPage.jsx`   | `assessmentAPI.getSubjectAssessments()`      | `GET /assessments/subject?subjectId=...` | UC-51: View All Assessment Forms | ✅ YES         |
| `AssessmentSectionsPage.jsx`      | `assessmentAPI.getAssessmentSections()`      | `GET /assessments/:id/sections`          | UC-53: View All Assessments      | ✅ YES         |
| `AssessmentSectionsPage.jsx`      | `assessmentAPI.getAssessmentFormPreview()`   | `GET /assessments/:id/preview`           | UC-53: View All Assessments      | ✅ YES         |
| `AssessmentSectionFieldsPage.jsx` | `assessmentAPI.getAssessmentSectionFields()` | `GET /assessments/sections/:id/fields`   | UC-53: View All Assessments      | ✅ YES         |
| `AssessmentSectionFields.jsx`     | `assessmentAPI.getAssessmentSectionFields()` | `GET /assessments/sections/:id/fields`   | UC-53: View All Assessments      | ✅ YES         |

**Kết luận:** Tất cả API calls thực sự trong Trainer pages đều **THUỘC Trainer** theo UC list! ✅

---

## 2. MOCK DATA (Không gọi API thật)

### ⚠️ Các pages/components sử dụng mock data:

| File                        | Mô tả                                  | API cần thiết (nếu có)                    | UC                                                | Thuộc Trainer?        |
| --------------------------- | -------------------------------------- | ----------------------------------------- | ------------------------------------------------- | --------------------- |
| `InstructedCoursesList.jsx` | Hiển thị danh sách courses được assign | `GET /courses` (instructed courses)       | UC-26: View All Courses                           | ✅ YES                |
| `AssessmentResultsList.jsx` | Hiển thị kết quả assessments           | `GET /assessments/results`                | UC-59: View All Assessment Results                | ❌ NO (Trainee)       |
| `TraineeDetailsPage.jsx`    | Chi tiết trainee                       | `GET /trainees/:id` hoặc `GET /users/:id` | UC-07: View All Users (nếu dùng `/users`)         | ❌ NO (Administrator) |
| `CourseDetailPage.jsx`      | Chi tiết course                        | `GET /courses/:id`                        | UC-26: View All Courses                           | ✅ YES                |
| `SubjectDetailsPage.jsx`    | Chi tiết subject                       | `GET /subjects/:id`                       | UC-32: View All Subjects                          | ✅ YES                |
| `TraineeList.jsx`           | Danh sách trainees trong course        | `GET /courses/:id/trainees`               | UC-26: View All Courses (trainees trong course)   | ✅ YES                |
| `SubjectList.jsx`           | Danh sách subjects trong course        | `GET /courses/:id/subjects`               | UC-26: View All Courses (subjects trong course)   | ✅ YES                |
| `TraineeListInSubject.jsx`  | Danh sách trainees trong subject       | `GET /subjects/:id/trainees`              | UC-32: View All Subjects (trainees trong subject) | ✅ YES                |

---

## 3. VẤN ĐỀ PHÁT HIỆN

### ❌ Vấn đề 1: "AssessmentResultsList.jsx" - UC-59 không thuộc Trainer

- **File:** `src/components/Trainer/AssessmentResultsList.jsx`
- **Mô tả:** Hiển thị kết quả assessments
- **UC tương ứng:** UC-59 (View All Assessment Results) → **Trainee** (KHÔNG phải Trainer!)
- **Kết luận:** Page này **KHÔNG NÊN** tồn tại cho Trainer, hoặc cần đổi tên/UC mapping

### ⚠️ Vấn đề 2: "TraineeDetailsPage.jsx" - Có thể cần `GET /users/:id`

- **File:** `src/pages/Trainer/TraineeDetailsPage.jsx`
- **Mô tả:** Hiển thị chi tiết trainee
- **API có thể cần:**
  - `GET /trainees/:id` → UC-37 (View All Enrollments) → Academic Dept
  - `GET /users/:id` → UC-07 (View All Users) → Administrator
- **Kết luận:** Cần xác định API nào được sử dụng. Nếu dùng `GET /users/:id`, đây là UC-07 (Administrator) và **KHÔNG thuộc Trainer**

### ✅ Các pages khác đều OK

- `InstructedCoursesList.jsx` → UC-26 (View All Courses) → Trainer ✅
- `CourseDetailPage.jsx` → UC-26 (View All Courses) → Trainer ✅
- `SubjectDetailsPage.jsx` → UC-32 (View All Subjects) → Trainer ✅
- `TraineeList.jsx` → UC-26 (View All Courses - trainees trong course) → Trainer ✅
- `SubjectList.jsx` → UC-26 (View All Courses - subjects trong course) → Trainer ✅
- `TraineeListInSubject.jsx` → UC-32 (View All Subjects - trainees trong subject) → Trainer ✅

---

## 4. KẾT LUẬN

### ✅ API Calls thực sự:

- **Tất cả API calls thực sự** trong Trainer pages đều **THUỘC Trainer** theo UC list
- Không có API call nào gọi tới UC không thuộc Trainer

### ⚠️ Mock Data:

- **Hầu hết pages** sử dụng mock data, chưa có API calls thực sự
- **1 page có vấn đề:** `AssessmentResultsList.jsx` - UC-59 (Trainee, không phải Trainer)
- **1 page cần xác định:** `TraineeDetailsPage.jsx` - Cần biết API nào được sử dụng

### 📋 Khuyến nghị:

1. **Loại bỏ hoặc đổi tên** `AssessmentResultsList.jsx` nếu không thuộc Trainer
2. **Xác định API** cho `TraineeDetailsPage.jsx` - Nếu dùng `GET /users/:id`, đây là UC-07 (Administrator) và cần xem xét lại
3. **Implement API calls thực sự** cho các pages đang dùng mock data (nếu cần)

---

## 5. SO SÁNH VỚI SIDEBAR

### Sidebar hiển thị:

- List Upcoming Assessment → ✅ OK (UC-53: Trainer)
- List Assessment Result → ❌ VẤN ĐỀ (UC-59: Trainee, không phải Trainer)
- List Instructed Course → ✅ OK (UC-26: Trainer)
- Create Incident/Feedback Report → ✅ OK (UC-62: Trainer)
- Departments → ❌ VẤN ĐỀ (UC-21: Administrator, Academic Dept, Dept Head)
- Issue List → ❌ VẤN ĐỀ (UC-60: SQA Auditor)
- Feedback List → ❌ VẤN ĐỀ (UC-60: SQA Auditor)

### Pages thực sự:

- Tất cả API calls thực sự đều OK ✅
- Chỉ có `AssessmentResultsList.jsx` (mock data) có vấn đề ⚠️

**Kết luận:** Vấn đề chính nằm ở **sidebar**, không phải ở **API calls trong pages**!


