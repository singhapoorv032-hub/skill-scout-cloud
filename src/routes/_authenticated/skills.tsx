import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Target } from "lucide-react";

export const Route = createFileRoute("/_authenticated/skills")({
  head: () => ({ meta: [{ title: "Skills — Lumen" }] }),
  component: SkillsPage,
});

function SkillsPage() {
  const { data } = useQuery({
    queryKey: ["skills-map"],
    queryFn: async () => {
      const { data: courses } = await supabase.from("courses").select("id, title, skills");
      const { data: lessons } = await supabase.from("lessons").select("course_id, completed");
      const map = new Map<string, { total: number; done: number; courses: Set<string> }>();
      for (const c of courses ?? []) {
        const cl = (lessons ?? []).filter((l) => l.course_id === c.id);
        const done = cl.filter((l) => l.completed).length;
        for (const s of c.skills ?? []) {
          const existing = map.get(s) ?? { total: 0, done: 0, courses: new Set() };
          existing.total += cl.length;
          existing.done += done;
          existing.courses.add(c.title);
          map.set(s, existing);
        }
      }
      return Array.from(map.entries()).map(([skill, v]) => ({
        skill,
        progress: v.total ? Math.round((v.done / v.total) * 100) : 0,
        courses: Array.from(v.courses),
      })).sort((a, b) => b.progress - a.progress);
    },
  });

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="font-display text-4xl mb-2">Skills</h1>
      <p className="text-muted-foreground mb-8">Skills you're building across your courses.</p>

      {(!data || data.length === 0) ? (
        <div className="card-elevated p-12 text-center">
          <Target className="w-10 h-10 mx-auto text-primary mb-3" />
          <p className="text-muted-foreground">Generate a course to start building your skills map.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {data.map((s) => (
            <div key={s.skill} className="card-elevated p-5">
              <div className="flex justify-between items-baseline mb-2">
                <h3 className="text-lg capitalize">{s.skill}</h3>
                <span className="text-sm text-primary">{s.progress}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden mb-3">
                <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${s.progress}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">From: {s.courses.join(", ")}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
