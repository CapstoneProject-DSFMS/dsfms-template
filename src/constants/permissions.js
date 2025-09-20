

export const FEATURES = {
  'FE-01': { name: 'Authentication', description: 'Provides secure login, logout, and password management functions for all users.' },
  'FE-02': { name: 'User Management', description: 'Allows the Administrator to create, view, edit, and delete user accounts, supporting both manual creation and bulk import from an Excel file.' },
  'FE-03': { name: 'Role Management', description: 'Allows the Administrator to define system roles and assign detailed functional permissions to each role.' },
  'FE-04': { name: 'User Profile Management', description: 'Allows each user to view and update their own basic personal information and other academic relevances.' },

  'FE-05': { name: 'Department Management', description: 'Allows the Administrator to create and manage the structure of departments and divisions within the academy (e.g., CCT, FCTD, SQA).' },
  'FE-06': { name: 'Course Management', description: 'Allows the Academic Department to create and manage the detailed information of courses within a department.' },
  'FE-07': { name: 'Subject Management', description: 'Allows the Academic Department to create and manage subjects within a course, including assigning responsible instructors.' },
  'FE-08': { name: 'Trainee Enrollment', description: 'Allows the Academic Department to enroll trainees into courses and manage their enrollment in specific subjects.' },

  'FE-09': { name: 'Template Management', description: 'Manage and track all Templates in the system or by Department, with support for tracking changes between versions over time.' },
  'FE-10': { name: 'Assessment Forms Management', description: 'Manage and track all used or in-progress Forms by Department.' },

  'FE-11': { name: 'Assessment Execution', description: 'Provides an interface for the Trainer to select a class/trainee and fill in results on the digital assessment form. Save drafts and submit when complete.' },
  'FE-12': { name: 'Assessment Results Approval', description: 'Allows Department Heads to approve or reject Assessment Results with notes to finalize the outcome.' },
  'FE-13': { name: 'Assessment Results Management', description: 'Allows authorized roles to export the final assessment results of trainees into a standardized PDF file.' },

  'FE-14': { name: 'Incident Reporting', description: 'Create and manage ad-hoc forms such as a Safety Report or a Student Feedback/Incident Report.' },
  'FE-15': { name: 'Analytics Dashboard', description: 'Provides charts and KPIs for Academic Department, Department Head, and Admin to monitor training effectiveness.' },

  'FE-16': { name: 'System Configuration', description: 'Allows the Administrator to configure system-wide fields (global pre-defined fields used in templates).' }
};

