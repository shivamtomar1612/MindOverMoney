import type { Metadata } from "next";

import { ProfileForm } from "@/components/profile/profile-form";
import { getUser } from "@/lib/data";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  const profile = getUser("aarav");
  if (!profile) return null;
  return <ProfileForm initialProfile={profile} />;
}
