"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserProfile } from "@/lib/types";
import { X } from "lucide-react";
import { BrandLogo } from "../brand-logo";

interface SoundCloudConnectionProps {
  profile: UserProfile;
  onUpdate: () => void;
}

export function SoundCloudConnection({ profile, onUpdate }: SoundCloudConnectionProps) {
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleConnect = () => {
    window.location.href = '/api/soundcloud/auth';
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      const response = await fetch('/api/soundcloud/disconnect', {
        method: 'POST',
      });

      if (response.ok) {
        onUpdate();
      } else {
        console.error('Failed to disconnect SoundCloud');
      }
    } catch (error) {
      console.error('Error disconnecting SoundCloud:', error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrandLogo brand="soundcloud" variant="primary" size="lg" />
          <div>
            <h3 className="font-semibold">SoundCloud</h3>
            <p className="text-sm text-muted-foreground">
              {profile.connected_services.soundcloud?.connected ? 'Connected' : 'Not connected'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {profile.connected_services.soundcloud?.connected ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDisconnect}
              disabled={isDisconnecting}
            >
              <X className="w-4 h-4 mr-2" />
              {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
            </Button>
          ) : (
            <Button onClick={handleConnect} size="sm">
              Connect SoundCloud
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

