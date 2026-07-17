import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { generateCourse } from "@/lib/courses.functions";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/courses/")({
  head: () => ({ meta: [{ title: "Courses — Lumen" }] }),
  component: CoursesPage,
});

function CoursesPage() {
  const navigate = useNavigate();
  const gen = useServerFn(generateCourse);
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [lessonCount, setLessonCount] = useState(5);
  const [busy, setBusy] = useState(false);

  const { data: courses, refetch } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => (await supabase.from("courses").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setBusy(true);
    try {
      const { courseId } = await gen({ data: { topic: topic.trim(), level, lessonCount } });
      toast.success("Course generated!");
      await refetch();
      navigate({ to: "/courses/$courseId", params: { courseId } });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to generate course");
    } finally { setBusy(false); }
  };

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="font-display text-4xl mb-2">Courses</h1>
      <p className="text-muted-foreground mb-8">Generate a personalized course on any topic.</p>

      <form onSubmit={create} className="card-elevated p-6 mb-10 space-y-4">
        <div className="flex items-center gap-2 text-primary text-sm">
          <Sparkles className="w-4 h-4" />Create with AI
        </div>
        <div>
          <Label>What do you want to learn?</Label>
          <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Python for data analysis, Ancient Roman history, Music theory basics" disabled={busy} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Level</Label>
            <Select value={level} onValueChange={(v: any) => setLevel(v)} disabled={busy}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Lessons</Label>
            <Select value={String(lessonCount)} onValueChange={(v) => setLessonCount(Number(v))} disabled={busy}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{[3, 4, 5, 6, 7, 8].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <Button type="submit" disabled={busy || !topic.trim()} className="glow-primary">
          {busy ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating…</> : "Generate course"}
        </Button>
      </form>

      <h2 className="font-display text-2xl mb-4">All courses</h2>
      {courses?.length === 0 ? (
        <p className="text-muted-foreground">No courses yet. Generate one above.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {courses?.map((c) => (
            <Link key={c.id} to="/courses/$courseId" params={{ courseId: c.id }} className="card-elevated p-6 hover:border-primary/60 transition">
              <div className="text-xs uppercase tracking-wider text-primary mb-1">{c.level}</div>
              <h3 className="text-xl mb-2">{c.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{c.description}</p>
              {c.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {c.skills.slice(0, 3).map((s: string) => <span key={s} className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground">{s}</span>)}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
