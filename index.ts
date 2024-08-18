import { handleApi } from "./handleApi"

// ./api/editProfile.ts API
import { Schema as EditProfile } from "./api/editProfile"
export { Schema as SchemaEditProfile } from "./api/editProfile"
export const editProfile = handleApi({url:"/api/editProfile",...EditProfile})

// ./api/getLeaderboard.ts API
import { Schema as GetLeaderboard } from "./api/getLeaderboard"
export { Schema as SchemaGetLeaderboard } from "./api/getLeaderboard"
export const getLeaderboard = handleApi({url:"/api/getLeaderboard",...GetLeaderboard})

// ./api/getProfile.ts API
import { Schema as GetProfile } from "./api/getProfile"
export { Schema as SchemaGetProfile } from "./api/getProfile"
export const getProfile = handleApi({url:"/api/getProfile",...GetProfile})

// ./api/searchUsers.ts API
import { Schema as SearchUsers } from "./api/searchUsers"
export { Schema as SchemaSearchUsers } from "./api/searchUsers"
export const searchUsers = handleApi({url:"/api/searchUsers",...SearchUsers})
export { handleApi } from "./handleApi"