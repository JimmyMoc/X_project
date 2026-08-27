<?php

namespace App\Mcp\Tools;

use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\JsonSchema\Types\Type;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsDestructive;
use Laravel\Mcp\Server\Tools\Annotations\IsOpenWorld;
use Throwable;

#[Name('restablecer_contrasena')]
#[Description('Restablece o actualiza la contraseña de un usuario mediante su correo electrónico.')]
#[IsOpenWorld]
#[IsDestructive]
class RestablecerContrasena extends Tool
{
    /**
     * Handle the tool request.
     */
    public function handle(Request $request): Response
    {
        try {
            $email = $request->get('email');
            $newPassword = $request->get('new_password');
            $token = $request->get('token');

            if (! $email || ! $newPassword) {
                return Response::error('Error: se requiere el correo electrónico (email) y la nueva contraseña (new_password).');
            }

            $user = User::where('email', $email)->first();

            if (! $user) {
                return Response::error("Error: no existe ningún usuario registrado con el correo '{$email}'.");
            }

            // Si se provee token, validar con el Password Broker de Laravel
            if ($token) {
                $status = Password::broker()->reset(
                    ['email' => $email, 'password' => $newPassword, 'token' => $token],
                    function ($u, $pwd) {
                        $u->password = Hash::make($pwd);
                        $u->save();
                    }
                );

                if ($status !== Password::PASSWORD_RESET) {
                    return Response::error('Error: el token de recuperación proporcionado es inválido o ha expirado.');
                }

                return Response::text("Contraseña restablecida exitosamente para el usuario {$user->name} ({$email}) usando token.");
            }

            // Modo administrativo directo (actualización directa de contraseña)
            $user->password = Hash::make($newPassword);
            $user->save();

            return Response::text("Contraseña actualizada exitosamente para el usuario {$user->name} ({$email}).");
        } catch (Throwable $e) {
            return Response::error("Error de base de datos o ejecución al restablecer contraseña: {$e->getMessage()}");
        }
    }

    /**
     * Get the tool's input schema.
     *
     * @return array<string, Type>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'email' => $schema->string()->description('Correo electrónico del usuario')->required(),
            'new_password' => $schema->string()->description('Nueva contraseña a asignar al usuario')->required(),
            'token' => $schema->string()->description('Token temporal de recuperación (opcional si es cambio directo)'),
        ];
    }
}
