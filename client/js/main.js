   var nickname="guest";
     var socket;
     
     $(function () {
    
     $('#login_form').modal("show");
  
     
    $('#go').click(function(e){
      nickname=$("#nickname").val()==""?"guest":$("#nickname").val();
      $('#login_form').modal('hide');
      
      socket = io({
         query:{
          login:nickname
         }
       });
       if(socket!==undefined){
            socket.on("online",function(msg){
                $("#b_online").html('<ul id="online"></ul> </div>');
                msg.split(',').forEach(function(u){
                $("#online").append("<li><p> "+u+" </p></li>");           
           })
         });
         
    socket.on('is typing',function(msg){
    $("#status").html(msg);
    });
    socket.on('chat message', function(msg){
      $('#messages').append($('<li>').text(msg));
     $('#b_chat').animate({
        scrollTop: $("#messages li").last().offset().top
    },
        'slow');
        
    });  
    socket.on('private chat',function(msg){
        $('#messages').append($('<li>').text(msg));
       $('#b_chat').animate({
        scrollTop: $("#messages li").last().offset().top
    },
        'slow');
    });
       }
       
     });
     
  
    $('#m').keypress(function(){
      socket.emit('is typing',nickname + " is typing...");
    });
    
    $("#m").focusout(function(){
      socket.emit('is typing',"");
    });
    
    
    $('form').submit(function(){
      var message=$('#m').val();
      $('#messages').append($('<li>').text(nickname+" : "+message));
      if(new RegExp("^@").test(message)){
          var destination=message.split(' ')[0].substring(1).toLowerCase();
          socket.emit("private chat",{dst:destination,msg:nickname+" : "+message.substring(destination.length+1)});
      }
      else if(message=="!clear"){
          $("#b_chat").html('<ul id="messages"></ul> </div>'); 
      }
      else{
      socket.emit('chat message', nickname+" : "+message);    
      }
      
      $('#m').val('');
      return false;
    });
    
    
    
  });