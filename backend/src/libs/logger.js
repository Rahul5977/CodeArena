import pino from "pino";
import pinoHttp from "pino-http";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const isDev = process.env.NODE_ENV !== "production";

// Never let secrets leak into logs — strip auth headers and cookies from
// both the request and the response.
const redact = {
  paths: [
    "req.headers.authorization",
    "req.headers.cookie",
    'req.headers["set-cookie"]',
    'res.headers["set-cookie"]',
  ],
  censor: "[redacted]",
};

// Pretty logs are nice locally but pull in an extra dep. Use pino-pretty only
// in development *and* only when it's actually installed; otherwise fall back
// to plain JSON so the app never crashes on a missing optional dependency.
function resolveTransport() {
  if (!isDev) return undefined;
  try {
    require.resolve("pino-pretty");
    return {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:HH:MM:ss",
        ignore: "pid,hostname",
      },
    };
  } catch {
    return undefined;
  }
}

const transport = resolveTransport();

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? "debug" : "info"),
  redact,
  ...(transport ? { transport } : {}),
});

// Request-logging middleware. Shares the same logger (and its redaction), and
// keeps the per-request line compact and severity-aware.
export const httpLogger = pinoHttp({
  logger,
  customLogLevel(req, res, err) {
    if (err || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  customSuccessMessage(req, res) {
    return `${req.method} ${req.originalUrl || req.url} ${res.statusCode}`;
  },
  customErrorMessage(req, res, err) {
    return `${req.method} ${req.originalUrl || req.url} ${res.statusCode} - ${err.message}`;
  },
});

export default logger;
