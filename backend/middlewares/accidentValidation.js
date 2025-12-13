const Joi = require("joi");

const accidentValidationSchema = (req, res, next) => {
  const schema = Joi.object({
    phoneNumber: Joi.string()
      .pattern(/^[0-9]{10,15}$/)
      .required()
      .messages({
        "string.pattern.base": "Phone number must contain 10 to 15 digits only",
        "any.required": "Phone number is required",
      }),

    description: Joi.string().min(3).max(500).required().messages({
      "string.min": "Description must be at least 3 characters",
      "string.max": "Description cannot exceed 500 characters",
      "any.required": "Description is required",
    }),

    location: Joi.object({
      latitude: Joi.number().min(-90).max(90).required().messages({
        "number.base": "Latitude must be a number",
        "number.min": "Latitude must be ≥ -90",
        "number.max": "Latitude must be ≤ 90",
        "any.required": "Latitude is required",
      }),

      longitude: Joi.number().min(-180).max(180).required().messages({
        "number.base": "Longitude must be a number",
        "number.min": "Longitude must be ≥ -180",
        "number.max": "Longitude must be ≤ 180",
        "any.required": "Longitude is required",
      }),
    })
      .required()
      .messages({
        "any.required": "Location is required",
      }),

    images: Joi.array()
      .items(Joi.string().uri())
      .max(5)
      .optional()
      .messages({
        "array.max": "Maximum 5 images are allowed",
        "string.uri": "Each image must be a valid URL",
      }),
  }).options({ stripUnknown: true });

  const { error, value } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      message: "Validation Error",
      errors: error.details.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      })),
    });
  }

  req.body = value;
  next();
};

module.exports = accidentValidationSchema;
