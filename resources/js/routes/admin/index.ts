import users from './users'
import roles from './roles'

const admin = {
    users: Object.assign(users, users),
    roles: Object.assign(roles, roles),
}

export default admin