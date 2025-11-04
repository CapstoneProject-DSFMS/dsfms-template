# 📱 SCREEN FLOW TESTING GUIDE

## Hướng dẫn chi tiết luồng màn hình cho từng Role

---

## 🔐 **1. DEPARTMENT HEAD** Screen Flow

### 📍 **Entry Point:**

- **Route sau login**: `/department-head/dashboard`
- **Redirect từ**: `RoleBasedRedirect` → `/department-head/dashboard`

### 🗺️ **Navigation Flow:**

#### **LUỒNG 1: Department Dashboard & Details**

```
1. Department Dashboard
   ├─ Route: /department-head/dashboard
   ├─ Page: DepartmentHeadDashboardPage
   ├─ Sidebar: "Department Dashboard"
   └─ Actions:
      ├─ Navigate to "My Department Details"
      └─ Navigate to "List Assessment Review Requests"

2. My Department Details
   ├─ Route: /department-head/my-department-details
   ├─ Page: MyDepartmentDetailsPage
   ├─ Sidebar: "My Department Details"
   ├─ Contains:
   │  └─ Course List (hiển thị danh sách courses)
   └─ Actions:
      ├─ Click vào course → Navigate to Course Details
      └─ View Department Head Details (nếu có)

3. Course Details (Từ Course List)
   ├─ Route: /department-head/my-department-details/:courseId
   ├─ Page: CourseDetailsPage
   ├─ Tabs:
   │  ├─ Tab 1: Subject List
   │  │  ├─ Hiển thị danh sách subjects trong course
   │  │  └─ Actions:
   │  │     ├─ Click "View" → Navigate to Subject Details (CHƯA CÓ PAGE)
   │  │     └─ Click "Edit" → Edit Subject (CHƯA CÓ)
   │  │
   │  └─ Tab 2: Trainee List
   │     ├─ Hiển thị danh sách trainees trong course
   │     └─ Actions:
   │        ├─ Click "View" → Navigate to Trainee Details (CHƯA CÓ PAGE)
   │        └─ Click "Edit" → Edit Trainee (CHƯA CÓ)
   │
   └─ Navigation:
      └─ Back button → Return to My Department Details

4. Subject Details (CHƯA CÓ - CẦN TẠO)
   ├─ Route: /department-head/courses/:courseId/subjects/:subjectId
   ├─ Should contain:
   │  └─ Trainee List (danh sách trainees trong subject)
   └─ Actions:
      └─ Click trainee → Navigate to Trainee Details

5. Trainee Details (CHƯA CÓ - CẦN TẠO)
   ├─ Route: /department-head/trainees/:traineeId
   └─ Should display:
      └─ Thông tin chi tiết của trainee
```

#### **LUỒNG 2: Assessment Review Process**

```
1. List Assessment Review Requests
   ├─ Route: /department-head/assessment-review-requests
   ├─ Page: AssessmentReviewRequestsPage
   ├─ Sidebar: "List Assessment Review Requests"
   ├─ Displays:
   │  ├─ Danh sách assessment requests cần review
   │  ├─ Filters: Status, Search
   │  └─ Summary cards: Pending, Approved, Denied
   └─ Actions:
      └─ Click "View" → Navigate to Assessment Request Details

2. Assessment Request Details
   ├─ Route: /department-head/assessment-review-requests/:requestId
   ├─ Page: AssessmentReviewRequestsPage (same page, different view)
   ├─ Displays:
   │  ├─ Chi tiết assessment request
   │  ├─ Assessment information
   │  ├─ Trainee information
   │  └─ Assessment results
   └─ Actions:
      ├─ Click "Approve Results" → handleApproveRequest()
      │  └─ Status → "approved"
      │
      └─ Click "Deny Results" → handleDenyRequest()
         └─ Status → "denied"
```

### ✅ **Test Steps cho DEPARTMENT HEAD:**

