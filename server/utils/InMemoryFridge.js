module.exports = function () {
  let data = null;

  return {
    putIn,
    takeOutAll,
  };

  function putIn(newData) {
    data = newData;
  }

  function takeOutAll() {
    return data;
  }
};
