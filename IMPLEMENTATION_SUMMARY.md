# Your Assessments (Đánh Giá của Bạn) - Implementation Summary

## 📋 Overview
Tôi đã cài đặt một hệ thống hoàn chỉnh để hiển thị "Your Assessments" với các tab được phân chia theo **Course** (Khóa học) và **Subject** (Môn học), kèm theo hai loại đánh giá: **Upcoming Assessments** (Đánh giá sắp tới) và **Completed Assessments** (Đánh giá đã hoàn thành).

## 🎯 Yêu cầu Thực hiện

### 1. **Gọi 2 API Chính:**
- `GET /assessments/course?courseId={courseId}` - Lấy danh sách đánh giá theo khóa học
- `GET /assessments/subject?subjectId={subjectId}` - Lấy danh sách đánh giá theo môn học

### 2. **Data Structure từ API:**
- **Course Assessments**: Trả về các đánh giá của toàn bộ khóa học với thông tin trainee
- **Subject Assessments**: Trả về các đánh giá của môn học cụ thể
- Mỗi assessment chứa: `id`, `name`, `status`, `occuranceDate`, `resultScore`, `trainee`, etc.

### 3. **Tabs Động:**
- Tab được tạo dựa trên dữ liệu từ API `/subjects/trainees/{traineeId}/course-subjects`
- Tự động tạo tab cho mỗi Course và các Subject con của nó

## 🏗️ Architecture & File Structure

### New Files Created:

#### 1. **`TraineeAssessmentsByEntity.jsx`** - Core Component
**Vị trí:** `src/components/Trainee/TraineeAssessmentsByEntity.jsx`

**Chức năng:**
- Hiển thị danh sách đánh giá cho một course hoặc subject cụ thể
- Hỗ trợ filter giữa "Upcoming" và "Completed" assessments
- Gọi API `assessmentAPI.getCourseAssessments()` hoặc `assessmentAPI.getSubjectAssessments()`
- Hiển thị thông tin trainee, ngày, status, điểm số

**Props:**
```javascript
{
  entityType: 'course' | 'subject',  // Loại entity
  entityId: string,                   // Course/Subject ID
  assessmentType: 'upcoming' | 'completed'  // Loại đánh giá
}
```

**API Calls:**
```javascript
// Lấy đánh giá theo course
await assessmentAPI.getCourseAssessments(courseId)
// Response: { assessments: [...], courseInfo: {...}, totalItems, page, limit, totalPages }

// Lấy đánh giá theo subject
await assessmentAPI.getSubjectAssessments(subjectId)
// Response: { assessments: [...], subjectInfo: {...}, totalItems, page, limit, totalPages }
```

#### 2. **`TraineeYourAssessmentsEnhanced.jsx`** - Main Container
**Vị trí:** `src/components/Trainee/TraineeYourAssessmentsEnhanced.jsx`

**Chức năng:**
- Load danh sách courses/subjects cho trainee hiện tại
- Quản lý các tab động cho courses và subjects
- Quản lý filter giữa "Upcoming" và "Completed" assessments
- Sử dụng `TraineeAssessmentsByEntity` để hiển thị từng tab

**Data Flow:**
```
User logged in → Hook useCourseSubjects(user.id)
→ Call /subjects/trainees/{traineeId}/course-subjects
→ Get courses and subjects
→ Create dynamic tabs (Course tabs + Subject sub-tabs)
→ On tab change → Load assessments for that course/subject
→ Call /assessments/course/{courseId} or /assessments/subject/{subjectId}
→ Display assessments with filters
```

#### 3. **`useCourseSubjects.js`** - Custom Hook
**Vị trí:** `src/hooks/useCourseSubjects.js`

**Chức năng:**
- Hook để load course-subjects data
- Xử lý loading, error states
- Có thể reuse trong các component khác

**Usage:**
```javascript
const { courseSubjects, loading, error, refetch } = useCourseSubjects(traineeId);
```

## 📊 Data Flow Diagram

```
YourAssessmentsPage
    ↓
TraineeYourAssessmentsEnhanced (Main)
    ├── Load: /subjects/trainees/{traineeId}/course-subjects
    ├── State: courseSubjects = [
    │   { course: {...}, subjects: [...] },
    │   { course: {...}, subjects: [...] }
    │ ]
    ├── Create dynamic tabs:
    │   ├── Tab: Course 1 (Code: GOT-031) → TraineeAssessmentsByEntity (courseId)
    │   ├── Tab: Subject 1.1 (Code: SUBJ-001) → TraineeAssessmentsByEntity (subjectId)
    │   ├── Tab: Subject 1.2 (Code: SUBJ-002) → TraineeAssessmentsByEntity (subjectId)
    │   └── ...more courses and subjects
    │
    └── Assessment Type Filter (Pills):
        ├── Upcoming Assessments
        └── Completed Assessments
                ↓
            TraineeAssessmentsByEntity
                ├── On Load: Check entityType
                ├── If course: Call /assessments/course?courseId={id}
                ├── If subject: Call /assessments/subject?subjectId={id}
                ├── Filter by assessmentType (upcoming/completed)
                └── Render assessment table with trainee info
```

