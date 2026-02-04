/**
 * Middleware: validateRequest
 * 
 * Validates the request body against a Zod schema.
 * If validation fails, returns a 400 Bad Request with detailed error messages.
 * If validation succeeds, attaches the validated data to `req.validatedData`.
 * 
 * @param {import('zod').ZodSchema} schema - The Zod schema to validate against
 * @returns {Function} Express middleware function
 */
export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      // Parse the request body against the schema
      // safeParse is used to avoid throwing errors directly
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        // Map Zod issues to a more user-friendly format
        const formattedErrors = result.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message
        }));

        return res.status(400).json({ 
          error: 'Validation failed',
          details: formattedErrors
        });
      }
      
      // Add the validated (and potentially transformed) data to req
      req.validatedData = result.data;
      next();
    } catch (error) {
      // This catch block might not be reached with safeParse, but kept for safety
      return res.status(500).json({ 
        error: 'Internal schema validation error'
      });
    }
  };
};
