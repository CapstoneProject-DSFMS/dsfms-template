/**
 * Backend Permission Structure
 * 
 * This file contains the permission structure as returned by BE API
 * Structure: Module -> Permission Name -> Permission ID
 * 
 * Generated from BE response:
 * GET /permissions returns modules with listPermissions
 */

export const BE_PERMISSIONS = {
  "Analytics Dashboard": {
    "Academic Overview Dashboard": "d39507ea-3417-4ffb-aedc-68bab2d02acc"
  },
  
  "Assessment Execution": {
    "View Trainee Sections": "d7ac0aac-0b33-4d72-ac24-3e4119ed4a80",
    "Confirm Trainee Participation": "19a0d973-8696-4666-b55f-a29aa055eab1",
    "View Section Fields": "cc86a51c-3fab-408b-9228-f50e0441208e",
    "List Assessments": "d730195c-4b3f-42f1-81ea-8c67f0f713d6",
    "Download Assessment Result": "6bf804cc-0e3b-44d7-aa52-978642791676",
    "View Assessment Details": "28b97065-11aa-4b32-b7f6-51860d8ea9dc",
    "View Assessment Sections": "12c43171-6490-4b7e-ad22-3a771e49b578",
    "Save Section Values": "e85c7cd1-488f-4109-a6ce-b2edc2ea70ef",
    "Submit Assessment": "5293ed3b-81b2-48d6-9503-601ba7d31e91"
  },
  
  "Assessment Forms Management": {
    "List Department Assessments": "6ab61f21-d9f7-4ce6-a11c-36e3f20b3017",
    "Toggle Trainee Lock": "7429fdf5-3b60-41ad-8ce1-89bb3599af21",
    "List My Assessment Events": "322d4189-6ac6-4d35-9a8a-b25415e56a3c",
    "Create Assessment": "22521664-7e34-4d44-b652-a342521978bc",
    "List Course Assessments": "77688d98-7c3a-40c2-a225-70e8dbd05b62",
    "Update Assessment Event": "169d1fca-14f6-466c-af51-761cdfadb143",
    "Create Bulk Assessments": "a060cea0-cf43-4d21-ba36-0f86def979a4",
    "List Subject Assessments": "67bc4807-db01-43e4-b001-824f00121342",
    "List Assessment Events": "99afd2d0-0527-4cd4-af32-b66897fb723a"
  },
  
  "Assessment Results Approval": {
    "Approve or Reject Assessment": "cdd76da5-54cd-44e2-b19c-fc0332922750"
  },
  
  "Course Management": {
    "View Course In Detail": "a8ff820f-39f1-4333-bf93-f63c1939c4e3",
    "Update Course": "b8447d06-9c89-4076-befc-20a313f5cf37",
    "View All Courses": "4e4e45cc-f5ab-493c-afca-704fc5ca1c8e",
    "View Trainee Enrollments": "435a9695-c895-460a-90e2-7eb56230ee7e",
    "Create Course": "3ec91d90-a90c-4fd6-9155-3cfd15602310",
    "View All Course Trainees": "b9bc685d-37b4-4f62-98f7-815a9e6ec391",
    "Archive Course": "f133b97f-95cf-4203-baf6-6fe18888f25a"
  },
  
  "Department Management": {
    "Create Department": "93dc29ce-eee3-4db0-af26-2df69fa955ad",
    "Update Department": "907525bd-9eda-4a82-86a2-85215ab56dce",
    "Enable Department": "3fe34cbc-5d6a-44f2-83b1-ba0640aa37df",
    "View all Available Department Heads": "88085c41-da90-4586-a255-bcb06c4682c2",
    "Delete Department": "798ec1f8-16d8-4a09-8a69-2bc328e4a3ba",
    "View Department In Detail": "2fb86d25-e540-4bcc-bc83-60235a9d3b28",
    "View All Departments": "5c3308bf-fa48-4529-bd7f-382b79bcb3fa"
  },
  
  "Media Management": {
    "Force Save ONLYOFFICE": "b88ca282-7d4b-41e6-ba19-bee3afc3f348",
    "Delete image/file": "6eefe640-6db5-4d4d-8a0c-1ad9b37498ab",
    "Upload Images": "49ca5202-0fb9-46e9-b8a6-782f29cb7959",
    "Create Image Presigned URL": "70ddf99e-8222-4fa8-a751-59ee47cae064",
    "Upload Documents": "215d7a7b-7440-4ae9-a28c-41cacc355682",
    "Create Document Presigned URL": "916e8af7-10d9-432d-8478-c41a32949b39",
    "Serve Static Files": "d55e91f5-1371-4694-8091-dff4f0fd7de7",
    "Submit OnlyOffice Document": "e81e50c1-bbf3-4b36-a117-0f3f88875f3c"
  },
  
  "Profile Management": {
    "View My Profile": "1f1dfa5d-0b16-4842-bd4a-375bd5e3507b",
    "Update My Profile": "a2aa9602-4028-4eef-b37a-86606944cb30",
    "Change Password": "72ab7bd5-d100-4ec0-b61d-a3f9d68f2493"
  },
  
  "Reports Management": {
    "List All Reports": "8ecff2c2-85a5-44f6-af66-0d623e631762",
    "List My Reports": "ed674eb6-82eb-4763-8101-ac3119f91333",
    "View Report Detail": "7fe1ddef-3687-499e-9cf1-beb47688a73d",
    "Cancel Report": "b93626eb-9946-413c-9b07-d3b10bf0a4f7",
    "Respond to Report": "3dc7f4db-561f-4188-a3af-87c3145f2fc0",
    "Acknowledge Report Receipt": "315d21ec-bdbc-4779-8a37-58d1cd467034",
    "Submit Report Request": "b818f1a6-f26c-418b-a69b-01655371fe33"
  },
  
  "Role Management": {
    "Disable Role": "c846890f-650b-489d-bb0d-ee21d10ba43e",
    "Create Role": "b1dcd2d8-865d-485a-865e-87020331b822",
    "Enable Role": "d53c5201-1411-4e82-b697-ea46f46a3119",
    "View Role In Detail": "c92bd053-56e3-4008-b9ac-bcd8a88c4c0e",
    "View All Roles": "8736fd6e-16e0-41b3-8e7b-a87913fa13d9",
    "Update Role": "9b49fa83-deba-4581-8a34-2e4a04d76269"
  },
  
  "Subject Management": {
    "Create Bulk Subjects": "46a8e7d0-8730-44aa-9671-2505c6ac3a1d",
    "Create Subject": "b10eaaec-18de-4c1f-bdb8-8bee7d0cc9d8",
    "Update Subject": "7f472c31-9297-432f-a35e-02ae8034043a",
    "List Subjects": "44ae43b3-86a5-463c-94fb-f7f8d0c1d509",
    "View Subject Detail": "c7fdefca-e5cc-44c0-981f-c67d8f953954",
    "Archive Subject": "4b6360f8-b35a-4f99-acd0-4623082753de"
  },
  
  "System Configuration": {
    "View Global Field": "39117be8-c2ee-45ed-9265-e64a459d7a08",
    "View Global Field In Detail": "d9cdf419-2692-4dc5-955c-c3dc493bff47",
    "Delete Global Field": "8d027685-95c4-4e06-aca9-e9c8b61c01a0",
    "List Global Fields": "a73c14c5-f421-4ca8-b158-98b7bb5e9b82",
    "Create Global Field": "4b22149d-e523-466d-a453-f63c93b3c37f",
    "Update Global Field": "ba4ff600-a3f5-4af6-b7e9-9dd3891eef4e",
    "View All Global Fields In Detail": "9cc56078-8397-43ec-95eb-48cddb073641"
  },
  
  "Template Management": {
    "Update Template Status": "bb0b4da6-cc88-4435-b787-07cde5d75e63",
    "Download Content PDF": "f38448de-d098-45e3-b35a-593fdf6f25aa",
    "Download Content & Config ZIP": "3946dc2e-7684-43b7-8a8c-394fa388ab43",
    "Edit Template Basics": "2e52af89-13cc-4a9f-abb4-f7afb8f86a54",
    "Approve or Reject Template": "55fdd4b1-fd32-47d8-ae03-2577844d1f35",
    "Download Configuration PDF": "fda15717-4299-4a8a-bfcc-049aafbc7dbd",
    "Refresh Draft Template": "19d0f64b-652d-41e5-bbf9-12596f4fd543",
    "Test S3 PDF Export": "3aa69715-cbaa-4054-84e1-96404af597a7",
    "Extract Fields from S3 Docx": "6239b15a-6151-4663-8608-a423df6efc05",
    "Create Template Version": "20acccce-1602-4a52-b6ef-fba334b5469f",
    "Resubmit Rejected Template": "92635536-34df-4219-b888-248736b0ebb0",
    "View Template Details": "cf33a670-ad98-4009-aaf9-266db41ac071",
    "View All Templates": "ff240b98-80c4-47f7-a9e7-177f3b2a9cda",
    "Create Template": "73257d15-3b0c-4bbd-aaf7-3e59acc453db",
    "View Template Schema": "07421830-1902-4faa-a730-5d8d769bb970",
    "View Department Templates": "fa4f1f04-8e1c-42af-a06b-d8a906d513f9",
    "Parse Template Schema": "16d267aa-24db-4575-8351-88c2dffa2bfc",
    "Extract Fields from Upload": "331525aa-bbbc-4633-8123-eefb41b2e7b4"
  },
  
  "Trainee Enrollment": {
    "View Trainee Subject Enrollments": "a527f342-93c6-45ff-9d49-b2622aba4d6a",
    "Remove Course-Trainee Enrollments": "17f5d26b-e7a0-4713-9118-360e592ab058",
    "View Course Enrollment Batches": "1effc8f0-79ac-4388-a0af-282350baaaf9",
    "Remove Course Enrollment Batch": "a8aa0342-95fa-4c7c-8fbc-ca0ba603c59e",
    "Assign Trainees to Subject": "9b65f280-d42b-482d-8b1-f9ce726bf092",
    "Remove Subject Enrollments": "e8e146b1-363e-4941-932f-d8bdde56c65c",
    "Lookup Subject Trainees": "f45aa4e4-d932-450e-a823-f7ff381ca6b0",
    "Remove Trainee from Subject": "dc19657c-3c88-471c-a18d-0114e0326b5a",
    "Remove Trainee from Course": "d510f9d6-0c7a-4576-b3e8-cd2dd2801102"
  },
  
  "Trainer Enrollment": {
    "Assign Course Trainer": "1095457e-655b-4f3d-a813-f2a5bdf9f9ab",
    "Change Course Trainer Role": "f57d9070-1f15-42fe-bd6e-808322399813",
    "Remove Trainer From Course": "471dc251-274b-4fba-a0ff-6dcfe0bab528",
    "Add Trainers to Subject": "9113ded5-d184-4927-a248-ff418be5a590",
    "Update Subject Trainer": "d6fb2efb-eb52-4241-a602-21311697a7d6",
    "List Available Trainers": "53195628-9391-4cb4-9fb5-4351ffc0d400",
    "Remove Subject Trainer": "367d64d3-f1d1-41f0-a138-86097093aece"
  },
  
  "User Management": {
    "View User In Detail": "ba0ceff4-ebad-4502-b0d7-fa634422d0d9",
    "Update User": "943fe305-c515-46c9-a37f-1c67d8d2dfff",
    "Enable User": "09f0d24f-3579-4879-bb5f-8b90f7bcb1fa",
    "Create User": "95526120-137a-4558-9a9b-9c51e09afe5f",
    "View All Users": "a37fdff3-c227-4fd3-b06a-c7b4576abbd6",
    "Disable User": "f66b25cb-3c6d-4de2-a8bb-de13b4822a27",
    "Bulk Create Users": "97f6a122-b8fc-4e08-9c19-2ee5a64687df",
    "Lookup Trainee Users": "63d91ccd-88f5-4976-8d1a-25c80682c426"
  }
};

