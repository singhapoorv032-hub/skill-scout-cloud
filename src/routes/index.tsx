import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sparkles, BookOpen, Target, Users, MessageSquare, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
        <div className="font-display text-3xl gradient-text whitespace-pre-line">{"Learnify_Ai\n\n"}</div>
        <div className="flex gap-3">
          <Link to="/auth"><Button variant="ghost">Sign in</Button></Link>
          <Link to="/auth"><Button>Get started</Button></Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-xs text-muted-foreground mb-8">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          Powered by Lovable AI
        </div>
        <h1 className="font-display text-6xl md:text-7xl leading-[1.05] tracking-tight">
          Learn anything, <span className="gradient-text italic">adapted to you.</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Learnify_Ai generates personalized courses, answers your questions in real time, and tracks
          the skills you're building — like having a private tutor for everything.
        </p>
        <div className="mt-10 flex gap-3 justify-center">
          <Link to="/auth"><Button size="lg" className="glow-primary">Start learning free</Button></Link>
          <a href="#features"><Button size="lg" variant="outline">See how it works</Button></a>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="card-elevated p-6">
              <div className="w-10 h-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="text-xl mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-32 text-center">
        <h2 className="font-display text-4xl mb-4">Ready to start?</h2>
        <p className="text-muted-foreground mb-8">Create your first AI-generated course in under a minute.</p>
        <Link to="/auth"><Button size="lg" className="glow-primary">Get started free</Button></Link>
      </section>
    </div>
  );
}

const features = [
  { icon: BookOpen, title: "AI course generation", desc: "Type a topic — get a full curriculum with lessons, quizzes, and progression tuned to your level." },
  { icon: MessageSquare, title: "Conversational tutor", desc: "Ask questions, get explanations, and work through problems with an always-available AI coach." },
  { icon: Target, title: "Skills tracking", desc: "See which skills you've built as you complete lessons, and get recommendations for what's next." },
  { icon: TrendingUp, title: "Adaptive difficulty", desc: "Quizzes and content adjust based on your performance — never too easy, never too hard." },
  { icon: Users, title: "Roleplay simulations", desc: "Practice conversations for sales, interviews, or support with realistic AI personas." },
  { icon: Sparkles, title: "Instant feedback", desc: "Get graded explanations on open-ended answers so you learn from every mistake." },
];
