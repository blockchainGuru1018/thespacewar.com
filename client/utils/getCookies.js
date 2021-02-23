function getCookie(name) {
  var dc, prefix, begin, end;
  dc = document.cookie;
  prefix = name + "=";
  begin = dc.indexOf("; " + prefix);
  end = dc.length;
  if (begin !== -1) {
    begin += 2;
  } else {
    begin = dc.indexOf(prefix);
    if (begin === -1 || begin !== 0) return null;
  }

  if (dc.indexOf(";", begin) !== -1) {
    end = dc.indexOf(";", begin);
  }

  return dc.substring(begin + prefix.length, end);
}
module.exports = getCookie;
