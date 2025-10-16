// Test file to verify roleUtils logic
import { isBaseRole, BASE_ROLES } from './roleUtils.js';

console.log('🧪 Testing roleUtils...');
console.log('BASE_ROLES:', BASE_ROLES);

// Test cases
const testRoles = ['ADMINISTRATOR', 'ACADEMIC_DEPARTMENT', 'TRAINEE', 'ADMIN', 'CUSTOM_ROLE'];

testRoles.forEach(role => {
  const result = isBaseRole(role);
  console.log(`🧪 isBaseRole('${role}') = ${result}`);
});

export default 'test completed';
