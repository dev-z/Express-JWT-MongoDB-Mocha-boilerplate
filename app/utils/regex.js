module.exports = (function regexUtil() {
  const matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;
  /**
   * @desc A string may contain regex characters which need to be escaped before
   *       storing the values to DB. This fn does that.
   * https://github.com/sindresorhus/escape-string-regexp/blob/master/index.js
   * @param {String} str The string to be escaped
   * @returns {String}
   */
  function escapeRegExp(str) {
    return str.replace(matchOperatorsRe, '\\$&');
  }

  /**
   * @desc Checks if a string contains malicious regex characters.
   * Regex can be used to execute a NoSQL injection attack.
   * This fn can be used to verify user input.
   * https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
   * @param {String} str The string to be checked
   * @returns {Boolean}
   */
  function checkRegExpCharsExist(str) {
    return matchOperatorsRe.test(str);
  }

  return {
    escapeRegExp,
    checkRegExpCharsExist,
  };
}());
