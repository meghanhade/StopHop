(function () {
      
  var map = L.mapbox.map('map', 'meghan.ipb4b059', {
    gridLayer: {},
    gridControl: {
    sanitizer: function (x) { console.log(x); return x; }
    }
    })
    .setView([45.52282, -122.6766], 13);

  var pathLayer = new L.LayerGroup().addTo(map);
  var markerLayer = new L.LayerGroup().addTo(map);

  var markerCount = 1;
  var markerList = [];
  var markerDict = {};


  function addMarker() {
    if (markerCount <= 4) {
      var markerCountString = markerCount.toString();
      var newMarker = L.marker(new L.LatLng(45.515609, -122.682437), {
      icon: L.mapbox.marker.icon({'marker-color': 'CC0033', 'marker-symbol': markerCountString}),
      draggable: true
      }).addTo(markerLayer);
      markerDict[markerCount] = {"marker":newMarker};
      markerCount += 1;
      markerList.push(newMarker);
    } else {
      window.alert("Sorry, you've reached the maximum number of destinations (4).");
    }
  }

  function startOver(){
    console.log("start over!!");
    map.removeLayer(markerLayer);
    map.removeLayer(pathLayer);
    markerCount = 1;
    markerList = [];
    markerDict = {};
    markerLayer = new L.LayerGroup().addTo(map);
    pathLayer = new L.LayerGroup().addTo(map);
  }

  function routeManager () {
    pathLayer.clearLayers();
    var roundTrip = $("#roundTrip input").is(":checked");
    var leaveNow = $("#leaveNow input").is(":checked");
    // var delay2 = 30; //form response
    var delay2 = $("minuteDelay2").val();
    // var delay3 = 10;//form response
    var delay3 = $("minuteDelay3").val();
    // var delay4 = 10; //form response
    var delay4 = $("minuteDelay4").val();


    // CHANGE THESE DELAY INPUTS!

    markerDict[1]["delay"] = 0;
    markerDict[2]["delay"] = 5;
    markerDict[3]["delay"] = 60;
    markerDict[4]["delay"] = 120;
    // console.log("delay2: ", delay2, "delay3: ", delay3, "delay4: ", delay4);

    if (leaveNow === true) {
      inputTime = Date.now();
      // console.log("leave now input time: ", inputTime);
    } else {
       // var timeForm = $("input#dateTime").val();
       var origInputTime = $("input#dateTime").val();
       console.log("origInputTime: ",origInputTime);
       // var adjustedTime = origInputTime.setHours(origInputTime.getHours() - 8);
       parsedInputTime = Date.parse(origInputTime);
       var adjustment = 8 * 60 * 60 * 1000;
       inputTime = parsedInputTime + adjustment;
    }

    var dictLength = Object.keys(markerDict).length;
    
    if (roundTrip === true) {
      markerDict[5]=markerDict[1];
    } else {
      delete markerDict[5];
    }
    for (var i = 1; i < dictLength; i++) {
      var fromMarker = markerDict[i]["marker"];
      var toMarker = markerDict[i + 1]["marker"];
      var delayTime = markerDict[i]["delay"];
      // console.log("routeManager forloop delaytime: ",i,":", delayTime);
      route = findTheRoute(fromMarker, toMarker, inputTime, delayTime);
      draw_route(route);
      // TODO add spinner or force the UI/Page to draw
      //can I make data fetching asynchronous and then sort out start/end times afterwards? (and space out at minimum by delay time)
      endTime = route.endTime;
      // update for next input time
      inputTime = endTime + delayTime;
      // console.log("routeManager forloop endtime plus delaytime: ",i,":", inputTime);
      // console.log([fromMarker, toMarker, inputTime, delayTime]);
    }
  }

  function findTheRoute (fromMarker, toMarker, inputTime, delayTime) {
    routes = getRoutes(fromMarker, toMarker, inputTime, delayTime);
    route = findBestRoute(routes);
    return route;
  }

  function getRoutes (fromMarker, toMarker, inputTime, delayTime) {
    var url = generate_url(fromMarker, toMarker, inputTime, delayTime);
    var routesData;
    $.ajax({
      //spinner here? Cynthia thinks *maybe*
      url: url,
      dataType: 'json',
      async: false,
      data:"",
      success: function(data) {
        routesData = data;
      }
    });
    return routesData;
  }

  //inputTime is arrival time of last trip, delayTime is from form
  function generate_url(fromMarker, toMarker, inputTime, delayTime) {
    var pointA = fromMarker.getLatLng();
    var pointB = toMarker.getLatLng();
    if (delayTime === undefined){
      delayTime = 0;
    }
    // THIS COULD BE WHERE THE TIME FAILS
    var delay = parseInt(delayTime) * 60 * 1000;
    var delayedStart = delay + inputTime;
    var d = new Date(delayedStart);
    var year = d.getFullYear();
    //add one to month, as January is month 0:
    var month = d.getMonth()+1;
    var day = d.getDate();
    //arrivalTime hours are already adjusted for GMT:
    var hour = d.getHours();
    var min = d.getMinutes();

    url = "http://localhost:8080/otp/routers/default/plan?fromPlace="+pointA.lat+"%2C"+pointA.lng+"&toPlace="+pointB.lat+"%2C"+pointB.lng+"&mode=TRANSIT%2CWALK&maxWalkDistance=750&arriveBy=false&date="+year+"-"+month+"-"+day+"&time="+hour+":"+min;
    // console.log(url);
    return url;
  }

  function findBestRoute(routes) {
    return routes.plan.itineraries[0];
  }

  function draw_route (route) {
    var legs = route.legs;
    // console.log(route.legs[0].startTime);

    for(var i=0; i < legs.length; i++) {
      var leg = legs[i];
      var endTime = new Date(leg.endTime);
      var startTime = new Date(leg.startTime);
      var startHour = startTime.getHours();
      var startMin = startTime.getMinutes();
      var endHour = endTime.getHours();
      var endMin = endTime.getMinutes();
      // draw the polyline
      var route_line = new L.Polyline(polyline.decode(leg.legGeometry.points)).addTo(pathLayer);
      route_line.leg = leg;
      route_line.bindPopup("Mode: "+leg.mode+" ("+leg.routeShortName+") "+leg.routeLongName+". From: "+leg.from.name+". To: "+leg.to.name+". Depart at: "+startHour+":"+startMin+". Arrive by: "+endHour+":"+endMin);
    }
  }

  $(document).ready(function () {
    $(".ui-button_route").click(routeManager);
    $(".ui-button_marker").click(addMarker);
    $(".startOver").click(startOver);
    // $('.timepicker').timepicker();
    // $("#dateTime").val(new Date().toDateInputValue());​
    //$('.ui-button_route').click(get_routes);
  });
})();