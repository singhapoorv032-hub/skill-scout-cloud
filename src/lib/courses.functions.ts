import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const CourseInput = z.object({
  topic: z.string().min(2).max(200),
  level: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  lessonCount: z.number().int().min(3).max(8).default(5),
});

export const generateCourse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CourseInput.parse(input))
  .handler(async ({ data, context }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const prompt = `You are an expert instructional designer. Create a ${data.level} course on: "${data.topic}".
Return ONLY valid JSON (no markdown fences) with this exact shape:
{
  "title": "string",
  "description": "1-2 sentence overview",
  "skills": ["skill1", "skill2", "skill3"],
  "lessons": [
    {
      "title": "string",
      "content": "300-500 words of clear teaching content in markdown. Use headings and examples.",
      "quiz": [
        { "question": "string", "options": ["A","B","C","D"], "answerIndex": 0, "explanation": "short" }
      ]
    }
  ]
}
Generate exactly ${data.lessonCount} lessons, each with 2 quiz questions. Progress in difficulty.`;

    const { text } = await generateText({ model, prompt });
    const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/```\s*$/, "").trim();
    let parsed: any;
    try { parsed = JSON.parse(cleaned); } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("AI returned invalid JSON");
      parsed = JSON.parse(match[0]);
    }

    const { supabase, userId } = context;
    const { data: course, error: courseErr } = await supabase
      .from("courses")
      .insert({
        user_id: userId,
        title: parsed.title ?? data.topic,
        topic: data.topic,
        description: parsed.description ?? "",
        level: data.level,
        skills: Array.isArray(parsed.skills) ? parsed.skills.slice(0, 8) : [],
      })
      .select()
      .single();
    if (courseErr) throw courseErr;

    const lessons = (parsed.lessons ?? []).map((l: any, i: number) => ({
      course_id: course.id,
      user_id: userId,
      position: i + 1,
      title: l.title ?? `Lesson ${i + 1}`,
      content: l.content ?? "",
      quiz: Array.isArray(l.quiz) ? l.quiz : [],
    }));
    if (lessons.length) {
      const { error: lessonErr } = await supabase.from("lessons").insert(lessons);
      if (lessonErr) throw lessonErr;
    }

    return { courseId: course.id };
  });

export const completeLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ lessonId: z.string().uuid(), score: z.number().int().min(0).max(100) }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("lessons")
      .update({ completed: true, quiz_score: data.score })
      .eq("id", data.lessonId);
    if (error) throw error;
    return { ok: true };
  });
