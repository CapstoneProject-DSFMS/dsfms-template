import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { usePermissions } from './usePermissions';
import { getFirstAccessibleRoute } from '../utils/sidebarUtils';
import { ROUTES } from '../constants/routes';

/**
 * Hook to get the first accessible route for the current user
 * This hook waits for permissions to load before returning the route
 * 
 * @param {string} fallbackPath - Fallback path if no accessible items found (default: '/dashboard')
 * @returns {Object} { firstRoute: string, isLoading: boolean }
 */
export const useFirstAccessibleRoute = (fallbackPath = ROUTES.DASHBOARD) => {
  const { user, userPermissions, isLoading } = useAuth();
  const { hasPermission, hasAnyPermission } = usePermissions();

  // Calculate first accessible route
  const firstRoute = useMemo(() => {
    // If still loading, return fallback (will be recalculated when permissions load)
    if (isLoading || !user || !userPermissions || userPermissions.length === 0) {
      return fallbackPath;
    }

    // Get first accessible route
    return getFirstAccessibleRoute(
      user,
      userPermissions,
      hasPermission,
      hasAnyPermission,
      fallbackPath
    );
  }, [user, userPermissions, hasPermission, hasAnyPermission, isLoading, fallbackPath]);

  return {
    firstRoute,
    isLoading: isLoading || !user || !userPermissions || userPermissions.length === 0
  };
};

