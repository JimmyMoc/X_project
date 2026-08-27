<?php

use App\Mcp\Servers\CeibaServer;
use Laravel\Mcp\Facades\Mcp;

// Endpoint Web (HTTP / SSE)
Mcp::web('/mcp/CEIBA', CeibaServer::class);

// Handle Local (CLI / Stdio con php artisan mcp:start ceiba)
Mcp::local('ceiba', CeibaServer::class);
