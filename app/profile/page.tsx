import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/lib/user-profile";
import { ProfileForm } from "@/components/profile-form";
import { QueueManagement } from "@/components/queue-management";

export default async function ProfilePage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (error || !user) {
    redirect("/auth/login");
  }

  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/profile-setup");
  }

  return (
    <div className="min-h-screenflex flex-col w-full items-center justify-center pt-40">
      <ProfileForm profile={profile} />
      <QueueManagement />
    </div>
  );
}
