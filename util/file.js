const fs = require('fs');
const path = require('path');

const deleteFile = (filePath) => {
    cFilePath = path.join(__dirname, '..' , filePath);
    fs.unlink(cFilePath, (err) => {
        if (err) {
            throw (err);
        }
    });
}

exports.deleteFile = deleteFile;