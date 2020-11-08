$(".shop-link").mouseover(function(){
  var latitude =  Number($(this).attr("data-lat"));
  var longitude =  Number($(this).attr("data-long"));

  showMarker(latitude, longitude);
});

$(".shop-link").mouseout(function(){
  hideMarker();
});

// Initialize and add the map
function initMap() {
  // Set Zurich Center as location
  zurichLocation = { lat: 47.3769, lng: 8.5417 };
  
  // TODO: set initial zoom of map based on all shop locations?
  map = new google.maps.Map(document.getElementById("shopmap"), {
    zoom: 13,
    center: zurichLocation,
  });
}

// show temporary marker when mouseover link
function showMarker(latitude, longitude){
  var markerLocation = { lat: latitude, lng: longitude }; 

  mouseoverMarker = new google.maps.Marker({
    position: markerLocation,
    map: map,
  });
}
// show temporary marker when mouseover link
function hideMarker(){
  mouseoverMarker.setMap(null);
}

// place marker when mouse click
function placeMarker(latitude, longitude){

}
