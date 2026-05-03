const Joi = require('joi');

const commonPatterns = {
  name: Joi.string().min(2).max(100).trim().required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().min(8).max(128).required(),
  objectId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
  status: Joi.string().valid('active', 'banned', 'inactive'),
  role: Joi.string().valid('user', 'admin')
};

const customMessages = {
  'string.min': '{#label} must be at least {#limit} characters long',
  'string.max': '{#label} cannot exceed {#limit} characters',
  'string.email': 'Please provide a valid email address',
  'any.required': '{#label} is required',
  'any.only': '{#label} must be one of: {#valids}',
  'string.pattern.base': '{#label} format is invalid'
};

const strongPasswordValidation = Joi.string()
  .min(8)
  .max(128)
  .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])'))
  .required()
  .messages({
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  });

const registerValidation = Joi.object({
  name: commonPatterns.name.messages(customMessages),
  email: commonPatterns.email.messages(customMessages),
  password: commonPatterns.password.messages({
    ...customMessages,
    'string.min': 'Password must be at least 8 characters long'
  })
});

const loginValidation = Joi.object({
  email: commonPatterns.email.messages(customMessages),
  password: Joi.string().required().messages(customMessages)
});

const adminLoginValidation = loginValidation;

const profileUpdateValidation = Joi.object({
  name: commonPatterns.name.messages(customMessages).optional(),
  phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).allow('').optional().messages({
    'string.pattern.base': 'Please provide a valid phone number'
  }),
  bio: Joi.string().max(500).allow('').optional(),
  avatar: Joi.string().uri().allow('').optional(),
  age: Joi.string().allow('').optional(),
  gender: Joi.string().valid('male', 'female', 'other', 'prefer-not-to-say', '').optional(),
  dob: Joi.string().allow('').optional(),
  isVerifiedBadge: Joi.boolean().optional(),
  addresses: Joi.array().items(Joi.object({
    street: Joi.string().allow('').optional(),
    apartment: Joi.string().allow('').optional(),
    city: Joi.string().allow('').optional(),
    state: Joi.string().allow('').optional(),
    pinCode: Joi.string().allow('').optional(),
    country: Joi.string().allow('').optional(),
    isDefault: Joi.boolean().optional()
  })).optional()
});

const passwordChangeValidation = Joi.object({
  currentPassword: Joi.string().required().messages(customMessages),
  newPassword: commonPatterns.password.messages({
    ...customMessages,
    'string.min': 'New password must be at least 8 characters long'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Password confirmation does not match new password',
    'any.required': 'Password confirmation is required'
  })
});

const statusUpdateValidation = Joi.object({
  status: commonPatterns.status.required().messages(customMessages)
});

const banUserValidation = Joi.object({
  reason: Joi.string().min(10).max(500).required().messages({
    'string.min': 'Ban reason must be at least 10 characters long',
    'string.max': 'Ban reason cannot exceed 500 characters',
    'any.required': 'Ban reason is required'
  })
});

const paginationValidation = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().valid('name', 'email', 'createdAt', 'updatedAt', 'lastLogin').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  search: Joi.string().max(100).optional(),
  status: commonPatterns.status.optional(),
  role: commonPatterns.role.optional()
});



const ValidationHelpers = {
  validatePagination: (query) => {
    const { error, value } = paginationValidation.validate(query);
    if (error) throw error;
    return value;
  },

  isValidObjectId: (id) => {
    return commonPatterns.objectId.validate(id).error === undefined;
  },

  isValidEmail: (email) => {
    return commonPatterns.email.validate(email).error === undefined;
  },

  checkPasswordStrength: (password) => {
    const { error } = strongPasswordValidation.validate(password);
    return error === undefined;
  }
};

const createProductValidation = Joi.object({
  name: commonPatterns.name,
  code: Joi.string().required(),
  description: Joi.string().allow(''),
  return: Joi.boolean().default(false),
  category: Joi.array().items(Joi.string()).min(1).required(),
  price: Joi.number().min(0).required(),
  quantity: Joi.number().integer().min(0).required(),
  isVisible: Joi.boolean().default(false),
  size: Joi.array().items(Joi.string()).min(1).required(),
  color: Joi.array().items(Joi.string()).min(1).required(),
  image: Joi.array().items(Joi.string()).min(1).required()
});

const updateProductValidation = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  code: Joi.string().optional(),
  description: Joi.string().allow('').optional(),
  return: Joi.boolean().optional(),
  category: Joi.array().items(Joi.string()).min(1).optional(),
  price: Joi.number().min(0).optional(),
  quantity: Joi.number().integer().min(0).optional(),
  isVisible: Joi.boolean().optional(),
  size: Joi.array().items(Joi.string()).min(1).optional(),
  color: Joi.array().items(Joi.string()).min(1).optional(),
  image: Joi.array().items(Joi.string()).min(1).optional()
});

module.exports = {
  registerValidation,
  loginValidation,
  adminLoginValidation,
  profileUpdateValidation,
  passwordChangeValidation,
  statusUpdateValidation,
  banUserValidation,
  paginationValidation,
  createProductValidation,
  updateProductValidation,
  ValidationHelpers,
  commonPatterns,
  customMessages,
  strongPasswordValidation
};