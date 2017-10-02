var express = require('express');
var path = require('path')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


app.use(express.static(path.join(__dirname, 'client')));
app.get('/', function(req, res){
res.sendFile(__dirname + '/index.html');
});

var online={};

io.on('connection', function(socket){
  var handshake=socket.handshake;
  online[handshake.query.login.toLowerCase()]=socket.id;
  io.emit('chat message', "user "+handshake.query.login.toLowerCase()+" connected");
  io.emit("online", Object.keys(online).toString());
  
  socket.on('is typing', function(msg){
    socket.broadcast.emit('is typing',msg);
  });
  
  socket.on('chat message', function(msg){
    socket.broadcast.emit('chat message',msg); // everyone gets it but the sender
  });
  socket.on('private chat',function(msg){
    io.to(online[msg.dst]).emit('private chat', msg.msg);
  });
  socket.on('disconnect', function(){
   delete online[handshake.query.login];
   io.emit("online", Object.keys(online).toString());
  });
});


http.listen(8080, function(){
  console.log('listening on *:3000');
});