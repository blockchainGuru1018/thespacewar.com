const watcher = {
  lastFnCall: 0,
};

module.exports = function (fn, timeoutInMilliseconds) {
  const now = Date.now();
  if (now - watcher.lastFnCall >= timeoutInMilliseconds) {
    watcher.lastFnCall = now;
    fn();
  }
};
