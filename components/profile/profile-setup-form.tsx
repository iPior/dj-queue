"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileSetupFormProps {
  user: any;
}

export function ProfileSetupForm({ user }: ProfileSetupFormProps) {
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [streamingServices, setStreamingServices] = useState<string[]>([]);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string>(""); // Add this back
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleStreamingServiceChange = (service: string, checked: boolean) => {
    if (checked) {
      setStreamingServices(prev => [...prev, service]);
    } else {
      setStreamingServices(prev => prev.filter(s => s !== service));
    }
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePic(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePicPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();

    try {
      let profilePicUrl = "";

      // Upload profile picture if selected
      if (profilePic) {
        const fileExt = profilePic.name.split('.').pop();
        const fileName = `${user.sub}-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('dj-queue-profile-pics')
          .upload(fileName, profilePic);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('dj-queue-profile-pics')
          .getPublicUrl(fileName);

        profilePicUrl = urlData.publicUrl;
      }

      // First, update the user's metadata in auth
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          display_name: displayName,
          bio,
          streaming_services: streamingServices,
          profile_pic_url: profilePicUrl,
          onboarded: true,
        },
      });

      if (authError) throw authError;

      // Then, insert/update the profile in a profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.sub,
          display_name: displayName,
          bio,
          streaming_services: streamingServices,
          avatar_url: profilePicUrl,
          email: user.email,
          updated_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      // Redirect to the main app
      router.push("/profile");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
        <CardDescription>
          Add some details to personalize your experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleProfileSetup}>
          <div className="flex flex-col gap-6">

            
            <div className="grid gap-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="John Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>


            <div className="grid gap-3">
              <Label htmlFor="profilePic">Profile Picture</Label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  {profilePicPreview ? (
                    <img
                      src={profilePicPreview}
                      alt="Profile preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">No image</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    id="profilePic"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended: Square image
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Input
                id="bio"
                placeholder="Tell us a bit about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>

            <div className="grid gap-3">
              <Label>Preferred Streaming Services (Select atleast one)</Label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="soundcloud"
                    checked={streamingServices.includes("soundcloud")}
                    onCheckedChange={(checked) => handleStreamingServiceChange("soundcloud", checked === true)}
                  />
                  <Label htmlFor="soundcloud" className="text-sm font-normal cursor-pointer">
                    Soundcloud
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="beatport"
                    checked={streamingServices.includes("beatport")}
                    onCheckedChange={(checked) => handleStreamingServiceChange("beatport", checked === true)}
                  />
                  <Label htmlFor="beatport" className="text-sm font-normal cursor-pointer">
                    Beatport
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tidal"
                    checked={streamingServices.includes("tidal")}
                    onCheckedChange={(checked) => handleStreamingServiceChange("tidal", checked === true)}
                  />
                  <Label htmlFor="tidal" className="text-sm font-normal cursor-pointer">
                    Tidal
                  </Label>
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Setting up profile..." : "Complete Setup"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
