import { BaseEntity } from "./base.entity.js";

export const SubmissionStatus = Object.freeze({
  SUBMITTED: "SUBMITTED",
  REVIEWED: "REVIEWED",
});

export class Submission extends BaseEntity {
  constructor(row = {}) {
    super(row);
    this.status = row.status ?? SubmissionStatus.SUBMITTED;
  }
}

export default Submission;