## 🔄 API Integration

### Existing API Methods (Already implemented in `assessment.js`):
```javascript
// Get course assessments
assessmentAPI.getCourseAssessments(courseId, params = {})
// GET /assessments/course?courseId=...

// Get subject assessments
assessmentAPI.getSubjectAssessments(subjectId, params = {})
// GET /assessments/subject?subjectId=...
```

### Existing API Methods (From `subject.js`):
```javascript
// Get course-subjects for trainee (used on EnrolledCoursesPage)
subjectAPI.getTraineeCourseSubjects(traineeId)
// GET /subjects/trainees/{traineeId}/course-subjects
```

## 💡 Key Features Implemented

### 1. **Dynamic Tab System**
- Tabs được tạo automatically dựa trên course-subjects data
- Course tabs with icon 📚
- Subject sub-tabs with indentation ▸

### 2. **Assessment Type Filtering**
- Two main filter tabs: "Upcoming Assessments" & "Completed Assessments"
- Based on status:
  - **Upcoming**: ON_GOING, PENDING, NOT_STARTED
  - **Completed**: APPROVED, COMPLETED, REJECTED, CANCELLED

### 3. **Assessment Display Table**
- **Columns:**
  - Assessment Name
  - Trainee (Full Name + EID)
  - Date (occuranceDate)
  - Status (with color-coded badges)
  - Score & Result (for completed assessments)
  - Actions

### 4. **Status Badges**
```javascript
{
  'ON_GOING': 'info' (blue),
  'PENDING': 'warning' (yellow),
  'NOT_STARTED': 'warning' (yellow),
  'APPROVED': 'success' (green),
  'COMPLETED': 'success' (green),
  'REJECTED': 'danger' (red),
  'CANCELLED': 'secondary' (gray)
}
```

### 5. **Responsive Design**
- Horizontal scroll for tabs on mobile
- Mobile-friendly table layout
- Bootstrap responsive grid

### 6. **Error Handling**
- Try-catch blocks for API calls
- Toast notifications for errors
- Error state display in UI
- Loading states with spinners

## 📱 UI Components

### Tab Navigation:
```
[📚 GOT-031] [▸ SUBJ-001] [▸ SUBJ-002] [▸ SUBJ-003] | [📚 GOT-032] [▸ SUBJ-004]
```

### Filter Pills:
```
[◉ Upcoming Assessments] [○ Completed Assessments]
```

### Assessment Table:
```
| Assessment Name | Trainee | Date | Status | Score | Result | Actions |
|-----------------|---------|------|--------|-------|--------|---------|
| React Assessment| John Doe| 11/26| On Going| - | - | ... |
| ... |
```

## 🔗 Updated File

### Modified: `YourAssessmentsPage.jsx`
**Change:** Replaced `TraineeYourAssessments` with `TraineeYourAssessmentsEnhanced`

**Before:**
```javascript
import TraineeYourAssessments from '../../components/Trainee/TraineeYourAssessments';
export const YourAssessmentsPage = () => (
  <Container fluid className="py-4">
    <TraineeYourAssessments traineeId={user?.id} />
  </Container>
);
```

**After:**
```javascript
import TraineeYourAssessmentsEnhanced from '../../components/Trainee/TraineeYourAssessmentsEnhanced';
export const YourAssessmentsPage = () => (
  <TraineeYourAssessmentsEnhanced />
);
```

## 🚀 How It Works

### Step 1: User navigates to `/assessments/my-assessments`
→ YourAssessmentsPage loads → TraineeYourAssessmentsEnhanced mounts

### Step 2: Component loads course-subjects
→ Calls `subjectAPI.getTraineeCourseSubjects(user.id)`
→ Gets: `{ traineeId, courses: [{ course: {...}, subjects: [...] }, ...] }`

### Step 3: Creates dynamic tabs
→ Loop through courses
→ For each course, create a Course tab
→ For each subject in course, create Subject sub-tab

### Step 4: User selects a tab
→ activeTab state changes
→ assessmentType state (upcoming/completed)
→ TraineeAssessmentsByEntity receives: `{ entityType, entityId, assessmentType }`

### Step 5: Component calls assessment API
→ If course: `assessmentAPI.getCourseAssessments(courseId)`
→ If subject: `assessmentAPI.getSubjectAssessments(subjectId)`
→ Filter assessments by assessmentType

### Step 6: Render results
→ Table shows assessments with trainee details
→ Status badges, scores (if completed)
→ Actions dropdown for viewing details

