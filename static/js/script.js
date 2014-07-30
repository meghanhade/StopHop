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
    for (marker in markerList) {
      console.log(marker);
    }
    return markerCount;
    }
    else {
      window.alert("Sorry, you've reached the maximum number of destinations (4).");
    }
  }

  function get_route_1 () {
    pathLayer.clearLayers();
    var url = generate_url();
    $.getJSON(url, function(data) {
      $.each(data, function(index, element) {
        $('body').append($('<div>', {
          text: element.name
        }));
      });
      draw_route_1(data);
      var arrivalTime = data.plan.itineraries[0].endTime;
      var delayTime2 = $("#delayTime2").val();
      console.log(delayTime2);
      get_route_2(arrivalTime, delayTime2);
    });
  }

  function get_route_2 (arrivalTime, delayTime2) {
    if (delayTime2 === 'undefined'){
      delayTime2 = 0;
    }
    var url2 = generate_url_2(arrivalTime, delayTime2);
   $.getJSON(url2, function(data2) {
        $.each(data2, function(index, element) {
          $('body').append($('<div>', {
            text: element.name
          }));
        });
        draw_route_2(data2);
    });
  }

   function generate_url(inputTime, delayTime) {
    if (delayTime === 'undefined'){
      delayTime = 0;
    }
    var pointA = markerList[0].getLatLng();
    var pointB = markerList[1].getLatLng();
    var inputTime = $("input#dateTime").val();
    var d = new Date(inputTime);
    var year = d.getFullYear();
    //add one to month, as January is month 0:
    var month = d.getMonth()+1;
    var day = d.getDate();
    //add 7 hours to adjust for GMT:
    var hour = d.getHours() + 7;
    var min = d.getMinutes();

    url = "http:localhost:8080/otp/routers/default/plan?fromPlace="+pointA.lat+"%2C"+pointA.lng+"&toPlace="+pointB.lat+"%2C"+pointB.lng+"&mode=TRANSIT%2CWALK&maxWalkDistance=750&arriveBy=false&date="+year+"-"+month+"-"+day+"&time="+hour+":"+min;
    // console.log(url); 
    return url;
  }

  function generate_url_2 (arrivalTime, delayTime2) {
    if (delayTime2 === 'undefined'){
      delayTime2 = 0;
    }
    var pointB = markerList[1].getLatLng();
    var pointC = markerList[2].getLatLng();
    var inputTime = arrivalTime;

    var delay = parseInt(delayTime2) * 60 * 1000;
    var delayedStart = delay + inputTime;


    var d = new Date(delayedStart);
    var year = d.getFullYear();
    //add one to month, as January is month 0:
    var month = d.getMonth()+1;
    var day = d.getDate();
    //arrivalTime hours are already adjusted for GMT:
    var hour = d.getHours();
    var min = d.getMinutes();


    url2 = "http:localhost:8080/otp/routers/default/plan?fromPlace="+pointB.lat+"%2C"+pointB.lng+"&toPlace="+pointC.lat+"%2C"+pointC.lng+"&mode=TRANSIT%2CWALK&maxWalkDistance=750&arriveBy=false&date="+year+"-"+month+"-"+day+"&time="+hour+":"+min;
    // console.log(url2)
    console.log(inputTime);
    console.log(delayedStart);
    return url2;
  }

  // Generic URL generation Function :

  // function generic_generate_url(fromMarker, toMarker, inputTime, delayTime) {
  //   var pointA = fromMarker.getLatLng();
  //   var pointB = toMarker.getLatLng();
  //   if (inputTime === undefined) {
  //     inputTime = $("input#dateTime").val();
  //     var d = new Date(inputTime);
  //     var year = d.getFullYear();
  //     //add one to month, as January is month 0:
  //     var month = d.getMonth()+1;
  //     var day = d.getDate();
  //     //add 7 hours to adjust for GMT:
  //     var hour = d.getHours() + 7;
  //     var min = d.getMinutes();
  //   }
  //   else {
  //     var d = new Date(inputTime);
  //     var year = d.getFullYear();
  //     //add one to month, as January is month 0:
  //     var month = d.getMonth()+1;
  //     var day = d.getDate();
  //     //arrivalTime hours are already adjusted for GMT:
  //     var hour = d.getHours();
  //     var min = d.getMinutes();
  //   }

  //   url = "http:localhost:8080/otp/routers/default/plan?fromPlace="+pointA.lat+"%2C"+pointA.lng+"&toPlace="+pointB.lat+"%2C"+pointB.lng+"&mode=TRANSIT%2CWALK&maxWalkDistance=750&arriveBy=false&date="+year+"-"+month+"-"+day+"&time="+hour+":"+min;
  //   // console.log(url); 
  //   return url;
  // }

  // function get_routes () {
  //     for (var i=0; i < 4; i++) {
  //       if (i === "2") {
  //           // some jquery to retrieve input

  //           generic_generate_url()//include delay)
  //       } else if (i == "3") {

  //       } else {
  //         // don't pass in delay
  //       }
  //     }

  // }

  $(document).ready(function () {
    $(".ui-button_route").click(get_route_1);
    //$('.ui-button_route').click(get_routes);
  });

  $(document).ready(function () {
    $(".ui-button_marker").click(addMarker);
  });

  function draw_route_1 (data) {

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

  function draw_route_2 (data2) {
    var legs = data2.plan.itineraries[0].legs;

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
})();