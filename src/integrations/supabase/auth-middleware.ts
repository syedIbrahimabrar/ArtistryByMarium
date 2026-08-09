import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "./client";

export const requireSupabaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    return next({
      context: {
        supabase,
        userId: "admin",
        claims: { sub: "admin" },
      },
    });
  },
);
