/*
 *
 * Copyright (c) 2015, Samuel Colbran <contact@samuco.net>
 * All rights reserved.
 *
 */

var db_module = module.exports;

//Internal variables.
db_module._root_database = require('../mods/ministore/ministore.js')('db');
db_module._databases = {};

/**
 * Adds a database to the _databases dictionary
 * @param database - the name of the database to load
 * @private
 */
db_module._load_db = function (database) {
    if (!(database in db_module._databases)) {
        db_module._databases[database] = db_module._root_database(database);
    }
};

/**
 * Saves a database
 * @param database - the name of the database to save
 * @private
 */
db_module._save_db = function (database, callback) {
    if (typeof db_module._databases[database] !== 'undefined')
    {
        console.log("Saving " + database);
        db_module._databases[database].save(callback);
    }
};

/**
 * Returns the value for the specific key
 * @param database - the database
 * @param key - the key to get the value from
 * @param callback - an optional asyncronous callback
 * @returns {*} - the value stored against the key
 */
db_module.valueForKey = function (database, key, callback) {
    db_module._load_db(database);
    if (typeof db_module._databases[database] !== 'undefined')
	{
		if (typeof callback !== 'undefined')
		{
			db_module._databases[database].get(key, function(callback){
				return function(obj){
					var copied = JSON.parse(JSON.stringify(obj));
					callback(copied);
				};
			}(callback));
		}
		else
		{
			var obj = db_module._databases[database].get(key);
			if (typeof obj !== 'undefined')
				return JSON.parse(JSON.stringify(obj));
			return undefined;
		}
	}
        return db_module._databases[database].get(key, callback);
    if (typeof callback !== 'undefined')
        callback(undefined);
    return undefined;
};

/**
 * Returns the keys for a database
 * @param database - the database
 * @returns [] - list of keys
 */
db_module.getKeys = function (database)
{
    db_module._load_db(database);
    if (typeof db_module._databases[database] !== 'undefined')
        return db_module._databases[database].list();
    return [];
}

/**
 * Associates a value with a key in a database.
 * @param database - the database
 * @param key - the key to associate the value with
 * @param value - the value
 * @param callback - an optional asyncronous callback
 */
db_module.setValueForKey = function (database, key, value, callback) {
    db_module._load_db(database);
    if (typeof db_module._databases[database] !== 'undefined')
    {
        console.log("Setting " + key + " to " + value + " in " + database);
        db_module._databases[database].set(key, value);
        db_module._save_db(callback);
    }
    if (typeof callback !== 'undefined')
        callback(false);
    return false;
};

/**
 * Deletes the value associated with a particular key
 * @param database - the database
 * @param key - the key to associate the value with
 * @param callback - an optional asyncronous callback
 * @returns {*}
 */
db_module.removeValueForKey = function(database, key, callback)
{
    db_module._load_db(database);
    if (typeof db_module._databases[database] !== 'undefined')
    {
        console.log("Deleting " + key + " from " + database);
        db_module._databases[database].remove(key, callback);
        return db_module._save_db(callback);
    }
    console.log("Cannot remove value for " + key + " because " + database + " is not loaded.");
    if (typeof callback !== 'undefined')
        callback(false);
    return false;
}

