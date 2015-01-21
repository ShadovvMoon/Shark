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
ejs     = require('ejs');

/**
 *
 * @param req
 * @param res
 * @param html
 * @param options
 */
function render(req, res, html, options) {
    try {
        options = (typeof options !== 'undefined') ? options : {};
        var compiled = ejs.compile(html, { filename: path.join(process.cwd(), './server/file.ejs')});
        html = compiled(options);
        res.send(html);
    } catch (err) {
        console.error(err);
    }
}
module.exports.render = render;

/**
 *
 * @param callback
 */
function setupPlugins(callback) {
    var pluginDir = "./server/";
    fs.readdir(pluginDir, function(err, files) {
        if (err) {
            return console.error(err);
        }

        function nextPlugin(i, files, callback) {
            if (i >= files.length) {
                return callback();
            }

            // What type of file is this?
            if (path.extname(files[i]) == '.js') { // Plugin

                var plugin = require(pluginDir + files[i]);
                plugin(module.exports, app, function (err) {
                    if (err) {
                        return callback(err);
                    }
                    return nextPlugin(i + 1, files, callback);
                });
            } else {
                return nextPlugin(i + 1, files, callback);
            }

            /*
             } else if (path.extname(files[i]) == '.ejs') { // HTML

             console.log("Added route " + '/' + path.basename(files[i]));
             app.route('/' + path.basename(files[i])).get(function (req, res) {
             fs.readFile(pluginDir + files[i], 'utf-8', function (err, html) {
             return render(req, res, html, req.query);
             });
             });
             return nextPlugin(i + 1, files, callback);

             } else {
             */
        }
        nextPlugin(0, files, callback);
    });
}

// Middleware
var methodOverride = require('method-override');
var bodyParser     = require('body-parser')

/**
 *
 * @param callback
 */
function configure(callback) {

    // Start the express server
    app.set('port', config.port);
    app.use(express.static(path.join(process.cwd() , './server/public')));

    // Load middleware
    app.use(methodOverride());
	if (!config.skipAuth) {
		var exsess = 'express-session';
    	app.use(require(exsess)({ resave: true,
        	saveUninitialized: true,
        	secret: 'uwotm8' }));
	}

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // Passport middleware
	if (!config.skipAuth) {
    	app.use(passport.initialize());
   	 	app.use(passport.session());
	}

    // Load plugins
    setupPlugins(function(err) {
        if (err) {
            return callback(err);
        }
        // Complete!
        callback();
    });
}

/**
 *
 * @param callback
 */
function start(callback) {
    http.createServer(app).listen(app.get('port'), function () {
        console.log("Express server listening on port " + app.get('port'));
        callback();
    });
}

module.exports.configure = configure;
module.exports.start     = start;
