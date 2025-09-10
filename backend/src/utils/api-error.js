class ApiError extends Error {
  constructure(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructure);
    }
  }
}
export { ApiError };