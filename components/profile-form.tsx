"use client";

import { useState } from "react";
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
import { UserProfile } from "@/lib/user-profile";

interface ProfileFormProps {
  profile: UserProfile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [username, setUsername] = useState(profile.username);
  const [displayName, setDisplayName] = useState(profile.display_name || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [streamingServices, setStreamingServices] = useState<string[]>(profile.streaming_services || []);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string>(profile.avatar_url || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleEdit = () => {
    setIsEditMode(true);
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    // Reset to original values
    setUsername(profile.username);
    setDisplayName(profile.display_name || "");
    setBio(profile.bio || "");
    setStreamingServices(profile.streaming_services || []);
    setProfilePic(null);
    setProfilePicPreview(profile.avatar_url || "");
    setIsEditMode(false);
    setError(null);
    setSuccess(null);
  };

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

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const supabase = createClient();

    try {
      let profilePicUrl = profile.avatar_url || "";

      // Upload profile picture if a new one was selected
      if (profilePic) {
        const fileExt = profilePic.name.split('.').pop();
        const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
        
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

      // Update the user's metadata in auth
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          username,
          display_name: displayName,
          bio,
          streaming_services: streamingServices,
          avatar_url: profilePicUrl,
        },
      });

      if (authError) throw authError;

      // Update the profile in the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username,
          display_name: displayName,
          bio,
          streaming_services: streamingServices,
          avatar_url: profilePicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (profileError) throw profileError;

      setSuccess("Profile updated successfully!");
      setIsEditMode(false);
      // Update the profile object with new values
      profile.username = username;
      profile.display_name = displayName;
      profile.bio = bio;
      profile.streaming_services = streamingServices;
      profile.avatar_url = profilePicUrl;
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl">Your Profile</CardTitle>
          <CardDescription>
            Manage your profile information and preferences
          </CardDescription>
        </div>
        {!isEditMode && (
          <Button onClick={handleEdit} variant="outline">
            Edit Profile
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleProfileUpdate}>
          <div className="flex flex-col gap-6">
            {/* Profile Picture Section */}
            <div className="grid gap-3">
              <Label>Profile Picture</Label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  {profilePicPreview ? (
                    <img
                      src={profilePicPreview}
                      alt="Profile picture"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">No image</span>
                    </div>
                  )}
                </div>
                {isEditMode && (
                  <div className="flex-1">
                    <Input
                      id="profilePic"
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePicChange}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended: Square image, max 5MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={!isEditMode}
                className={!isEditMode ? "bg-muted" : ""}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="John Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={!isEditMode}
                className={!isEditMode ? "bg-muted" : ""}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Input
                id="bio"
                placeholder="Tell us a bit about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className={`min-h-[80px] resize-none ${!isEditMode ? "bg-muted" : ""}`}
                disabled={!isEditMode}
              />
            </div>


            {/* Streaming Services Section */}
            <div className="grid gap-3">
              <Label>Preferred Streaming Services</Label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="soundcloud"
                    checked={streamingServices.includes("soundcloud")}
                    onCheckedChange={(checked) => handleStreamingServiceChange("soundcloud", checked === true)}
                    disabled={!isEditMode}
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
                    disabled={!isEditMode}
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
                    disabled={!isEditMode}
                  />
                  <Label htmlFor="tidal" className="text-sm font-normal cursor-pointer">
                    Tidal
                  </Label>
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-green-500">{success}</p>}
            
            {isEditMode && (
              <div className="flex gap-3">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Updating profile..." : "Save Changes"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
