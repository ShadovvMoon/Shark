/*
 *
 * Copyright (c) 2015, Samuel Colbran <contact@samuco.net>
 * All rights reserved.
 *
 */

config  = require('../config.js');
path    = require('path');
http    = require('http');
fs      = require('fs');
server  = require('./server');

// Loading
console.log("Shark is... alive!");

// Configure the server
console.log("Configuring server...");
server.configure(function(err) {
    if (err) {
        return console.error(err);
    }

	var port = 3000;
    console.log("Starting server...");
    server.start(port, function() {
		require("openurl").open("http://localhost:3000/");
    });
});