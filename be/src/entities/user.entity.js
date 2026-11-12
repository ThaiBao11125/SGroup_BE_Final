import { BaseEntity } from "./base.entity.js";

export const UserRole = Object.freeze({
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
});

export class User extends BaseEntity {
  constructor(row = {}) {
    super(row);
    this.role = row.role ?? UserRole.MEMBER;
  }

  toJSON() {
    const { password, ...publicFields } = this;
    return publicFields;
  }
}

export default User;
