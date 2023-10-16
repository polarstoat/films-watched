function tokenToString(t) {
  return `${t.access_token.substring(0, 8)}… (expires ${new Date(t.expires).toUTCString()})`;
}

function isEqual(obj1, obj2) {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

export {
  tokenToString,
  isEqual,
};
