export default {
  isEnabled,
};

function isEnabled(featureName) {
  const isEnabled = localStorage.getItem("ft-" + featureName);
  return isEnabled === "true";
}
