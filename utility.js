function tokenToString(t) {
  return `${t.access_token.substring(0, 8)}… (expires ${new Date(t.expires).toUTCString()})`;
}

export {
  // eslint-disable-next-line import/prefer-default-export
  tokenToString,
};