// UC-level permissions (fine-grained). Each maps to a FEATURE code.
export const PERMISSIONS_BY_UC = {
  'UC-01': { id: 'UC-01', title: 'Login', feature: 'FE-01', description: 'Users enter credentials to gain access.' },
  'UC-02': { id: 'UC-02', title: 'Logout', feature: 'FE-01', description: 'Users securely end session.' },
  'UC-03': { id: 'UC-03', title: 'Reset Password', feature: 'FE-01', description: 'Request reset link / change default system-generated password.' },

  'UC-04': { id: 'UC-04', title: 'Create User Account', feature: 'FE-02', description: 'Admin manually creates a new user and assigns role.' },
  'UC-05': { id: 'UC-05', title: 'Bulk Import User Accounts', feature: 'FE-02', description: 'Admin uploads Excel to create multiple accounts.' },
  'UC-06': { id: 'UC-06', title: 'Manage User Accounts', feature: 'FE-02', description: 'View, update, disable/delete user profiles.' },

  'UC-07': { id: 'UC-07', title: 'Manage Roles & Permissions', feature: 'FE-03', description: 'Admin assigns or revokes functional permissions for roles.' },
  'UC-08': { id: 'UC-08', title: 'Manage Own Profile', feature: 'FE-04', description: 'Authenticated user updates personal profile (trainers can pre-config signature).' },

  'UC-09': { id: 'UC-09', title: 'Create Department', feature: 'FE-05', description: 'Admin creates organizational unit/department.' },
  'UC-10': { id: 'UC-10', title: 'Manage Departments', feature: 'FE-05', description: 'Admin edit/deactivate departments.' },

  'UC-11': { id: 'UC-11', title: 'Create Course', feature: 'FE-06', description: 'Academic Dept defines a new training course.' },
  'UC-12': { id: 'UC-12', title: 'Manage Courses', feature: 'FE-06', description: 'Academic Dept view/update/archive courses.' },

  'UC-13': { id: 'UC-13', title: 'Create Subject', feature: 'FE-07', description: 'Academic Dept adds subject to a course and assign instructors.' },
  'UC-14': { id: 'UC-14', title: 'Manage Subjects', feature: 'FE-07', description: 'Academic Dept updates/removes subjects.' },

  'UC-15': { id: 'UC-15', title: 'Enroll Trainees in Course', feature: 'FE-08', description: 'Academic Dept enrolls a batch into a course.' },
  'UC-16': { id: 'UC-16', title: 'Manage Trainee Enrollment', feature: 'FE-08', description: 'Modify enrollment/exemptions per trainee.' },

  'UC-17': { id: 'UC-17', title: 'Create Assessment Template', feature: 'FE-09', description: 'Admin creates a master template (e.g., upload DOCX).' },
  'UC-18': { id: 'UC-18', title: 'Configure Template Rules', feature: 'FE-09', description: 'Define dynamic properties, variables, sections, types and rules.' },
  'UC-19': { id: 'UC-19', title: 'Manage Template Versions', feature: 'FE-09', description: 'Update template resulting in a new version copy.' },
  'UC-20': { id: 'UC-20', title: 'Disable Template', feature: 'FE-09', description: 'Disable a template; keep existing generated forms.' },

  'UC-21': { id: 'UC-21', title: 'Generate Assessment Forms', feature: 'FE-10', description: 'Generate forms for each trainee in a subject using approved template.' },
  'UC-22': { id: 'UC-22', title: 'View All Available Forms', feature: 'FE-10', description: 'View upcoming/assigned assessment forms for subject/course.' },
  'UC-23': { id: 'UC-23', title: 'Archive Form', feature: 'FE-10', description: 'Permanently remove form instances that were generated in error (only if not started).' },

  'UC-24': { id: 'UC-24', title: 'Review Assessment History', feature: 'FE-11', description: 'Search, filter, and view history of assessment forms.' },
  'UC-25': { id: 'UC-25', title: 'Fill and Save Assessment Draft', feature: 'FE-11', description: 'Trainer/Trainee fills form and can save progress as draft.' },
  'UC-26': { id: 'UC-26', title: 'Submit Assessment for Approval', feature: 'FE-11', description: 'Trainer submits completed form; it becomes read-only and goes to approval.' },

  'UC-27': { id: 'UC-27', title: 'Review Submitted Assessment', feature: 'FE-12', description: 'Dept Head views submitted assessment for a trainee.' },
  'UC-28': { id: 'UC-28', title: 'Approve Assessment Result', feature: 'FE-12', description: 'Dept Head approves the assessment result and locks record.' },
  'UC-29': { id: 'UC-29', title: 'Reject Assessment Result', feature: 'FE-12', description: 'Dept Head rejects result and returns form to submitter with reason.' },

  'UC-30': { id: 'UC-30', title: 'View Own Results History', feature: 'FE-13', description: 'Trainee views full history of finalized assessment results.' },
  'UC-31': { id: 'UC-31', title: 'Download Assessment Results As PDF', feature: 'FE-13', description: 'Trainer or Dept Head exports formatted PDF of finalized results.' },

  'UC-32': { id: 'UC-32', title: 'Submit Incident/Feedback Report', feature: 'FE-14', description: 'Trainer/Trainee submits safety/incident/feedback report.' },
  'UC-33': { id: 'UC-33', title: 'Review Submitted Reports', feature: 'FE-14', description: 'SQA Auditor views and manages submitted reports.' },
  'UC-34': { id: 'UC-34', title: 'View Submitted Reports', feature: 'FE-14', description: 'User views list & status of their submitted reports.' },

  'UC-35': { id: 'UC-35', title: 'View Analytics Dashboard', feature: 'FE-15', description: 'Management views charts and KPIs for training effectiveness.' },

  'UC-36': { id: 'UC-36', title: 'Configure Global Fields', feature: 'FE-16', description: 'Admin configures global pre-defined fields for templates.' }
};

export const ROLE_PERMISSIONS = {
  ADMIN: [
    // Authentication
    'UC-01','UC-02','UC-03',
    // User Management
    'UC-04','UC-05','UC-06',
    // Role Management
    'UC-07',
    // Profile
    'UC-08',
    // Department Management
    'UC-09','UC-10',
    // Template Management (Admin)
    'UC-17','UC-18','UC-19','UC-20',
    // Analytics
    'UC-35',
    // System Configuration
    'UC-36'
  ],

  // Academic Department staff
  ACADEMIC_DEPT: [
    'UC-01','UC-02','UC-03',
    'UC-08',
    // Course & Subject
    'UC-11','UC-12','UC-13','UC-14',
    // Enrollment
    'UC-15','UC-16',
    // Assessment Forms Management
    'UC-21','UC-22','UC-23',
    // Assessment history / monitoring
    'UC-24',
    // Analytics
    'UC-35'
  ],

  // Trainers
  TRAINER: [
    'UC-01','UC-02','UC-03',
    'UC-08',
    // Access forms, fill, submit
    'UC-22','UC-24','UC-25','UC-26',
    // Export PDF
    'UC-31',
    // Incident reporting
    'UC-32','UC-34'
  ],

  // Trainees
  TRAINEE: [
    'UC-01','UC-02','UC-03',
    'UC-08',
    // View/Fill forms assigned to them
    'UC-22','UC-25',
    // View their own finalized results
    'UC-30',
    // Incident reporting
    'UC-32','UC-34'
  ],

  DEPT_HEAD: [
    'UC-01','UC-02','UC-03',
    'UC-08',
    // oversight and viewing
    'UC-24',
    // Approval actions
    'UC-27','UC-28','UC-29',
    // Export PDF
    'UC-31',
    // Analytics
    'UC-35'
  ],

  // SQA Auditor
  SQA_AUDITOR: [
    'UC-01','UC-02','UC-03',
    'UC-08',
    // Incident reports review
    'UC-33'
  ]
};

