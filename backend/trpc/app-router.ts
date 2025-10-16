import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { generatePlanProcedure } from "./routes/meals/generate-plan/route";
import { generateWorkoutPlanProcedure } from "./routes/workouts/generate-plan/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  meals: createTRPCRouter({
    generatePlan: generatePlanProcedure,
  }),
  workouts: createTRPCRouter({
    generatePlan: generateWorkoutPlanProcedure,
  }),
});

export type AppRouter = typeof appRouter;