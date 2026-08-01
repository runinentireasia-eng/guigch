import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type OrganizerProfile = {
  id: string;
  user_id: string;
  org_name: string;
  contact_person: string;
  email: string;
  phone: string;
  website: string;
  proof: string;
  previous_event_url: string;
  status: "pending" | "verified" | "rejected";
  admin_notes: string;
};

export function useSessionUser() {
  return useQuery({
    queryKey: ["session-user"],
    queryFn: async () => (await supabase.auth.getUser()).data.user ?? null,
  });
}

export function useIsAdmin() {
  const { data: user } = useSessionUser();
  return useQuery({
    queryKey: ["is-admin", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user!.id);
      return !!data?.some((r) => r.role === "admin");
    },
  });
}

export function useMyOrganizerProfile() {
  const { data: user } = useSessionUser();
  return useQuery({
    queryKey: ["my-organizer", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("organizer_profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      return (data as OrganizerProfile) ?? null;
    },
  });
}

export function useVerifiedOrganizerNames() {
  return useQuery({
    queryKey: ["verified-organizers"],
    queryFn: async () => {
      const { data } = await supabase
        .from("organizer_directory")
        .select("org_name")
        .eq("verified", true);
      return new Set((data ?? []).map((r) => r.org_name.trim().toLowerCase()));
    },
  });
}

export async function logRaceAction(raceId: string | null, action: string, note = "") {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  await supabase.from("race_audit_log").insert({
    race_id: raceId,
    action,
    note,
    actor_id: data.user.id,
  });
}
