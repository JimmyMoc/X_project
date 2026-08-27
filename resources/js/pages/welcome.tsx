import { Head, Link, usePage } from '@inertiajs/react';
import { Shield, Lock, Smartphone, Users, ChevronRight, Github } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { dashboard, login, register } from '@/routes';

const features = [
    {
        icon: Shield,
        title: 'Secure by default',
        description:
            'Password policies enforced in production: minimum 12 characters, mixed case, numbers, symbols, and breach detection.',
    },
    {
        icon: Smartphone,
        title: 'Two-factor authentication',
        description:
            'TOTP-based 2FA with QR code setup, manual key entry, and single-use recovery codes.',
    },
    {
        icon: Lock,
        title: 'Microsoft SSO',
        description:
            'Sign in with a Microsoft account via OAuth2. Accounts are automatically created or linked on first login.',
    },
    {
        icon: Users,
        title: 'Roles & permissions',
        description:
            'Granular access control powered by Spatie Laravel Permission. Assign roles and gate any route or action.',
    },
];

export default function Welcome({ canRegister = true }: { canRegister?: boolean }) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>

            <div className="flex min-h-screen flex-col bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">

                {/* ── Navbar ── */}
                <header className="sticky top-0 z-50 border-b border-black/5 bg-[#FDFDFC]/80 backdrop-blur-md dark:border-white/5 dark:bg-[#0a0a0a]/80">
                    <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-7 items-center justify-center rounded-md bg-[#1b1b18] dark:bg-white">
                                <AppLogoIcon className="size-4 fill-current text-white dark:text-black" />
                            </div>
                            <span className="text-sm font-semibold tracking-tight">
                                CEIBA: Centralizar la estructura de identidades, bases de datos y aplicaciones.
                            </span>
                        </div>

                        <nav className="flex items-center gap-2">
                            {auth.user ? (
                                <Button asChild size="sm">
                                    <Link href={dashboard()}>
                                        Dashboard
                                        <ChevronRight className="ml-1 size-3.5" />
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button asChild variant="ghost" size="sm">
                                        <Link href={login()}>Log in</Link>
                                    </Button>
                                    {canRegister && (
                                        <Button asChild size="sm">
                                            <Link href={register()}>
                                                Get started
                                            </Link>
                                        </Button>
                                    )}
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* ── Hero ── */}
                <main className="flex flex-1 flex-col">
                    <section className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-24 text-center lg:py-36">
                        <Badge
                            variant="outline"
                            className="mb-6 gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                        >
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            Laravel · React · Inertia
                        </Badge>

                        <p className="mt-6 max-w-xl text-balance text-lg text-[#1b1b18]/60 dark:text-[#EDEDEC]/60">
                            CEIBA es el sistema integral de directorio activo de ECOSUR que centraliza la estructura de identidades, bases de datos y aplicaciones, unificando en un solo entorno la gestión, autenticación y control de accesos de toda la institución.
                            Como la ceiba que sostiene su ecosistema, es el núcleo que da soporte, orden y seguridad a la infraestructura digital de El Colegio de la Frontera Sur.
                        </p>

                        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                            {auth.user ? (
                                <Button asChild size="lg" className="rounded-full px-8">
                                    <Link href={dashboard()}>
                                        Go to dashboard
                                        <ChevronRight className="ml-1.5 size-4" />
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    {canRegister && (
                                        <Button asChild size="lg" className="rounded-full px-8">
                                            <Link href={register()}>
                                                Create an account
                                                <ChevronRight className="ml-1.5 size-4" />
                                            </Link>
                                        </Button>
                                    )}
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="lg"
                                        className="rounded-full px-8"
                                    >
                                        <Link href={login()}>Sign in</Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </section>
                </main>

                {/* ── Footer ── */}
                <footer className="border-t border-black/5 dark:border-white/5">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 text-xs text-[#1b1b18]/40 dark:text-[#EDEDEC]/40">
                        <div className="flex items-center gap-2">
                            <AppLogoIcon className="size-3.5 fill-current" />
                            <span>CEIBA</span>
                        </div>
                    </div>
                </footer>

            </div>
        </>
    );
}
