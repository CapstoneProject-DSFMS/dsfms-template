/**
 * UC (Use Case) Dependencies Mapping
 * 
 * Defines dependencies between Use Cases.
 * Example: To Update User (UC-08), you need View All Users (UC-07) first.
 * 
 * Structure: { "UC-XX": ["UC-YY", "UC-ZZ"] } - UC-XX depends on UC-YY and UC-ZZ
 */

export const UC_DEPENDENCIES = {
  // ============================================
  // User & Access Management
  // ============================================
  
  // User Management
  "UC-04": ["UC-07"], // Create User → needs View All Users (to see created user)
  "UC-05": ["UC-07"], // Bulk Create Users → needs View All Users (to see created users)
  "UC-08": ["UC-07"], // Update User → needs View All Users (to find user to update)
  "UC-09": ["UC-07"], // Enable/Disable User → needs View All Users (to find user)
  
  // Role Management
  "UC-10": ["UC-12"], // Create Role → needs View All Roles (to see created role)
  "UC-13": ["UC-12"], // Update Role → needs View All Roles (to find role to update)
  "UC-14": ["UC-12"], // Enable/Disable Role → needs View All Roles (to find role)
  
  // User Profile Management
  "UC-17": ["UC-16"], // Configure Signature → needs View My Profile (to see current profile)
  "UC-18": ["UC-16"], // Update Profile → needs View My Profile (to see current profile)
  
  // ============================================
  // Academic Management
  // ============================================
  
  // Department Management
  "UC-19": ["UC-21"], // Create Department → needs View All Departments (to see created department)
  "UC-22": ["UC-21"], // Update Department → needs View All Departments (to find department)
  "UC-23": ["UC-21"], // Enable/Disable Department → needs View All Departments (to find department)
  // "UC-XX": View My Department Detail - Base UC, no dependencies (has separate API)
  
  // Course Management
  "UC-24": ["UC-26"], // Create Course → needs View All Courses (to see created course)
  "UC-27": ["UC-26"], // Update Course → needs View All Courses (to find course)
  "UC-28": ["UC-26"], // Archive Course → needs View All Courses (to find course)
  // "UC-XX": View My List Instructed Course - Base UC, no dependencies (has separate API)
  // "UC-XX": View List Course (for trainer) - Base UC, no dependencies (has separate API)
  
  // Subject Management
  "UC-29": ["UC-32"], // Bulk Add Subjects → needs List Subjects (to see added subjects)
  "UC-30": ["UC-32"], // Add Single Subject → needs List Subjects (to see added subject)
  "UC-33": ["UC-32"], // Update Subject → needs List Subjects (to find subject)
  "UC-34": ["UC-32"], // Disable Subject → needs List Subjects (to find subject)
  
  // Trainee Enrollment
  "UC-35": ["UC-37"], // Enroll Trainee → needs View Trainee Subject Enrollments (to see enrollments)
  "UC-38": ["UC-37"], // Remove Trainee from Enrollment → needs View Trainee Subject Enrollments (to find enrollment)
  // "UC-XX": View My Enrolled Course List - Base UC, no dependencies (has separate API)
  
  // ============================================
  // Template & Form Management
  // ============================================
  
  // Template Management
  "UC-39": ["UC-47"], // Create Template → needs View All Template (to see created template)
  "UC-40": ["UC-47"], // Edit Draft Template → needs View All Template (to find template)
  "UC-41": ["UC-47"], // Submit Template → needs View All Template (to find template)
  "UC-42": ["UC-47"], // Delete Draft Template → needs View All Template (to find template)
  "UC-44": ["UC-47"], // Update Template Version → needs View All Template (to find template)
  "UC-45": ["UC-47"], // Disable/Enable Template → needs View All Template (to find template)
  "UC-46": ["UC-47"], // Approve/Deny Template → needs View All Template (to find template)
  "UC-48": ["UC-47"], // Download Template As PDF → needs View All Template (to find template)
  
  // Assessment Forms Management
  "UC-49": ["UC-52"], // Create Assessment Form → needs View All Assessment Forms (to see created form)
  "UC-51": ["UC-52"], // Update Assessment Form → needs View All Assessment Forms (to find form)
  "UC-53": ["UC-52"], // Archive Assessment Form → needs View All Assessment Forms (to find form)
  
  // ============================================
  // Assessment Process
  // ============================================
  
  // Assessment Execution
  "UC-55": ["UC-54"], // Fill and Save Assessment Draft → needs View All Assessments (to find assessment)
  "UC-56": ["UC-54"], // Sign Confirm Assessment → needs View All Assessments (to find assessment)
  "UC-57": ["UC-54"], // Submit Assessment for Approval → needs View All Assessments (to find assessment)
  // "UC-XX": View My List Upcoming Assessment - Base UC, no dependencies (has separate API)
  // "UC-XX": View My Assessment - Base UC, no dependencies (has separate API)
  
  // Assessment Results Approval
  "UC-58": ["UC-59"], // Approve/Deny Submitted Assessment → needs View All Assessment Requests (to find request)
  "UC-60": ["UC-59"], // View All Assessment Results → needs View All Assessment Requests (to find results)
  
  // ============================================
  // Reporting & Analytics
  // ============================================
  
  // Incident Reporting
  "UC-62": ["UC-61"], // Submit Incident/Feedback Report → needs View All Incident/Feedback Report (to see submitted report)
  "UC-63": ["UC-61"], // Cancel Incident/Feedback Report → needs View All Incident/Feedback Report (to find report)
  "UC-64": ["UC-61"], // Review Incident/Feedback Report → needs View All Incident/Feedback Report (to find report)
  // "UC-XX": View My Issue List - Base UC, no dependencies (has separate API)
  
  // Analytics Dashboard
  // UC-66: View Analytics Dashboard - Base UC, no dependencies
  
  // ============================================
  // System Management
  // ============================================
  
  // System Configuration
  "UC-66": ["UC-69"], // Configure Global Fields → needs View All Global Fields (to see created field)
  "UC-70": ["UC-69"], // Update Global Field → needs View All Global Fields (to find field)
  "UC-71": ["UC-69"], // Disable/Enable Field → needs View All Global Fields (to find field)
};

