import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QueueCreationDialog } from "@/components/queue-creation-dialog";
import { PastQueueCard } from "@/components/past-queue-card";


export function QueueManagement() {
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
  )
}