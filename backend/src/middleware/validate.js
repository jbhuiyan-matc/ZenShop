/**
 * Middleware for validating request body against Zod schema
 */
export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          error: 'Validation failed',
          issues: result.error.issues 
        });
      }
      
      // Add the validated data to req
      req.validatedData = result.data;
      next();
    } catch (error) {
      return res.status(500).json({ 
        error: 'Schema validation error'
      });
    }
  };
};
