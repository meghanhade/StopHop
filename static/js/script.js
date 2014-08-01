(function () {
      
  var map = L.mapbox.map('map', 'meghan.ipb4b059', {
    gridLayer: {},
    gridControl: {
    sanitizer: function (x) { console.log(x); return x; }
    }
    })
    .setView([45.52282, -122.6766], 13);

  var pathLayer = new L.LayerGroup().addTo(map);

  var markerCount = 1;
  var markerList = [];
  var markerDict = {};

  function addMarker() {
    if (markerCount <= 4) {
      var markerCountString = markerCount.toString();
      var newMarker = L.marker(new L.LatLng(45.515609, -122.682437), {
      icon: L.mapbox.marker.icon({'marker-color': 'CC0033', 'marker-symbol': markerCountString}),
      draggable: true
      }).addTo(map);
      markerDict[markerCount] = {"marker":newMarker};
      console.log(markerDict);
      markerCount += 1;
      markerList.push(newMarker);
    } else {
      window.alert("Sorry, you've reached the maximum number of destinations (4).");
    }
  }

  //inputTime is arrival time of last trip, delayTime is from form
  function generic_generate_url(fromMarker, toMarker, inputTime, delayTime) {
    var pointA = fromMarker.getLatLng();
    var pointB = toMarker.getLatLng();
    delayTime = 0;
    // if (delayTime === undefined){
    //   delayTime = 0;
    // }
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

  function routeManager () {
    pathLayer.clearLayers();
    var roundTrip = $("#roundTrip input").is(":checked");
    var leaveNow = $("#leaveNow input").is(":checked");
    var delay2 = 10; //form response
    var delay3 = 10;
    var delay4 = 10; //form response
    var inputTime = $("input#dateTime").val();
    console.log(inputTime);
    markerDict[1]["delay"] = 0;
    markerDict[2]["delay"] = delay2;
    markerDict[3]["delay"] = delay3;
    if (leaveNow === true) {
      console.log("Leave now!");
      var inputTime = Date.now();
      console.log(inputTime);
    } else {
      console.log("Leave later");
      console.log(inputTime);
    }
    var dictLength = Object.keys(markerDict).length;
    console.log(markerDict);
    if (roundTrip === true) {
      console.log("ROUNDTRIP!!");
      markerDict[5]=markerDict[1];
    } else {
      console.log("Not roundtrip");
      delete markerDict[5];
    }
    for (var i = 1; i < dictLength; i++) {
      var fromMarker = markerDict[i]["marker"];
      var toMarker = markerDict[i + 1]["marker"];
      var delayTime = markerDict[i]["delay"];
      route = findTheRoute(fromMarker, toMarker, inputTime, delayTime);
      draw_route(route);
      // TODO add spinner or force the UI/Page to draw
      //can I make data fecthing asynchronous and then sort out start/end times afterwards? (and space out at minimum by delay time)
      endTime = route.endTime;
      // update for next input time
      inputTime = endTime + delayTime;
      console.log([fromMarker, toMarker, inputTime, delayTime]);
    }
  }

  function getRoutes (fromMarker, toMarker, inputTime, delayTime) {
    var url = generic_generate_url(fromMarker, toMarker, inputTime, delayTime);
    var routesData;
    $.ajax({
      //spinner here?
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

  function findBestRoute(routes) {
    // TODO actually find best route
    return routes.plan.itineraries[0];
  }

  function findTheRoute (fromMarker, toMarker, inputTime, delayTime) {
    routes = getRoutes(fromMarker, toMarker, inputTime, delayTime);
    route = findBestRoute(routes);
    return route;
  }

  function draw_route (route) {
    var legs = route.legs;
    console.log(route.legs[0].startTime);

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
    // $('.timepicker').timepicker();
    // $("#dateTime").val(new Date().toDateInputValue());​
    //$('.ui-button_route').click(get_routes);
  });

  $(document).ready(function () {
    
  });

})();