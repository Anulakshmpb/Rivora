const { body, validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

// Helper middleware to run validations and format errors
const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validation rules
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));

    // Forward the custom ValidationError to the global error handler
    next(new ValidationError("Validation failed", formattedErrors));
  };
};

// Validation rules
const registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8, max: 128 }).withMessage('Password must be between 8 and 128 characters')
];

const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
];

const profileUpdateRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .optional({ checkFalsy: true })
    .matches(/^\+?[\d\s\-\(\)]+$/).withMessage('Please provide a valid phone number'),
  body('bio')
    .optional({ checkFalsy: true })
    .isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  body('avatar')
    .optional({ checkFalsy: true })
    .isURL().withMessage('Avatar must be a valid URL'),
  body('gender')
    .optional({ checkFalsy: true })
    .isIn(['male', 'female', 'other', 'prefer-not-to-say', '']).withMessage('Invalid gender value'),
  body('age')
    .optional({ checkFalsy: true })
    .trim(),
  body('dob')
    .optional({ checkFalsy: true })
    .trim(),
  body('addresses')
    .optional()
    .isArray().withMessage('Addresses must be an array'),
  body('newsletterSubscription')
    .optional()
    .isBoolean().withMessage('Newsletter subscription must be a boolean'),
  body('languagePreference')
    .optional({ checkFalsy: true })
    .trim()
];

const passwordChangeRules = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8, max: 128 }).withMessage('New password must be between 8 and 128 characters'),
  body('confirmPassword')
    .notEmpty().withMessage('Password confirmation is required')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    })
];

const createProductRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Product name must be between 2 and 100 characters'),
  body('code')
    .trim()
    .notEmpty().withMessage('Product code is required'),
  body('description')
    .optional({ checkFalsy: true })
    .trim(),
  body('return')
    .optional()
    .isBoolean().withMessage('Return must be a boolean'),
  body('category')
    .custom(val => Array.isArray(val) && val.length > 0).withMessage('Category must be a non-empty array'),
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('size')
    .custom(val => Array.isArray(val) && val.length > 0).withMessage('Size must be a non-empty array'),
  body('color')
    .custom(val => Array.isArray(val) && val.length > 0).withMessage('Color must be a non-empty array'),
  body('image')
    .custom(val => Array.isArray(val) && val.length > 0).withMessage('Image must be a non-empty array')
];

const updateProductRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Product name must be between 2 and 100 characters'),
  body('code')
    .optional()
    .trim()
    .notEmpty().withMessage('Product code cannot be empty'),
  body('description')
    .optional({ checkFalsy: true })
    .trim(),
  body('return')
    .optional()
    .isBoolean().withMessage('Return must be a boolean'),
  body('category')
    .optional()
    .custom(val => Array.isArray(val) && val.length > 0).withMessage('Category must be a non-empty array'),
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('quantity')
    .optional()
    .isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('size')
    .optional()
    .custom(val => Array.isArray(val) && val.length > 0).withMessage('Size must be a non-empty array'),
  body('color')
    .optional()
    .custom(val => Array.isArray(val) && val.length > 0).withMessage('Color must be a non-empty array'),
  body('image')
    .optional()
    .custom(val => Array.isArray(val) && val.length > 0).withMessage('Image must be a non-empty array')
];

const preprocessProductData = (req, res, next) => {
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map(file => file.s3Url || `/uploads/${file.filename}`);
    let existingImages = [];
    if (req.body.image) {
      try {
        existingImages = typeof req.body.image === 'string' ? JSON.parse(req.body.image) : req.body.image;
      } catch (e) {
        existingImages = Array.isArray(req.body.image) ? req.body.image : [req.body.image];
      }
    }
    req.body.image = [...existingImages, ...newImages];
  } else if (req.body.image && typeof req.body.image === 'string') {
    try {
      req.body.image = JSON.parse(req.body.image);
    } catch (e) {
      req.body.image = [req.body.image];
    }
  }

  ['category', 'size', 'color'].forEach(field => {
    if (typeof req.body[field] === 'string') {
      try {
        req.body[field] = JSON.parse(req.body[field]);
      } catch (e) {
        if (req.body[field].includes(',')) {
          req.body[field] = req.body[field].split(',').map(s => s.trim());
        } else {
          req.body[field] = [req.body[field]];
        }
      }
    }
  });
  next();
};

module.exports = {
  validateRegister: validate(registerRules),
  validateLogin: validate(loginRules),
  validateProfileUpdate: validate(profileUpdateRules),
  validatePasswordChange: validate(passwordChangeRules),
  validateCreateProduct: validate(createProductRules),
  validateUpdateProduct: validate(updateProductRules),
  preprocessProductData
};
