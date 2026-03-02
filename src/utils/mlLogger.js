const isDevelopment = process.env.NODE_ENV !== "production";

const safeMeta = (meta) => {
  if (!meta || typeof meta !== "object") return undefined;
  return meta;
};

const log = (level, message, meta) => {
  if (!isDevelopment) return;
  const payload = safeMeta(meta);
  const fn = console[level] || console.log;
  if (payload) {
    fn(`[ML] ${message}`, payload);
    return;
  }
  fn(`[ML] ${message}`);
};

module.exports = {
  debug: (message, meta) => log("debug", message, meta),
  info: (message, meta) => log("info", message, meta),
  warn: (message, meta) => log("warn", message, meta),
  error: (message, meta) => log("error", message, meta)
};
