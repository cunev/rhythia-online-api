import { handleApi } from "./handleApi"

// ./api/approveMap.ts API

/*
export const Schema = {
  input: z.strictObject({
    session: z.string(),
    mapId: z.number(),
  }),
  output: z.object({
    error: z.string().optional(),
  }),
};*/
import { Schema as ApproveMap } from "./api/approveMap"
export { Schema as SchemaApproveMap } from "./api/approveMap"
export const approveMap = handleApi({url:"/api/approveMap",...ApproveMap})

// ./api/createBeatmap.ts API

/*
export const Schema = {
  input: z.strictObject({
    url: z.string(),
    session: z.string(),
    updateFlag: z.boolean().optional(),
  }),
  output: z.strictObject({
    hash: z.string().optional(),
    error: z.string().optional(),
  }),
};*/
import { Schema as CreateBeatmap } from "./api/createBeatmap"
export { Schema as SchemaCreateBeatmap } from "./api/createBeatmap"
export const createBeatmap = handleApi({url:"/api/createBeatmap",...CreateBeatmap})

// ./api/createBeatmapPage.ts API

/*
export const Schema = {
  input: z.strictObject({
    session: z.string(),
  }),
  output: z.strictObject({
    error: z.string().optional(),
    id: z.number().optional(),
  }),
};*/
import { Schema as CreateBeatmapPage } from "./api/createBeatmapPage"
export { Schema as SchemaCreateBeatmapPage } from "./api/createBeatmapPage"
export const createBeatmapPage = handleApi({url:"/api/createBeatmapPage",...CreateBeatmapPage})

// ./api/deleteBeatmapPage.ts API

/*
export const Schema = {
  input: z.strictObject({
    session: z.string(),
    id: z.number(),
  }),
  output: z.strictObject({
    error: z.string().optional(),
  }),
};*/
import { Schema as DeleteBeatmapPage } from "./api/deleteBeatmapPage"
export { Schema as SchemaDeleteBeatmapPage } from "./api/deleteBeatmapPage"
export const deleteBeatmapPage = handleApi({url:"/api/deleteBeatmapPage",...DeleteBeatmapPage})

// ./api/editAboutMe.ts API

/*
export const Schema = {
  input: z.strictObject({
    session: z.string(),
    data: z.object({
      about_me: z.string().optional(),
    }),
  }),
  output: z.object({
    error: z.string().optional(),
  }),
};*/
import { Schema as EditAboutMe } from "./api/editAboutMe"
export { Schema as SchemaEditAboutMe } from "./api/editAboutMe"
export const editAboutMe = handleApi({url:"/api/editAboutMe",...EditAboutMe})

// ./api/editProfile.ts API

/*
export const Schema = {
  input: z.strictObject({
    session: z.string(),
    data: z.object({
      avatar_url: z.string().optional(),
      username: z.string().optional(),
    }),
  }),
  output: z.object({
    error: z.string().optional(),
  }),
};*/
import { Schema as EditProfile } from "./api/editProfile"
export { Schema as SchemaEditProfile } from "./api/editProfile"
export const editProfile = handleApi({url:"/api/editProfile",...EditProfile})

// ./api/getAvatarUploadUrl.ts API

/*
export const Schema = {
  input: z.strictObject({
    session: z.string(),
    contentLength: z.number(),
    contentType: z.string(),
    intrinsicToken: z.string(),
  }),
  output: z.strictObject({
    error: z.string().optional(),
    url: z.string().optional(),
    objectKey: z.string().optional(),
  }),
};*/
import { Schema as GetAvatarUploadUrl } from "./api/getAvatarUploadUrl"
export { Schema as SchemaGetAvatarUploadUrl } from "./api/getAvatarUploadUrl"
export const getAvatarUploadUrl = handleApi({url:"/api/getAvatarUploadUrl",...GetAvatarUploadUrl})

// ./api/getBadgedUsers.ts API

/*
export const Schema = {
  input: z.strictObject({
    badge: z.string(),
  }),
  output: z.object({
    error: z.string().optional(),
    leaderboard: z
      .array(
        z.object({
          flag: z.string().nullable(),
          id: z.number(),
          username: z.string().nullable(),
        })
      )
      .optional(),
  }),
};*/
import { Schema as GetBadgedUsers } from "./api/getBadgedUsers"
export { Schema as SchemaGetBadgedUsers } from "./api/getBadgedUsers"
export const getBadgedUsers = handleApi({url:"/api/getBadgedUsers",...GetBadgedUsers})

