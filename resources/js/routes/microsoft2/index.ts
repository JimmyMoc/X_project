import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Auth\OAuthController::login
* @see app/Http/Controllers/Auth/OAuthController.php:23
* @route '/auth/microsoft2'
*/
export const login = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: login.url(options),
    method: 'get',
})

login.definition = {
    methods: ["get","head"],
    url: '/auth/microsoft2',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\OAuthController::login
* @see app/Http/Controllers/Auth/OAuthController.php:23
* @route '/auth/microsoft2'
*/
login.url = (options?: RouteQueryOptions) => {
    return login.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\OAuthController::login
* @see app/Http/Controllers/Auth/OAuthController.php:23
* @route '/auth/microsoft2'
*/
login.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: login.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\OAuthController::login
* @see app/Http/Controllers/Auth/OAuthController.php:23
* @route '/auth/microsoft2'
*/
login.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: login.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Auth\OAuthController::login
* @see app/Http/Controllers/Auth/OAuthController.php:23
* @route '/auth/microsoft2'
*/
const loginForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: login.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\OAuthController::login
* @see app/Http/Controllers/Auth/OAuthController.php:23
* @route '/auth/microsoft2'
*/
loginForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: login.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\OAuthController::login
* @see app/Http/Controllers/Auth/OAuthController.php:23
* @route '/auth/microsoft2'
*/
loginForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: login.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

login.form = loginForm

/**
* @see \App\Http\Controllers\Auth\OAuthController::callback
* @see app/Http/Controllers/Auth/OAuthController.php:41
* @route '/auth/microsoft2/callback'
*/
export const callback = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: callback.url(options),
    method: 'get',
})

callback.definition = {
    methods: ["get","head"],
    url: '/auth/microsoft2/callback',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\OAuthController::callback
* @see app/Http/Controllers/Auth/OAuthController.php:41
* @route '/auth/microsoft2/callback'
*/
callback.url = (options?: RouteQueryOptions) => {
    return callback.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\OAuthController::callback
* @see app/Http/Controllers/Auth/OAuthController.php:41
* @route '/auth/microsoft2/callback'
*/
callback.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: callback.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\OAuthController::callback
* @see app/Http/Controllers/Auth/OAuthController.php:41
* @route '/auth/microsoft2/callback'
*/
callback.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: callback.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Auth\OAuthController::callback
* @see app/Http/Controllers/Auth/OAuthController.php:41
* @route '/auth/microsoft2/callback'
*/
const callbackForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: callback.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\OAuthController::callback
* @see app/Http/Controllers/Auth/OAuthController.php:41
* @route '/auth/microsoft2/callback'
*/
callbackForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: callback.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\OAuthController::callback
* @see app/Http/Controllers/Auth/OAuthController.php:41
* @route '/auth/microsoft2/callback'
*/
callbackForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: callback.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

callback.form = callbackForm

const microsoft2 = {
    login: Object.assign(login, login),
    callback: Object.assign(callback, callback),
}

export default microsoft2