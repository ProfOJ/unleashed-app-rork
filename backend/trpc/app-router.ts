import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import saveProfileProcedure from "./routes/witness/save-profile/route";
import saveTestimonyProcedure from "./routes/witness/save-testimony/route";
import getProfileProcedure from "./routes/witness/get-profile/route";
import getProfileByContactProcedure from "./routes/witness/get-profile-by-contact/route";
import enhanceTestimonyProcedure from "./routes/witness/enhance-testimony/route";
import getTestimoniesProcedure from "./routes/witness/get-testimonies/route";
import deleteTestimonyProcedure from "./routes/witness/delete-testimony/route";
import updateTestimonyProcedure from "./routes/witness/update-testimony/route";
import enhanceWitnessCardProcedure from "./routes/witness/enhance-witness-card/route";
import awardPointsProcedure from "./routes/points/award-points/route";
import getLeaderboardProcedure from "./routes/points/get-leaderboard/route";
import getUserStatsProcedure from "./routes/points/get-user-stats/route";
import runTestsProcedure from "./routes/test/run-tests/route";
import saveSoulProcedure from "./routes/souls/save-soul/route";
import getSoulsProcedure from "./routes/souls/get-souls/route";
import deleteSoulProcedure from "./routes/souls/delete-soul/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  witness: createTRPCRouter({
    saveProfile: saveProfileProcedure,
    saveTestimony: saveTestimonyProcedure,
    getProfile: getProfileProcedure,
    getProfileByContact: getProfileByContactProcedure,
    enhanceTestimony: enhanceTestimonyProcedure,
    getTestimonies: getTestimoniesProcedure,
    deleteTestimony: deleteTestimonyProcedure,
    updateTestimony: updateTestimonyProcedure,
    enhanceWitnessCard: enhanceWitnessCardProcedure,
  }),
  points: createTRPCRouter({
    awardPoints: awardPointsProcedure,
    getLeaderboard: getLeaderboardProcedure,
    getUserStats: getUserStatsProcedure,
  }),
  test: createTRPCRouter({
    runTests: runTestsProcedure,
  }),
  souls: createTRPCRouter({
    saveSoul: saveSoulProcedure,
    getSouls: getSoulsProcedure,
    deleteSoul: deleteSoulProcedure,
  }),
});

export type AppRouter = typeof appRouter;