## 📦 Dependencies Used

- **React Bootstrap**: Tab, Nav, Card, Badge, Table, Alert, Spinner
- **React Router**: useNavigate for navigation
- **React Toastify**: Toast notifications
- **Custom Hooks**: useCourseSubjects, useTableSort
- **API Layers**: assessmentAPI, subjectAPI

## ✅ Optimization Details

### 1. **API Call Optimization:**
- Course-subjects API được gọi **1 lần** khi component mount
- Assessment API được gọi **chỉ khi tab thay đổi** (lazy loading)
- Không re-fetch nếu tab giống nhau

### 2. **State Management:**
- courseSubjects: cached, không thay đổi
- activeTab: tracks current selected tab
- assessmentType: tracks upcoming/completed filter
- loading, error: UI states

### 3. **Performance:**
- useCallback để avoid unnecessary re-renders
- Memoized sortedData từ useTableSort
- Dynamic tab creation (không hardcode)

### 4. **Error Handling:**
- Graceful error messages
- Toast notifications
- Error boundary ready

## 📋 Testing Checklist

- [x] Course-subjects API loads correctly
- [x] Dynamic tabs created for each course/subject
- [x] Assessment API calls on tab change
- [x] Upcoming vs Completed filter works
- [x] Status badges display correctly
- [x] Trainee information shows
- [x] Loading states work
- [x] Error handling works
- [x] No console errors/warnings
- [x] Responsive design

## 🎓 Example Data Flow

### Initial Load:
```json
GET /subjects/trainees/6c78e6b8-7821-417e-b243-d59f176b67c4/course-subjects
Response: {
  "traineeId": "6c78e6b8-7821-417e-b243-d59f176b67c4",
  "courses": [
    {
      "course": {
        "id": "263473b3-8120-4f98-8df5-983fb557de10",
        "name": "mot cai gi do",
        "code": "GOT-031"
      },
      "subjects": [
        {
          "id": "cabc6049-8ba5-4ef1-9c2d-adc7273c0950",
          "name": "Testing subject",
          "code": "SUBJ-TEST-005"
        }
      ]
    }
  ]
}
```

### On Course Tab Click:
```json
GET /assessments/course?courseId=263473b3-8120-4f98-8df5-983fb557de10
Response: {
  "assessments": [
    {
      "id": "32efb4b9-e110-4343-bab8-87e6114e1357",
      "name": "test bulk",
      "courseId": "263473b3-8120-4f98-8df5-983fb557de10",
      "occuranceDate": "2025-11-26T00:00:00.000Z",
      "status": "ON_GOING",
      "trainee": {
        "id": "6c78e6b8-7821-417e-b243-d59f176b67c4",
        "eid": "TE000002",
        "fullName": "Test Test Traineea"
      }
    }
  ],
  "courseInfo": {
    "id": "263473b3-8120-4f98-8df5-983fb557de10",
    "name": "mot cai gi do",
    "code": "GOT-031"
  }
}
```

### On Subject Tab Click:
```json
GET /assessments/subject?subjectId=cabc6049-8ba5-4ef1-9c2d-adc7273c0950
Response: {
  "assessments": [],
  "subjectInfo": {
    "id": "cabc6049-8ba5-4ef1-9c2d-adc7273c0950",
    "name": "Testing subject",
    "code": "SUBJ-TEST-005",
    "course": {
      "id": "263473b3-8120-4f98-8df5-983fb557de10",
      "name": "mot cai gi do",
      "code": "GOT-031"
    }
  }
}
```

## 🎯 Key Benefits

1. **Dynamic Tab System**: No hardcoded tabs, automatically created from API data
2. **Optimized API Calls**: Only calls assessment API when needed (on tab change)
3. **Flexible Filtering**: Supports course-level and subject-level assessments
4. **User-Friendly**: Clear visual hierarchy with course and subject organization
5. **Maintainable**: Reusable components and hooks for future enhancements
6. **Error Resilient**: Proper error handling and user feedback

## 📝 Summary of Changes

| File | Action | Purpose |
|------|--------|---------|
| `TraineeAssessmentsByEntity.jsx` | Created | New component to display assessments by course/subject |
| `TraineeYourAssessmentsEnhanced.jsx` | Created | Main container with dynamic tabs and filters |
| `useCourseSubjects.js` | Created | Custom hook for loading course-subjects data |
| `YourAssessmentsPage.jsx` | Modified | Updated to use new enhanced component |
| `assessment.js` | No change needed | Already has getCourseAssessments & getSubjectAssessments |
| `subject.js` | No change needed | Already has getTraineeCourseSubjects |

---

**Tất cả các API calls được tối ưu hóa để chỉ gọi khi cần thiết, không gọi lặp lại không cần thiết.**
