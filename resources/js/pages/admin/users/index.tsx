import { Head, router, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, Check, Pencil, Plus, Search, Shield, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { Can } from '@/components/can';
import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInitials } from '@/hooks/use-initials';
import { usePermissions } from '@/hooks/use-permissions';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Role, User } from '@/types/auth';

interface UserListItem {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    roles: { id: number; name: string }[];
}

interface PaginatedUsers {
    data: UserListItem[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
}

interface Props {
    users: PaginatedUsers;
    roles: Role[];
    filters: {
        search: string;
        role: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Administración', href: '/admin/users' },
    { title: 'Usuarios', href: '/admin/users' },
];

export default function UsersIndex({ users, roles, filters }: Props) {
    const { auth, flash } = usePage<{
        auth: { user: User };
        flash: { success?: string; error?: string };
    }>().props;
    const getInitials = useInitials();
    const { isSuperAdmin } = usePermissions();

    const [search, setSearch] = useState(filters.search || '');
    const [selectedRoleFilter, setSelectedRoleFilter] = useState(filters.role || '');

    // Modals state
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
    const [deletingUser, setDeletingUser] = useState<UserListItem | null>(null);

    // Create Form
    const createForm = useForm({
        name: '',
        email: '',
        password: '',
        roles: ['User'] as string[],
    });

    // Edit Form
    const editForm = useForm({
        name: '',
        email: '',
        password: '',
        roles: [] as string[],
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/users',
            { search, role: selectedRoleFilter },
            { preserveState: true, replace: true }
        );
    };

    const handleRoleFilterChange = (role: string) => {
        setSelectedRoleFilter(role);
        router.get(
            '/admin/users',
            { search, role },
            { preserveState: true, replace: true }
        );
    };

    const openCreateModal = () => {
        createForm.reset();
        createForm.clearErrors();
        createForm.setData({
            name: '',
            email: '',
            password: '',
            roles: ['User'],
        });
        setIsCreateOpen(true);
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/users', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const openEditModal = (user: UserListItem) => {
        setEditingUser(user);
        editForm.clearErrors();
        editForm.setData({
            name: user.name,
            email: user.email,
            password: '',
            roles: user.roles?.map((r) => r.name) || [],
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        editForm.put(`/admin/users/${editingUser.id}`, {
            onSuccess: () => {
                setEditingUser(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = () => {
        if (!deletingUser) return;
        router.delete(`/admin/users/${deletingUser.id}`, {
            onSuccess: () => setDeletingUser(null),
        });
    };

    const toggleRoleInCreate = (roleName: string) => {
        const current = [...createForm.data.roles];
        const index = current.indexOf(roleName);
        if (index > -1) {
            if (current.length > 1) {
                current.splice(index, 1);
                createForm.setData('roles', current);
            }
        } else {
            current.push(roleName);
            createForm.setData('roles', current);
        }
    };

    const toggleRoleInEdit = (roleName: string) => {
        const current = [...editForm.data.roles];
        const index = current.indexOf(roleName);
        if (index > -1) {
            if (current.length > 1) {
                current.splice(index, 1);
                editForm.setData('roles', current);
            }
        } else {
            current.push(roleName);
            editForm.setData('roles', current);
        }
    };

    const getRoleBadgeVariant = (roleName: string) => {
        switch (roleName) {
            case 'Super Admin':
                return 'destructive';
            case 'Admin':
                return 'default';
            default:
                return 'secondary';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Usuarios" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Gestión de Usuarios</h1>
                        <p className="text-sm text-muted-foreground">
                            Administra cuentas, roles y accesos al sistema.
                        </p>
                    </div>

                    <Can permission="users.create" role={['Super Admin', 'Admin']}>
                        <Button onClick={openCreateModal} className="gap-2">
                            <Plus className="size-4" />
                            Nuevo Usuario
                        </Button>
                    </Can>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <Alert className="border-emerald-500/50 text-emerald-600 dark:border-emerald-500/40 dark:text-emerald-400">
                        <Check className="size-4" />
                        <AlertTitle>Éxito</AlertTitle>
                        <AlertDescription>{flash.success}</AlertDescription>
                    </Alert>
                )}

                {flash?.error && (
                    <Alert variant="destructive">
                        <AlertCircle className="size-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                )}

                {/* Filter & Search Bar */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <form onSubmit={handleSearch} className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre o correo electrónico..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </form>

                    <div className="flex items-center gap-2">
                        <select
                            value={selectedRoleFilter}
                            onChange={(e) => handleRoleFilterChange(e.target.value)}
                            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus:outline-hidden focus:ring-1 focus:ring-ring"
                        >
                            <option value="">Todos los roles</option>
                            {roles.map((r) => (
                                <option key={r.id} value={r.name}>
                                    {r.name}
                                </option>
                            ))}
                        </select>

                        {(search || selectedRoleFilter) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSearch('');
                                    setSelectedRoleFilter('');
                                    router.get('/admin/users');
                                }}
                            >
                                Limpiar
                            </Button>
                        )}
                    </div>
                </div>

                {/* Users Table */}
                <div className="rounded-xl border bg-card text-card-foreground shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                <tr>
                                    <th className="px-6 py-4">Usuario</th>
                                    <th className="px-6 py-4">Roles</th>
                                    <th className="px-6 py-4">Seguridad 2FA</th>
                                    <th className="px-6 py-4">Fecha Registro</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-muted-foreground">
                                            No se encontraron usuarios que coincidan con la búsqueda.
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((user) => {
                                        const isCurrentUser = user.id === auth.user?.id;
                                        return (
                                            <tr key={user.id} className="hover:bg-muted/40 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="size-9">
                                                            <AvatarFallback className="text-xs font-medium">
                                                                {getInitials(user.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="flex items-center gap-2 font-medium">
                                                                <span>{user.name}</span>
                                                                {isCurrentUser && (
                                                                    <Badge variant="outline" className="text-[10px]">
                                                                        Tú
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {user.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {user.roles && user.roles.length > 0 ? (
                                                            user.roles.map((r) => (
                                                                <Badge
                                                                    key={r.id}
                                                                    variant={getRoleBadgeVariant(r.name)}
                                                                >
                                                                    {r.name}
                                                                </Badge>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">
                                                                Sin rol
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    {user.two_factor_enabled ? (
                                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                                            <Shield className="size-3.5" /> Habilitado
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">
                                                            Deshabilitado
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 text-xs text-muted-foreground">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </td>

                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Can permission="users.edit" role={['Super Admin', 'Admin']}>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="size-8"
                                                                onClick={() => openEditModal(user)}
                                                                title="Editar usuario"
                                                            >
                                                                <Pencil className="size-3.5" />
                                                            </Button>
                                                        </Can>

                                                        <Can permission="users.delete" role={['Super Admin', 'Admin']}>
                                                            <Button
                                                                variant="destructive"
                                                                size="icon"
                                                                className="size-8"
                                                                disabled={isCurrentUser}
                                                                onClick={() => setDeletingUser(user)}
                                                                title={isCurrentUser ? "No puedes eliminar tu propia cuenta" : "Eliminar usuario"}
                                                            >
                                                                <Trash2 className="size-3.5" />
                                                            </Button>
                                                        </Can>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {users.total > users.data.length && (
                        <div className="flex items-center justify-between border-t px-6 py-4 text-sm text-muted-foreground">
                            <div>
                                Mostrando <span className="font-medium text-foreground">{users.from}</span> a{' '}
                                <span className="font-medium text-foreground">{users.to}</span> de{' '}
                                <span className="font-medium text-foreground">{users.total}</span> usuarios
                            </div>

                            <div className="flex gap-1">
                                {users.links.map((link, idx) => (
                                    <Button
                                        key={idx}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create User Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                        <DialogDescription>
                            Ingresa los datos para registrar un nuevo usuario y asignarle roles.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="create-name">Nombre completo</Label>
                            <Input
                                id="create-name"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                placeholder="Ej. Ana Pérez"
                                required
                            />
                            <InputError message={createForm.errors.name} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="create-email">Correo electrónico</Label>
                            <Input
                                id="create-email"
                                type="email"
                                value={createForm.data.email}
                                onChange={(e) => createForm.setData('email', e.target.value)}
                                placeholder="ana@ejemplo.com"
                                required
                            />
                            <InputError message={createForm.errors.email} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="create-password">Contraseña inicial</Label>
                            <Input
                                id="create-password"
                                type="password"
                                value={createForm.data.password}
                                onChange={(e) => createForm.setData('password', e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                            <InputError message={createForm.errors.password} />
                        </div>

                        <div className="space-y-2">
                            <Label>Roles asignados</Label>
                            <div className="grid grid-cols-2 gap-2 rounded-lg border p-3">
                                {roles.map((role) => (
                                    <label
                                        key={role.id}
                                        className="flex items-center gap-2 text-sm font-medium cursor-pointer"
                                    >
                                        <Checkbox
                                            checked={createForm.data.roles.includes(role.name)}
                                            onCheckedChange={() => toggleRoleInCreate(role.name)}
                                            disabled={role.name === 'Super Admin' && !isSuperAdmin}
                                        />
                                        <span>{role.name}</span>
                                    </label>
                                ))}
                            </div>
                            <InputError message={createForm.errors.roles} />
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={createForm.processing}>
                                {createForm.processing ? 'Guardando...' : 'Crear Usuario'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Editar Usuario</DialogTitle>
                        <DialogDescription>
                            Modifica la información y los roles asignados a {editingUser?.name}.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="edit-name">Nombre completo</Label>
                            <Input
                                id="edit-name"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                required
                            />
                            <InputError message={editForm.errors.name} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="edit-email">Correo electrónico</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={editForm.data.email}
                                onChange={(e) => editForm.setData('email', e.target.value)}
                                required
                            />
                            <InputError message={editForm.errors.email} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="edit-password">
                                Nueva Contraseña <span className="text-xs text-muted-foreground">(opcional)</span>
                            </Label>
                            <Input
                                id="edit-password"
                                type="password"
                                value={editForm.data.password}
                                onChange={(e) => editForm.setData('password', e.target.value)}
                                placeholder="Dejar en blanco para mantener la actual"
                            />
                            <InputError message={editForm.errors.password} />
                        </div>

                        <div className="space-y-2">
                            <Label>Roles asignados</Label>
                            <div className="grid grid-cols-2 gap-2 rounded-lg border p-3">
                                {roles.map((role) => (
                                    <label
                                        key={role.id}
                                        className="flex items-center gap-2 text-sm font-medium cursor-pointer"
                                    >
                                        <Checkbox
                                            checked={editForm.data.roles.includes(role.name)}
                                            onCheckedChange={() => toggleRoleInEdit(role.name)}
                                            disabled={role.name === 'Super Admin' && !isSuperAdmin}
                                        />
                                        <span>{role.name}</span>
                                    </label>
                                ))}
                            </div>
                            <InputError message={editForm.errors.roles} />
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingUser(null)}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={editForm.processing}>
                                {editForm.processing ? 'Actualizando...' : 'Guardar Cambios'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Eliminar Usuario</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas eliminar la cuenta de{' '}
                            <span className="font-semibold text-foreground">{deletingUser?.name}</span> ({deletingUser?.email})?
                            Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setDeletingUser(null)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                        >
                            Sí, eliminar usuario
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
