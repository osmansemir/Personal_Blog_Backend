import { ZodError } from "zod";

/**
 * Validation middleware factory
 * @param {ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware function
 */
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      // Validate request body against schema
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors for client-friendly response
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: "Validation failed",
          errors,
        });
      }

      // Pass other errors to error handler
      next(error);
    }
  };
};

/**
 * Validation middleware for request params
 * @param {ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware function
 */
export const validateParams = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: "Invalid request parameters",
          errors,
        });
      }

      next(error);
    }
  };
};