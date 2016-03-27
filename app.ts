/// <reference path="./typings/tsd.d.ts" />

import express = require("express");
import socket_io = require("socket.io");
var io = socket_io();
var redis = require('socket.io-redis');
io.adapter(redis({ host: 'localhost', port: 6379 }));

import path = require("path")
var app = express();
app.set('port',process.env.PORT||3000)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public'), { maxAge: 86400000 }));

app.get("/", function(req, res) {
    res.render("index.ejs");
})

var server = app.listen(app.get("port"), function() {
    console.log("server listen in ",app.get("port"))
})

var users={};
io.listen(server,{'pingInterval': 10,})
var numUsers = 0;
io.on("connection", function(socket: any) {
    var addedUser = false;

    // when the client emits 'new message', this listens and executes
    socket.on('new message', function(data) {
        // we tell the client to execute 'new message'
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: data
        });
        console.log(process.env.PORT,socket.username,":",data);
    });

    // when the client emits 'add user', this listens and executes
    socket.on('add user', function(username) {
        if (addedUser) return;
        if(users[username]){
            console.log("断开",username,socket.id,"连接");
            users[username].disconnect();
        }
        users[username]=socket;
        // we store the username in the socket session for this client
        socket.username = username;
        ++numUsers;
        addedUser = true;
        socket.emit('login', {
            numUsers: numUsers
        });
        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers
        });
    });

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', function() {
        socket.broadcast.emit('typing', {
            username: socket.username
        });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', function() {
        socket.broadcast.emit('stop typing', {
            username: socket.username
        });
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function() {
        if (addedUser) {
            --numUsers;

            // echo globally that this client has left
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });

})