/**
 * Get permission ID by module and permission name
 * @param {string} module - Module name (e.g., "User Management")
 * @param {string} permissionName - Permission name (e.g., "View All Users")
 * @returns {string|null} Permission ID or null if not found
 */
export const getPermissionId = (module, permissionName) => {
  return BE_PERMISSIONS[module]?.[permissionName] || null;
};

/**
 * Get all permission names for a module
 * @param {string} module - Module name
 * @returns {string[]} Array of permission names
 */
export const getPermissionsForModule = (module) => {
  const modulePermissions = BE_PERMISSIONS[module];
  if (!modulePermissions) return [];
  return Object.keys(modulePermissions);
};

/**
 * Get all modules
 * @returns {string[]} Array of module names
 */
export const getAllModules = () => {
  return Object.keys(BE_PERMISSIONS);
};

/**
 * Find module and permission name by permission ID
 * @param {string} permissionId - Permission ID
 * @returns {{module: string, permissionName: string}|null}
 */
export const findPermissionById = (permissionId) => {
  for (const [module, permissions] of Object.entries(BE_PERMISSIONS)) {
    for (const [permissionName, id] of Object.entries(permissions)) {
      if (id === permissionId) {
        return { module, permissionName };
      }
    }
  }
  return null;
};

/**
 * Get all permissions as flat array with module info
 * @returns {Array<{module: string, name: string, id: string}>}
 */
export const getAllPermissionsFlat = () => {
  const result = [];
  for (const [module, permissions] of Object.entries(BE_PERMISSIONS)) {
    for (const [name, id] of Object.entries(permissions)) {
      result.push({ module, name, id });
    }
  }
  return result;
};

