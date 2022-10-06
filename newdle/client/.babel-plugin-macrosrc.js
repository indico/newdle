const {execSync} = require('child_process');

try {
  const urlMap = JSON.parse(execSync('flask url_map_to_json'));

  module.exports = {
    flaskURLs: {
      urlMap,
    },
  };
} catch (ex) {
  let exitCode = 1;

  // ex.status is only present when the command passed to execSync fails, hence we need
  // to make sure we don't pass undefined to process.exit since it is pretty much the same
  // as process.exit(0)
  if (ex.status !== undefined) {
    exitCode = ex.status;
  }

  // exit with non-zero code to prevent confusing changes in *.po files
  process.exit(exitCode);
}
