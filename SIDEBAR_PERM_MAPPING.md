## Sidebar → PERM-XX Mapping (Frontend Navigation)

All sidebar visibility decisions are based purely on the canonical `PERM-XX` IDs from `permissions_list.json`. No role filters are used; if a user has the required permission(s), they see the navigation entry. Dropdown parents render if at least one child passes its permission check. Use `excludePermissions` when an item must _not_ be shown to users who also have certain higher-level permissions.

---

### 1. Admin Navigation

| Sidebar ID      | Label                | Permissions                            | Notes                                  |
| --------------- | -------------------- | -------------------------------------- | -------------------------------------- |
| `main-menu`     | Main Menu            | `isAdminOnly: true`                    | Admin-only flag, no PERM check         |
| `users`         | User Management      | `PERM-009` (View All Users)            |                                        |
| `roles`         | Role Management      | `PERM-014` (View All Roles)            |                                        |
| `departments`   | Departments          | `["PERM-019","PERM-021"]` (requireAll) | Must have View All + Update Department |
| `forms`         | Template List        | `PERM-048` (View All Templates)        |                                        |
| `system-config` | System Configuration | `PERM-080` (View All Global Fields)    |                                        |

---

### 2. Academic Department Navigation

| Sidebar ID           | Label                 | Permissions                                                              | Notes                                                               |
| -------------------- | --------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| `academic-dashboard` | Academic Dashboard    | `PERM-077` (View Analytics Dashboard)                                    |                                                                     |
| `assessment-event`   | Assessment Event      | `PERM-055` (View All Assessment Events)                                  |                                                                     |
| `department`         | Department (dropdown) | `PERM-019` (View All Departments)<br/>`excludePermissions: ["PERM-021"]` | Only shows for users who can view but **cannot** update departments |

---

### 3. Trainee Navigation

| Sidebar ID               | Label                            | Permissions                                      | Notes                                                        |
| ------------------------ | -------------------------------- | ------------------------------------------------ | ------------------------------------------------------------ |
| `trainee-dashboard`      | Trainee Dashboard                | `PERM-078` (View Personal Dashboard)             |                                                              |
| `enrolled-courses`       | Enrolled Course List             | `PERM-058` (View Enrolled Courses)               |                                                              |
| `all-assessments`        | All Assessments                  | _(no direct PERM)_                               | Dropdown parent; render if any child is accessible           |
| ├─ `your-assessments`    | Your Assessments                 | `["PERM-059","PERM-062"]` (requireAll)           | Need View All Assigned Assessment Forms **and** Sign Confirm |
| ├─ `signature-required`  | Signature Required List          | `PERM-062` (Sign Confirm Assessment Form)        |                                                              |
| └─ `completion-required` | Section Completion Required List | `PERM-061` (Fill Assessment Form and Save Draft) |                                                              |
| `create-issue`           | Create Incident/Feedback Report  | `PERM-073` (Submit Incident/Feedback Report)     |                                                              |

---

### 4. Trainer Navigation

| Sidebar ID              | Label                          | Permissions                                     | Notes           |
| ----------------------- | ------------------------------ | ----------------------------------------------- | --------------- |
| `assigned-assessment`   | Assigned Assessment (dropdown) | `PERM-059` (View All Assigned Assessment Forms) | Parent dropdown |
| └─ `assessment-results` | Assessment Results             | `PERM-067` (View All Assessment Form Results)   | Child entry     |
| `instructed-courses`    | Instructed Course              | `PERM-057` (View Instructed Courses)            |                 |

---

### 5. Department Head Navigation

| Sidebar ID                   | Label                      | Permissions                                                                 | Notes                                                                    |
| ---------------------------- | -------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `department-dashboard`       | Department Dashboard       | `PERM-077` (View Analytics Dashboard)                                       |                                                                          |
| `my-department-details`      | My Department Details      | `PERM-020` (View Department Details)<br/>`excludePermissions: ["PERM-019"]` | Only shows if user can view **their** department but not all departments |
| `assessment-review-requests` | Assessment Review Requests | `PERM-066` (View All Submitted Assessment Forms)                            |                                                                          |

---

### 6. SQA Navigation

| Sidebar ID           | Label                       | Permissions                                    | Notes                                                                             |
| -------------------- | --------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------- |
| `incidents-feedback` | Incidents / Feedback Report | `PERM-070` (View All Incident/Feedback Report) |                                                                                   |
| `template-list`      | Template List               | `PERM-048` (View All Templates)                | No dropdown; in-page features guard sub-permissions (`PERM-050`, `PERM-051`, ...) |

---

### Notes for Implementation

1. **Only PERM checks**: remove role-based filters; permissions determine access.
2. **Dropdown parents**: render when at least one child passes permission requirements; hide inaccessible children.
3. **Exclude logic**: use `excludePermissions` where specified to prevent overlaps (e.g., Admin vs Academic department views).
4. **Component-level controls**: child actions (history, section list, etc.) inside Template pages should continue to guard features with `PERM-050`, `PERM-051`, etc.
