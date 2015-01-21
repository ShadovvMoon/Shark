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

fs = require('fs');
config = require('../../config.js');
passport = require('passport');

module.exports = function(server, app, callback) {
    app.route('/edit').get(function (req, res, next) {
		if (!req.user && !config.skipAuth) {
			return res.redirect('/login');
		}

		// GET
        var script = req.query['script'];
		var prac   = req.query['prac'];
		var file   = path.join(config.markingDirectory,
            (config.skipAuth?config.skipUser:req.user.username), prac, script);
        var savejson = path.join(config.markingDirectory, (config.skipAuth?config.skipUser:req.user.username),
            prac, path.basename(script, '.py')+".json");

        // Read the json file
        fs.readFile(config.criteriaPath, 'utf-8', function (err, json_data) {
            var criteria = JSON.parse(json_data);

            // Read the script file and then render the marker
            fs.readFile(file, 'utf-8', function (err, script_data) {
                if (err) return next(err);

                function render(json) {
                    fs.readFile(path.join(config.ejsPath, "edit.ejs"), 'utf-8', function (err, html) {
                        if (err) return next(err);
                        return server.render(req, res, html, {
                            global_user: (config.skipAuth?config.skipUser:req.user.username),
                            global_script: {
                                source: script_data
                            },
                            global_criteria: criteria,
                            global_savefile: json,
                            global_query: req.query
                        });
                    });
                }

                // Read the save json (if it exists)
                console.log(savejson);
                fs.exists(savejson, function(exists) {
                   if (exists) {
                       fs.readFile(savejson, 'utf-8', function (err, json) {
                           if (err) return next(err);
                           render(JSON.parse(json));
                       });
                   } else {
                       render();
                   }
                });
            });
        });
    }).post(function (req, res, next) {
        if (!req.user && !config.skipAuth) {
            return res.redirect('/login');
        }

        // POST
        var json     = req.body;
        var code     = json['code'];
        var criteria = json['criteria'];
        var script   = json['script'];
        var prac     = json['prac'];

        // Save the new file
        var file = path.join(config.markingDirectory, (config.skipAuth?config.skipUser:req.user.username), prac, script);
        fs.writeFile(file, code, function(err) {
            if (err) {
                console.error(err);
                return res.send(JSON.stringify({
                    success: false,
                    err: err
                }));
            }

            // Save the criteria file
            var file = path.join(config.markingDirectory, (config.skipAuth?config.skipUser:req.user.username), prac, path.basename(script, '.py')+".json");
            fs.writeFile(file, JSON.stringify(criteria), function(err) {
                if (err) {
                    console.error(err);
                    return res.send(JSON.stringify({
                        success: false,
                        err: err
                    }));
                }

                res.send(JSON.stringify({success: true}));
            });
        });
    });
	callback();
}