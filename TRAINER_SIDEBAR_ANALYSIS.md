# PHÂN TÍCH SIDEBAR CỦA TRAINER

## 1. UC LIST CỦA TRAINER (Theo UC list user cung cấp)

### ✅ UC thuộc Trainer:

- **UC-26**: View All Courses → Academic Dept, **Dept Head, Trainer** ✅
- **UC-51**: View All Assessment Forms → **Academic Dept, Trainer** ✅
- **UC-53**: View All Assessments → **Trainer, Trainee** ✅
- **UC-58**: View All Assessment Requests → Department Head, **Trainers** ✅
- **UC-61**: View All Incident/Feedback Report → **Trainer, Trainee, SQA Auditor** ✅
- **UC-62**: Submit Incident/Feedback Report → **Trainer, Trainee** ✅
- **UC-17**: Configure Signature → **Trainer** ✅
- **UC-15, UC-16, UC-18**: User Profile Management → **All Roles** ✅

### ❌ UC KHÔNG thuộc Trainer:

- **UC-21**: View All Departments → **Administrator, Academic Dept, Dept Head** (KHÔNG phải Trainer!)
- **UC-59**: View All Assessment Results → **Trainee** (KHÔNG phải Trainer!)
- **UC-60**: Manage All Incident/Feedback Report → **SQA Auditor** (KHÔNG phải Trainer!)
- **UC-64**: Review Incident/Feedback Report → **SQA Auditor** (KHÔNG phải Trainer!)

---

## 2. SIDEBAR ITEMS HIỆN TẠI CỦA TRAINER

| Sidebar Item                    | Permission Required       | Thuộc Trainer? (Theo UC) | Ghi chú                                                                 |
| ------------------------------- | ------------------------- | ------------------------ | ----------------------------------------------------------------------- |
| Departments                     | `VIEW_ALL_DEPARTMENTS`    | ❌ NO                    | UC-21: Administrator, Academic Dept, Dept Head                          |
| Create Incident/Feedback Report | `SUBMIT_REPORT_REQUEST`   | ✅ YES                   | UC-62: Trainer, Trainee                                                 |
| List Assessment Result          | `VIEW_ASSESSMENT_DETAILS` | ❌ NO                    | UC-59: Trainee (KHÔNG phải Trainer!)                                    |
| List Instructed Course          | `VIEW_ALL_COURSES`        | ✅ YES                   | UC-26: Academic Dept, Dept Head, Trainer                                |
| Issue List                      | `LIST_ALL_REPORTS`        | ⚠️ CÓ THỂ                | UC-61: Trainer, Trainee, SQA Auditor (nhưng "Issue List" là của SQA)    |
| Feedback List                   | `LIST_ALL_REPORTS`        | ⚠️ CÓ THỂ                | UC-61: Trainer, Trainee, SQA Auditor (nhưng "Feedback List" là của SQA) |

---

## 3. VẤN ĐỀ PHÁT HIỆN

### Vấn đề 1: "Departments" không thuộc Trainer

- **Sidebar hiển thị:** "Departments" với permission `VIEW_ALL_DEPARTMENTS`
- **Theo UC:** UC-21 (View All Departments) → Administrator, Academic Dept, Dept Head
- **Kết luận:** Trainer **KHÔNG NÊN** thấy "Departments"

### Vấn đề 2: "List Assessment Result" không thuộc Trainer

- **Sidebar hiển thị:** "List Assessment Result" với permission `VIEW_ASSESSMENT_DETAILS`
- **Theo UC:** UC-59 (View All Assessment Results) → Trainee
- **Kết luận:** Trainer **KHÔNG NÊN** thấy "List Assessment Result"

### Vấn đề 3: "Issue List" và "Feedback List" là của SQA Auditor

- **Sidebar hiển thị:** "Issue List" và "Feedback List" với permission `LIST_ALL_REPORTS`
- **Theo UC:**
  - UC-60: Manage All Incident/Feedback Report → SQA Auditor
  - UC-61: View All Incident/Feedback Report → Trainer, Trainee, SQA Auditor
- **Vấn đề:** Mặc dù Trainer có permission `LIST_ALL_REPORTS` (UC-61), nhưng "Issue List" và "Feedback List" là các page chuyên biệt của SQA Auditor để quản lý reports
- **Kết luận:** Trainer có thể xem reports (UC-61), nhưng không nên thấy "Issue List" và "Feedback List" (đây là pages của SQA)

### Vấn đề 4: Thiếu "List Upcoming Assessment"

- **Sidebar có:** "List Upcoming Assessment" với permission `LIST_ASSESSMENTS`
- **Theo UC:** UC-53 (View All Assessments) → Trainer, Trainee
- **Kết luận:** ĐÚNG, nhưng có thể không hiển thị vì Trainer không có permission `LIST_ASSESSMENTS`

---

## 4. SIDEBAR ITEMS ĐÚNG CHO TRAINER (Theo UC)

### ✅ Nên hiển thị:

1. **List Upcoming Assessment** → `LIST_ASSESSMENTS` (UC-53: Trainer, Trainee)
2. **List Instructed Course** → `VIEW_ALL_COURSES` (UC-26: Academic Dept, Dept Head, Trainer)
3. **Create Incident/Feedback Report** → `SUBMIT_REPORT_REQUEST` (UC-62: Trainer, Trainee)

### ❌ KHÔNG nên hiển thị:

1. **Departments** → `VIEW_ALL_DEPARTMENTS` (UC-21: Administrator, Academic Dept, Dept Head)
2. **List Assessment Result** → `VIEW_ASSESSMENT_DETAILS` (UC-59: Trainee)
3. **Issue List** → `LIST_ALL_REPORTS` (UC-60: SQA Auditor - Manage All Reports)
4. **Feedback List** → `LIST_ALL_REPORTS` (UC-60: SQA Auditor - Manage All Reports)

---

## 5. GIẢI PHÁP

### Option 1: Fix ở Backend (Khuyến nghị)

- **Loại bỏ** các permissions không thuộc Trainer role:
  - `VIEW_ALL_DEPARTMENTS` (UC-21)
  - `VIEW_ASSESSMENT_DETAILS` cho "List Assessment Result" (UC-59)
  - `LIST_ALL_REPORTS` (nếu chỉ dùng cho SQA pages)

### Option 2: Fix ở Frontend (Workaround)

- Thêm **role-based filtering** cho Trainer sidebar items
- Trainer chỉ thấy:
  - List Upcoming Assessment
  - List Instructed Course
  - Create Incident/Feedback Report
- **KHÔNG** hiển thị:
  - Departments
  - List Assessment Result
  - Issue List
  - Feedback List

### Option 3: Hybrid (Khuyến nghị)

- Kết hợp **role-based** và **permission-based**
- Trainer role → Chỉ hiển thị items theo UC list (role-based)
- Các role khác → Check permission (permission-based)

---

## 6. KẾT LUẬN

**Nguyên nhân sidebar hiển thị quá nhiều items:**

1. ✅ **Logic sidebar đúng** - Check permission, không check role
2. ❌ **Permissions của Trainer dư thừa** - Có cả permissions của các role khác
3. ❌ **Không có role-based filtering** - Sidebar không biết Trainer chỉ nên thấy một số items nhất định

**Giải pháp:**

- **Backend**: Loại bỏ permissions dư thừa khỏi Trainer role
- **Frontend**: Thêm role-based filtering cho Trainer (chỉ hiển thị items theo UC list)


