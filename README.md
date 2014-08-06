StopHop
=================

Overview
-----------

StopHop is a web application that provides travel planning for public transit, allowing multiple stops and taking into consideration the amount of time needed at each destination. 

Powered by several open source technologies, this project fills a gap left by Google Maps directions service, which provides multi-stop routing for driving, walking and cycling, but not for public transit. The user is able to select destinations on a Leaflet and Mapbox-driven mapping interface and designate a "layover" at each stop. These data points are then used to generate a custom route by submitting calls to the OpenTripPlan routing engine API.

This project was inspired by my interest in creating web tools that improve urban systems, as well as open source technologies and creating dynamic, data-driven maps and visualizations.


Dependencies
------------
JavaScript 
jQuery 
[Leaflet](http://leafletjs.com/), an Open-Source JavaScript Library for Interactive Maps
[Mapbox](https://www.mapbox.com/)
[OpenTripPlanner Routing Engine](https://github.com/opentripplanner)
HTML/CSS 

This project requires implementation of the OpenTripPlanner (OTP) routing engine. This routing engine has various dependencies of its own; information about these can be found in the OTP documentation.

For further information and documentation on implementing OTP, review http://www.opentripplanner.org.

Additionally, for information on working with routing engines in general, OTP researchers have compiled a good list of [relevent literature](https://github.com/opentripplanner/OpenTripPlanner/wiki/RoutingBibliography).







