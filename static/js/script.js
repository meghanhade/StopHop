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

  function addMarker() {
    if (markerCount <= 4) {
      var markerCountString = markerCount.toString();
      var newMarker = L.marker(new L.LatLng(45.515609, -122.682437), {
      icon: L.mapbox.marker.icon({'marker-color': 'CC0033', 'marker-symbol': markerCountString}),
      draggable: true
      }).addTo(map);
      markerCount += 1;
      markerList.push(newMarker);
      console.log(markerList);
      for (var marker in markerList) {
        console.log(marker);
      }
    }
    else {
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

  function get_route_1 () {
    pathLayer.clearLayers();
    var fromMarker = markerList[0];
    var toMarker = markerList[1];
    var inputTime = Date.now();
    // var inputTime = $("input#dateTime").val();
    var delayTime = 0;
    var url = generic_generate_url(fromMarker, toMarker, inputTime, delayTime);
    $.getJSON(url, function(data) {
      $.each(data, function(index, element) {
        $('body').append($('<div>', {
          text: element.name
        }));
      });
      draw_routes(data);
      var inputTime = data.plan.itineraries[0].endTime;
      var delayTime = $("#delayTime2").val();
      get_route_2(inputTime, delayTime);
    });
  }

  function get_route_2 (inputTime, delayTime) {
    if (delayTime === 'undefined'){
      delayTime = 0;
    }
    var fromMarker = markerList[1];
    var toMarker = markerList[2];
    var url = generic_generate_url(fromMarker, toMarker, inputTime, delayTime);
   $.getJSON(url, function(data) {
        $.each(data, function(index, element) {
          $('body').append($('<div>', {
            text: element.name
          }));
        });
        draw_routes(data);
        var inputTime = data.plan.itineraries[0].endTime;
        var delayTime = $("#delayTime3").val();
        get_route_3(inputTime, delayTime);
    });
  }

  function get_route_3 (inputTime, delayTime) {
    if (delayTime === 'undefined'){
      delayTime = 0;
    }
    var fromMarker = markerList[2];
    var toMarker = markerList[3];
    var url = generic_generate_url(fromMarker, toMarker, inputTime, delayTime);
   $.getJSON(url, function(data) {
        $.each(data, function(index, element) {
          $('body').append($('<div>', {
            text: element.name
          }));
        });
        draw_routes(data);
    });
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
    $(".ui-button_route").click(get_route_1);
    $(".ui-button_marker").click(addMarker);
    //$('.ui-button_route').click(get_routes);
  });

  $(document).ready(function () {
    
  });

})();