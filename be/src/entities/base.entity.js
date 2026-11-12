export class BaseEntity {
  constructor(row = {}) {
    Object.assign(this, row);
  }

  static fromRow(row) {
    if (!row) return null;
    return new this(row);
  }

  static fromRows(rows = []) {
    return rows.map((row) => this.fromRow(row));
  }

  toJSON() {
    return { ...this };
  }
}

export default BaseEntity;
