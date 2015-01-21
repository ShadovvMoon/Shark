/*
 * Copyright (c) 2015, Samuel Colbran <contact@samuco.net>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 
 * Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 
 * Redistributions in binary form must reproduce the above copyright notice, this
 * list of conditions and the following disclaimer in the documentation and/or
 * other materials provided with the distribution.
 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

config  = require('../config');
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
