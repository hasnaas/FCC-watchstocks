
var socket;


$(document).ready(function(){

socket=io();

socket.on("current stocks",function(msg){
  var to=moment().format("YYYY-MM-DD");
  var from=moment().subtract(600, 'days').format("YYYY-MM-DD");
  
  //initialialize html containers and necessary variables
  $("#symbols").html('');
  $("svg").empty();
  var global_data=[];
  var stocks=[];
  var total_length=msg.liste.length+1;
  
  
  msg.liste.forEach(function(s){
 // var url="https://www.quandl.com/api/v3/datasets/WIKI/"+s.trim()+".json?column_index=4&start_date="+from+"&end_date="+to+"&collapse=monthly&api_key=oBwdhiK9tZyxxDgNw5jJ";
  var url="https://www.quandl.com/api/v3/datasets/WIKI/"+s.trim()+".json?column_index=4&start_date="+from+"&end_date="+to+"&api_key=oBwdhiK9tZyxxDgNw5jJ";

  $.ajax({
  url:url,
  method:'GET',
  success: function(response){
    //console.log(response);
     $("#symbols").append('<div class="card"><div class="row"><div class="col-xs-10"><h4>'+s+' </h4></div><div class="col-xs-2  remove"><i class="fa fa-times center-block"></i></div></div><h5>'+response.dataset.name+'</h5></div>');   
      //console.log(s+" : "+response.dataset.data);
     // console.log("current status "+global_data.length);
     
      if (global_data.length==0){
          global_data=response.dataset.data.map(function(a){
          var row={};
          row["date"]=a[0];
          row[s]=a[1];
          return row;
          },s);
          
          var val1=response.dataset.data.map(function(a){
            return {date:a[0],close:a[1]}
          });
          
          stocks.push({id:s,values:val1});
        }
      else{
        var val1=response.dataset.data.map(function(a){
            return {date:a[0],close:a[1]}
          });
        stocks.push({id:s,values:val1});
          
        var d=response.dataset.data;
        for(var i=0;i<global_data.length;i++){
          if(global_data[i]["date"]==d[i][0]){
            global_data[i][s]=d[i][1];  
            }
          else{
        //later, exclude yahoo for the moment
            }
        }
    
    }
   
   
  },
  error: function(error){
    console.log(error);
  }
  
  }).done(function(){
    
    if(Object.keys(global_data[0]).length==total_length){
      //console.log(stocks[0]);
      draw(global_data,stocks);
    }
  });
  
  
  
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




function draw(data,stocks){
  //see also http://blog.scottlogic.com/2015/07/08/yahoo-finance-chart.html

//time formats https://github.com/d3/d3-time-format#locale_format
var parseTime = d3.timeParse("%Y-%m-%d");

data.forEach(function(d){
    d.date=parseTime(d.date);
});
stocks.forEach(function(s){
  s.values.forEach(function(v){
    v.date=parseTime(v.date);
  })
})
//alert(JSON.stringify(data[0]));


var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
  /*
    var x = d3.scaleTime()
    .rangeRound([0, width]);

    var y = d3.scaleLinear()
    .rangeRound([height, 0]);
    */
  var x = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory10);
    
  var line = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.close); });
    
  
  
  x.domain(d3.extent(data, function(d) { return d.date; }));
  y.domain([
    d3.min(stocks, function(c) { return d3.min(c.values, function(d) { return d.close; }); }),
    d3.max(stocks, function(c) { return d3.max(c.values, function(d) { return d.close; }); })
  ]);
  
  z.domain(stocks.map(function(c) { return c.id; }));
  
  g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));
  
  g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y))
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("fill", "#000")
      .text("Price, $");
  
  var stock = g.selectAll(".stock")
    .data(stocks)
    .enter().append("g")
      .attr("class", "stock");
  
  stock.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return z(d.id); });
  
  stock.append("text")
      .datum(function(d) { return {id: d.id, value: d.values[0]}; })
      .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.close) + ")"; })
      .attr("x", 3)
      .attr("dy", "0.35em")
      .style("font", "10px sans-serif")
      .text(function(d) { return d.id; })  
}
