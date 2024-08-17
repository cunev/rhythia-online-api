import { handleApi } from "./handleApi"

// ./api/editUser.ts API
import { Schema as EditUser } from "./api/editUser"
export { Schema as SchemaEditUser } from "./api/editUser"
export const editUser = handleApi({url:"/api/editUser",...EditUser})
export { handleApi } from "./handleApi"