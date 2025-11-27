import { useMemo } from 'react';
import { usePermissions } from './usePermissions';
import { PERMISSION_IDS } from '../constants/permissionIds';

/**
 * Custom hook to determine template list mode based on user permissions
 * 
 * Logic:
 * - SQA Mode: User has VIEW_ALL_TEMPLATES (PERM-041) + APPROVE_OR_REJECT_TEMPLATE (PERM-040)
 * - Admin Mode: User has only VIEW_ALL_TEMPLATES (PERM-041) (without APPROVE_OR_REJECT_TEMPLATE)
 * 
 * @returns {Object} { isSQAMode, isAdminMode, hasViewAll, hasApproveReject }
 */
export const useTemplateListMode = () => {
  const { hasPermission } = usePermissions();

  const hasViewAll = useMemo(() => {
    return hasPermission(PERMISSION_IDS.VIEW_ALL_TEMPLATE); // View All Template
  }, [hasPermission]);

  const hasApproveReject = useMemo(() => {
    return hasPermission(PERMISSION_IDS.APPROVE_DENY_TEMPLATE); // Approve/Deny Template
  }, [hasPermission]);

  const isSQAMode = useMemo(() => {
    // SQA Mode: Must have both VIEW_ALL_TEMPLATES and APPROVE_OR_REJECT_TEMPLATE
    return hasViewAll && hasApproveReject;
  }, [hasViewAll, hasApproveReject]);

  const isAdminMode = useMemo(() => {
    // Admin Mode: Has VIEW_ALL_TEMPLATES but NOT APPROVE_OR_REJECT_TEMPLATE
    return hasViewAll && !hasApproveReject;
  }, [hasViewAll, hasApproveReject]);

  return {
    isSQAMode,
    isAdminMode,
    hasViewAll,
    hasApproveReject
  };
};