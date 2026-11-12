import { BaseEntity } from "./base.entity.js";

export class Lesson extends BaseEntity {
  constructor(row = {}) {
    super(row);
    this.order = row.order ?? 1;
  }
}

export default Lesson;
