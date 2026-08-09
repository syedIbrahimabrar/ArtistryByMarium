// Safe fallback client for server operations
import { supabase } from "./client";

export const supabaseAdmin = supabase as unknown as typeof supabase;
