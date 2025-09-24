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
    <div className="flex flex-col w-full items-center justify-center py-20">
      <ProfileForm profile={profile} />
      <QueueManagement />
    </div>
  );
}
