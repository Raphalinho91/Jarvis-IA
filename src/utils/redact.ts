export function redactSensitiveInfo(
  env: Record<string, any>
): Record<string, any> {
  const redactedEnv = { ...env };
  if (redactedEnv.DATABASE_CONNECTION) {
    redactedEnv.DATABASE_CONNECTION = "[Redacted]";
  }
  if (redactedEnv.DATABASE_CONNECTION_2) {
    redactedEnv.DATABASE_CONNECTION_2 = "[Redacted]";
  }
  return redactedEnv;
}
