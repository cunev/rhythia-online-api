import { handleApi } from "./handleApi"

// ./api/approveMap.ts API
import { Schema as ApproveMap } from "./api/approveMap"
export { Schema as SchemaApproveMap } from "./api/approveMap"
export const approveMap = handleApi({url:"/api/approveMap",...ApproveMap})

// ./api/createBeatmap.ts API
import { Schema as CreateBeatmap } from "./api/createBeatmap"
export { Schema as SchemaCreateBeatmap } from "./api/createBeatmap"
export const createBeatmap = handleApi({url:"/api/createBeatmap",...CreateBeatmap})

// ./api/createBeatmapPage.ts API
import { Schema as CreateBeatmapPage } from "./api/createBeatmapPage"
export { Schema as SchemaCreateBeatmapPage } from "./api/createBeatmapPage"
export const createBeatmapPage = handleApi({url:"/api/createBeatmapPage",...CreateBeatmapPage})

// ./api/editAboutMe.ts API
import { Schema as EditAboutMe } from "./api/editAboutMe"
export { Schema as SchemaEditAboutMe } from "./api/editAboutMe"
export const editAboutMe = handleApi({url:"/api/editAboutMe",...EditAboutMe})

// ./api/editProfile.ts API
import { Schema as EditProfile } from "./api/editProfile"
export { Schema as SchemaEditProfile } from "./api/editProfile"
export const editProfile = handleApi({url:"/api/editProfile",...EditProfile})

// ./api/getAvatarUploadUrl.ts API
import { Schema as GetAvatarUploadUrl } from "./api/getAvatarUploadUrl"
export { Schema as SchemaGetAvatarUploadUrl } from "./api/getAvatarUploadUrl"
export const getAvatarUploadUrl = handleApi({url:"/api/getAvatarUploadUrl",...GetAvatarUploadUrl})

// ./api/getBadgedUsers.ts API
import { Schema as GetBadgedUsers } from "./api/getBadgedUsers"
export { Schema as SchemaGetBadgedUsers } from "./api/getBadgedUsers"
export const getBadgedUsers = handleApi({url:"/api/getBadgedUsers",...GetBadgedUsers})

// ./api/getBeatmapComments.ts API
import { Schema as GetBeatmapComments } from "./api/getBeatmapComments"
export { Schema as SchemaGetBeatmapComments } from "./api/getBeatmapComments"
export const getBeatmapComments = handleApi({url:"/api/getBeatmapComments",...GetBeatmapComments})

// ./api/getBeatmapPage.ts API
import { Schema as GetBeatmapPage } from "./api/getBeatmapPage"
export { Schema as SchemaGetBeatmapPage } from "./api/getBeatmapPage"
export const getBeatmapPage = handleApi({url:"/api/getBeatmapPage",...GetBeatmapPage})

// ./api/getBeatmapPageById.ts API
import { Schema as GetBeatmapPageById } from "./api/getBeatmapPageById"
export { Schema as SchemaGetBeatmapPageById } from "./api/getBeatmapPageById"
export const getBeatmapPageById = handleApi({url:"/api/getBeatmapPageById",...GetBeatmapPageById})

// ./api/getBeatmaps.ts API
import { Schema as GetBeatmaps } from "./api/getBeatmaps"
export { Schema as SchemaGetBeatmaps } from "./api/getBeatmaps"
export const getBeatmaps = handleApi({url:"/api/getBeatmaps",...GetBeatmaps})

// ./api/getLeaderboard.ts API
import { Schema as GetLeaderboard } from "./api/getLeaderboard"
export { Schema as SchemaGetLeaderboard } from "./api/getLeaderboard"
export const getLeaderboard = handleApi({url:"/api/getLeaderboard",...GetLeaderboard})

// ./api/getMapUploadUrl.ts API
import { Schema as GetMapUploadUrl } from "./api/getMapUploadUrl"
export { Schema as SchemaGetMapUploadUrl } from "./api/getMapUploadUrl"
export const getMapUploadUrl = handleApi({url:"/api/getMapUploadUrl",...GetMapUploadUrl})

// ./api/getProfile.ts API
import { Schema as GetProfile } from "./api/getProfile"
export { Schema as SchemaGetProfile } from "./api/getProfile"
export const getProfile = handleApi({url:"/api/getProfile",...GetProfile})

// ./api/getPublicStats.ts API
import { Schema as GetPublicStats } from "./api/getPublicStats"
export { Schema as SchemaGetPublicStats } from "./api/getPublicStats"
export const getPublicStats = handleApi({url:"/api/getPublicStats",...GetPublicStats})

// ./api/getScore.ts API
import { Schema as GetScore } from "./api/getScore"
export { Schema as SchemaGetScore } from "./api/getScore"
export const getScore = handleApi({url:"/api/getScore",...GetScore})

// ./api/getUserScores.ts API
import { Schema as GetUserScores } from "./api/getUserScores"
export { Schema as SchemaGetUserScores } from "./api/getUserScores"
export const getUserScores = handleApi({url:"/api/getUserScores",...GetUserScores})

// ./api/nominateMap.ts API
import { Schema as NominateMap } from "./api/nominateMap"
export { Schema as SchemaNominateMap } from "./api/nominateMap"
export const nominateMap = handleApi({url:"/api/nominateMap",...NominateMap})

// ./api/postBeatmapComment.ts API
import { Schema as PostBeatmapComment } from "./api/postBeatmapComment"
export { Schema as SchemaPostBeatmapComment } from "./api/postBeatmapComment"
export const postBeatmapComment = handleApi({url:"/api/postBeatmapComment",...PostBeatmapComment})

// ./api/rankMapsArchive.ts API
import { Schema as RankMapsArchive } from "./api/rankMapsArchive"
export { Schema as SchemaRankMapsArchive } from "./api/rankMapsArchive"
export const rankMapsArchive = handleApi({url:"/api/rankMapsArchive",...RankMapsArchive})

// ./api/searchUsers.ts API
import { Schema as SearchUsers } from "./api/searchUsers"
export { Schema as SchemaSearchUsers } from "./api/searchUsers"
export const searchUsers = handleApi({url:"/api/searchUsers",...SearchUsers})

// ./api/submitScore.ts API
import { Schema as SubmitScore } from "./api/submitScore"
export { Schema as SchemaSubmitScore } from "./api/submitScore"
export const submitScore = handleApi({url:"/api/submitScore",...SubmitScore})

// ./api/updateBeatmapPage.ts API
import { Schema as UpdateBeatmapPage } from "./api/updateBeatmapPage"
export { Schema as SchemaUpdateBeatmapPage } from "./api/updateBeatmapPage"
export const updateBeatmapPage = handleApi({url:"/api/updateBeatmapPage",...UpdateBeatmapPage})
export { handleApi } from "./handleApi"