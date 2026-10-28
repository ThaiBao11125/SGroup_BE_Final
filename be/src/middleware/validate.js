import { validationResult, body } from 'express-validator';
import { BadRequestError } from '../core/error.response.js';

export const validate = (rules) => {
    return async (req, res, next) => {
        for (const rule of rules) {
            await rule.run(req);
        }

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        const formattedErrors = errors.array().map((err) => ({
            field: err.path,
            message: err.msg,
        }));

        const error = new BadRequestError('Validation failed');
        error.errors = formattedErrors;
        return next(error);
    };
};

export const registerRules = [
  body("name")
    .trim()
    .notEmpty().withMessage("Tên không được để trống")
    .isLength({ min: 2, max: 50 }).withMessage("Tên phải từ 2 đến 50 ký tự"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email không được để trống")
    .isEmail().withMessage("Email không đúng định dạng")
    .normalizeEmail(),

  body("password")
    .trim()
    .notEmpty().withMessage("Mật khẩu không được để trống")
    .isLength({ min: 6 }).withMessage("Mật khẩu phải có tối thiểu 6 ký tự"),

  body("age")
    .optional()
    .isInt({ min: 1, max: 120 }).withMessage("Tuổi phải là số nguyên từ 1 đến 120"),
];

export const loginRules = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email không được để trống")
    .isEmail().withMessage("Email không đúng định dạng")
    .normalizeEmail(),

  body("password")
    .trim()
    .notEmpty().withMessage("Mật khẩu không được để trống"),
];

export const createClassRules = [
  body("name")
    .trim()
    .notEmpty().withMessage("Tên lớp học không được để trống")
    .isLength({ min: 2, max: 150 }).withMessage("Tên lớp học phải từ 2 đến 150 ký tự"),

  body("description")
    .optional()
    .trim(),

  body("startDate")
    .optional({ values: "falsy" })
    .isISO8601().withMessage("Ngày bắt đầu phải đúng định dạng YYYY-MM-DD"),

  body("endDate")
    .optional({ values: "falsy" })
    .isISO8601().withMessage("Ngày kết thúc phải đúng định dạng YYYY-MM-DD")
    .custom((endDate, { req }) => {
      if (req.body.startDate && endDate && new Date(endDate) < new Date(req.body.startDate)) {
        throw new Error("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu");
      }
      return true;
    }),

  body("mentorId")
    .notEmpty().withMessage("Vui lòng chỉ định Mentor cho lớp học")
    .isInt({ min: 1 }).withMessage("mentorId phải là số nguyên dương"),
];

export const updateClassRules = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 }).withMessage("Tên lớp học phải từ 2 đến 150 ký tự"),

  body("description")
    .optional()
    .trim(),

  body("startDate")
    .optional({ values: "falsy" })
    .isISO8601().withMessage("Ngày bắt đầu phải đúng định dạng YYYY-MM-DD"),

  body("endDate")
    .optional({ values: "falsy" })
    .isISO8601().withMessage("Ngày kết thúc phải đúng định dạng YYYY-MM-DD")
    .custom((endDate, { req }) => {
      if (req.body.startDate && endDate && new Date(endDate) < new Date(req.body.startDate)) {
        throw new Error("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu");
      }
      return true;
    }),

  body("mentorId")
    .optional()
    .isInt({ min: 1 }).withMessage("mentorId phải là số nguyên dương"),
];

export const addMemberRules = [
  body("memberId")
    .notEmpty().withMessage("Vui lòng cung cấp memberId")
    .isInt({ min: 1 }).withMessage("memberId phải là số nguyên dương"),
];