1. **Test Department Dashboard:**

   - [ ] Login với role DEPARTMENT_HEAD
   - [ ] Verify redirect đến `/department-head/dashboard`
   - [ ] Verify sidebar hiển thị 3 items: Dashboard, My Department Details, Assessment Review Requests
   - [ ] Click "My Department Details"

2. **Test My Department Details:**

   - [ ] Verify hiển thị Course List
   - [ ] Click vào một course
   - [ ] Verify navigate đến Course Details

3. **Test Course Details:**

   - [ ] Verify có 2 tabs: Subject List & Trainee List
   - [ ] Test tab Subject List: View subjects, click View (CHƯA CÓ PAGE)
   - [ ] Test tab Trainee List: View trainees, click View (CHƯA CÓ PAGE)
   - [ ] Test Back button

4. **Test Assessment Review:**
   - [ ] Navigate to "List Assessment Review Requests"
   - [ ] Verify danh sách requests
   - [ ] Click View trên một request
   - [ ] Verify Assessment Request Details
   - [ ] Test Approve button
   - [ ] Test Deny button
   - [ ] Verify status update

---

## 🎓 **2. ACADEMIC DEPARTMENT** Screen Flow

### 📍 **Entry Point:**

- **Route sau login**: `/academic/dashboard`
- **Redirect từ**: `RoleBasedRedirect` → `/academic/dashboard`

### 🗺️ **Navigation Flow:**

```
1. Academy Dashboard
   ├─ Route: /academic/dashboard
   ├─ Page: AcademicDashboard
   ├─ Sidebar: "Academic Dashboard"
   └─ Quick Actions:
      ├─ View All Departments
      └─ Course Management

2. Department List / Course Selection View
   ├─ Route: /academic/departments
   ├─ Page: CourseSelectionView
   ├─ Sidebar: "Departments" (dynamic từ department dropdown)
   ├─ Displays:
   │  ├─ List of Departments
   │  └─ Course List trong từng department
   └─ Actions:
      ├─ Select department từ dropdown
      ├─ Click vào course → Navigate to Course Details
      └─ Click "View Department Details" → Navigate to Department Details

3. Department Details (Từ Department List)
   ├─ Route: /academic/departments/:departmentId (CHƯA RÕ)
   ├─ Contains:
   │  ├─ Course List
   │  ├─ Department Head Details
   │  └─ Link to Academy Dashboard
   └─ Actions:
      ├─ Create New Course (CHƯA CÓ - CẦN TẠO)
      ├─ Click course → Navigate to Course Details
      └─ Navigate to Academy Dashboard

4. Course Details
   ├─ Route: /academic/course/:courseId
   │  OR: /academic/course-detail/:courseId
   ├─ Page: CourseDetailsWrapper hoặc CourseDetailPage
   ├─ Contains:
   │  └─ Subject List (hiển thị subjects trong course)
   └─ Actions:
      ├─ Edit Course Details (CHƯA CÓ - CẦN TẠO)
      ├─ Add A Subject (CHƯA CÓ - CẦN TẠO)
      ├─ Bulk Import Subjects (CHƯA CÓ - CẦN TẠO)
      │  └─ Should include Preview Table
      └─ Click subject → Navigate to Subject Details

5. Subject Details
   ├─ Route: /academic/subject/:subjectId
   │  OR: /academic/course/:courseId/subject/:subjectId
   ├─ Page: SubjectDetailsWrapper
   ├─ Contains:
   │  ├─ Subject information
   │  └─ Trainers List (CHƯA CÓ - CẦN TẠO)
   └─ Actions:
      ├─ View Trainers List → Navigate to Trainers List (CHƯA CÓ)
      ├─ Enroll Trainees → Navigate to Enroll Trainees
      └─ Navigate back to Course Details

6. Enroll Trainees
   ├─ Route: /academic/course/:courseId/enroll-trainees
   ├─ Page: EnrollTraineesPage
   ├─ Contains:
   │  └─ Form để enroll trainees vào course
   └─ Actions:
      ├─ Select trainees
      ├─ Bulk Import Trainees (CHƯA CÓ - CẦN TẠO)
      └─ Submit enrollment

7. Trainers List (CHƯA CÓ - CẦN TẠO)
   ├─ Route: /academic/subjects/:subjectId/trainers
   ├─ Should display:
   │  └─ Danh sách trainers assigned to subject
   └─ Actions:
      ├─ Click trainer → Navigate to Trainer Details
      └─ Update Trainer's Role (CHƯA CÓ - CẦN TẠO)

8. Trainer Details (CHƯA CÓ - CẦN TẠO)
   ├─ Route: /academic/trainers/:trainerId
   └─ Should display:
      └─ Thông tin chi tiết trainer + Update Role function

9. Trainee List (CHƯA CÓ - CẦN TẠO)
   ├─ Route: /academic/subjects/:subjectId/trainees
   ├─ Should display:
   │  └─ Danh sách trainees enrolled in subject
   └─ Actions:
      └─ Bulk Import Trainees (CHƯA CÓ - CẦN TẠO)
```

