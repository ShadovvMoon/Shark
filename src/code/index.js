/*
 *
 * Copyright (c) 2015, Samuel Colbran <contact@samuco.net>
 * All rights reserved.
 *
 */

config  = require('../config.js');
unzip   = require('unzip'); //disable for nexe
fs      = require('fs');
path    = require('path');
http    = require('http');

setup   = require('./setup');
uploads = require('./uploads'); // constants issue?
server  = require('./server');
auth    = require('./auth');

setup(function(err) {
    if (err) {
        return console.error(err);
    }

    // Parse the uploads directory
    console.log("Refreshing uploads...");
    uploads.refresh(function(err) {
        if (err) {
            return console.error(err);
        }
        console.log("Refresh complete");
    });

    // Configure authentication
    auth.setup();

    // Configure the express server
    console.log("Configuring server...");
    server.configure(function(err) {
        if (err) {
            return console.error(err);
        }

        console.log("Starting server...");
        server.start(function() {

        });
    });
});
