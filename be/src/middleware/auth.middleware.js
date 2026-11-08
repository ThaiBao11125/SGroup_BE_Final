import { UnauthorizedError, ForbiddenError } from "../core/error.response.js";
import { verifyToken, isTokenBlacklisted } from "../utils/jwt.helper.js";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Bạn chưa đăng nhập! Vui lòng cung cấp token hợp lệ.");
  }

  const token = authHeader.split(" ")[1];

  if (isTokenBlacklisted(token)) {
    throw new UnauthorizedError("Token đã bị vô hiệu hóa do đã đăng xuất, vui lòng đăng nhập lại!");
  }

  try {
    const decoded = verifyToken(token);

    req.user = decoded;
    req.token = token;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new UnauthorizedError("Token của bạn đã hết hạn, vui lòng đăng nhập lại!");
    }
    throw new UnauthorizedError("Token không hợp lệ hoặc đã bị chỉnh sửa trái phép!");
  }
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError("Bạn không có quyền thực hiện hành động này!");
    }
    next();
  };
};
