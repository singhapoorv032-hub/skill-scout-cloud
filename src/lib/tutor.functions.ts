import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const ChatInput = z.object({
  message: z.string().min(1).max(2000),
  courseId: z.string().uuid().nullable().optional(),
});

export const sendTutorMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ChatInput.parse(input))
  .handler(async ({ data, context }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const { supabase, userId } = context;

    // Load history + optional course context
    const { data: history } = await supabase
      .from("tutor_messages")
      .select("role, content")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(30);

    let courseContext = "";
    if (data.courseId) {
      const { data: course } = await supabase.from("courses").select("title, topic, description").eq("id", data.courseId).maybeSingle();
      if (course) courseContext = `\nCurrent course context: "${course.title}" — ${course.description ?? course.topic}`;
    }

    // Persist user message
    await supabase.from("tutor_messages").insert({
      user_id: userId, course_id: data.courseId ?? null, role: "user", content: data.message,
    });

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const messages = [
      { role: "system" as const, content: `You are Lumen, a patient, encouraging AI tutor. Explain concepts clearly with examples. Use markdown. If the learner is wrong, gently correct and explain why. Keep responses focused (under 400 words unless the topic requires depth).${courseContext}` },
      ...(history ?? []).map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user" as const, content: data.message },
    ];

    const { text } = await generateText({ model, messages });

    await supabase.from("tutor_messages").insert({
      user_id: userId, course_id: data.courseId ?? null, role: "assistant", content: text,
    });

    return { reply: text };
  });

export const clearTutorHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await context.supabase.from("tutor_messages").delete().eq("user_id", context.userId);
    return { ok: true };
  });
