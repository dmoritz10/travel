

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


{trip:
  name: "Aspen - Jan 2022",
  type: 'Domestic, Ski, International',
  nbrDays: 12,
  img: pointer to image,
  destinations: [
    {
      name: "Aspen",
      startDate: 1/29/2022,
      endDate: 2/5/2022,
    },
    {
      name: "Aspen",
      startDate: 1/29/2022,
      endDate: 2/5/2022,
    },{
      name: "Aspen",
      startDate: 1/29/2022,
      endDate: 2/5/2022,
    }
  ]
  
}