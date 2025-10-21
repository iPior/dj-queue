import Link from "next/link";
import { AuthButton } from "@/components/supabase-auth/auth-button";

export function Header() {
  return (
    <header className="absolute w-full top-0 z-50">
      <div className="container mx-auto flex h-24 items-center justify-between">
        {/* Logo/Brand */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="hidden font-bold sm:inline-block text-xl">
            <span className="text-primary text-3xl">Crowd </span>
            <span className="text-foreground text-3xl">Control</span>
          </span>
        </Link>

        {/* Right side - Auth and Theme */}
        <div className="flex items-center">
          <AuthButton />
        </div>
      </div>
    </header>
  );
}