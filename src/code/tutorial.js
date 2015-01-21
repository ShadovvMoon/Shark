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
