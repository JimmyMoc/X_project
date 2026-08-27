import { usePage } from '@inertiajs/react';
import type { Auth } from '@/types/auth';

export function usePermissions() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const user = auth?.user;
    const userRoles = user?.roles ?? [];
    const userPermissions = user?.permissions ?? [];

    const isSuperAdmin = userRoles.includes('Super Admin');

    const hasRole = (role: string | string[]): boolean => {
        if (!user || userRoles.length === 0) return false;
        if (isSuperAdmin) return true;
        const rolesToCheck = Array.isArray(role) ? role : [role];
        return rolesToCheck.some((r) => userRoles.includes(r));
    };

    const hasAnyRole = (roles: string[]): boolean => {
        return hasRole(roles);
    };

    const hasPermission = (permission: string | string[]): boolean => {
        if (!user || userPermissions.length === 0) return false;
        if (isSuperAdmin) return true;
        const permissionsToCheck = Array.isArray(permission) ? permission : [permission];
        return permissionsToCheck.some((p) => userPermissions.includes(p));
    };

    const hasAllPermissions = (permissions: string[]): boolean => {
        if (!user || userPermissions.length === 0) return false;
        if (isSuperAdmin) return true;
        return permissions.every((p) => userPermissions.includes(p));
    };

    return {
        user,
        roles: userRoles,
        permissions: userPermissions,
        isSuperAdmin,
        hasRole,
        hasAnyRole,
        hasPermission,
        hasAllPermissions,
    };
}