### ✅ **Test Steps cho ACADEMIC DEPARTMENT:**

1. **Test Academy Dashboard:**

   - [ ] Login với role ACADEMIC_DEPARTMENT
   - [ ] Verify redirect đến `/academic/dashboard`
   - [ ] Verify sidebar có "Academic Dashboard"
   - [ ] Test Quick Actions

2. **Test Department List:**

   - [ ] Navigate to Departments
   - [ ] Verify department dropdown
   - [ ] Select department
   - [ ] Verify course list hiển thị
   - [ ] Click vào course

3. **Test Course Details:**

   - [ ] Verify Subject List hiển thị
   - [ ] Test Edit Course (CHƯA CÓ)
   - [ ] Test Add Subject (CHƯA CÓ)
   - [ ] Test Bulk Import Subjects (CHƯA CÓ)
   - [ ] Click vào subject

4. **Test Subject Details:**

   - [ ] Verify subject information
   - [ ] Test Enroll Trainees button
   - [ ] Test Trainers List (CHƯA CÓ)

5. **Test Enroll Trainees:**
   - [ ] Navigate to Enroll Trainees page
   - [ ] Test select trainees
   - [ ] Test Bulk Import (CHƯA CÓ)
   - [ ] Test submit enrollment

---

## 👨‍🏫 **3. TRAINER** Screen Flow

### 📍 **Entry Point:**

- **Route sau login**: `/trainer/upcoming-assessments`
- **Redirect từ**: `RoleBasedRedirect` → `/trainer/upcoming-assessments`

### 🗺️ **Navigation Flow:**

