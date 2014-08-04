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
  var markerDict = {};

  function addMarker() {
    if (markerCount <= 4) {
      var markerCountString = markerCount.toString();
        var newMarker = L.marker(new L.LatLng(45.515609, -122.682437), {
        icon: L.mapbox.marker.icon({'marker-color': 'B830A8', 'marker-symbol': markerCountString,}),
        draggable: true
      }).addTo(markerLayer);
      markerDict[markerCount] = {"marker":newMarker};
      markerCount += 1;
    } else {
      window.alert("Sorry, you've reached the maximum number of destinations (4).");
    }
  }

  function startOver(){
    console.log("start over!!");
    map.removeLayer(markerLayer);
    map.removeLayer(pathLayer);
    markerCount = 1;
    markerDict = {};
    markerLayer = new L.LayerGroup().addTo(map);
    pathLayer = new L.LayerGroup().addTo(map);
  }

  function routeManager () {
    pathLayer.clearLayers();
    var roundTrip = $("#roundTrip input").is(":checked");
    var leaveNow = $("#leaveNow input").is(":checked");
    var delay2 = $("#delayTime2").val();
    var delay3 = $("#delayTime3").val();
    var delay4 = $("#delayTime4").val();

    markerDict[1]["delay"] = 0;
   
    if (typeof (markerDict[2]) !== 'undefined'){
      markerDict[2]["delay"] = delay2;
    } else {
      console.log("undefined check: ", markerDict[2]["delay"]);
    }
    if (typeof (markerDict[3]) !== 'undefined'){
      markerDict[3]["delay"] = delay3;
    }
    if (typeof (markerDict[4]) !== 'undefined'){
      markerDict[4]["delay"] = delay4;
    }
    console.log("delay2: ", delay2, "delay3: ", delay3, "delay4: ", delay4);

    if (leaveNow === true) {
      inputTime = Date.now();
    } else {
       var origInputTime = $("input#dateTime").val();
       parsedInputTime = Date.parse(origInputTime);
       var adjustment = 8 * 60 * 60 * 1000;
       inputTime = parsedInputTime + adjustment;
    }

    var dictLength = Object.keys(markerDict).length;
    
    if (roundTrip === true) {
      // markerDict[Object.keys(markerDict)[Object.keys(markerDict).length - 1]]=markerDict[1];
      console.log(dictLength);
      console.log(markerDict[dictLength]);
      markerDict[dictLength]=markerDict[1];

    } else {
      delete markerDict[dictLength];
    }
    for (var i = 1; i < dictLength; i++) {
      var fromMarker = markerDict[i]["marker"];
      var toMarker = markerDict[i + 1]["marker"];
      var delayTime = markerDict[i]["delay"];
      // console.log("routeManager forloop delaytime: ",i,":", delayTime);
      route = findTheRoute(fromMarker, toMarker, inputTime, delayTime);
      draw_route(route);
      // TODO add spinner or force the UI/Page to draw
      endTime = route.endTime;
      // update for next input time
      inputTime = endTime + delayTime;
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
      console.log("drawing route number ", i);
      var leg = legs[i];
      var endTime = new Date(leg.endTime);
      var startTime = new Date(leg.startTime);
      var startHour = startTime.getHours();
      var startMin = startTime.getMinutes();
      var endHour = endTime.getHours();
      var endMin = endTime.getMinutes();
      // draw the polyline
      //add style to L.polyline(options(style (is an object w/ stroke color, weight)))
      var route_line = new L.Polyline(polyline.decode(leg.legGeometry.points)).addTo(pathLayer);
      route_line.leg = leg;
      route_line.bindPopup("Mode: "+leg.mode+" ("+leg.routeShortName+") "+leg.routeLongName+". From: "+leg.from.name+". To: "+leg.to.name+". Depart at: "+startHour+":"+startMin+". Arrive by: "+endHour+":"+endMin);
      console.log("drew route ", i);
    }
  }

  $(document).ready(function () {
    $(".ui-button_route").click(routeManager);
    $(".ui-button_marker").click(addMarker);
    $(".startOver").click(startOver);
    // $('.timepicker').timepicker();
    // $("#dateTime").val(new Date().toDateInputValue());​
  });
})();