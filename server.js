var express = require('express');
var path = require('path')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


app.use(express.static(path.join(__dirname, 'client')));
app.get('/', function(req, res){
res.sendFile(__dirname + '/index.html');
});
//to be updated realtime upon client sockets emits
var SYMBOLS = { liste:['AAPL','FB','VZ']
};
 
io.on('connection', function(socket){
 
  io.emit('current stocks',SYMBOLS);
  
  socket.on('add stock',function(msg){
    
    if(SYMBOLS.liste.indexOf(msg.trim())<0){
      SYMBOLS.liste.push(msg);
       io.emit('current stocks',SYMBOLS);
    }  
  });
  
  socket.on('delete stock',function(msg){
    var index=SYMBOLS.liste.indexOf(msg.trim());
    SYMBOLS.liste.splice(index,1);
    io.emit('current stocks',SYMBOLS);
  });
  
 
  
});
http.listen(process.env.PORT|| 8080, function(){
  console.log('listening on *:3000');
});