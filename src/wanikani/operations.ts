import {z} from "zod"
import {AssignmentSchema} from "./models";

export const GetAssignmentsSchema = z.object({
    pages: z.object({
        per_page: z.number(),
        next_url: z.string().optional().or(z.null()),
    }),
    data: z.array(z.object({
        id: z.number(),
        data: AssignmentSchema
    }))
})

export type GetAssignmentOutput = z.infer<typeof GetAssignmentsSchema>;
