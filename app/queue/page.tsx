
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/lib/user-profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QueueCreationDialog } from "@/components/queue-creation-dialog";
import { PastQueueCard } from "@/components/past-queue-card";

export default async function QueuePage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  const user = data?.claims;

  // Get profile if user is logged in (DJs)
  let profile = null;
  if (user && !error) {
    profile = await getCurrentUserProfile();
  }

  // If user is logged in (DJ), show DJ management interface
  if (user && profile) {
    return (
      <div className="flex h-full w-full items-center justify-center py-12">
        <div className="w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Queue Management</h1>
            <p className="text-muted-foreground mt-2">
              Create and manage your DJ queues
            </p>
          </div>

          <div className="grid gap-6">
            <Card className="w-1/2">
              <CardHeader>
                <CardTitle>Start a New Queue</CardTitle>
                <CardDescription>
                  Start a new queue for your DJ session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QueueCreationDialog />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Past Queues</CardTitle>
                <CardDescription>
                  View your existing queues
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* This will be filled with past queues */}
                <PastQueueCard/>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
}