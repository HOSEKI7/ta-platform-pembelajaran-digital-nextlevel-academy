import { z } from "zod";

export const submitQuizSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1, "questionId wajib diisi."),
        optionIndex: z
          .number()
          .int("optionIndex harus bilangan bulat.")
          .min(0, "optionIndex tidak boleh negatif."),
      }),
    )
    .min(1, "Minimal satu jawaban harus dikirim."),
});

export type SubmitQuizInput = z.infer<typeof submitQuizSchema>;
