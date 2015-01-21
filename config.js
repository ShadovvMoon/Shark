/*
 *
 * Copyright (c) 2015, Samuel Colbran <contact@samuco.net>
 * All rights reserved.
 *
 */

var config = {}

//---------------------------
// General
//---------------------------
// Express
config.port = 3000;

//---------------------------
// Shark
//---------------------------
// Authentication
config.skipAuth = true;
config.skipUser = "admin";

// Directory locations
config.pythonDirectory   = "../python";
config.uploadDirectory   = config.pythonDirectory + "/upload";
config.downloadDirectory = config.pythonDirectory + "/download";
config.markingDirectory  = config.pythonDirectory + "/marking";

//---------------------------
// MyPyTutor
//---------------------------
// Directory locations
config.tuteDirectory   = "../MyPyTutor/CSSE1001Tutorials";
config.tuteConfig      = config.tuteDirectory + "/tutorials.txt";
config.saveDirectory   = "../MyPyTutor/CSSE1001Solutions";
config.tmpDirectory    = "../MyPyTutor/tmp";
config.tmpScript       = "script.py";
config.tutorLib        = "../MyPyTutor/code";
config.tutorLaunch 	   = "MyPyTutor.py";

// Express
config.socketPort = 3333;
//---------------------------

module.exports = config;