// ./api/getBeatmapComments.ts API

/*
export const Schema = {
  input: z.strictObject({
    page: z.number(),
  }),
  output: z.strictObject({
    error: z.string().optional(),
    comments: z.array(
      z.object({
        beatmapPage: z.number(),
        content: z.string().nullable(),
        owner: z.number(),
        created_at: z.string(),
        profiles: z.object({
          avatar_url: z.string().nullable(),
          username: z.string().nullable(),
          badges: z.any().nullable(),
        }),
      })
    ),
  }),
};*/
import { Schema as GetBeatmapComments } from "./api/getBeatmapComments"
export { Schema as SchemaGetBeatmapComments } from "./api/getBeatmapComments"
export const getBeatmapComments = handleApi({url:"/api/getBeatmapComments",...GetBeatmapComments})

// ./api/getBeatmapPage.ts API

/*
export const Schema = {
  input: z.strictObject({
    session: z.string(),
    id: z.number(),
  }),
  output: z.object({
    error: z.string().optional(),
    beatmap: z
      .object({
        id: z.number().nullable().optional(),
        nominations: z.array(z.number()).nullable().optional(),
        playcount: z.number().nullable().optional(),
        created_at: z.string().nullable().optional(),
        updated_at: z.number().nullable().optional(),
        difficulty: z.number().nullable().optional(),
        noteCount: z.number().nullable().optional(),
        length: z.number().nullable().optional(),
        title: z.string().nullable().optional(),
        ranked: z.boolean().nullable().optional(),
        beatmapFile: z.string().nullable().optional(),
        image: z.string().nullable().optional(),
        imageLarge: z.string().nullable().optional(),
        starRating: z.number().nullable().optional(),
        owner: z.number().nullable().optional(),
        ownerUsername: z.string().nullable().optional(),
        ownerAvatar: z.string().nullable().optional(),
        status: z.string().nullable().optional(),
        description: z.string().nullable().optional(),
        tags: z.string().nullable().optional(),
      })
      .optional(),
  }),
};*/
import { Schema as GetBeatmapPage } from "./api/getBeatmapPage"
export { Schema as SchemaGetBeatmapPage } from "./api/getBeatmapPage"
export const getBeatmapPage = handleApi({url:"/api/getBeatmapPage",...GetBeatmapPage})

// ./api/getBeatmapPageById.ts API

/*
export const Schema = {
  input: z.strictObject({
    session: z.string(),
    mapId: z.string(),
  }),
  output: z.object({
    error: z.string().optional(),
    beatmap: z
      .object({
        id: z.number().nullable().optional(),
        nominations: z.array(z.number()).nullable().optional(),
        playcount: z.number().nullable().optional(),
        created_at: z.string().nullable().optional(),
        updated_at: z.number().nullable().optional(),
        difficulty: z.number().nullable().optional(),
        noteCount: z.number().nullable().optional(),
        length: z.number().nullable().optional(),
        title: z.string().nullable().optional(),
        ranked: z.boolean().nullable().optional(),
        beatmapFile: z.string().nullable().optional(),
        image: z.string().nullable().optional(),
        starRating: z.number().nullable().optional(),
        owner: z.number().nullable().optional(),
        ownerUsername: z.string().nullable().optional(),
        ownerAvatar: z.string().nullable().optional(),
        status: z.string().nullable().optional(),
      })
      .optional(),
  }),
};*/
import { Schema as GetBeatmapPageById } from "./api/getBeatmapPageById"
export { Schema as SchemaGetBeatmapPageById } from "./api/getBeatmapPageById"
export const getBeatmapPageById = handleApi({url:"/api/getBeatmapPageById",...GetBeatmapPageById})

// ./api/getBeatmaps.ts API

/*
export const Schema = {
  input: z.strictObject({
    session: z.string(),
    textFilter: z.string().optional(),
    authorFilter: z.string().optional(),
    tagsFilter: z.string().optional(),
    page: z.number().default(1),
    maxStars: z.number().optional(),
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    minStars: z.number().optional(),
    creator: z.number().optional(),
    status: z.string().optional(),
  }),
  output: z.object({
    error: z.string().optional(),
    total: z.number(),
    viewPerPage: z.number(),
    currentPage: z.number(),
    beatmaps: z
      .array(
        z.object({
          id: z.number(),
          playcount: z.number().nullable().optional(),
          created_at: z.string().nullable().optional(),
          difficulty: z.number().nullable().optional(),
          noteCount: z.number().nullable().optional(),
          length: z.number().nullable().optional(),
          title: z.string().nullable().optional(),
          ranked: z.boolean().nullable().optional(),
          beatmapFile: z.string().nullable().optional(),
          image: z.string().nullable().optional(),
          starRating: z.number().nullable().optional(),
          owner: z.number().nullable().optional(),
          ownerUsername: z.string().nullable().optional(),
          ownerAvatar: z.string().nullable().optional(),
          status: z.string().nullable().optional(),
          tags: z.string().nullable().optional(),
        })
      )
      .optional(),
  }),
};*/
import { Schema as GetBeatmaps } from "./api/getBeatmaps"
export { Schema as SchemaGetBeatmaps } from "./api/getBeatmaps"
export const getBeatmaps = handleApi({url:"/api/getBeatmaps",...GetBeatmaps})

