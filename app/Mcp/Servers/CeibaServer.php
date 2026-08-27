<?php

namespace App\Mcp\Servers;

use App\Mcp\Tools\CrearUsuario;
use App\Mcp\Tools\RestablecerContrasena;
use Laravel\Mcp\Server;
use Laravel\Mcp\Server\Attributes\Instructions;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Version;

#[Name('Ceiba Server')]
#[Version('1.0.0')]
#[Instructions('Servidor MCP para administración de usuarios, autenticación y recursos del sistema CEIBA.')]
class CeibaServer extends Server
{
    protected array $tools = [
        CrearUsuario::class,
        RestablecerContrasena::class,
    ];

    protected array $resources = [
        //
    ];

    protected array $prompts = [
        //
    ];
}
