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
config    = require('../../config.js');
path      = require('path');

var PythonShell = require('python-shell');
module.exports = function(server, app, callback) {

    // Set up the web socket
	var WebSocketServer = require('ws').Server;
	var wss = new WebSocketServer({port: config.socketPort});

	console.log("Opening socket on port " + config.socketPort);
	wss.on('connection', function(ws) {

        // Python experiment
        var mainDir = path.dirname(require.main.filename);
        var p = require('child_process').spawn('python3', ['-u', '-i', path.join(mainDir, config.tmpDirectory, config.tmpScript)], {
            stdio: [
                'pipe',
                'pipe',
                'pipe'
            ],
            cwd: path.join(mainDir, config.tmpDirectory)
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
	});


	app.route('/python').post(function (req, res, next) {

		// Run a python script
        var code_path = path.join(config.tmpDirectory, config.tmpScript); // passthrough is unsafe
        var json_string = req.body;
        var code = json_string['code'];

        // Write the code to a file
        fs.writeFile(code_path, code, function (err) {
            if (err) throw err;
            return res.send("true");

            // Run the code
            /*
            var mainDir = path.dirname(require.main.filename);
            var tempDir = path.join(mainDir, config.tmpDirectory);

            var options = {
                mode: 'text',
                pythonPath: "python3",
                pythonOptions: ['-u'],
                scriptPath: tempDir,
                args: []
            };

            PythonShell.run(config.tmpScript, options, function (err, results) {
                if (err) return res.send(err);
                return res.send(JSON.parse(results));
            });
            */
        });
    });



	callback();
}