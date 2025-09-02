import Link from "next/link";
import { Button } from "./ui/button";
import { ThemeSwitcher } from "./supabase-auth/theme-switcher";
import { AuthButton } from "./supabase-auth/auth-button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo/Brand */}
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block text-xl">
              DJ Queue App
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            href="/" 
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Home
          </Link>
          <Link 
            href="/profile" 
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Profile
          </Link>
        </nav>

        {/* Right side - Auth and Theme */}
        <div className="flex items-center space-x-4">
          <AuthButton />
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
