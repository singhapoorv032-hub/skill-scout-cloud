import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/roleplay")({
  head: () => ({ meta: [{ title: "Roleplay — Lumen" }] }),
  component: RoleplayPage,
});

const scenarios = [
  { title: "Sales discovery call", desc: "Practice qualifying a prospect on a discovery call.", tag: "Sales" },
  { title: "Job interview: senior engineer", desc: "Rehearse behavioral and technical questions.", tag: "Career" },
  { title: "Customer support escalation", desc: "De-escalate a frustrated customer and resolve their issue.", tag: "Support" },
  { title: "Doctor–patient consultation", desc: "Explain a diagnosis with empathy and clarity.", tag: "Healthcare" },
];

function RoleplayPage() {
  return (
    <div className="p-8 max-w-5xl">
      <h1 className="font-display text-4xl mb-2">Roleplay</h1>
      <p className="text-muted-foreground mb-8">Practice real conversations with AI-powered personas.</p>

      <div className="grid md:grid-cols-2 gap-4">
        {scenarios.map((s) => (
          <div key={s.title} className="card-elevated p-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary mb-2">
              <Users className="w-3.5 h-3.5" />{s.tag}
            </div>
            <h3 className="text-xl mb-2">{s.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{s.desc}</p>
            <div className="text-xs text-muted-foreground italic">Coming soon</div>
          </div>
        ))}
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        In the meantime, try roleplaying with the <a href="/tutor" className="text-primary underline">AI Tutor</a> —
        ask it to play any persona and give you feedback.
      </p>
    </div>
  );
}
