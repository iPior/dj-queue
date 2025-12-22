import { UserProfile } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  return getUserProfile(user.id);
}

export async function checkAdminStatus(): Promise<boolean> {
  const supabase = await createClient();
  
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    return false;
  }
  return true;
}

// Helper function to elegantly update connected services
export async function updateConnectedService(userId: string, serviceName: string, serviceData: any): Promise<boolean> {
  const supabase = await createClient();
  
  try {
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('connected_services')
      .eq('id', userId)
      .single();

    // Merge with existing services
    const currentServices = currentProfile?.connected_services || {};
    const updatedServices = {
      ...currentServices,
      [serviceName]: serviceData,
    };

    // Update the database
    const { error } = await supabase
      .from('profiles')
      .update({
        connected_services: updatedServices,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error(`Failed to update ${serviceName} service:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error updating ${serviceName} service:`, error);
    return false;
  }
}