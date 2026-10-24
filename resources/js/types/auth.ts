export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    is_sso?: boolean;
    roles?: string[];
    permissions?: string[];
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type Role = {
    id: number;
    name: string;
    guard_name?: string;
    permissions?: Permission[];
    users_count?: number;
    created_at?: string;
    updated_at?: string;
};

export type Permission = {
    id: number;
    name: string;
    guard_name?: string;
    created_at?: string;
    updated_at?: string;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
