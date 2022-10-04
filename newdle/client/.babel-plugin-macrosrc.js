const {execSync} = require('child_process');

try {
  const urlMap = JSON.parse(execSync('flask url_map_to_json'));

  module.exports = {
    flaskURLs: {
      urlMap,
    },
  };
} catch (ex) {
  // exit with non-zero code to prevent confusing changes in *.po files
  process.exit(ex.status);
}