// ./api/getBeatmapStarRating.ts API

/*
export const Schema = {
  input: z.strictObject({
    session: z.string(),
    mapId: z.string(),
  }),
  output: z.object({
    error: z.string().optional(),
    beatmap: z
      .object({
        starRating: z.number().nullable().optional(),
      })
      .optional(),
  }),
};*/
import { Schema as GetBeatmapStarRating } from "./api/getBeatmapStarRating"
export { Schema as SchemaGetBeatmapStarRating } from "./api/getBeatmapStarRating"
export const getBeatmapStarRating = handleApi({url:"/api/getBeatmapStarRating",...GetBeatmapStarRating})

// ./api/getLeaderboard.ts API

/*
export const Schema = {
  input: z.strictObject({
    session: z.string(),
    page: z.number().default(1),
    flag: z.string().optional(),
  }),
  output: z.object({
    error: z.string().optional(),
    total: z.number(),
    viewPerPage: z.number(),
    currentPage: z.number(),
    userPosition: z.number(),
    leaderboard: z
      .array(
        z.object({
          flag: z.string().nullable(),
          id: z.number(),
          username: z.string().nullable(),
          play_count: z.number().nullable(),
          skill_points: z.number().nullable(),
          total_score: z.number().nullable(),
        })
      )
      .optional(),
  }),
};*/
import { Schema as GetLeaderboard } from "./api/getLeaderboard"
export { Schema as SchemaGetLeaderboard } from "./api/getLeaderboard"
export const getLeaderboard = handleApi({url:"/api/getLeaderboard",...GetLeaderboard})

// ./api/getMapUploadUrl.ts API

/*
export const Schema = {
  input: z.strictObject({
    mapName: z.string().optional(),
    session: z.string(),
    contentLength: z.number(),
    contentType: z.string(),
    intrinsicToken: z.string(),
  }),
  output: z.strictObject({
    error: z.string().optional(),
    url: z.string().optional(),
    objectKey: z.string().optional(),
  }),
};*/
import { Schema as GetMapUploadUrl } from "./api/getMapUploadUrl"
export { Schema as SchemaGetMapUploadUrl } from "./api/getMapUploadUrl"
export const getMapUploadUrl = handleApi({url:"/api/getMapUploadUrl",...GetMapUploadUrl})

// ./api/getPassToken.ts API

/*
export const Schema = {
  input: z.strictObject({
    data: z.object({
      email: z.string(),
      passkey: z.string(),
      computerName: z.string(),
    }),
  }),
  output: z.object({
    token: z.string().optional(),
    error: z.string().optional(),
  }),
};*/
import { Schema as GetPassToken } from "./api/getPassToken"
export { Schema as SchemaGetPassToken } from "./api/getPassToken"
export const getPassToken = handleApi({url:"/api/getPassToken",...GetPassToken})

// ./api/getProfile.ts API

/*
export const Schema = {
  input: z.strictObject({
    session: z.string(),
    id: z.number().nullable().optional(),
  }),
  output: z.object({
    error: z.string().optional(),
    user: z
      .object({
        about_me: z.string().nullable(),
        avatar_url: z.string().nullable(),
        profile_image: z.string().nullable(),
        badges: z.any().nullable(),
        created_at: z.number().nullable(),
        flag: z.string().nullable(),
        id: z.number(),
        uid: z.string().nullable(),
        ban: z.string().nullable(),
        username: z.string().nullable(),
        verified: z.boolean().nullable(),
        play_count: z.number().nullable(),
        skill_points: z.number().nullable(),
        squares_hit: z.number().nullable(),
        total_score: z.number().nullable(),
        position: z.number().nullable(),
        is_online: z.boolean(),
      })
      .optional(),
  }),
};*/
import { Schema as GetProfile } from "./api/getProfile"
export { Schema as SchemaGetProfile } from "./api/getProfile"
export const getProfile = handleApi({url:"/api/getProfile",...GetProfile})

