/*
 *
 * Copyright (c) 2015, Samuel Colbran <contact@samuco.net>
 * All rights reserved.
 *
 */

var ejs = require('ejs');
var serverPlugins = [require('../plugins/scripts.js'),
					 require('../plugins/edit.js')];

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
        var compiled = ejs.compile(html, { filename: path.join(process.cwd(), path.join(config.ejsPath, "file.ejs"))});
        html = compiled(options);
        res.send(html);
    } catch (err) {
        console.error(err);
    }
}
module.exports.render = render;

function appSimulator() {
	var simulator = this;
	simulator._static = path.join(process.cwd() , config.publicPath);
	simulator._routes = {};
	simulator.route = function(name) {
		if (name.indexOf("/") != 0) {
			name = "/" + name;
		}

		console.log("Route " + name);
		function routeSimulator(name) {
			var route = this;
			this.get = function(callback) { //callback(req, res, next)
				route._get = callback;
				return route;
			}
			this.post = function(callback) { //callback(req, res, next)
				route._post = callback;
				return route;
			}
		}

		var route = new routeSimulator(name);
		simulator._routes[name] = route;
		return route;
	};

	simulator.app = function (req, res) {
		// Decode the URL into a route and query (ty stackoverflow)
		// Find the first ?
		var url = req.url;
		var n = url.indexOf("?");
		if (n != -1) {

			// Extract the query
			var match,
	        pl     = /\+/g,  // Regex for replacing addition symbol with a space
	        search = /([^&=]+)=?([^&]*)/g,
	        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
	        query  = req.url.substring(n+1);
	
		    urlParams = {};
		    while (match = search.exec(query))
		       urlParams[decode(match[1])] = decode(match[2]);
	
			req.query = urlParams;
	
			// Extract the name
			url = url.substring(0,n);
		} else {
			req.query = {};
		}

		// send simulator
		res.send = function(data) {
			// Write response data
			res.write(data, 'utf-8');

			// Finish the response
			res.end();
		};

		// Receive the body
		var body = "";
		function respond(status) {
			res.writeHead(status, { "Content-Type": "text/plain" });
			res.end(body);
		}
		function success() {
			req.body = body;
			//console.log("BODY " + req.body);

			// Find the route
			var route = undefined;
			if (url in simulator._routes) {
				route = simulator._routes[url];
			}
	
			// Ship to the appropriate method
			if (typeof route !== 'undefined') {
				if (req.method == "GET") {3
					route._get(req, res, function next() { //TODO: Check if get method exists
						console.log("Next GET");
					});
				} else if (req.method == "POST") { //TODO: Check if post method exists
					route._post(req, res, function next() {
						console.log("Next POST");
					});
				}
			} else {
		
				// Is this a static file?
				var file = path.join(simulator._static, req.url);
	
				function error(err) {
					console.log("An error occured at " + req.url + " " + err);
					res.writeHead(403, {'Content-Type': 'text/html'});
					res.end();
				}
	
				//TODO: make sure file is inside public directory
				fs.realpath(simulator._static, function(err, a) {
					if (err) {return error(err);}
					fs.realpath(file, function(err, b) {
						if (err) {return error(err);}
						var b_in_a = b.indexOf(a) == 0;
						if (b_in_a) {
							fs.exists(file, function(exists) {
								if (exists) {
									fs.readFile(file, function (err, file) {
					                    if (err) return next(err);
					                    res.send(file);
					                });
								} else {
									console.log("Missing file " + req.url);
									res.writeHead(404, {'Content-Type': 'text/html'});
									res.end();
								}
							});
						} else {
							console.log("Invalid permissions for file " + req.url);
							res.writeHead(403, {'Content-Type': 'text/html'});
							res.end();
						}
					});
				});
			}
		}
		function addListeners() {
			req.on("data", function(data) {
				body += data.toString();
			});
			req.on("end", function() {
				success();
			});
			setTimeout(function() {
				respond && respond(500);
			}, 1000);
		}
		addListeners();
	};
}
var simulator = new appSimulator();

/**
 *
 * @param callback
 */
function setupPlugins(callback) {
    // NEXE does not support dynamic requirement
 function nextPlugin(i, serverPlugins, callback) {
    if (i >= serverPlugins.length) {
        return callback();
    }

       var plugin = serverPlugins[i];
       plugin(module.exports, simulator, function (err) {
           if (err) {
               return callback(err);
           }
           return nextPlugin(i + 1, serverPlugins, callback);
       });
}
nextPlugin(0, serverPlugins, callback);
}

/**
 *
 * @param callback
 */
function configure(callback) {

	// Load plugins
	console.log("Loading plugins...");
	setupPlugins(callback);
}

/**
 *
 * @param callback
 */
function start(port, callback) {
	var server = http.createServer(simulator.app);

	// now that proxy is running
	server.listen(port, '127.0.0.1', function() {
		console.log("Listening");
		callback();
	});
}

module.exports.configure = configure;
module.exports.start     = start;
