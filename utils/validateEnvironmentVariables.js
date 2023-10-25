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

export default validateEnvironmentVariables;
