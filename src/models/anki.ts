import { z } from "zod"

const RawAnkiCard = z.object({
    "Expression": z.string(),
    "Meaning": z.string(),
    "Example sentence": z.string(),
    "Usage": z.string().optional(),
    "Example sentence meaning": z.string().optional()
})

export type RawAnkiCardType = z.infer<typeof RawAnkiCard>
