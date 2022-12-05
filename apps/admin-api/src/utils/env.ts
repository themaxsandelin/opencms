export function validateEnvVars(vars: { [index: string]: string }) {
  const requiredVars = [
    'DATABASE_URL',
    'UPLOAD_DIR',
    'AUTH_CLIENT_ID',
    'AUTH_CLIENT_SECRET',
    'AUTH_TENANT_ID'
  ];
  for (let i = 0; i < requiredVars.length; i++) {
    if (!vars[requiredVars[i]]) {
      throw new Error(`You have to define the env variable ${requiredVars[i]}`);
    }
  }
}
