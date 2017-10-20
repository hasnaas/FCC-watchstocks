
var socket;


$(document).ready(function(){

socket=io();

socket.on("current stocks",function(msg){
  var to=moment().format("YYYY-MM-DD");
  var from=moment().subtract(600, 'days').format("YYYY-MM-DD");
  
  //initialialize html containers and necessary variables
  $("#symbols").html('');
  var series=[];
  var total_length=msg.liste.length;
  
  var sequence=Promise.resolve();
  msg.liste.forEach(function(s){
  var url="https://www.quandl.com/api/v3/datasets/WIKI/"+s.trim()+".json?column_index=4&start_date="+from+"&end_date="+to+"&api_key=oBwdhiK9tZyxxDgNw5jJ";
  sequence=sequence.then(function(){
      return getJSON(url);
  }).then(function(response){
      $("#symbols").append('<div class="card"><div class="row"><div class="col-xs-10"><h4>'+s+' </h4></div><div class="col-xs-2  remove"><i class="fa fa-times center-block"></i></div></div><h5>'+response.dataset.name+'</h5></div>');   
       var data1=response.dataset.data.map(function(a){
       return [new Date(a[0]).getTime(),a[1]];
     });
     data1.reverse();
     var serie={name:s,data:data1,tooltip:{valueDecimals: 2}};
     series.push(serie);
     if(total_length==series.length)
      draw(series);
  }).catch(function(e){
      console.log(e);
  });


//the above code is better than the following one

/*
  $.ajax({
  url:url,
  method:'GET',
  success: function(response){
    //console.log(response);
     $("#symbols").append('<div class="card"><div class="row"><div class="col-xs-10"><h4>'+s+' </h4></div><div class="col-xs-2  remove"><i class="fa fa-times center-block"></i></div></div><h5>'+response.dataset.name+'</h5></div>');   
     // console.log(s+" : "+response.dataset.data);
     // console.log("current status "+global_data.length);
     var data1=response.dataset.data.map(function(a){
       return [new Date(a[0]).getTime(),a[1]];
     });
     data1.reverse();
     //console.log(data1[0]);
     var serie={name:s,data:data1,tooltip:{valueDecimals: 2}};
     series.push(serie);
     l++;
  },
  error: function(error){
    console.log(s+" : "+JSON.stringify(error));
    l++;
  }
  
  }).done(function(){
    if(total_length==l)
      draw(series);
    }
  );
  */
  
  
  });
});  

});


$("#addstock").submit(function(e){
  e.preventDefault();
  e.stopImmediatePropagation();
  var symbol=$("#addstock input").val().trim();
  
  //validate whether the symbol is a valid one
  var url="https://www.quandl.com/api/v3/datasets/WIKI/"+symbol+"/metadata.json?api_key=oBwdhiK9tZyxxDgNw5jJ";
  $.ajax({
    url:url,
    method:'GET',
    success :function(response){
     $("#addstock p").html("");
    socket.emit("add stock",symbol);
    }
    ,
    error: function(error){
     console.log(error);
      $("#addstock p").html("invalid ticker");  
    }
  });
  
 
});



//becase these divs were dynamically added
$("#symbols").on("click",".remove",function(e){
  var symbol=$(this).siblings('div').children('h4').html();
  socket.emit("delete stock",symbol);
});

function getURL(url){
    return fetch(url);
}

function getJSON(url){
    return getURL(url).then(function(response){
        return response.json();
    });
}

//examples from https://www.highcharts.com/stock/demo/styled-scrollbar
//http://jsfiddle.net/gh/get/jquery/1.7.2/highslide-software/highcharts.com/tree/master/samples/stock/demo/basic-line/
//http://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/stock/demo/compare/
function draw(data){
  
 // $.getJSON('https://www.highcharts.com/samples/data/jsonp.php?filename=aapl-c.json&callback=?', function (data) {
    // Create the chart
    Highcharts.stockChart('graphe', {


        rangeSelector: {
            selected: 5
        },

        title: {
            text: 'Stocks'
        },

        series: data
    });
//});

}