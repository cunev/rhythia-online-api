import { handleApi } from "./handleApi"

// ./api/createUser.ts API
import { Schema as CreateUser } from "./api/createUser"
export { Schema as SchemaCreateUser } from "./api/createUser"
export const createUser = handleApi({url:"/api/createUser",...CreateUser})

// ./api/editUser.ts API
import { Schema as EditUser } from "./api/editUser"
export { Schema as SchemaEditUser } from "./api/editUser"
export const editUser = handleApi({url:"/api/editUser",...EditUser})
export { handleApi } from "./handleApi"