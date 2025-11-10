import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DJRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: dj_id } = await params;
  const supabase = await createClient();

  const { data: queue, error } = await supabase
    .from("queues")
    .select("code")
    .eq("dj_id", dj_id)
    .eq("status", "active")
    .single();  

  if (error || !queue) {
    console.error('Error fetching queue:', error);
    return
  }

  if (queue.code) redirect(`/queue/${queue.code}`);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>No Active Queue</CardTitle>
          <CardDescription>
            This DJ doesn't have an active queue at the moment. Please check back later or contact the DJ directly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The DJ may need to create and activate a queue before you can join.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

