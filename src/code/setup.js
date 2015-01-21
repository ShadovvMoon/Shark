/*
 *
 * Copyright (c) 2015, Samuel Colbran <contact@samuco.net>
 * All rights reserved.
 *
 */

express = require('express');
app     = express();
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
