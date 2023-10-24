function tokenToString(t) {
  return `${t.access_token.substring(0, 8)}… (expires ${new Date(t.expires).toUTCString()})`;
}

function isEqual(obj1, obj2) {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

function validateEnvironmentVariables(vars, pattern, logger) {
  vars.forEach((environmentVariable) => {
    const value = process.env[environmentVariable];

    if (!value) {
      logger.error('Required environment variable not set: %s', environmentVariable);
      process.exit(1);
    } else if (!pattern.test(value)) {
      logger.warn('Unexpected format of environment variable: %s', environmentVariable);
    } else {
      logger.debug('Validated format of environment variable: %s', environmentVariable);
    }
  });
}

export {
  tokenToString,
  isEqual,
  validateEnvironmentVariables,
};
