/*
 *
 * Copyright (c) 2015, Samuel Colbran <contact@samuco.net>
 * All rights reserved.
 *
 */

fs      = require('fs');
path    = require('path');
unzip   = require('unzip'); //disable for nexe

/**
 *
 * @param file
 */
function parseUpload(file, callback) {
    console.log("Parsing " + file);
    fs.createReadStream(file).pipe(unzip.Extract({ path: config.markingDirectory})).on('close', function(err) {
        if (err) {
            return callback(err);
        }

        fs.unlink(file, callback);
    });
}

/**
 * Look for any uploaded zip files and deal with them appropriately
 */
function parseUploads(callback) {
    fs.readdir(config.uploadDirectory, function(err, files) {
        if (err) {
            return console.error(err);
        }

        function nextUpload(i, files, callback) {
            if (i >= files.length) {
                return callback();
            }

            // Have we found a zip file?
            if (path.extname(files[i]) == '.zip') {
                parseUpload(path.join(config.uploadDirectory, files[i]), function(i,callback) {
                    return function(err) {
                        if (err) {
                            return callback(err);
                        }
                        return nextUpload(i + 1, files, callback);
                    }
                }(i, callback));
            } else {
                return nextUpload(i + 1, files, callback);
            }
        }
        nextUpload(0, files, callback);
    });
}


// Export the setup function
module.exports.refresh = parseUploads;
