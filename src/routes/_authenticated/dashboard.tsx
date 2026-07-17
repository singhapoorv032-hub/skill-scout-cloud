import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles, Target, TrendingUp, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Lumen" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = Route.useRouteContext();
  const name = (user.user_metadata?.full_name as string | undefined)?.split(" ")[0] ?? user.email?.split("@")[0] ?? "learner";

  const { data: courses } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => (await supabase.from("courses").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const { data: lessons } = await supabase.from("lessons").select("completed, quiz_score");
      const total = lessons?.length ?? 0;
      const done = lessons?.filter((l) => l.completed).length ?? 0;
      const scores = lessons?.filter((l) => l.quiz_score != null).map((l) => l.quiz_score!) ?? [];
      const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      return { total, done, avg };
    },
  });

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-10">
        <p className="text-sm text-muted-foreground">Welcome back,</p>
        <h1 className="font-display text-5xl capitalize">{name}.</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-10">
        <Stat icon={BookOpen} label="Courses" value={courses?.length ?? 0} />
        <Stat icon={Target} label="Lessons completed" value={`${stats?.done ?? 0} / ${stats?.total ?? 0}`} />
        <Stat icon={TrendingUp} label="Avg quiz score" value={stats?.avg ? `${stats.avg}%` : "—"} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl">Your courses</h2>
        <Link to="/courses"><Button variant="outline"><Plus className="w-4 h-4 mr-1" />New course</Button></Link>
      </div>

      {courses?.length === 0 ? (
        <div className="card-elevated p-12 text-center">
          <Sparkles className="w-10 h-10 mx-auto text-primary mb-3" />
          <h3 className="font-display text-2xl mb-2">No courses yet</h3>
          <p className="text-muted-foreground mb-6">Generate your first AI course to get started.</p>
          <Link to="/courses"><Button className="glow-primary">Create your first course</Button></Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {courses?.map((c) => (
            <Link key={c.id} to="/courses/$courseId" params={{ courseId: c.id }} className="card-elevated p-6 hover:border-primary/60 transition">
              <div className="text-xs uppercase tracking-wider text-primary mb-1">{c.level}</div>
              <h3 className="text-xl mb-2">{c.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{c.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: React.ReactNode }) {
  return (
    <div className="card-elevated p-5">
      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2"><Icon className="w-4 h-4" />{label}</div>
      <div className="font-display text-3xl">{value}</div>
    </div>
  );
}
