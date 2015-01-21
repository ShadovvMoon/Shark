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
function setup() {
    setupPassport();
    setupDatabase();
}
module.exports.setup = setup;