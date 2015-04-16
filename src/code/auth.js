/*
 *
 * Copyright (c) 2015, Samuel Colbran <contact@samuco.net>
 * All rights reserved.
 *
 */

passport      = require("passport");
LocalStrategy = require('passport-local').Strategy;
database      = require('./plist');
crypto        = require('crypto');
bcrypt        = require('bcrypt-nodejs');

/**
 * Checks whether a request is authenticated. If not, automatically redirect to the login page and return false.
 * @param req - the client request
 * @param res - the client response
 * @returns {boolean} true if authenticated.
 */
function user_authenticated(req, res) {
    if (req.user) return true;
    res.redirect('/login');
    return false;
}

/**
 *
 * @param username
 * @param password
 */
function addUser(username, password) {
    bcrypt.hash(password, null, null, function(err, hash) {
        database.setValueForKey("users", username, {
            hash: hash
        }, undefined);
    });
}

/**
 *
 * @param username
 * @param hash
 * @param callback
 */
function verifyUser(username, hash, callback) {
    database.valueForKey("users", username, function(value){
        bcrypt.compare(value.hash, hash, function(err, res) {
            callback(err, res);
        });
    })
}

/**
 *
 */
function setupDatabase() {
    if (database.getKeys('users').indexOf('admin') == -1) {
        addUser("admin", "password");
    }
}

/**
 *
 */
function setupPassport() {

    //Passport
    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (obj, done) {
        done(null, obj);
    });

    // Local strategy
    passport.use(new LocalStrategy
    (
        function (username, password, done) {
            var selected_user = database.valueForKey("users", username, undefined);
            if (selected_user) {
                bcrypt.compare(password, selected_user.hash, function(err, res) {
                    if (err) {
                        return console.error(err);
                    }

                    if (res) {
                        return done(null, {username: username, hash: selected_user.hash});
                    } else {
                        return done(null, false, { message: 'Incorrect password.' });
                    }
                });
            }
            else
                return done(null, false, { message: 'Incorrect username.' });
        }
    ));
}

/**
 *
 */

//TODO: Make Asyncronous
function setupNoAuth() {
	if (config.skipAuth) { // Figure out the user based on folders in the marking directory
		fs.readdir(config.markingDirectory, function(err, files) {
        	if (err) {
        	    return console.error(err);
        	}
			
			var i = 0;
			for (i = 0; i < files.length; i++) {
				if (fs.statSync(path.join(config.markingDirectory, files[i])).isDirectory()) {
					config.skipUser = files[i];
					return;
				}
			}
		});
	}
}

/**
 *
 */
function setup() {
    setupPassport();
    setupDatabase();
	setupNoAuth();
}
module.exports.setupNoAuth = setupNoAuth;
module.exports.setup = setup;