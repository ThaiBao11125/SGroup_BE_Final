import { validationResult, body, param } from 'express-validator';
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

export const updateMemberStatusRules = [
  body("status")
    .notEmpty().withMessage("Vui lòng cung cấp trạng thái mới")
    .isIn(['ACTIVE', 'DROPPED', 'COMPLETED']).withMessage("Trạng thái chỉ được là ACTIVE, DROPPED, hoặc COMPLETED"),
];

export const createLessonRules = [
  body("title")
    .trim()
    .notEmpty().withMessage("Tiêu đề bài học không được để trống")
    .isLength({ min: 2, max: 255 }).withMessage("Tiêu đề bài học phải từ 2 đến 255 ký tự"),

  body("content")
    .optional()
    .trim(),

  body("order")
    .optional()
    .isInt({ min: 1 }).withMessage("Thứ tự bài học (order) phải là số nguyên dương (>= 1)"),
];

export const updateLessonRules = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 }).withMessage("Tiêu đề bài học phải từ 2 đến 255 ký tự"),

  body("content")
    .optional()
    .trim(),

  body("order")
    .optional()
    .isInt({ min: 1 }).withMessage("Thứ tự bài học (order) phải là số nguyên dương (>= 1)"),
];

export const createAssignmentRules = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID lớp học phải là số nguyên dương"),

  body("title")
    .trim()
    .notEmpty()
    .withMessage("Tiêu đề bài tập không được để trống")
    .bail()
    .isLength({ min: 2, max: 255 })
    .withMessage("Tiêu đề bài tập phải từ 2 đến 255 ký tự"),

  body("description")
    .optional()
    .trim(),

  body("deadline")
    .notEmpty()
    .withMessage("Hạn nộp không được để trống")
    .bail()
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage("Deadline phải đúng định dạng ISO 8601")
    .bail()
    .custom((value) => {
      return /(?:Z|[+-]\d{2}:\d{2})$/i.test(value);
    })
    .withMessage("Deadline bắt buộc phải có múi giờ, ví dụ +07:00 hoặc Z")
    .bail()
    .custom((value) => !Number.isNaN(Date.parse(value)))
    .withMessage("Deadline không phải ngày giờ hợp lệ"),

  body("maximumScore")
    .optional()
    .isFloat({ gt: 0, max: 999.99 })
    .withMessage("Điểm tối đa phải lớn hơn 0 và không vượt quá 999.99")
    .bail()
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Điểm tối đa chỉ được có tối đa 2 chữ số thập phân"),
];

export const classIdParamRules = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID lớp học phải là số nguyên dương"),
];

export const assignmentIdParamRules = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID bài tập phải là số nguyên dương"),
];

const UPDATE_ASSIGNMENT_FIELDS = ["title", "description", "deadline", "maximumScore"];

export const updateAssignmentRules = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID bài tập phải là số nguyên dương"),

  body()
    .custom((_, { req }) => {
      const b = req.body;
      if (!b || typeof b !== "object" || Array.isArray(b)) {
        throw new Error("Body không hợp lệ");
      }
      const keys = Object.keys(b);
      if (keys.length === 0) {
        throw new Error("Cần ít nhất một trường để cập nhật");
      }
      const invalid = keys.filter((k) => !UPDATE_ASSIGNMENT_FIELDS.includes(k));
      if (invalid.length > 0) {
        throw new Error(`Không được phép cập nhật các trường: ${invalid.join(", ")}`);
      }
      return true;
    }),

  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Tiêu đề bài tập không được để trống")
    .bail()
    .isLength({ min: 2, max: 255 })
    .withMessage("Tiêu đề bài tập phải từ 2 đến 255 ký tự"),

  body("description")
    .optional({ values: "null" })
    .isString()
    .withMessage("Mô tả phải là chuỗi hoặc null")
    .bail()
    .trim(),

  body("deadline")
    .optional()
    .notEmpty()
    .withMessage("Hạn nộp không được để trống")
    .bail()
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage("Deadline phải đúng định dạng ISO 8601")
    .bail()
    .custom((value) => /(?:Z|[+-]\d{2}:\d{2})$/i.test(value))
    .withMessage("Deadline bắt buộc phải có múi giờ, ví dụ +07:00 hoặc Z")
    .bail()
    .custom((value) => !Number.isNaN(Date.parse(value)))
    .withMessage("Deadline không phải ngày giờ hợp lệ"),

  body("maximumScore")
    .optional()
    .isFloat({ gt: 0, max: 999.99 })
    .withMessage("Điểm tối đa phải lớn hơn 0 và không vượt quá 999.99")
    .bail()
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Điểm tối đa chỉ được có tối đa 2 chữ số thập phân"),
];

export const createSubmissionRules = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID bài tập phải là số nguyên dương"),

  body("repositoryUrl")
    .trim()
    .notEmpty()
    .withMessage("URL repository không được để trống")
    .bail()
    .isURL()
    .withMessage("URL repository không đúng định dạng URL hợp lệ")
    .bail()
    .isLength({ max: 500 })
    .withMessage("URL repository không được vượt quá 500 ký tự"),

  body("content")
    .optional({ values: "null" })
    .isString()
    .withMessage("Nội dung nộp bài phải là chuỗi")
    .bail()
    .trim(),
];

export const submissionIdParamRules = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID bài nộp phải là số nguyên dương"),
];

export const reviewSubmissionRules = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID bài nộp phải là số nguyên dương"),

  body("score")
    .notEmpty()
    .withMessage("Vui lòng cung cấp điểm số")
    .bail()
    .isFloat({ min: 0, max: 999.99 })
    .withMessage("Điểm số phải là số lớn hơn hoặc bằng 0 và không vượt quá 999.99")
    .bail()
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Điểm số chỉ được có tối đa 2 chữ số thập phân"),

  body("feedback")
    .optional({ values: "null" })
    .isString()
    .withMessage("Nhận xét phải là chuỗi")
    .bail()
    .trim(),
];
