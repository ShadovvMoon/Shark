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
passport = require('passport');

/**
 *
 * @param server
 * @param app
 * @param callback
 */
module.exports = function(server, app, callback) {

    // Load the criteria file
    fs.readFile(config.criteriaPath, 'utf-8', function (err, json_data) {
        var criteria = JSON.parse(json_data);

        // Setup the scripts express page
        app.route('/import').get(function (req, res, next) {
            if (!req.user && !config.skipAuth) {
                return res.redirect('/login');
            }

            // GET
            fs.readFile(path.join(config.ejsPath, "import.ejs"), 'utf-8', function (err, html) {
                if (err) {
                    return next(err);
                }

                return server.render(req, res, html, {
                    global_user: (config.skipAuth?config.skipUser:req.user.username),
                    global_query: req.query
                });

            });
        });
        callback();
    });
}