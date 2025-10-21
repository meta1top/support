export class AppError<T = unknown> extends Error {
  code: number;
  data: T | null;

  constructor(code: number, message: string, data: T | null = null) {
    super(message);
    this.code = code;
    this.data = data;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
