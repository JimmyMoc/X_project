import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';

interface PageProps {
    flash?: {
        status?: string;
    };
}

export default function Sessions() {
    const [showPassword, setShowPassword] = useState(false);
    const form = useForm({ password: '' });

    // Casteamos los props a nuestro tipo
    const { flash } = usePage().props as PageProps;

    const logoutOtherDevicesUrl = '/logout-other-devices';

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        form.post(logoutOtherDevicesUrl);
    }

    return (
        <div className="mx-auto mt-10 max-w-md">
            <Head title="Sesiones" />

            <h2 className="mb-4 text-lg font-bold">Session management</h2>
            <p className="mb-6 text-sm text-muted-foreground">
                Log out of all active sessions on other devices. You will remain
                signed in only on this browser.
            </p>

            <form onSubmit={submit} className="space-y-4">
                <div className="relative">
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium"
                    >
                        Confirm your password
                    </label>
                    <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={form.data.password}
                        onChange={(e) =>
                            form.setData('password', e.target.value)
                        }
                        placeholder="********"
                        className="mt-1 w-full rounded border p-2 pr-16"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute top-7 right-2 text-sm text-blue-600"
                    >
                        {showPassword ? 'Ocultar' : 'Ver'}
                    </button>
                    {form.errors.password && (
                        <div className="mt-1 text-sm text-red-600">
                            {form.errors.password}
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={form.processing}
                    className="w-full rounded bg-blue-600 px-4 py-2 text-white"
                >
                    {form.processing
                        ? 'Processing...'
                        : 'Log out from other devices'}
                </button>
            </form>

            {form.recentlySuccessful && (
                <div className="mt-4 text-sm text-green-600">
                    Sessions on other devices closed successfully.
                </div>
            )}

            {flash?.status && (
                <div className="mt-4 text-sm text-green-600">
                    {flash.status}
                </div>
            )}
        </div>
    );
}
