import Joi from "joi";

export const userSchema = Joi.object({
  first_name: Joi.string().trim().required(),
  last_name: Joi.string().trim().required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().trim().required(),
  registration_mode: Joi.string().valid("upload", "live").required().messages({
    "any.only": "Registration mode must be one of: upload,live",
    "string.empty": "Registration mode is required",
  }),
  attendance_pic_url: Joi.string().trim().optional(),
});
