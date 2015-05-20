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


fs        = require('fs');
ncp       = require('ncp').ncp;
ncp.limit = 16;
config    = require('../../config.js');
path      = require('path');
util      = require('../code/util.js');

module.exports = function(server, app, callback) {

    // Set up the web socket
	var WebSocketServer = require('ws').Server;
	var wss = new WebSocketServer({port: config.socketPort});

	console.log("Opening socket on port " + config.socketPort);
	wss.on('connection', function(ws) {

        // Python experiment
        var mainDir = path.dirname(require.main.filename);
        var windows = process.platform === "win32" || process.platform === "win64";

        var foundScript = function(python) {
            var cd = path.join(mainDir, config.tmpDirectory);
            var relpython = path.relative(cd, python);
            var p = require('child_process').spawn(relpython, ['-u', '-i', path.join(mainDir, config.tmpDirectory, config.tmpScript)], {
                stdio: [
                    'pipe',
                    'pipe',
                    'pipe'
                ],

                // cwd needs to be modified to a relative path (so python.exe is relative to this path)
                cwd: cd
            });
            p.stdin.setEncoding('utf8');
            p.stdout.setEncoding('utf8');
            p.stderr.setEncoding('utf8');
            p.stdout.on('data', function(message) {
                ws.send(message);
            });
            p.stderr.on('data', function(message) {
                ws.send(message);
            });

            ws.on('message', function(message) {
                p.stdin.write(message);
            });
            ws.on('close', function close() {
                p.stdin.destroy();
                p.stdout.destroy();
                p.stderr.destroy();
                p.kill();
                ws.close();
            });
        };

        // Search the paths until an executable is found
        util.asyncLoop(config.pythonPaths.length, function(loop) {
            var path = config.pythonPaths[loop.iteration()];
            fs.exists(path, function(exists) {
                if (exists) {
                    return foundScript(path);
                }
                loop.next();
            });
        }, function() {
            ws.send("Python 3 was not found on your system.\n");
            ws.send("Please add an install path to config.js");
            ws.close();
        });
	});


	app.route('/python').post(function (req, res, next) {

        // Remove the temporary directory
        var deleteFolderRecursive = function(path) {
            if( fs.existsSync(path) ) {
                fs.readdirSync(path).forEach(function(file,index) {
                    var curPath = path + "/" + file;
                    if(fs.statSync(curPath).isDirectory()) { // recurse
                        deleteFolderRecursive(curPath);
                    } else { // delete file
                        fs.unlinkSync(curPath);
                    }
                });
                fs.rmdirSync(path);
            }
        };
        deleteFolderRecursive(config.tmpDirectory);

        // Re-create the temporary directory
        ncp(config.supportPath, config.tmpDirectory, function (err) {
            if (err) {
                return console.error(err);
            }

            // Run a python script
            var code_path = path.join(config.tmpDirectory, config.tmpScript); // passthrough is unsafe
            var json_string = req.body;
            var code = json_string['code'];

            // Write the code to a file
            fs.writeFile(code_path, code, function (err) {
                if (err) throw err;
                return res.send("true");
            });
        });
    });



	callback();
}