/**
 * Get all dependencies for a specific UC
 * @param {string} ucId - UC ID (e.g., "UC-08")
 * @returns {string[]} Array of UC IDs that this UC depends on
 */
export const getUCDependencies = (ucId) => {
  return UC_DEPENDENCIES[ucId] || [];
};

/**
 * Get all UCs that depend on a specific UC
 * @param {string} ucId - UC ID (e.g., "UC-07")
 * @returns {string[]} Array of UC IDs that depend on this UC
 */
export const getUCDependents = (ucId) => {
  const dependents = [];
  Object.entries(UC_DEPENDENCIES).forEach(([dependentUC, dependencies]) => {
    if (dependencies.includes(ucId)) {
      dependents.push(dependentUC);
    }
  });
  return dependents;
};

/**
 * Check if a UC has all its dependencies satisfied
 * @param {string} ucId - UC ID to check
 * @param {string[]} availableUCs - Array of UC IDs that the user has access to
 * @returns {boolean} True if all dependencies are satisfied
 */
export const hasUCDependenciesSatisfied = (ucId, availableUCs) => {
  const dependencies = getUCDependencies(ucId);
  if (dependencies.length === 0) {
    return true; // No dependencies
  }
  
  // Check if all dependencies are in availableUCs
  return dependencies.every(dep => availableUCs.includes(dep));
};

/**
 * Get all base UCs (UCs with no dependencies)
 * @returns {string[]} Array of base UC IDs
 */
export const getBaseUCs = () => {
  const allUCs = Object.keys(UC_DEPENDENCIES);
  const allDependencies = new Set();
  
  // Collect all UC IDs that are dependencies
  Object.values(UC_DEPENDENCIES).forEach(deps => {
    deps.forEach(dep => allDependencies.add(dep));
  });
  
  // Base UCs are those that are not dependencies of any other UC
  // But we also need to include UCs that are not in UC_DEPENDENCIES at all
  // For now, we'll return UCs that are dependencies but not dependents
  const baseUCs = Array.from(allDependencies).filter(uc => 
    !allUCs.includes(uc) || !getUCDependents(uc).length
  );
  
  return baseUCs;
};

/**
 * Get dependency tree for a UC (all dependencies recursively)
 * @param {string} ucId - UC ID
 * @param {Set} visited - Set of visited UC IDs (to prevent cycles)
 * @returns {string[]} Array of all dependency UC IDs (including transitive dependencies)
 */
export const getUCDependencyTree = (ucId, visited = new Set()) => {
  if (visited.has(ucId)) {
    return []; // Prevent cycles
  }
  
  visited.add(ucId);
  const dependencies = getUCDependencies(ucId);
  const allDependencies = [...dependencies];
  
  // Recursively get dependencies of dependencies
  dependencies.forEach(dep => {
    const subDependencies = getUCDependencyTree(dep, visited);
    subDependencies.forEach(subDep => {
      if (!allDependencies.includes(subDep)) {
        allDependencies.push(subDep);
      }
    });
  });
  
  return allDependencies;
};

