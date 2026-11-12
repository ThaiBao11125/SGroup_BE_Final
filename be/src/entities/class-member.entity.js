import { BaseEntity } from "./base.entity.js";

export const ClassMemberStatus = Object.freeze({
  ACTIVE: "ACTIVE",
  DROPPED: "DROPPED",
  COMPLETED: "COMPLETED",
});

export class ClassMember extends BaseEntity {
  constructor(row = {}) {
    super(row);
    this.status = row.status ?? ClassMemberStatus.ACTIVE;
  }
}

export default ClassMember;
