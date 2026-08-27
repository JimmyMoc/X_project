import { Head, router, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, Check, KeyRound, Pencil, Plus, Shield, Trash2, Users } from 'lucide-react';
import React, { useState } from 'react';
import { Can } from '@/components/can';
import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { usePermissions } from '@/hooks/use-permissions';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Permission, Role } from '@/types/auth';

interface Props {
    roles: (Role & { permissions: Permission[]; users_count: number })[];
    permissions: Permission[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Administración', href: '/admin/users' },
    { title: 'Roles y Permisos', href: '/admin/roles' },
];

export default function RolesIndex({ roles, permissions }: Props) {
    const { flash } = usePage<{
        flash: { success?: string; error?: string };
    }>().props;
    const { isSuperAdmin } = usePermissions();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<(Role & { permissions: Permission[] }) | null>(null);
    const [deletingRole, setDeletingRole] = useState<Role | null>(null);

    const createForm = useForm({
        name: '',
        permissions: [] as string[],
    });

    const editForm = useForm({
        name: '',
        permissions: [] as string[],
    });

    const openCreateModal = () => {
        createForm.reset();
        createForm.clearErrors();
        setIsCreateOpen(true);
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/roles', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const openEditModal = (role: Role & { permissions: Permission[] }) => {
        setEditingRole(role);
        editForm.clearErrors();
        editForm.setData({
            name: role.name,
            permissions: role.permissions?.map((p) => p.name) || [],
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRole) return;

        editForm.put(`/admin/roles/${editingRole.id}`, {
            onSuccess: () => {
                setEditingRole(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = () => {
        if (!deletingRole) return;
        router.delete(`/admin/roles/${deletingRole.id}`, {
            onSuccess: () => setDeletingRole(null),
        });
    };

    const togglePermissionInCreate = (permName: string) => {
        const current = [...createForm.data.permissions];
        const index = current.indexOf(permName);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(permName);
        }
        createForm.setData('permissions', current);
    };

    const togglePermissionInEdit = (permName: string) => {
        const current = [...editForm.data.permissions];
        const index = current.indexOf(permName);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(permName);
        }
        editForm.setData('permissions', current);
    };

    const isSystemRole = (name: string) => ['Super Admin', 'Admin', 'User'].includes(name);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles y Permisos" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Roles y Permisos</h1>
                        <p className="text-sm text-muted-foreground">
                            Controla los niveles de acceso y los privilegios asignados a cada rol del sistema.
                        </p>
                    </div>

                    <Can role="Super Admin">
                        <Button onClick={openCreateModal} className="gap-2">
                            <Plus className="size-4" />
                            Nuevo Rol
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

                {/* Roles Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {roles.map((role) => {
                        const isSuper = role.name === 'Super Admin';
                        const isDefault = isSystemRole(role.name);

                        return (
                            <div
                                key={role.id}
                                className="flex flex-col justify-between rounded-xl border bg-card p-6 shadow-xs"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-lg">{role.name}</h3>
                                                {isSuper && (
                                                    <Badge variant="destructive" className="text-[10px]">
                                                        Acceso Total
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Users className="size-3.5" />
                                                <span>{role.users_count} {role.users_count === 1 ? 'usuario' : 'usuarios'}</span>
                                            </div>
                                        </div>

                                        <Shield className="size-5 text-muted-foreground/60" />
                                    </div>

                                    {/* Permissions badges */}
                                    <div className="space-y-1.5">
                                        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                            Permisos ({isSuper ? permissions.length : (role.permissions?.length || 0)})
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {isSuper ? (
                                                <Badge variant="outline" className="border-primary/40 bg-primary/5 text-primary text-xs">
                                                    * Todos los permisos del sistema
                                                </Badge>
                                            ) : role.permissions && role.permissions.length > 0 ? (
                                                role.permissions.map((p) => (
                                                    <Badge key={p.id} variant="secondary" className="text-xs font-mono">
                                                        {p.name}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-xs text-muted-foreground">
                                                    Sin permisos específicos
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center justify-end gap-2 border-t pt-4">
                                    <Can role="Super Admin">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openEditModal(role)}
                                            className="gap-1.5 text-xs"
                                        >
                                            <Pencil className="size-3" />
                                            Editar
                                        </Button>

                                        {!isDefault && (
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                disabled={role.users_count > 0}
                                                onClick={() => setDeletingRole(role)}
                                                className="gap-1.5 text-xs"
                                                title={role.users_count > 0 ? 'No se puede eliminar un rol con usuarios asignados' : 'Eliminar rol'}
                                            >
                                                <Trash2 className="size-3" />
                                                Eliminar
                                            </Button>
                                        )}
                                    </Can>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Create Role Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Crear Nuevo Rol</DialogTitle>
                        <DialogDescription>
                            Define el nombre del rol y selecciona los permisos permitidos.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="create-role-name">Nombre del Rol</Label>
                            <Input
                                id="create-role-name"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                placeholder="Ej. Auditor, Editor, Soporte"
                                required
                            />
                            <InputError message={createForm.errors.name} />
                        </div>

                        <div className="space-y-2">
                            <Label>Permisos del Sistema</Label>
                            <div className="grid grid-cols-2 gap-2 rounded-lg border p-3 max-h-60 overflow-y-auto">
                                {permissions.map((perm) => (
                                    <label
                                        key={perm.id}
                                        className="flex items-center gap-2 text-sm font-medium cursor-pointer py-1"
                                    >
                                        <Checkbox
                                            checked={createForm.data.permissions.includes(perm.name)}
                                            onCheckedChange={() => togglePermissionInCreate(perm.name)}
                                        />
                                        <span className="font-mono text-xs">{perm.name}</span>
                                    </label>
                                ))}
                            </div>
                            <InputError message={createForm.errors.permissions} />
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
                                {createForm.processing ? 'Guardando...' : 'Crear Rol'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Role Dialog */}
            <Dialog open={!!editingRole} onOpenChange={(open) => !open && setEditingRole(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Editar Rol: {editingRole?.name}</DialogTitle>
                        <DialogDescription>
                            Modifica los permisos asociados a este rol.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="edit-role-name">Nombre del Rol</Label>
                            <Input
                                id="edit-role-name"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                disabled={editingRole?.name === 'Super Admin'}
                                required
                            />
                            <InputError message={editForm.errors.name} />
                        </div>

                        {editingRole?.name !== 'Super Admin' ? (
                            <div className="space-y-2">
                                <Label>Permisos del Sistema</Label>
                                <div className="grid grid-cols-2 gap-2 rounded-lg border p-3 max-h-60 overflow-y-auto">
                                    {permissions.map((perm) => (
                                        <label
                                            key={perm.id}
                                            className="flex items-center gap-2 text-sm font-medium cursor-pointer py-1"
                                        >
                                            <Checkbox
                                                checked={editForm.data.permissions.includes(perm.name)}
                                                onCheckedChange={() => togglePermissionInEdit(perm.name)}
                                            />
                                            <span className="font-mono text-xs">{perm.name}</span>
                                        </label>
                                    ))}
                                </div>
                                <InputError message={editForm.errors.permissions} />
                            </div>
                        ) : (
                            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
                                El rol Super Admin posee todos los permisos automáticamente de manera irrestricta.
                            </div>
                        )}

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingRole(null)}
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
            <Dialog open={!!deletingRole} onOpenChange={(open) => !open && setDeletingRole(null)}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Eliminar Rol</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas eliminar el rol{' '}
                            <span className="font-semibold text-foreground">{deletingRole?.name}</span>?
                            Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setDeletingRole(null)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                        >
                            Sí, eliminar rol
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
