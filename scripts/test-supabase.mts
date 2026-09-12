import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { isSupabaseConfigured } from "../src/lib/supabase/config.ts";
import { normalizeProfile } from "../src/lib/profile/storage.ts";
import { getUser } from "../src/lib/data/demo-data.ts";

const aarav = getUser("aarav");
assert.ok(aarav, "the Aarav demo profile should remain available without Supabase");
assert.equal(isSupabaseConfigured, false, "this fallback test intentionally runs without Supabase variables");

const normalized = normalizeProfile({ name: "  Demo Learner ", riskScore: 140, literacyScore: -4 }, aarav);
assert.equal(normalized.name, "Demo Learner");
assert.equal(normalized.riskScore, 100);
assert.equal(normalized.literacyScore, 0);
assert.equal(normalized.riskTolerance, "Conservative");

const migration = readFileSync(new URL("../supabase/migrations/20260912000000_initial.sql", import.meta.url), "utf8");
for (const table of ["profiles", "watchlists", "analyses", "paper_portfolios", "portfolio_transactions", "learning_progress", "uploaded_reports"]) {
  assert.match(migration, new RegExp(`create table if not exists public\\.${table}`));
  assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`));
}
assert.match(migration, /auth\.uid\(\)/);
assert.match(migration, /portfolio_transactions_own/);

const envExample = readFileSync(new URL("../.env.example", import.meta.url), "utf8");
for (const variable of ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "OPENAI_API_KEY", "FINANCIAL_API_KEY"]) {
  assert.match(envExample, new RegExp(`^${variable}=`, "m"));
}

console.log("Supabase fallback validation passed without environment variables; demo profile normalization remains safe.");
