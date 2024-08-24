import { handleApi } from "./handleApi"

// ./api/getPublicStats.ts API
import { Schema as GetPublicStats } from "./api/getPublicStats"
export { Schema as SchemaGetPublicStats } from "./api/getPublicStats"
export const getPublicStats = handleApi({url:"/api/getPublicStats",...GetPublicStats})

// ./api/getUserScores.ts API
import { Schema as GetUserScores } from "./api/getUserScores"
export { Schema as SchemaGetUserScores } from "./api/getUserScores"
export const getUserScores = handleApi({url:"/api/getUserScores",...GetUserScores})

// ./api/editProfile.ts API
import { Schema as EditProfile } from "./api/editProfile"
export { Schema as SchemaEditProfile } from "./api/editProfile"
export const editProfile = handleApi({url:"/api/editProfile",...EditProfile})

// ./api/getProfile.ts API
import { Schema as GetProfile } from "./api/getProfile"
export { Schema as SchemaGetProfile } from "./api/getProfile"
export const getProfile = handleApi({url:"/api/getProfile",...GetProfile})

// ./api/getLeaderboard.ts API
import { Schema as GetLeaderboard } from "./api/getLeaderboard"
export { Schema as SchemaGetLeaderboard } from "./api/getLeaderboard"
export const getLeaderboard = handleApi({url:"/api/getLeaderboard",...GetLeaderboard})

// ./api/searchUsers.ts API
import { Schema as SearchUsers } from "./api/searchUsers"
export { Schema as SchemaSearchUsers } from "./api/searchUsers"
export const searchUsers = handleApi({url:"/api/searchUsers",...SearchUsers})

// ./api/submitScore.ts API
import { Schema as SubmitScore } from "./api/submitScore"
export { Schema as SchemaSubmitScore } from "./api/submitScore"
export const submitScore = handleApi({url:"/api/submitScore",...SubmitScore})
export { handleApi } from "./handleApi"