// ./api/getPublicStats.ts API

/*
export const Schema = {
  input: z.strictObject({}),
  output: z.object({
    profiles: z.number(),
    beatmaps: z.number(),
    scores: z.number(),
    lastBeatmaps: z.array(
      z.object({
        id: z.number().nullable().optional(),
        nominations: z.array(z.number()).nullable().optional(),
        playcount: z.number().nullable().optional(),
        created_at: z.string().nullable().optional(),
        difficulty: z.number().nullable().optional(),
        noteCount: z.number().nullable().optional(),
        length: z.number().nullable().optional(),
        title: z.string().nullable().optional(),
        ranked: z.boolean().nullable().optional(),
        beatmapFile: z.string().nullable().optional(),
        image: z.string().nullable().optional(),
        starRating: z.number().nullable().optional(),
        owner: z.number().nullable().optional(),
        ownerUsername: z.string().nullable().optional(),
        ownerAvatar: z.string().nullable().optional(),
        status: z.string().nullable().optional(),
      })
    ),
    topUsers: z.array(
      z.object({
        username: z.string(),
        id: z.number(),
        avatar_url: z.string(),
        skill_points: z.number(),
      })
    ),
    lastComments: z.array(
      z.object({
        owner: z.number(),
        content: z.string(),
        username: z.string(),
        beatmapTitle: z.string(),
        beatmapPage: z.number(),
      })
    ),
  }),
};*/
import { Schema as GetPublicStats } from "./api/getPublicStats"
export { Schema as SchemaGetPublicStats } from "./api/getPublicStats"
export const getPublicStats = handleApi({url:"/api/getPublicStats",...GetPublicStats})

// ./api/getScore.ts API

/*
export const Schema = {
  input: z.strictObject({
    session: z.string(),
    id: z.number(),
  }),
  output: z.object({
    error: z.string().optional(),
    score: z
      .object({
        awarded_sp: z.number().nullable(),
        beatmapHash: z.string().nullable(),
        created_at: z.string(),
        id: z.number(),
        misses: z.number().nullable(),
        passed: z.boolean().nullable(),
        songId: z.string().nullable(),
        userId: z.number().nullable(),
        beatmapDifficulty: z.number().optional().nullable(),
        beatmapNotes: z.number().optional().nullable(),
        beatmapTitle: z.string().optional().nullable(),
        username: z.string().optional().nullable(),
        speed: z.number().optional().nullable(),
        spin: z.boolean().optional().nullable(),
      })
      .optional(),
  }),
};*/
import { Schema as GetScore } from "./api/getScore"
export { Schema as SchemaGetScore } from "./api/getScore"
export const getScore = handleApi({url:"/api/getScore",...GetScore})

// ./api/getTimestamp.ts API

/*
export const Schema = {
  input: z.strictObject({}),
  output: z.object({
    time: z.number(),
  }),
};*/
import { Schema as GetTimestamp } from "./api/getTimestamp"
export { Schema as SchemaGetTimestamp } from "./api/getTimestamp"
export const getTimestamp = handleApi({url:"/api/getTimestamp",...GetTimestamp})

// ./api/getUserScores.ts API

/*
export const Schema = {
  input: z.strictObject({
    session: z.string(),
    id: z.number(),
    limit: z.number().default(10),
  }),
  output: z.object({
    error: z.string().optional(),
    lastDay: z
      .array(
        z.object({
          awarded_sp: z.number().nullable(),
          beatmapHash: z.string().nullable(),
          created_at: z.string(),
          id: z.number(),
          misses: z.number().nullable(),
          passed: z.boolean().nullable(),
          songId: z.string().nullable(),
          userId: z.number().nullable(),
          beatmapDifficulty: z.number().optional().nullable(),
          beatmapNotes: z.number().optional().nullable(),
          beatmapTitle: z.string().optional().nullable(),
          speed: z.number().optional().nullable(),
          spin: z.boolean().optional().nullable(),
        })
      )
      .optional(),
    top: z
      .array(
        z.object({
          awarded_sp: z.number().nullable(),
          beatmapHash: z.string().nullable(),
          created_at: z.string(),
          id: z.number(),
          misses: z.number().nullable(),
          passed: z.boolean().nullable(),
          rank: z.string().nullable(),
          songId: z.string().nullable(),
          userId: z.number().nullable(),
          beatmapDifficulty: z.number().optional().nullable(),
          beatmapNotes: z.number().optional().nullable(),
          beatmapTitle: z.string().optional().nullable(),
          speed: z.number().optional().nullable(),
          spin: z.boolean().optional().nullable(),
        })
      )
      .optional(),
    stats: z
      .object({
        totalScores: z.number(),
        spinScores: z.number(),
      })
      .optional(),
  }),
};*/
import { Schema as GetUserScores } from "./api/getUserScores"
export { Schema as SchemaGetUserScores } from "./api/getUserScores"
export const getUserScores = handleApi({url:"/api/getUserScores",...GetUserScores})