```
1. List Upcoming Assessment
   ├─ Route: /trainer/upcoming-assessments
   ├─ Page: UpcomingAssessmentsPage
   ├─ Sidebar: "List Upcoming Assessment"
   ├─ Tabs:
   │  ├─ Tab 1: Upcoming Assessments
   │  │  └─ Component: UpcomingAssessmentsList
   │  │
   │  └─ Tab 2: Section Required Completion
   │     └─ Component: SectionCompletionList
   └─ Actions:
      ├─ Click assessment → Navigate to assessment detail (CHƯA CÓ)
      └─ Schedule New Assessment (CHƯA CÓ)

2. Section Required Completion (Tab trong Upcoming Assessments)
   ├─ Embedded trong: UpcomingAssessmentsPage (tab 2)
   ├─ Component: SectionCompletionList
   └─ Displays:
      └─ Danh sách sections cần completion

3. List Assessment Result
   ├─ Route: /trainer/assessment-results
   ├─ Page: AssessmentResultsPage
   ├─ Sidebar: "List Assessment Result"
   ├─ Component: AssessmentResultsList
   └─ Actions:
      └─ Click "View Result" → Navigate to Assessment Result Details

4. Assessment Result Details
   ├─ Route: /trainer/assessment-details/:resultId
   ├─ Page: AssessmentResultDetailsPage
   ├─ Tabs:
   │  ├─ Tab 1: Assessment Overview
   │  │  └─ Assessment information, score, grade
   │  │
   │  └─ Tab 2: Section Breakdown
   │     └─ Table of sections với scores
   └─ Actions:
      ├─ Download Report
      └─ View Approval Notes → Navigate to Result Approval Note

5. Result Approval Note
   ├─ Route: /trainer/approval-notes/:resultId
   ├─ Page: ResultApprovalNotePage
   └─ Displays:
      ├─ Approval status
      ├─ Approval history
      └─ Form để add/edit approval notes

6. List Instructed Course
   ├─ Route: /trainer/instructed-courses
   ├─ Page: InstructedCoursesPage
   ├─ Sidebar: "List Instructed Course"
   ├─ Component: InstructedCoursesList
   └─ Actions:
      └─ Click "View Course Detail" → Navigate to Course Detail

7. Course Detail (Từ Instructed Course List)
   ├─ Route: /trainer/courses/:courseId
   ├─ Page: TrainerCourseDetailPage (CourseDetailPage)
   ├─ Tabs:
   │  ├─ Tab 1: Subject List
   │  │  └─ Component: SubjectList
   │  │  └─ Actions:
   │  │     └─ Click subject → Navigate to Subject Details
   │  │
   │  └─ Tab 2: Trainee List
   │     └─ Component: TraineeList
   │     └─ Actions:
   │        └─ Click trainee → Navigate to Trainee Details
   └─ Navigation:
      └─ Back button → Return to Instructed Courses List

8. Subject Details (Từ Subject List trong Course Detail)
   ├─ Route: /trainer/subjects/:subjectId
   ├─ Page: SubjectDetailsPage
   └─ Displays:
      └─ Subject information

9. Trainee Details (Từ Trainee List trong Course Detail)
   ├─ Route: /trainer/trainees/:traineeId
   ├─ Page: TraineeDetailsPage
   └─ Displays:
      └─ Trainee information

10. Configure Signature
    ├─ Route: /trainer/configure-signature
    ├─ Page: ConfigureSignaturePage
    ├─ Access: Từ Profile hoặc direct navigation
    └─ Displays:
       ├─ Digital Signature upload
       ├─ Signature Guidelines
       └─ Current Status
```

### ✅ **Test Steps cho TRAINER:**

1. **Test Upcoming Assessments:**

   - [ ] Login với role TRAINER
   - [ ] Verify redirect đến `/trainer/upcoming-assessments`
   - [ ] Verify có 2 tabs: Upcoming Assessments & Section Required Completion
   - [ ] Test tab switching
   - [ ] Test filters và search

2. **Test Assessment Results:**

   - [ ] Navigate to "List Assessment Result"
   - [ ] Verify danh sách results
   - [ ] Click "View Result"
   - [ ] Verify Assessment Result Details page

3. **Test Assessment Result Details:**

   - [ ] Verify 2 tabs: Overview & Section Breakdown
   - [ ] Test tab switching
   - [ ] Click "View Approval Notes"
   - [ ] Verify Result Approval Note page

4. **Test Instructed Courses:**

   - [ ] Navigate to "List Instructed Course"
   - [ ] Verify danh sách courses
   - [ ] Click "View Course Detail"
   - [ ] Verify Course Detail page với 2 tabs

5. **Test Course Detail:**

   - [ ] Test Subject List tab
   - [ ] Click subject → Verify Subject Details
   - [ ] Test Trainee List tab
   - [ ] Click trainee → Verify Trainee Details
   - [ ] Test Back button

6. **Test Configure Signature:**
   - [ ] Navigate to Configure Signature (từ Profile hoặc direct)
   - [ ] Test upload signature
   - [ ] Verify preview và guidelines

---

