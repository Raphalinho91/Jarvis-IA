export function redactSensitiveInfo(
  env: Record<string, any>
): Record<string, any> {
  const redactedEnv = { ...env };
  if (redactedEnv.DATABASE_CONNECTION) {
    redactedEnv.DATABASE_CONNECTION = "[SUPABASE]";
  }
  if (redactedEnv.MONGODB_CONNECTION) {
    redactedEnv.MONGODB_CONNECTION = "[MONGODB]";
  }
  return redactedEnv;
}
