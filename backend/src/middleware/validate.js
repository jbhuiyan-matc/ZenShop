import { logger } from '../utils/logger.js';

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
      // Execute Zod validation
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        // Log validation failure for debugging
        logger.warn(`Validation failed for ${req.method} ${req.originalUrl} from IP ${req.ip}`);
        
        // Format Zod errors into a readable structure
        const issues = result.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message
        }));

        return res.status(400).json({ 
          error: 'Validation Error',
          message: 'The provided data does not match the expected format.',
          issues 
        });
      }
      
      // Attach validated data to the request object
      // This ensures downstream handlers use the clean, validated data
      req.validatedData = result.data;
      
      next();
    } catch (error) {
      logger.error('Unexpected error during schema validation:', error);
      return res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'An error occurred while processing your request.'
      });
    }
  };
};
