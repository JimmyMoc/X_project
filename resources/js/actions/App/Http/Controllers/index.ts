import SecurityController from './SecurityController'
import Auth from './Auth'
import Admin from './Admin'
import Settings from './Settings'

const Controllers = {
    SecurityController: Object.assign(SecurityController, SecurityController),
    Auth: Object.assign(Auth, Auth),
    Admin: Object.assign(Admin, Admin),
    Settings: Object.assign(Settings, Settings),
}

export default Controllers