import React from 'react';
import { usePermissions } from '@/hooks/use-permissions';

export interface CanProps {
    permission?: string | string[];
    role?: string | string[];
    allPermissions?: string[];
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function Can({
    permission,
    role,
    allPermissions,
    children,
    fallback = null,
}: CanProps) {
    const { hasPermission, hasRole, hasAllPermissions } = usePermissions();

    if (role && !hasRole(role)) {
        return <>{fallback}</>;
    }

    if (permission && !hasPermission(permission)) {
        return <>{fallback}</>;
    }

    if (allPermissions && !hasAllPermissions(allPermissions)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

export default Can;
