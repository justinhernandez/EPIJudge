const fs = require('fs');
const os = require('os');
const path = require('path');
let tempFilePath = false;

// generate random string
function randomString(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// temp file creator helper
function tempFile(data = '') {
  return new Promise((resolve, reject) => {
    // generate random name
    const name = randomString(16) + '.js';
    // if temp path hasn't been set then set it
    if (!tempFilePath) {
      tempFilePath = path.join(os.tmpdir(), 'tmp-epi-judge');
    }
    fs.mkdtemp(tempFilePath, (err, folder) => {
      if (err) return reject(err);

      const file_name = path.join(folder, name);

      fs.writeFile(file_name, data, 'utf8', (error_file) => {
        if (error_file) return reject(error_file);

        resolve(file_name);
      });
    });
  });
}

module.exports = {
  randomString,
  tempFile,
};
