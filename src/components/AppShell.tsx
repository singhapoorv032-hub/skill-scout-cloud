import { Link, useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Sparkles, Target, Users, LogOut, Home } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/courses", label: "Courses", icon: BookOpen },
  { to: "/tutor", label: "AI Tutor", icon: Sparkles },
  { to: "/skills", label: "Skills", icon: Target },
  { to: "/roleplay", label: "Roleplay", icon: Users },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const signOut = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/" });
  };
  return (
    <div className="min-h-screen flex">
      <aside className="w-60 shrink-0 border-r border-border/60 bg-card/40 backdrop-blur px-4 py-6 flex flex-col">
        <Link to="/dashboard" className="font-display text-2xl gradient-text mb-8">Lumen</Link>
        <nav className="flex-1 flex flex-col gap-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition"
              activeProps={{ className: "!text-primary-foreground bg-primary/90 hover:bg-primary" }}
            >
              <Icon className="w-4 h-4" />{label}
            </Link>
          ))}
        </nav>
        <Button variant="ghost" size="sm" onClick={signOut} className="justify-start gap-2 text-muted-foreground">
          <LogOut className="w-4 h-4" />Sign out
        </Button>
      </aside>
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
