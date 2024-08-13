import { handleApi } from "./handleApi"

// ./api/createUser.ts API
import { Schema as CreateUser } from "./api/createUser"
export { Schema as SchemaCreateUser } from "./api/createUser"
export const createUser = handleApi(CreateUser)

// ./api/editUser.ts API
import { Schema as EditUser } from "./api/editUser"
export { Schema as SchemaEditUser } from "./api/editUser"
export const editUser = handleApi(EditUser)
export { handleApi } from "./handleApi"