## 👤 **4. TRAINEE** Screen Flow

### 📍 **Entry Point:**

- **Route sau login**: `/trainee`
- **Redirect từ**: `RoleBasedRedirect` → `/trainee`

### 🗺️ **Navigation Flow:**

```
1. Dashboard
   ├─ Route: /trainee
   ├─ Page: TraineeDashboardPage
   ├─ Sidebar: "Dashboard"
   └─ Quick Access:
      ├─ Academic Details
      ├─ Enrolled Course List
      ├─ All Assessments
      └─ Create Issue Report/Feedback

2. Academic Details
   ├─ Route: /trainee/academic-details
   ├─ Page: AcademicDetailsPage
   ├─ Sidebar: "Academic Details"
   └─ Displays:
      └─ Academic information của trainee

3. Enrolled Course List
   ├─ Route: /trainee/enrolled-courses
   ├─ Page: EnrolledCoursesPage
   ├─ Sidebar: "Enrolled Course List"
   └─ Actions:
      └─ Click course → Navigate to Enrolled Course Details

4. Enrolled Course Details
   ├─ Route: /trainee/courses/:courseId
   ├─ Page: TraineeCourseDetailPage
   ├─ Tabs:
   │  ├─ Tab 1: Subject List
   │  │  └─ Actions:
   │  │     └─ Click subject → Navigate to Enrolled Subject Details
   │  │
   │  └─ Tab 2: All Assessment Events
   │     └─ Actions:
   │        └─ Click assessment → Navigate to Assessment Detail
   └─ Navigation:
      └─ Back button → Return to Enrolled Course List

5. Enrolled Subject Details
   ├─ Route: /trainee/courses/:courseId/subjects/:subjectId
   ├─ Page: TraineeSubjectDetailPage
   ├─ Tabs:
   │  └─ Tab: All Assessment Events
   │     └─ Actions:
   │        └─ Click assessment → Navigate to Assessment Detail
   └─ Navigation:
      └─ Back button → Return to Enrolled Course Details

6. All Assessments
   ├─ Route: /trainee/all-assessments
   ├─ Page: AllAssessmentsPage (CHƯA RÕ - có thể là YourAssessmentsPage)
   ├─ Sidebar: "All Assessments" (dropdown)
   ├─ Contains:
   │  ├─ Signature Required List
   │  ├─ Section Completion Required List
   │  └─ Upcoming/Completed Assessments
   └─ Actions:
      ├─ Click assessment từ Signature Required → Navigate to Assessment Section Details
      ├─ Click assessment từ Section Completion → Navigate to Assessment Section Details
      └─ Click assessment từ Upcoming/Completed → Navigate to Assessment Detail

7. Signature Required List
   ├─ Route: /trainee/signature-required
   ├─ Page: SignatureRequiredPage
   ├─ Sidebar: "All Assessments" → "Signature Required List"
   └─ Actions:
      └─ Click assessment → Navigate to Assessment Section Details

8. Section Completion Required List
   ├─ Route: /trainee/section-completion
   ├─ Page: SectionCompletionPage
   ├─ Sidebar: "All Assessments" → "Section Completion Required List"
   └─ Actions:
      └─ Click assessment → Navigate to Assessment Section Details

9. Upcoming/Completed Assessments
   ├─ Route: /trainee/your-assessments
   ├─ Page: YourAssessmentsPage
   ├─ Sidebar: "All Assessments" → "Your Assessments"
   └─ Actions:
      └─ Click assessment → Navigate to Assessment Detail

10. Assessment Section Details
    ├─ Route: /trainee/assessments/:assessmentId/sections/:sectionId
    ├─ Page: AssessmentSectionDetailsPage
    └─ Actions:
       ├─ Complete section (nếu chưa complete)
       └─ Signature Required → Navigate to Signature Pad

11. Signature Pad
    ├─ Route: /trainee/signature-pad/:sectionId
    ├─ Page: SignaturePadPage
    └─ Actions:
       ├─ Draw/Upload signature
       └─ Submit signature → Return to Assessment Section Details

12. Assessment Detail
    ├─ Route: /trainee/assessments/:assessmentId
    ├─ Page: TraineeAssessmentDetailPage
    ├─ Access từ:
    │  ├─ All Assessment Events (trong Course/Subject Details)
    │  ├─ Upcoming/Completed Assessments
    │  └─ Assessment Section Details
    └─ Actions:
       └─ Create Issue Report/Feedback → Navigate to Create Issue

13. Create Issue Report/Feedback
    ├─ Route: /trainee/create-issue
    ├─ Page: CreateIssuePage
    ├─ Access từ:
    │  ├─ Assessment Detail
    │  └─ All Assessments
    └─ Actions:
       └─ Submit issue/feedback → Return to Dashboard
```

