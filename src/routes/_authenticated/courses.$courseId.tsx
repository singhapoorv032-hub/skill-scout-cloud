import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { completeLesson } from "@/lib/courses.functions";
import { toast } from "sonner";
import { CheckCircle2, Circle, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/courses/$courseId")({
  head: () => ({ meta: [{ title: "Course — Lumen" }] }),
  component: CoursePage,
});

type Quiz = { question: string; options: string[]; answerIndex: number; explanation?: string };

function CoursePage() {
  const { courseId } = Route.useParams();
  const qc = useQueryClient();
  const complete = useServerFn(completeLesson);

  const { data: course } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => (await supabase.from("courses").select("*").eq("id", courseId).single()).data,
  });

  const { data: lessons } = useQuery({
    queryKey: ["lessons", courseId],
    queryFn: async () => (await supabase.from("lessons").select("*").eq("course_id", courseId).order("position")).data ?? [],
  });

  const [activeIdx, setActiveIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const active = lessons?.[activeIdx];
  const quiz: Quiz[] = (active?.quiz as any) ?? [];

  const submit = async () => {
    if (!active) return;
    const correct = quiz.filter((q, i) => answers[i] === q.answerIndex).length;
    const score = quiz.length ? Math.round((correct / quiz.length) * 100) : 100;
    setSubmitted(true);
    try {
      await complete({ data: { lessonId: active.id, score } });
      toast.success(`Lesson complete — ${score}%`);
      qc.invalidateQueries({ queryKey: ["lessons", courseId] });
    } catch (e: any) { toast.error(e.message); }
  };

  const nextLesson = () => {
    if (!lessons) return;
    setSubmitted(false); setAnswers({});
    setActiveIdx((i) => Math.min(i + 1, lessons.length - 1));
  };

  if (!course || !lessons) return <div className="p-8 text-muted-foreground">Loading…</div>;

  return (
    <div className="p-8 max-w-6xl">
      <Link to="/courses" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" />All courses
      </Link>
      <div className="mb-8">
        <div className="text-xs uppercase tracking-wider text-primary mb-2">{course.level}</div>
        <h1 className="font-display text-4xl mb-2">{course.title}</h1>
        <p className="text-muted-foreground">{course.description}</p>
      </div>

      <div className="grid grid-cols-[240px_1fr] gap-6">
        <aside className="space-y-1">
          {lessons.map((l, i) => (
            <button
              key={l.id}
              onClick={() => { setActiveIdx(i); setSubmitted(false); setAnswers({}); }}
              className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${i === activeIdx ? "bg-primary/90 text-primary-foreground" : "hover:bg-secondary/60"}`}
            >
              {l.completed ? <CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> : <Circle className="w-4 h-4 text-muted-foreground shrink-0" />}
              <span className="truncate">{i + 1}. {l.title}</span>
            </button>
          ))}
        </aside>

        {active && (
          <div className="card-elevated p-8">
            <h2 className="font-display text-3xl mb-4">{active.title}</h2>
            <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-foreground/90 leading-relaxed">
              {active.content}
            </div>

            {quiz.length > 0 && (
              <div className="mt-8 pt-8 border-t border-border">
                <h3 className="font-display text-2xl mb-4">Quick check</h3>
                <div className="space-y-6">
                  {quiz.map((q, qi) => (
                    <div key={qi}>
                      <p className="font-medium mb-3">{qi + 1}. {q.question}</p>
                      <div className="space-y-2">
                        {q.options.map((opt, oi) => {
                          const chosen = answers[qi] === oi;
                          const correct = submitted && oi === q.answerIndex;
                          const wrong = submitted && chosen && oi !== q.answerIndex;
                          return (
                            <button
                              key={oi}
                              disabled={submitted}
                              onClick={() => setAnswers({ ...answers, [qi]: oi })}
                              className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition ${
                                correct ? "border-primary bg-primary/10" :
                                wrong ? "border-destructive bg-destructive/10" :
                                chosen ? "border-primary" : "border-border hover:border-primary/50"
                              }`}
                            >{opt}</button>
                          );
                        })}
                      </div>
                      {submitted && q.explanation && <p className="text-xs text-muted-foreground mt-2">{q.explanation}</p>}
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex gap-3">
                  {!submitted ? (
                    <Button onClick={submit} disabled={Object.keys(answers).length !== quiz.length}>Submit quiz</Button>
                  ) : activeIdx < lessons.length - 1 ? (
                    <Button onClick={nextLesson}>Next lesson →</Button>
                  ) : (
                    <p className="text-primary">🎉 Course complete!</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
