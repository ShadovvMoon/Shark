/*
 *
 * Copyright (c) 2015, Samuel Colbran <contact@samuco.net>
 * All rights reserved.
 *
 */

config  = require('../config');
fs      = require('fs');
path    = require('path');

function parseTutorials(callback) {
    fs.readFile(config.tuteConfig, 'utf-8', function (err, tute_data) {
        var output = [];
        var current_week = undefined;
        function add() {
            if (typeof current_week !== 'undefined') {
                output.push(current_week);
            }
            current_week = undefined
        }

        var lines = tute_data.split("\n");
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (line.trim() == "") continue;
            if (line.indexOf("[") == 0) { // New category
                add();

                // Compute the line name
                current_week = {
                    name:  /\[(.*)\]/.exec(line)[1],
                    tutorials: []
                };
            } else { // Tutorial
                if (typeof current_week !== 'undefined') {
                    var elements = line.split(":");
                    if (elements.length != 2) {
                        continue;
                    }
                    current_week.tutorials.push({
                        name: elements[0],
                        file: elements[1]
                    });
                }
            }
        }
        add();
        callback(output);
    });
}

// Export the setup function
module.exports.parseTutorials = parseTutorials;
