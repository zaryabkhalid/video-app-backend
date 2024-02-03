class ApiError extends Error {
  constructor(statusCode, message = "Something went wrong", stack = "") {
    super(message);

    Object.setPrototypeOf(this, new.target.prototype);

    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.status = statusCode >= 400 && statusCode < 500 ? "Fail" : "Error";
    this.isOperational = true;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
