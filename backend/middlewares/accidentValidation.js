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
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required(),
    }).required(),

    images: Joi.array()
      .items(
        Joi.object({
          url: Joi.string().uri().required().messages({
            "string.uri": "Image must be a valid Cloudinary URL",
          }),
          public_id: Joi.string().required().messages({
            "any.required": "Cloudinary public_id is required",
          }),
        })
      )
      .max(5)
      .optional()
      .messages({
        "array.max": "Maximum 5 images are allowed",
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
