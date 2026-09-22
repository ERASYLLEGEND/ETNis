import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        res.status(400).json({ error: `Деректер қате толтырылған: ${message}`, details: error.errors });
        return;
      }
      res.status(400).json({ error: 'Деректерді тексеру барысында қате шықты' });
    }
  };
}