### ✅ **Test Steps cho TRAINEE:**

1. **Test Dashboard:**

   - [ ] Login với role TRAINEE
   - [ ] Verify redirect đến `/trainee`
   - [ ] Verify sidebar có các items chính
   - [ ] Test quick access buttons

2. **Test Enrolled Courses:**

   - [ ] Navigate to "Enrolled Course List"
   - [ ] Verify danh sách courses
   - [ ] Click vào course
   - [ ] Verify Enrolled Course Details

3. **Test Course Details:**

   - [ ] Verify 2 tabs: Subject List & All Assessment Events
   - [ ] Test Subject List tab: Click subject
   - [ ] Test All Assessment Events tab: Click assessment

4. **Test Subject Details:**

   - [ ] Verify All Assessment Events tab
   - [ ] Click assessment → Verify Assessment Detail

5. **Test All Assessments:**

   - [ ] Navigate to "All Assessments"
   - [ ] Test Signature Required List
   - [ ] Test Section Completion Required List
   - [ ] Test Upcoming/Completed Assessments

6. **Test Assessment Section Details:**

   - [ ] Navigate từ Signature Required hoặc Section Completion
   - [ ] Verify section information
   - [ ] Test Complete section (nếu chưa complete)
   - [ ] Test Signature Required button → Navigate to Signature Pad

7. **Test Signature Pad:**

   - [ ] Verify signature drawing/upload
   - [ ] Test submit signature
   - [ ] Verify return to Assessment Section Details

8. **Test Assessment Detail:**

   - [ ] Navigate từ various sources
   - [ ] Verify assessment information
   - [ ] Test Create Issue button

9. **Test Create Issue:**
   - [ ] Navigate to Create Issue page
   - [ ] Test form submission
   - [ ] Verify return to Dashboard

---

## 🔍 **5. SQA AUDITOR** Screen Flow

### 📍 **Entry Point:**

- **Route sau login**: `/sqa/issues`
- **Redirect từ**: `RoleBasedRedirect` → `/sqa/issues`

### 🗺️ **Navigation Flow:**

