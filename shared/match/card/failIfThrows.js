module.exports = function failIfThrows(fn) {
  try {
    fn();
  } catch (e) {
    return false;
  }
  return true;
};
