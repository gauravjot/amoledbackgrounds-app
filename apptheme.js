const {withAndroidStyles} = require("expo/config-plugins");

function withCustomAppTheme(config) {
  return withAndroidStyles(config, config => {
    let modified = false;
    const styles = config.modResults;
    styles.resources.style.map(style => {
      if (style.$.name === "AppTheme") {
        if (!modified) {
          style.$.parent = "Theme.AppCompat.NoActionBar";
          modified = true;
        } else {
          styles.resources.style.splice(styles.resources.style.indexOf(style), 1);
        }
      }
    });
    return config;
  });
}
module.exports = withCustomAppTheme;
