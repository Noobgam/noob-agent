import { z } from "zod"

export const AssignmentSchema = z.object({
    created_at: z.string().datetime(),
    subject_id: z.number(),
    subject_type: z.union([
        z.literal("radical"),
        z.literal("kanji"),
        z.literal("vocabulary"),
        z.literal("kana_vocabulary")
    ]),
    srs_stage: z.number(),
})

export type Assignment = z.infer<typeof AssignmentSchema>;

