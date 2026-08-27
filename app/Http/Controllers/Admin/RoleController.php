<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    /**
     * Display a listing of roles and permissions.
     */
    public function index(): Response
    {
        $roles = Role::with(['permissions:id,name'])
            ->withCount('users')
            ->get();

        $permissions = Permission::all(['id', 'name']);

        return Inertia::render('admin/roles/index', [
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    /**
     * Store a newly created role in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles,name'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        $role = Role::create(['name' => $validated['name'], 'guard_name' => 'web']);

        if (! empty($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        return back()->with('success', "Rol '{$role->name}' creado exitosamente.");
    }

    /**
     * Update the specified role in storage.
     */
    public function update(Request $request, Role $role): RedirectResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('roles', 'name')->ignore($role->id),
            ],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        // Don't rename Super Admin
        if ($role->name === 'Super Admin' && $validated['name'] !== 'Super Admin') {
            return back()->with('error', "No se puede cambiar el nombre del rol 'Super Admin'.");
        }

        $role->name = $validated['name'];
        $role->save();

        if ($role->name !== 'Super Admin') {
            $role->syncPermissions($validated['permissions'] ?? []);
        }

        return back()->with('success', "Rol '{$role->name}' actualizado exitosamente.");
    }

    /**
     * Remove the specified role from storage.
     */
    public function destroy(Role $role): RedirectResponse
    {
        if (in_array($role->name, ['Super Admin', 'Admin', 'User'])) {
            return back()->with('error', "No se pueden eliminar los roles predeterminados del sistema.");
        }

        if ($role->users()->count() > 0) {
            return back()->with('error', "No se puede eliminar el rol porque tiene usuarios asignados.");
        }

        $role->delete();

        return back()->with('success', "Rol '{$role->name}' eliminado exitosamente.");
    }
}
