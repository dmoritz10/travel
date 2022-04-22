

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
    

On trip maintenance

make Type required with select
make Rrip Name, Destinations, countries required

on Destination Maintenance
make all required

Disable rebuikd bottom is no dests
Search
Move import to drop-down


