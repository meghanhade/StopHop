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

  function disableButton() {
    $(".ui-button_marker").addClass("disabled");
  }

  function addMarker() {
    if (markerCount <= 3) {
      var markerCountString = markerCount.toString();
        var newMarker = L.marker(new L.LatLng(45.515609, -122.682437), {
        icon: L.mapbox.marker.icon({'marker-color': 'B830A8', 'marker-symbol': markerCountString,}),
        draggable: true
      }).addTo(markerLayer);
      markerDict[markerCount] = {"marker":newMarker};
      markerCount += 1;
    } else if (markerCount == 4) {
      var markerCountString = markerCount.toString();
      var newMarker = L.marker(new L.LatLng(45.515609, -122.682437), {
        icon: L.mapbox.marker.icon({'marker-color': 'B830A8', 'marker-symbol': markerCountString,}),
        draggable: true
      }).addTo(markerLayer);
      markerDict[markerCount] = {"marker":newMarker};
      markerCount += 1;
      disableButton();
    }
  }

  function startOver(){
    // console.log("start over!!");
    map.removeLayer(markerLayer);
    map.removeLayer(pathLayer);
    $(".ui-button_marker").removeClass("disabled");
    markerCount = 1;
    markerDict = {};
    markerLayer = new L.LayerGroup().addTo(map);
    pathLayer = new L.LayerGroup().addTo(map);
    map.setView([45.52282, -122.6766], 13);
  }

  function routeManager () {
    //manage loader
    pathLayer.clearLayers();
    var roundTrip = $("#roundTrip input").is(":checked");
    var leaveNow = $("#leaveNow input").is(":checked");
    var delay2 = $("#delayTime2").val();
    var delay3 = $("#delayTime3").val();
    var delay4 = $("#delayTime4").val();

    var delays = {1:0, 2:delay2, 3:delay3, 4:delay4};
    // console.log("delays: ", delays);

    // console.log("delay2: ", delay2, "delay3: ", delay3, "delay4: ", delay4);

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
      // console.log(markerDict[dictLength]);
      // console.log('dict length in roundtrip', Object.keys(markerDict).length);
      markerDict[dictLength+1]=markerDict[1];
      // console.log('dict length in roundtrip', Object.keys(markerDict).length);
      dictLength = Object.keys(markerDict).length;
    }

    // console.log("markerDict: ", markerDict);
    // console.log("dictLength: ",dictLength);
    for (var i = 1; i < dictLength; i++) {
      console.log("i: ", i);
      var fromMarker = markerDict[i]["marker"];
      var toMarker = markerDict[i + 1]["marker"];
      var delayTime;
      // console.log("typeof delays: ", typeof (delays[i]));
      delayTime = 0;
      if (!delays[i]){
        delayTime = 0;
        // console.log("delayTime/if: ", delayTime);
      } else {
        delayTime = parseInt(delays[i]);
        // console.log("delayTime/else: ", delayTime);
      }
      // console.log("fromMarker: ,", fromMarker, "toMarker: ", toMarker, "inputTime: ", inputTime, "delayTime: ", delayTime);
      route = findTheRoute(fromMarker, toMarker, inputTime, delayTime);
      draw_route(route);
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
    //
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
    // console.log("routes: ",routes);
    return routes.plan.itineraries[0];
  }

  function draw_route (route) {
    var legs = route.legs;
    // var modeBus =;
    // var modeWalk =;
    // var modeRail =;
    // var color2
    // console.log(route.legs[0].startTime);

    //manage removing loader class//

    for(var i=0; i < legs.length; i++) {
      var color;
      var leg = legs[i];
      var endTime = new Date(leg.endTime);
      var startTime = new Date(leg.startTime);
      var startHour = startTime.getHours();
      var startMin = startTime.getMinutes();
      if (startMin < 10) {
        startMin = ("0" + startTime.getMinutes()).slice(-2);
      }
      var endHour = endTime.getHours();
      var endMin = endTime.getMinutes();
      var polyline_options;
      if (leg.mode === "WALK") {
        polyline_options = {
        color:'#39C9BB',
        opacity: .8
        };
      } else if (leg.mode === "TRAM"){
        polyline_options = {
        color: '#9BCb68',
        opacity: .8
        };
      } else if (leg.mode === "BUS"){
        polyline_options = {
        color: "#E87272",
        opacity: .8
        };
      } else {
        polyline_options = {
        color: "BLUE",
        // opacity: .7
        };
      }
      // draw the polyline
      
      var route_line = new L.Polyline(polyline.decode(leg.legGeometry.points), polyline_options).addTo(pathLayer);
      // var route_line = new L.Polyline(polyline.decode(leg.legGeometry.points)).addTo(pathLayer);
      route_line.leg = leg;
      route_line.bindPopup(leg.mode+" ("+leg.routeShortName+") "+leg.routeLongName+". From: "+leg.from.name+". To: "+leg.to.name+". Depart at: "+startHour+":"+startMin+". Arrive by: "+endHour+":"+endMin);
      // console.log("drew route ", i);
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