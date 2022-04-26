

Import place visits from Google Locations

Places We've Been

    sort:
        place name
        country
    
    filter:
        place name
        date range
        country

    format:
        one entry per place
        address, nbr times visited, country
        > goes to listing like secimg

Trip We've Taken

    sort:
        trip name
        trip type

    filter:
        trip name
        trip type
        country

    format:
        one entry per trip
        > goes to destinations within trip



Global vars

  trpHdrs         = objSht[trpTitle].colHdrs
  trpVals         = objSht[trpTitle].vals

  trpIdx       = which trip is selected = index in trpVals by showTrips

    use to update Trips sheet by f/m in show trip.js and trips-js.js

  var destDtl = trpVals[trpArrIdx][trpHdrs.indexOf("Destination Detail")]

  trpdtlIdx   = which Destination is selected = index in destDtl by showTrip


Classes

  trpSelected     = which element of trpContainer is selected by >

    when > is clicked, 
      remove all classes and set class on this
      update trpArrIdx

  trpDestSelected = which element of trpdtlmContainer is selected by >

    when > is clicked, 
      remove all classes and set class on this
      update trpDestDtlIdx
    

Trip maintenance

  make Type required with select
  make Trip Name, Destinations, countries required

Destination Maintenance
  make all required

x - Disable rebuikd bottom is no dests
x - Search on places

Trips
  Move Trips import to drop-down
  On import, prompt to add new Trip
  x - Make Type select multiple
  x - Add types to Composite Key

Change main menu
  Remove Import after movingb to dropdowns
  Change Places to Countries
  Add Places

Design, develop a timeline

Design, develop Places similar to Google Timeline

Reservations

  x - need some sort of copy/paste from email to reservation
  Move reservations import to drop-down
  add-update current reservations - how to detect an update ?
  prompt for add-update

  x - filter on complete vs future reservations

x - Make Schnucky version
  d-none all edit buttons except on Reservations

Add calendar view


From Google create calendar events from Gmail:
Reservation at 
Stay at 
Flight to 
Tee Time Reservation Confirmation
From 
