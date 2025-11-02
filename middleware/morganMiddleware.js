import morgan from "morgan";
import chalk from "chalk";
import util from "util";

// --- Middleware to capture response body ---
export const captureResponseBody = (req, res, next) => {
  const oldSend = res.send;
  res.send = function (body) {
    // Store response body for later use
    res.locals.body = body;
    return oldSend.call(this, body);
  };
  next();
};

// --- Custom morgan tokens ---
morgan.token("body", (req) => {
  if (!req.body || Object.keys(req.body).length === 0) return "{}";
  return util.inspect(req.body, { colors: true, depth: null });
});

morgan.token("query", (req) => {
  if (!req.query || Object.keys(req.query).length === 0) return "{}";
  return util.inspect(req.query, { colors: true, depth: null });
});

morgan.token("headers", (req) =>
  util.inspect(req.headers, { colors: true, depth: 1 }),
);

morgan.token("res-body", (req, res) => {
  if (!res.locals.body) return "{}";
  // pretty-print JSON if possible
  try {
    const parsed = JSON.parse(res.locals.body);
    return util.inspect(parsed, { colors: true, depth: null });
  } catch {
    return String(res.locals.body);
  }
});

// --- Custom format ---
const devFormat = (tokens, req, res) => {
  return [
    chalk.bold.cyan("\n====== HTTP REQUEST ======"),
    chalk.yellow(`${tokens.method(req, res)} ${tokens.url(req, res)}`),
    chalk.green(`Status: ${tokens.status(req, res)}`),
    chalk.magenta(`Response Time: ${tokens["response-time"](req, res)} ms`),
    chalk.gray(`\nHeaders: ${tokens.headers(req, res)}`),
    chalk.blue(`\nQuery: ${tokens.query(req, res)}`),
    chalk.white(`\nBody: ${tokens.body(req, res)}`),
    // chalk.bold.green(`\nResponse: ${tokens["res-body"](req, res)}`),
    chalk.bold.cyan("\n==========================\n"),
  ].join(" ");
};

// --- Export ready-to-use middleware ---
export const morganMiddleware = morgan(devFormat);
