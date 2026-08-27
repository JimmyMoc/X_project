import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        // En producción (build) los archivos de Wayfinder ya están generados
        // y commiteados — no es necesario ni posible regenerarlos sin un
        // servidor Laravel activo. Solo se regeneran en modo dev.
        command === 'serve' && wayfinder({
            formVariants: true,
        }),
    ].filter(Boolean),
    esbuild: {
        jsx: 'automatic',
    },
}));
