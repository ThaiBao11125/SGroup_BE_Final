import { BaseEntity } from "./base.entity.js";

export class Assignment extends BaseEntity {
  constructor(row = {}) {
    super(row);
    this.maximum_score = row.maximum_score ?? 10.0;
  }
}

export default Assignment;