// ./api/nominateMap.ts API

/*
export const Schema = {
  input: z.strictObject({
    session: z.string(),
    mapId: z.number(),
  }),
  output: z.object({
    error: z.string().optional(),
  }),
};*/
import { Schema as NominateMap } from "./api/nominateMap"
export { Schema as SchemaNominateMap } from "./api/nominateMap"
export const nominateMap = handleApi({url:"/api/nominateMap",...NominateMap})

// ./api/postBeatmapComment.ts API

/*
export const Schema = {
  input: z.strictObject({
    session: z.string(),
    page: z.number(),
    content: z.string(),
  }),
  output: z.strictObject({
    error: z.string().optional(),
  }),
};*/
import { Schema as PostBeatmapComment } from "./api/postBeatmapComment"
export { Schema as SchemaPostBeatmapComment } from "./api/postBeatmapComment"
export const postBeatmapComment = handleApi({url:"/api/postBeatmapComment",...PostBeatmapComment})

// ./api/rankMapsArchive.ts API

/*
export const Schema = {
  input: z.strictObject({
    session: z.string(),
    mapId: z.number(),
  }),
  output: z.object({
    error: z.string().optional(),
  }),
};*/
import { Schema as RankMapsArchive } from "./api/rankMapsArchive"
export { Schema as SchemaRankMapsArchive } from "./api/rankMapsArchive"
export const rankMapsArchive = handleApi({url:"/api/rankMapsArchive",...RankMapsArchive})

// ./api/searchUsers.ts API

/*
export const Schema = {
  input: z.strictObject({
    text: z.string(),
  }),
  output: z.object({
    error: z.string().optional(),
    results: z
      .array(
        z.object({
          id: z.number(),
          username: z.string().nullable(),
        })
      )
      .optional(),
  }),
};*/
import { Schema as SearchUsers } from "./api/searchUsers"
export { Schema as SchemaSearchUsers } from "./api/searchUsers"
export const searchUsers = handleApi({url:"/api/searchUsers",...SearchUsers})

// ./api/setPasskey.ts API

/*
export const Schema = {
  input: z.strictObject({
    session: z.string(),
    data: z.object({
      passkey: z.string(),
    }),
  }),
  output: z.object({
    error: z.string().optional(),
  }),
};*/
import { Schema as SetPasskey } from "./api/setPasskey"
export { Schema as SchemaSetPasskey } from "./api/setPasskey"
export const setPasskey = handleApi({url:"/api/setPasskey",...SetPasskey})

// ./api/submitScore.ts API

/*
export const Schema = {
  input: z.strictObject({
    session: z.string(),
    data: z.strictObject({
      token: z.string(),
      relayHwid: z.string(),
      songId: z.string(),
      misses: z.number(),
      hits: z.number(),
      mapHash: z.string(),
      speed: z.number(),
      mods: z.array(z.string()),
      additionalData: z.any(),
      spin: z.boolean(),
    }),
  }),
  output: z.object({
    error: z.string().optional(),
  }),
};*/
import { Schema as SubmitScore } from "./api/submitScore"
export { Schema as SchemaSubmitScore } from "./api/submitScore"
export const submitScore = handleApi({url:"/api/submitScore",...SubmitScore})

// ./api/updateBeatmapPage.ts API

/*
export const Schema = {
  input: z.strictObject({
    session: z.string(),
    id: z.number(),
    beatmapHash: z.string().optional(),
    tags: z.string().optional(),
    description: z.string().optional(),
  }),
  output: z.strictObject({
    error: z.string().optional(),
  }),
};*/
import { Schema as UpdateBeatmapPage } from "./api/updateBeatmapPage"
export { Schema as SchemaUpdateBeatmapPage } from "./api/updateBeatmapPage"
export const updateBeatmapPage = handleApi({url:"/api/updateBeatmapPage",...UpdateBeatmapPage})
export { handleApi } from "./handleApi"