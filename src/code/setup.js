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

express = require('express');
app     = express();
config  = require('../config');
fs      = require('fs');
path    = require('path');

/**
 *
 * @param directory
 * @param callback
 */
function setupDirectory(directory, callback) {
    fs.exists(directory, function(exists) {
        // If the directory already exists, then we don't need to make a new one
        if (exists) {
            return callback();
        }

        fs.mkdir(directory, function (err) {
            callback(err);
        });
    });
}

/**
 *
 * @param callback
 */
function setup(callback) {
    /*setupDirectory(config.exportDirectory, function(err) {
     if (err) {
     return callback(err);
     }*/
    setupDirectory(config.pythonDirectory, function (err) {
        if (err) {
            return callback(err);
        }
        setupDirectory(config.uploadDirectory, function (err) {
            if (err) {
                return callback(err);
            }
            /*
             setupDirectory(config.downloadDirectory, function (err) {
             if (err) {
             return callback(err);
             }*/
            setupDirectory(config.markingDirectory, function (err) {
                callback(err);
            });
            //});
        });
    });
    //});
}

// Export the setup function
module.exports = setup;
