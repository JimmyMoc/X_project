import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\SecurityController::logoutOtherDevices
* @see app/Http/Controllers/SecurityController.php:10
* @route '/logout-other-devices'
*/
export const logoutOtherDevices = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logoutOtherDevices.url(options),
    method: 'post',
})

logoutOtherDevices.definition = {
    methods: ["post"],
    url: '/logout-other-devices',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SecurityController::logoutOtherDevices
* @see app/Http/Controllers/SecurityController.php:10
* @route '/logout-other-devices'
*/
logoutOtherDevices.url = (options?: RouteQueryOptions) => {
    return logoutOtherDevices.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SecurityController::logoutOtherDevices
* @see app/Http/Controllers/SecurityController.php:10
* @route '/logout-other-devices'
*/
logoutOtherDevices.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logoutOtherDevices.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SecurityController::logoutOtherDevices
* @see app/Http/Controllers/SecurityController.php:10
* @route '/logout-other-devices'
*/
const logoutOtherDevicesForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: logoutOtherDevices.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SecurityController::logoutOtherDevices
* @see app/Http/Controllers/SecurityController.php:10
* @route '/logout-other-devices'
*/
logoutOtherDevicesForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: logoutOtherDevices.url(options),
    method: 'post',
})

logoutOtherDevices.form = logoutOtherDevicesForm

const SecurityController = { logoutOtherDevices }

export default SecurityController