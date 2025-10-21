import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import { getUserProfile } from "@/lib/user-utils";
import { User } from "lucide-react"
import Image from "next/image";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeSwitcher } from "./theme-switcher";


export async function AuthButton() {
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;
  
  if (!user) {
    return null;
  }

  // Get user profile to display username
  const profile = await getUserProfile(user.sub);
  const displayName = profile?.username || profile?.display_name;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="hover:cursor-pointer" asChild>
        {/* <div className="rounded-full overflow-hidden"> */}
          {profile?.avatar_url ? 
          <Image 
            src={profile.avatar_url} 
            alt={displayName || "User Avatar"} 
            width={50} 
            height={50}
            className="object-cover rounded-full border shadow-lg"
          /> : <User size={50} />}
        {/* </div> */}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>{displayName}</span> 
          <ThemeSwitcher />
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <LogoutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