```
1. Issue List
   ├─ Route: /sqa/issues
   ├─ Page: IssueListPage
   ├─ Sidebar: "Issue List"
   ├─ Displays:
   │  └─ Danh sách issues
   └─ Actions:
      └─ Click "View" → Navigate to Issue Details (CHƯA CÓ PAGE)

2. Issue Details (CHƯA CÓ - CẦN TẠO)
   ├─ Route: /sqa/issues/:issueId
   ├─ Should display:
   │  └─ Chi tiết issue
   └─ Actions:
      └─ Respond to Issue → Navigate to Issue Response

3. Issue Response (CHƯA CÓ - CẦN TẠO)
   ├─ Route: /sqa/issues/:issueId/response
   └─ Should contain:
      └─ Form để respond to issue

4. Feedback List
   ├─ Route: /sqa/feedback
   ├─ Page: FeedbackListPage
   ├─ Sidebar: "Feedback List"
   ├─ Displays:
   │  └─ Danh sách feedback
   └─ Actions:
      └─ Click "Acknowledge" → Navigate to Feedback Acknowledgement (CHƯA CÓ PAGE)
      └─ Click "View" → View feedback detail (CHƯA CÓ PAGE)

5. Feedback Acknowledgement (CHƯA CÓ - CẦN TẠO)
   ├─ Route: /sqa/feedback/:feedbackId/acknowledgement
   └─ Should contain:
      └─ Form để acknowledge feedback

6. Template List
   ├─ Route: /sqa/templates
   ├─ Page: TemplateListPage
   ├─ Sidebar: "Template List"
   ├─ Displays:
   │  └─ Danh sách templates
   └─ Actions:
      └─ Click "View Detail" → Navigate to Template Details

7. Template Details
   ├─ Route: /sqa/templates/:templateId
   ├─ Page: TemplateDetailPage
   ├─ Tabs:
   │  ├─ Tab 1: Template Overview
   │  │  └─ Basic template information
   │  │
   │  ├─ Tab 2: Sections
   │  │  └─ Section List (table)
   │  │
   │  └─ Tab 3: Version History
   │     └─ List History Version (table)
   │     └─ Actions:
   │        └─ Click version → Navigate to Old Template Version Details (CHƯA CÓ PAGE)
   │
   └─ Actions:
      ├─ Export PDF button
      └─ Field List (CHƯA CÓ TAB - CẦN THÊM)

8. Old Template Version Details (CHƯA CÓ - CẦN TẠO)
   ├─ Route: /sqa/templates/:templateId/versions/:versionId
   └─ Should display:
      └─ Chi tiết của template version cũ

9. Field List (CHƯA CÓ - CẦN THÊM)
   ├─ Should be: Tab 4 trong Template Details
   │  OR: Route: /sqa/templates/:templateId/fields
   └─ Should display:
      └─ Danh sách fields trong template
```

### ✅ **Test Steps cho SQA AUDITOR:**

1. **Test Issue List:**

   - [ ] Login với role SQA_AUDITOR
   - [ ] Verify redirect đến `/sqa/issues`
   - [ ] Verify sidebar có: Issue List, Feedback List, Template List
   - [ ] Verify danh sách issues
   - [ ] Click View (CHƯA CÓ PAGE)

2. **Test Feedback List:**

   - [ ] Navigate to "Feedback List"
   - [ ] Verify danh sách feedback
   - [ ] Click Acknowledge (CHƯA CÓ PAGE)
   - [ ] Click View (CHƯA CÓ PAGE)

3. **Test Template List:**

   - [ ] Navigate to "Template List"
   - [ ] Verify danh sách templates
   - [ ] Click "View Detail"
   - [ ] Verify Template Details page

4. **Test Template Details:**
   - [ ] Verify 3 tabs: Overview, Sections, Version History
   - [ ] Test Template Overview tab
   - [ ] Test Sections tab → Verify Section List
   - [ ] Test Version History tab → Verify List History Version
   - [ ] Click version (CHƯA CÓ PAGE)
   - [ ] Test Export PDF button
   - [ ] Verify Field List tab (CHƯA CÓ)

---

## 📋 **TỔNG HỢP TEST CHECKLIST**

### ✅ **Routes Cần Verify:**

#### **DEPARTMENT HEAD:**

- [x] `/department-head/dashboard`
- [x] `/department-head/my-department-details`
- [x] `/department-head/my-department-details/:courseId`
- [ ] `/department-head/courses/:courseId/subjects/:subjectId` (CHƯA CÓ)
- [ ] `/department-head/trainees/:traineeId` (CHƯA CÓ)
- [x] `/department-head/assessment-review-requests`
- [x] `/department-head/assessment-review-requests/:requestId`

#### **ACADEMIC DEPARTMENT:**

