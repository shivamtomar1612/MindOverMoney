"use client";

import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/hooks/use-auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { normalizeProfile, readDemoProfile, writeDemoProfile, DEMO_PROFILE_EVENT } from "@/lib/profile/storage";
import type { DemoUser } from "@/types";
import type { SupabaseProfileRow } from "@/lib/supabase/types";

function fromSupabase(row: SupabaseProfileRow, fallback: DemoUser): DemoUser {
  return normalizeProfile({ id: row.id, name: row.name, experience: row.experience as DemoUser["experience"], riskTolerance: row.risk_tolerance as DemoUser["riskTolerance"], riskScore: row.risk_score, investmentHorizon: row.investment_horizon as DemoUser["investmentHorizon"], goal: row.goal, literacyScore: row.literacy_score }, fallback);
}

export function useProfile(initialProfile: DemoUser) {
  const { user, loading: authLoading, demoMode } = useAuth();
  const [profile, setProfile] = useState<DemoUser>(initialProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const client = getSupabaseBrowserClient();

  useEffect(() => {
    let active = true;
    const markLoaded = () => setLoading(false);
    const localFallback = user?.isDemo && user.name ? { ...initialProfile, id: user.id, name: user.name } : initialProfile;
    const syncLocal = () => { if (active) setProfile(readDemoProfile(localFallback)); };
    if (authLoading) return () => { active = false; };

    if (!client || !isSupabaseConfigured || demoMode || !user || user.isDemo) {
      syncLocal();
      markLoaded();
      window.addEventListener(DEMO_PROFILE_EVENT, syncLocal);
      return () => { active = false; window.removeEventListener(DEMO_PROFILE_EVENT, syncLocal); };
    }

    void Promise.resolve(client.from("profiles").select("id,name,experience,risk_tolerance,risk_score,investment_horizon,goal,literacy_score").eq("id", user.id).maybeSingle()).then(({ data, error: queryError }) => {
      if (!active) return;
      if (queryError || !data) {
        setProfile({ ...localFallback, id: user.id, name: user.name || localFallback.name });
      } else {
        setProfile(fromSupabase(data as SupabaseProfileRow, { ...initialProfile, id: user.id }));
      }
      setLoading(false);
    }).catch(() => {
      if (active) { setProfile({ ...localFallback, id: user.id, name: user.name || localFallback.name }); setLoading(false); }
    });

    return () => { active = false; };
  }, [authLoading, client, demoMode, initialProfile, user]);

  const save = useCallback(async (nextProfile: DemoUser) => {
    const normalized = normalizeProfile(nextProfile, initialProfile);
    setSaving(true);
    setError(null);
    if (client && isSupabaseConfigured && !demoMode && user && !user.isDemo) {
      try {
        const { error: upsertError } = await client.from("profiles").upsert({ id: user.id, name: normalized.name, experience: normalized.experience, risk_tolerance: normalized.riskTolerance, risk_score: normalized.riskScore, investment_horizon: normalized.investmentHorizon, goal: normalized.goal, literacy_score: normalized.literacyScore }, { onConflict: "id" });
        if (upsertError) throw upsertError;
      } catch {
        writeDemoProfile(normalized);
        setError("Supabase could not save this profile, so it was saved in Demo Mode on this device.");
      }
    } else {
      writeDemoProfile(normalized);
    }
    setProfile(normalized);
    setSaving(false);
  }, [client, demoMode, initialProfile, user]);

  return { profile, loading, saving, error, save, isDemo: demoMode || !user || user.isDemo };
}
