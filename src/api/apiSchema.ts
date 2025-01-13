import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const getEventsSchema = z.object({
    from: z.string().refine(
        (val) => !isNaN(Date.parse(val)),
        { message: 'Invalid UTC timestamp string for `from`' }
    ).optional(),
    to: z.string().refine(
        (val) => !isNaN(Date.parse(val)),
        { message: 'Invalid UTC timestamp string for `to`' }
    ).optional(),
});

export const createValidationMiddleware = (schema: z.ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            if (req.method === 'GET') {
                req.query = schema.parse(req.query);
            } else {
                req.body = schema.parse(req.body);
            }
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({
                    error: error.message,
                });
                return;
            }
            next(error);
        }
    };
};
