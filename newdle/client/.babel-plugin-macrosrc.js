const {execSync} = require('child_process');

const urlMap = JSON.parse(execSync('flask url_map_to_json'));

module.exports = {
  flaskURLs: {
    urlMap,
  },
};
