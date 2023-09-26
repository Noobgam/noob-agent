import { z } from "zod"

const RawAnkiCard = z.object({
    "Expression": z.string(),
    "Meaning": z.string(),
    "Example sentence": z.string()
})

export type RawAnkiCardType = z.infer<typeof RawAnkiCard>
