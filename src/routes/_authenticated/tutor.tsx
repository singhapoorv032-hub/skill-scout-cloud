import { createFileRoute, useServerFn } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendTutorMessage, clearTutorHistory } from "@/lib/tutor.functions";
import { Sparkles, Send, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/tutor")({
  head: () => ({ meta: [{ title: "AI Tutor — Lumen" }] }),
  component: TutorPage,
});

function TutorPage() {
  const send = useServerFn(sendTutorMessage);
  const clear = useServerFn(clearTutorHistory);
  const qc = useQueryClient();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: messages } = useQuery({
    queryKey: ["tutor-messages"],
    queryFn: async () => (await supabase.from("tutor_messages").select("*").order("created_at")).data ?? [],
  });

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = input.trim();
    if (!msg || busy) return;
    setInput(""); setBusy(true);
    try {
      await send({ data: { message: msg } });
      qc.invalidateQueries({ queryKey: ["tutor-messages"] });
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  const doClear = async () => {
    await clear({});
    qc.invalidateQueries({ queryKey: ["tutor-messages"] });
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="px-8 py-5 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" />AI Tutor</h1>
          <p className="text-xs text-muted-foreground">Ask anything — Lumen is patient and thorough.</p>
        </div>
        {messages && messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={doClear}><Trash2 className="w-4 h-4 mr-1" />Clear</Button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages?.length === 0 && (
            <div className="text-center py-16">
              <Sparkles className="w-10 h-10 mx-auto text-primary mb-3" />
              <h2 className="font-display text-2xl mb-2">What should we explore today?</h2>
              <p className="text-sm text-muted-foreground">Try: "Explain gradient descent like I'm 12" or "Help me understand supply and demand."</p>
            </div>
          )}
          {messages?.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed whitespace-pre-wrap ${m.role === "user" ? "bg-primary text-primary-foreground" : "card-elevated"}`}>
                {m.content}
              </div>
            </div>
          ))}
          {busy && (
            <div className="flex justify-start"><div className="card-elevated px-5 py-3 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />Thinking…</div></div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <form onSubmit={submit} className="px-8 py-4 border-t border-border">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask the tutor…" disabled={busy} />
          <Button type="submit" disabled={busy || !input.trim()}><Send className="w-4 h-4" /></Button>
        </div>
      </form>
    </div>
  );
}
