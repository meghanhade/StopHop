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
    // if (inputTime === undefined) {
    //   inputTime = $("input#dateTime").val();
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

    url = "http:localhost:8080/otp/routers/default/plan?fromPlace="+pointA.lat+"%2C"+pointA.lng+"&toPlace="+pointB.lat+"%2C"+pointB.lng+"&mode=TRANSIT%2CWALK&maxWalkDistance=750&arriveBy=false&date="+year+"-"+month+"-"+day+"&time="+hour+":"+min;
    // console.log(url); 
    return url;
  }

  function routeManager () {
    pathLayer.clearLayers();
    var delay2 = 10; //form response
    var delay3 = 10; //form response
    markerDict[1]["delay"] = 0;
    markerDict[2]["delay"] = delay2;
    markerDict[3]["delay"] = delay3;
    console.log(markerDict);
    //call getRoutes() here
    var dictLength = Object.keys(markerDict).length;
    var inputTime = Date.now(); //SET THIS TO FORM RESPONSE!!!!!
    console.log(markerDict);
    for (var i = 1; i < dictLength; i++) {
      console.log(i);
      var fromMarker = markerDict[i]["marker"];
      var toMarker = markerDict[i + 1]["marker"];
      var delayTime = markerDict[i]["delay"];
      inputTime = getRoutes (fromMarker, toMarker, inputTime, delayTime); //the return of getRoutes
    }
  }

  function getRoutes (fromMarker, toMarker, inputTime, delayTime) {
    var url = generic_generate_url(fromMarker, toMarker, inputTime, delayTime);
    $.getJSON(url, function(data) {
      $.each(data, function(index, element) {
        $('body').append($('<div>', {
          text: element.name
        }));
      });
      draw_routes(data);
      var inputTime = data.plan.itineraries[0].endTime;
    });
    return inputTime;
  }

  function draw_routes (data) {
    var legs = data.plan.itineraries[0].legs;

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
    //$('.ui-button_route').click(get_routes);
  });

  $(document).ready(function () {
    
  });

})();