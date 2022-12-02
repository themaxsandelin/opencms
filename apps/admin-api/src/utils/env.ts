export function validateEnvVars(vars: { [index: string]: string }) {
  const requiredVars = [
    'NX_DATABASE_URL',
    'NX_UPLOAD_DIR',
    'NX_AUTH_CLIENT_ID',
    'NX_AUTH_CLIENT_SECRET',
    'NX_AUTH_TENANT_ID'
  ];
  for (let i = 0; i < requiredVars.length; i++) {
    if (!vars[requiredVars[i]]) {
      throw new Error(`You have to define the env variable ${requiredVars[i]}`);
    }
  }
}