- [x] `/academic/dashboard`
- [x] `/academic/departments`
- [ ] `/academic/departments/:departmentId` (CHƯA RÕ)
- [x] `/academic/course/:courseId`
- [x] `/academic/course-detail/:courseId`
- [ ] `/academic/courses/create` (CHƯA CÓ)
- [ ] `/academic/courses/:courseId/edit` (CHƯA CÓ)
- [x] `/academic/subject/:subjectId`
- [x] `/academic/course/:courseId/subject/:subjectId`
- [ ] `/academic/subjects/:subjectId/trainers` (CHƯA CÓ)
- [ ] `/academic/trainers/:trainerId` (CHƯA CÓ)
- [ ] `/academic/subjects/:subjectId/trainees` (CHƯA CÓ)
- [x] `/academic/course/:courseId/enroll-trainees`

#### **TRAINER:**

- [x] `/trainer/upcoming-assessments`
- [x] `/trainer/assessment-results`
- [x] `/trainer/assessment-details/:resultId`
- [x] `/trainer/approval-notes/:resultId`
- [x] `/trainer/instructed-courses`
- [x] `/trainer/courses/:courseId`
- [x] `/trainer/subjects/:subjectId`
- [x] `/trainer/trainees/:traineeId`
- [x] `/trainer/configure-signature`

#### **TRAINEE:**

- [x] `/trainee`
- [x] `/trainee/academic-details`
- [x] `/trainee/enrolled-courses`
- [x] `/trainee/courses/:courseId`
- [x] `/trainee/courses/:courseId/subjects/:subjectId`
- [x] `/trainee/all-assessments`
- [x] `/trainee/signature-required`
- [x] `/trainee/section-completion`
- [x] `/trainee/your-assessments`
- [x] `/trainee/assessments/:assessmentId/sections/:sectionId`
- [x] `/trainee/signature-pad/:sectionId`
- [x] `/trainee/assessments/:assessmentId`
- [x] `/trainee/create-issue`

#### **SQA AUDITOR:**

- [x] `/sqa/issues`
- [ ] `/sqa/issues/:issueId` (CHƯA CÓ)
- [ ] `/sqa/issues/:issueId/response` (CHƯA CÓ)
- [x] `/sqa/feedback`
- [ ] `/sqa/feedback/:feedbackId/acknowledgement` (CHƯA CÓ)
- [x] `/sqa/templates`
- [x] `/sqa/templates/:templateId`
- [ ] `/sqa/templates/:templateId/versions/:versionId` (CHƯA CÓ)
- [ ] `/sqa/templates/:templateId/fields` (CHƯA CÓ - HOẶC TAB)

---

## 🎯 **PRIORITY TESTING ORDER**

### **Priority 1: Core Flows (100% Complete)**

1. ✅ **TRAINER** - Full flow test
2. ✅ **TRAINEE** - Full flow test

### **Priority 2: Mostly Complete (Cần thêm vài pages)**

3. ⚠️ **DEPARTMENT HEAD** - Test existing, note missing pages
4. ⚠️ **SQA AUDITOR** - Test existing, note missing pages

### **Priority 3: Need Major Work**

5. ⚠️ **ACADEMIC DEPARTMENT** - Test existing, document missing features

---

## 📝 **NOTES**

- **Routes với `:param`** là dynamic routes, cần test với actual IDs
- **Tabs** trong pages cần test tab switching
- **Back buttons** cần verify navigation đúng
- **Actions buttons** (View, Edit, Delete) cần test functionality
- **Forms** cần test validation và submission
- **Filters và Search** cần test functionality

---

## 🔄 **NAVIGATION PATTERNS**

### **Common Patterns:**

1. **List → Detail**: Click item trong list → Navigate to detail page
2. **Detail → List**: Back button → Return to list
3. **Tab Navigation**: Switch tabs trong cùng page
4. **Dropdown Navigation**: Sidebar dropdown menus
5. **Action Buttons**: View, Edit, Delete, Approve, Deny, etc.

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Author**: System Audit



