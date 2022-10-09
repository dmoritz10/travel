
async function updateTripsFromLocationHistory(input) {

  await fetchPlaces(input)  

  await updateTrips()

}

async function fetchPlaces(input) {

  var objLHD = await openShts(
    [
      { title: 'Location History Detail', type: 'all' },
      { title: 'City Timezone Xref', type: 'all'}
    ])

  var files = input.files

  var placesArr = []

  
  if (files.length) {

    var sortedFiles = sortInputFiles(files)

    for (var i=0;i<sortedFiles.length;i++) {  
      var file = files[sortedFiles[i][1]]
      var fileContents = await readFile(file)
      var arr = await formatPlace(fileContents, objLHD)
      arr.forEach( ele => placesArr.push(ele))
    }

  } 

  console.log('sortedFiles',sortedFiles)
  console.log('placesArr',placesArr)

  console.log('tempAct', tempAct)

  var arrCTX = [objLHD['City Timezone Xref'].colHdrs].concat(objLHD['City Timezone Xref'].vals)
  await updateSheet('City Timezone Xref', arrCTX)

  await updateAppendSht(placesArr, objLHD)

}



async function updateAppendSht(arr, objLHD) {

/*
  1. Read 'Location History Detail' including header row - LHD
  2. Pull out 'UTC Date' column
  3. For each arr

      for each ele of arr
        lookup UTC Date in arrUTCDate
          if found replace the entire row in LHD
          else append row to LHD

  4. Clear LHD sheet
  5. Write entire array back out to LHD
          
*/

 
  var arrLHD = objLHD['Location History Detail'].vals
  var hdrs = objLHD['Location History Detail'].colHdrs


  const UTCDateCol = hdrs.indexOf('UTC Date')
  const arrUTCDate = arrLHD.map(x => x[UTCDateCol]);

  var updateCntr = 0
  var appendCntr = 0

  for (var i = 0;i<arr.length;i++) {

    var ele = arr[i]

    let row = arrUTCDate.indexOf(ele[UTCDateCol])
    if (row > -1)   {arrLHD[row] = ele;updateCntr++}
    else            {arrLHD.push(ele);appendCntr++}

  }

  buildTrips(arrLHD, hdrs)

  console.log('updateAppendSht')
  console.log('arr', arr.length)
  console.log('arrLHD', arrLHD)
  console.log('updateCntr', updateCntr)
  console.log('appendCntr', appendCntr)
  console.log('total', appendCntr + updateCntr)

  var shtArr = [hdrs].concat(arrLHD)

  console.time('updateSheet')

  await updateSheet('Location History Detail', shtArr)

  console.timeEnd('updateSheet')

  console.log('Update complete')

  
}

async function buildTrips(arr, hdrs) {

  // Sort by Date
  // If Distance > 50

  var dateUTCCol = hdrs.indexOf('UTC Date')
  var tripCol = hdrs.indexOf('Trip')
  var distCol = hdrs.indexOf('Distance')
  var moYrCol = hdrs.indexOf('Month')
  var destCol = hdrs.indexOf('Destinations')
  var statesCol = hdrs.indexOf('States')
  var cntrysCol = hdrs.indexOf('Countries')

  arr.sort(function(a,b) {return a[dateUTCCol] < b[dateUTCCol] ? -1 : 1});

  var trip = null

  for (i=0;i<arr.length;i++) {

    var ele = arr[i]

    if (ele[distCol] > 50) {

      if (!trip) {

        var trip = calcTripName(arr, hdrs, i)

      }

      arr[i][tripCol] = trip.name
      arr[i][moYrCol] = trip.moYr
      arr[i][destCol] = JSON.stringify(trip.dest)
      arr[i][cntrysCol] = JSON.stringify(trip.cntrys)
      arr[i][statesCol] = JSON.stringify(trip.states)
      
    } else {

      trip = null

    }

  }

}

function calcTripName(arr, hdrs, strIdx) {

  var dateCol = hdrs.indexOf('Date')
  var distCol = hdrs.indexOf('Distance')
  var cityCol = hdrs.indexOf('City')
  var stateCol = hdrs.indexOf('State')
  var cntryCol = hdrs.indexOf('Country')
  var cntrysCol = hdrs.indexOf('Countries')

  var tripArr = []
  var stateArr = []
  var cntryArr = []
  var newDate = null

  for (var i=strIdx;i<arr.length;i++) {

    var ele = arr[i]

    if (ele[distCol] <= 50) break

    if (ele[dateCol] == newDate) continue

    newDate = ele[dateCol]

    // if (ele[cntryCol] == "USA") {
    //   tripArr.push(ele[cityCol])
    // } else {
    //   tripArr.push(ele[cntryCol])
    // }

    tripArr.push(ele[cityCol])

    cntryArr.push(ele[cntryCol])

    stateArr.push(ele[stateCol])

  }

  console.log('tripArr', tripArr)

  // Rank cities

  var counts = {}
  tripArr.forEach(el => counts[el] = 1  + (counts[el] || 0))

  const  tripSorted = Object.keys(counts)
  .sort((key1, key2) => counts[key2] - counts[key1])
  .reduce((obj, key) => ({
    ...obj,
    [key]: counts[key]
  }), {})


  console.log('counts', counts)

  var tripDest = []
  for (let [key, value] of Object.entries(tripSorted)) {
    tripDest.push(key) 
  }
  
  var uniqueDests = []
  tripArr.forEach( ele => {

    if (uniqueDests.indexOf(ele) == -1) uniqueDests.push(ele)

  })


  console.log('uniqueDests', uniqueDests)

  // Rank states

  var counts = {}
  stateArr.forEach(el => counts[el] = 1  + (counts[el] || 0))

  console.log('counts', counts)
  
  const  stateSorted = Object.keys(counts)
  .sort((key1, key2) => counts[key2] - counts[key1])
  .reduce((obj, key) => ({
    ...obj,
    [key]: counts[key]
  }), {})
  
  var tripState = []
  for (let [key, value] of Object.entries(stateSorted)) {
    tripState.push(key) 
  }

  // Rank countries

  var counts = {}
  cntryArr.forEach(el => counts[el] = 1  + (counts[el] || 0))

  console.log('counts', counts)
  
  const  cntrySorted = Object.keys(counts)
  .sort((key1, key2) => counts[key2] - counts[key1])
  .reduce((obj, key) => ({
    ...obj,
    [key]: counts[key]
  }), {})
  
  var tripCntry = []
  for (let [key, value] of Object.entries(cntrySorted)) {
    tripCntry.push(key) 
  }

  var tripName = tripCntry[0] == "USA" ? tripDest[0] : tripCntry[0]

  var tripMoYr = tripMonth(newDate)
  
  console.log('tripName1', tripName)

  return {

    name:   tripName,
    moYr:   tripMoYr,
    dest:   uniqueDests,
    cntrys: tripCntry,
    states: tripState
  }
}

function tripMonth(dt) {

  const moAbbr = (moNbr)  => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][moNbr*1-1]
  var dtArr = dt.split("/")
  return moAbbr(dtArr[0]) + ' ' + dtArr[2].substring(0,4)

}

function readFile(file) {
  return new Promise((resolve, reject) => {
    let contents = ""
    const reader = new FileReader()
    reader.onloadend = function (e) {
      contents = e.target.result
      resolve(contents)
    }
    reader.onerror = function (e) {
      reject(e)
    }
    reader.readAsText(file)
  })
}

async function formatPlace(json, objLHD) {

  var a = JSON.parse(json)

  var b = a.timelineObjects

  var homeLat = readOption('Home Lat')
  var homeLng = readOption('Home Lng')

  var hdrs = objLHD['Location History Detail'].colHdrs

  var arr = []
  var activities = {}
  var cntr = 0



  for (var i in b) {

    var type = Object.keys(b[i])[0]

    if (type == "placeVisit") {

        var x = b[i].placeVisit

        var ele = []

        if (!x.location.address)  continue;
        // if (!x.location.name)     continue;

        var addr = x.location.address ? x.location.address.replace(/\n/g, ", ") : ''

        var addrArr = prepAddr(addr)

        if (addrArr.length == 0)  continue;

        
        var cntry   = cleanCntry(addrArr)
        var cityState = cleanCityState(addrArr, cntry)

        if (cntry == 'UK' || cntry == 'Ireland') ukPlaces.push(addrArr)

        if (!cityState.city) continue
        
        var lat = x.location.latitudeE7 ? x.location.latitudeE7/10**7 : x.otherCandidateLocations[0].latitudeE7/10**7
        var lng = x.location.longitudeE7 ? x.location.longitudeE7/10**7 : x.otherCandidateLocations[0].longitudeE7/10**7

        var localTime = await calcLocalTime(cityState.city, x.duration.startTimestamp, lat, lng, objLHD['City Timezone Xref'])
        var dateTimeFormatted = localTime.toLocaleString(DateTime.DATETIME_SHORT)

        var duration = DateTime.fromISO(x.duration.endTimestamp).diff(DateTime.fromISO(x.duration.startTimestamp))
        var DDHH = duration.toFormat("hh':'mm");

 
        ele[hdrs.indexOf('Name')]               = x.location.name ? x.location.name : prepAddr(addr)[0]
        ele[hdrs.indexOf('Date')]               = dateTimeFormatted
        ele[hdrs.indexOf('UTC Date')]           = x.duration.startTimestamp
        ele[hdrs.indexOf('Duration')]           = DDHH
        ele[hdrs.indexOf('Place Id')]           = x.location.placeId
        ele[hdrs.indexOf('Place Confidence')]   = x.placeConfidence
        ele[hdrs.indexOf('Address')]            = prepAddr(addr).join(' | ')
        ele[hdrs.indexOf('City')]               = cityState.city
        ele[hdrs.indexOf('State')]              = cityState.state
        ele[hdrs.indexOf('Country')]            = cntry
        ele[hdrs.indexOf('Lat')]                = lat
        ele[hdrs.indexOf('Lng')]                = lng
        ele[hdrs.indexOf('Distance')]           = Math.round(distanceFromHome(homeLat, homeLng, lat, lng, 'M'))
        ele[hdrs.indexOf('Info')]               = JSON.stringify(x)
        ele[hdrs.indexOf('Month')]              = tripMonth(dateTimeFormatted)
        ele[hdrs.indexOf('Activities')]         = JSON.stringify(activities);

        arr.push(ele)   

        activities = {}

        cntr++

    } else if (type == "activitySegment") {

      var x = b[i].activitySegment

      var activityType = calcActivityType(x.activities[0].activityType)

      var duration = calcDuration (x.duration.startTimestamp, x.duration.endTimestamp)

      var distance = calcDist(activityType, duration, x.distance, x.startLocation, x.endLocation)

      if (!distance) {
        
        console.log('invalid distance', activityType, duration, x.distance, calcDistance(x.startLocation, x.endLocation))
        
        continue

      }

      if (!activities[activityType.type]) activities[activityType.type] = {duration: 0, distance: 0}
    
      activities[activityType.type]['duration'] += duration
      // activities[activityType]['distance'] += x.distance ? x.distance : calcDistance(x.startLocation, x.endLocation)
      activities[activityType.type]['distance'] += distance


      tempAct.push([
        x.duration.endTimestamp,
        x.activityType,
        x.activities[0].activityType,
        calcDuration (x.duration.startTimestamp, x.duration.endTimestamp)/60,
        x.distance/1609.34,
        calcDistance(x.startLocation, x.endLocation)/1609.34,
        x.activities[0]?.activityType,
        x.waypointPath?.travelMode,
        x.waypointPath?.source,
        x.waypointPath?.distanceMeters/1609.34,
        x.simplifiedRawPath?.source,
        x.simplifiedRawPath?.distanceMeters/1609.34,

      ])




    }

}

arr[arr.length-1][hdrs.indexOf('Activities')] = JSON.stringify(activities);

console.log('cntr', cntr)
console.log('arr', arr)


return arr

}

function calcActivityType(activityType) {

  switch (activityType) {

    case 'BOATING':
      var type = 'Boating'
      var maxSpeedMPH = 60
      var url = 'https://www.gstatic.com/images/icons/material/system/2x/directions_boat_black_24dp.png'
    break;
    case 'CYCLING':
      var type = 'Cycling'
      var maxSpeedMPH = 30
      var url = 'https://maps.gstatic.com/mapsactivities/icons/activity_icons/2x/ic_activity_biking_black_24dp.png'
    break;
    case 'FLYING':
      var type = 'Flying'
      var maxSpeedMPH = 800
      var url = 'https://www.gstatic.com/images/icons/material/system/2x/local_airport_black_24dp.png'
    break;
    case 'HIKING':
      var type = 'Hiking'
      var maxSpeedMPH = 15
      var url = 'https://maps.gstatic.com/mapsactivities/icons/activity_icons/2x/ic_activity_hiking_black_24dp.png'
    break;
    case 'IN_BUS':
      var type = 'On a bus'
      var maxSpeedMPH = 80
      var url = 'https://www.gstatic.com/images/icons/material/system/2x/directions_bus_black_24dp.png'
    break;
    case 'IN_FERRY':
      var type = 'On a ferry'
      var maxSpeedMPH = 60
      var url = 'https://www.gstatic.com/images/icons/material/system/2x/directions_boat_black_24dp.png'
    break;
    case 'IN_GONDOLA_LIFT':
      var type = 'In a gondola lift'
      var url = 'https://maps.gstatic.com/mapsactivities/icons/activity_icons/2x/ic_activity_gondola_black_24dp.png'
    break;
    case 'IN_PASSENGER_VEHICLE':
      var type = 'Driving'
      var maxSpeedMPH = 90
      var url = 'https://www.gstatic.com/images/icons/material/system/2x/directions_car_black_24dp.png'
    break;
    case 'IN_SUBWAY':
      var type = 'On the subway'
      var maxSpeedMPH = 90
      var url = 'https://maps.gstatic.com/mapsactivities/icons/activity_icons/2x/ic_activity_subway_black_24dp.png'
    break;
    case 'IN_TAXI':
      var type = 'In a taxi'
      var url = 'https://www.gstatic.com/images/icons/material/system/2x/local_taxi_black_24dp.png'
    break;
    case 'IN_TRAIN':
      var type = 'On a train'
      var maxSpeedMPH = 90
      var url = 'https://www.gstatic.com/images/icons/material/system/2x/directions_railway_black_24dp.png'
    break;
    case 'IN_TRAM':
      var type = 'On a tram'
      var maxSpeedMPH = 60
      var url = 'https://maps.gstatic.com/mapsactivities/icons/activity_icons/2x/ic_activity_tram_black_24dp.png'
    break;
    case 'IN_VEHICLE':
      var type = 'Driving'
      var url = 'https://www.gstatic.com/images/icons/material/system/2x/directions_car_black_24dp.png'
    break;
    case 'SKIING':
      var type = 'Skiing'
      var maxSpeedMPH = 90
      var url = 'https://maps.gstatic.com/mapsactivities/icons/activity_icons/2x/ic_activity_downhill_skiing_black_24dp.png'
    break;
    case 'WALKING':
      var type = 'Walking'
      var maxSpeedMPH = 15
      var url = 'https://maps.gstatic.com/mapsactivities/icons/activity_icons/2x/ic_activity_walking_black_24dp.png'
    break;
    default:
      var type = 'Moving'
      var maxSpeedMPH = 90
      var url = 'https://maps.gstatic.com/mapsactivities/icons/activity_icons/2x/ic_activity_moving_black_24dp.png'
    break;
  }

  return {
    type: type,
    maxSpeedMPH: maxSpeedMPH,
    url: url
  }


}

function calcDist(activityType, duration, distance, startLocation, endLocation) {

  const spdInMPH = (distance, duration) => (distance / 1609.34) / (duration / 60)

  if (duration <= 0) return null

  var spdMPH = spdInMPH(distance, duration)

  if (spdMPH <= activityType.maxSpeedMPH) {

    return distance

  } else {

    var calcDst = calcDistance(startLocation, endLocation) 

    if (calcDst <= 0) return null

    var calcSpdMPH = spdInMPH(calcDst, duration)
    if (calcSpdMPH <= activityType.maxSpeedMPH) { 

      return calcDst 

    }

  }

  console.log('fall thru', calcDst, calcSpdMPH)

  return null

}

function calcDistance(startLocn, endLocn) {

  let unit = 'K'

  let lat1 = startLocn.latitudeE7
  let lon1 = startLocn.longitudeE7
  let lat2 = endLocn.latitudeE7
  let lon2 = endLocn.longitudeE7

  if ((lat1 == lat2) && (lon1 == lon2)) {
    return 0;
  }
  else {
    var radlat1 = Math.PI * lat1/180;
    var radlat2 = Math.PI * lat2/180;
    var theta = lon1-lon2;
    var radtheta = Math.PI * theta/180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = dist * 180/Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit=="K") { dist = dist * 1.609344 }
    if (unit=="N") { dist = dist * 0.8684 }
    return dist;
  }
}

function calcDuration (str, end) {

  const s = luxon.DateTime.fromISO(str)
  const es = luxon.DateTime.fromISO(end)
  
  const diff = es.diff(s, ['minutes']).values.minutes
  
  console.log('diff', diff)

  return diff

}

async function calcLocalTime(city, startTimestamp, lat, lng, cityXref) {

  var hdrs      = cityXref.colHdrs
  var cityXref  = cityXref.vals

  var idx = cityXref.findIndex(arr => arr.includes(city));

  if (idx == -1) var timezoneId = await buildCityXref(city, lat, lng, cityXref)
  else           var timezoneId = cityXref[idx][1]
  
  var localTime = DateTime.fromISO(`${startTimestamp}`, { zone: `${timezoneId}` });

  // return localTime.toString()
  return localTime

}

async function buildCityXref(city, lat, lng, cityXref) {

  var geonames = `http://api.geonames.org/timezoneJSON?lat=${lat}&lng=${lng}&username=dmoritz10`

  var geoTimezoneId = await xhr('https://cors.bridged.cc/' + geonames)
    
  .then( response => {
    
    console.log(response)
    console.log(response.xhr);  // full response
    console.log(response.data)

    return response.data.timezoneId

  })

  .catch( error => {
    console.log(error.status); // xhr.status
    console.log(error.statusText); // xhr.statusText
  });

  cityXref.push([city, geoTimezoneId])

  return geoTimezoneId

}


function prepAddr(addr) {

  var arr = addr.split(', ')  

  var addrArr = []

  for (i=0;i<arr.length;i++) {

    let wrk = arr[i]
    wrk = wrk.replace(/[0-9]/g, '').replace(/( [A-Z][A-Z] [A-Z][A-Z])/, '').replace(/( [A-Z][A-Z][A-Z] [A-Z][A-Z])/, '') // Eg. Edinburgh EH EG
    // wrk = wrk.replace(/-/g, '')
    wrk = wrk.trim()

    if (wrk) addrArr.push(wrk)
    // addrArr.push(wrk)

  }

  return addrArr

}

function cleanCityState(addrArr, cntry) {


  if (cntry == "USA" || cntry == "Canada" || cntry == "Mexico") {

    var s = addrArr.length > 1 ? addrArr[addrArr.length - 1].replace(/-/g, '').trim() : ''
    var state = convertStateToFullName(s)
    var city  = addrArr.length > 1 ? addrArr[addrArr.length - 2] : addrArr[addrArr.length - 1]

  } else if (cntry == "Ireland") {

    var state = ''
    var city  = addrArr[addrArr.length - 2]

  } else {

    var state = ''
    var city  = addrArr[addrArr.length - 1]

  }

  return {city:city, state:state}

}

function cleanCntry(addrArr) {

  var cntry =addrArr.pop()

  const clnCntry = (mask, val, cntry) => (mask.indexOf(cntry) == -1 ? cntry : val)

  var syn = ['United States']
  var val = 'USA'
  cntry = clnCntry(syn, val, cntry)

  var syn = ['United Kingdom']
  var val = 'UK'
  cntry = clnCntry(syn, val, cntry)
  
  var syn = ['Deutschland']
  var val = 'Germany'
  cntry = clnCntry(syn, val, cntry)
  
  var syn = ['España', 'Espanha', 'Espanya']
  var val = 'Spain'
  cntry = clnCntry(syn, val, cntry)
  
  var syn = ['Italia', 'Italië']
  var val = 'Italy'
  cntry = clnCntry(syn, val, cntry)

  var syn = ['Österreich']
  var val = 'Austria'
  cntry = clnCntry(syn, val, cntry)

  var syn = ['Perú']
  var val = 'Peru'
  cntry = clnCntry(syn, val, cntry)
  
  var syn = ['Schweiz', 'Svizzera']
  var val = 'Switzerland'
  cntry = clnCntry(syn, val, cntry)

  var syn = ['México']
  var val = 'Mexico'
  cntry = clnCntry(syn, val, cntry)
  
  var syn = ['Nederland']
  var val = 'Netherlands'
  cntry = clnCntry(syn, val, cntry)

  return cntry
  
}


function distanceFromHome(lat1, lon1, lat2, lon2, unit) {
	if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	}
	else {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		if (unit=="K") { dist = dist * 1.609344 }
		if (unit=="N") { dist = dist * 0.8684 }
		return dist;
	}
}


//
//
//

async function updateTrips() {

  var objShts = await openShts(
      [
        { title: 'Location History Detail', type: 'all' },
        { title: 'Trips', type: 'all'}

      ])
  
  var valsLHD    = objShts['Location History Detail'].vals
  var hdrsLHD   = objShts['Location History Detail'].colHdrs

  var valsTRP  = objShts['Trips'].vals
  var hdrsTRP = objShts['Trips'].colHdrs

  const LHDTripCol = hdrsLHD.indexOf('Trip')
  const LHDDestCol = hdrsLHD.indexOf('Destinations')
  const LHDMonthCol = hdrsLHD.indexOf('Month')

  const TRPStrCol  = hdrsTRP.indexOf('Start Date')
  const TRPStrDteArr = valsTRP.map(x => x[TRPStrCol]);
  
  const TRPEndCol  = hdrsTRP.indexOf('End Date')
  const TRPEndDteArr = valsTRP.map(x => x[TRPEndCol]);
  
  var updateCntr = 0
  var appendCntr = 0
  var skipCntr = 0


  for (var i = 0;i<valsLHD.length;i++) {

    var ele = valsLHD[i]

    if (ele[LHDTripCol])
      {
        var trip = buildTrip(i, valsLHD, hdrsLHD, valsTRP, hdrsTRP)
        i = trip.endIdx*1 + 1

      } else continue
    
    let key = JSON.parse(ele[LHDDestCol]).join(' - ') + ' - ' + ele[LHDMonthCol]

    let row = findMatchInTrips(trip.val[hdrsTRP.indexOf('Start Date')], trip.val[hdrsTRP.indexOf('End Date')], TRPStrDteArr, TRPEndDteArr)

    var cl = {

      row: row,
      trip:trip,
      tripStr: trip.val[hdrsTRP.indexOf('Start Date')],
      tripEnd: trip.val[hdrsTRP.indexOf('End Date')],
      strDate:row > -1 ? TRPStrDteArr[row] : row,
      endDate:row > -1 ? TRPEndDteArr[row] : row

    }

    // console.log(cl)

    if (row == -1)   {

      var msg = "Add this trip ?<br><br>" +
                trip.val[hdrsTRP.indexOf('Trip')] + '<br>' +  
                trip.val[hdrsTRP.indexOf('Start Date')];

      var addTrip = await confirm(msg)

      if (!addTrip) {

        skipCntr++

      } else {

        valsTRP.push(trip.val);
        appendCntr++

      }

    } else {

       if (valsTRP[row][hdrsTRP.indexOf('Source')] == 'LHD') {
        
        valsTRP[row] = trip.val;
        updateCntr++

      } else {

        skipCntr++

      }

    }

  }

  console.log('updateAppendSht')
  console.log('updateCntr', updateCntr)
  console.log('appendCntr', appendCntr)
  console.log('skipCntr', skipCntr)
  console.log('total', appendCntr + updateCntr + skipCntr)

  var shtArr = [hdrsTRP].concat(valsTRP)

  console.time('updateSheet')

  await updateSheet('Trips', shtArr)

  console.timeEnd('updateSheet')

  console.log('Update complete')

  var msg =   "Trips updated: " + updateCntr  + '<br>' +
              "Trips added  : " + appendCntr  + '<br>' +
              "Trips skipped: " + skipCntr    + '<br>' +
              "Total        : " + (appendCntr*1 + updateCntr*1 + skipCntr*1)

  bootbox.alert({

    title: 'Import Trips Complete',
    message: msg,
    closeButton: false

  });

  listTrips("Trips")

}

function buildTrip(strIdx, valsLHD, hdrsLHD, valsTRP, hdrsTRP) {

  var trp = []
  var ele = valsLHD[strIdx]

  console.log('ele', ele)

  var states = JSON.parse(ele[hdrsLHD.indexOf('States')])
  var cntries = JSON.parse(ele[hdrsLHD.indexOf('Countries')])

  var cntry = cntries.length == 1 && cntries[0] == "USA" ? states : cntries

  console.log('countiresz', states, cntries)
  console.log(cntries.length == 1)
  console.log(cntries[0] == "USA")
  console.log(cntries.length == 1 && cntries[0] == "USA")


  trp[hdrsTRP.indexOf('Composite Key')]  = ele[hdrsLHD.indexOf('Trip')] + ' - ' + ele[hdrsLHD.indexOf('Month')] + ' - ' + JSON.parse(ele[hdrsLHD.indexOf('Destinations')]).join(' - ')
  trp[hdrsTRP.indexOf('Trip')]           = ele[hdrsLHD.indexOf('Trip')]
  trp[hdrsTRP.indexOf('Month')]          = ele[hdrsLHD.indexOf('Month')]
  trp[hdrsTRP.indexOf('Destinations')]   = ele[hdrsLHD.indexOf('Destinations')]
  trp[hdrsTRP.indexOf('Countries')]      = JSON.stringify(cntry)
  trp[hdrsTRP.indexOf('Type')]           = cntries.length == 1 && cntries[0] == "USA" ? JSON.stringify(["Domestic"]) : JSON.stringify(["International"])
  trp[hdrsTRP.indexOf('Start Date')]     = ele[hdrsLHD.indexOf('Date')].split(',')[0]
  trp[hdrsTRP.indexOf('Source')]         = 'LHD'

  var destArr = []

  for (var i=strIdx;i<valsLHD.length;i++) {

    var dest = valsLHD[i]

    if (dest[hdrsLHD.indexOf('Trip')]) {

      destArr.push({

        name:         dest[hdrsLHD.indexOf('Name')],
        date:         dest[hdrsLHD.indexOf('Date')],
        city:         dest[hdrsLHD.indexOf('City')],
        state:        dest[hdrsLHD.indexOf('Country')] == "USA" ? dest[hdrsLHD.indexOf('State')] : dest[hdrsLHD.indexOf('Country')],
        activities:   JSON.parse(dest[hdrsLHD.indexOf('Activities')])

      })

    } else {

      trp[hdrsTRP.indexOf('End Date')]              = dest[hdrsLHD.indexOf('Date')].split(',')[0]
      trp[hdrsTRP.indexOf('Destination Detail')]    = JSON.stringify(destArr)
      trp[hdrsTRP.indexOf('Nbr Days')]              = calcNbrDays(trp[hdrsTRP.indexOf('Start Date')], trp[hdrsTRP.indexOf('End Date')])
      return {val: trp, endIdx: i-1}

    }

  }

  trp[hdrsTRP.indexOf('End Date')]              = dest[hdrsLHD.indexOf('Date')].split(',')[0]
  trp[hdrsTRP.indexOf('Destination Detail')]    = JSON.stringify(destArr)
  trp[hdrsTRP.indexOf('Nbr Days')]              = calcNbrDays(trp[hdrsTRP.indexOf('Start Date')], trp[hdrsTRP.indexOf('End Date')])
      
  return {val: trp, endIdx: i-1}

}


function calcNbrDays(str, end) {

var strDate = DateTime.fromJSDate(new Date(str))
var endDate = DateTime.fromJSDate(new Date(end))

const diff = endDate.diff(strDate, ["days"]).days

return diff*1 + 1

}

function findMatchInTrips(strdt, enddt, strArr, endArr) {

  let trpStr = new Date(strdt)
  let trpEnd = new Date(enddt)

  var row = -1

  for (var i=0;i<strArr.length;i++) {

    let str = new Date(strArr[i])
    let end = new Date(endArr[i])

    if ( (str <= trpStr && trpStr <= end) || (str <= trpEnd && trpEnd <= end) ) {

      row = i
      break;

    }

  }

  return row

}

function sortInputFiles(files) {

  var sortedFiles = []

  for (var i=0;i<files.length;i++) {

    var file = files[i].name

    console.log('file', file)

    yr = file.substring(0,4)

    var regex = /\_(.*?)\./;
    var moName = regex.exec(file)[1].substring(0,3);


    var moNbr = ('0' + ( "JanFebMarAprMayJunJulAugSepOctNovDec".toUpperCase().indexOf(moName) / 3 + 1 )).slice(-2);

    console.log(yr, moName, moNbr)

    sortedFiles.push([yr + '-' + moNbr, i])

  }

  sortedFiles.sort((a, b) => a[0].localeCompare(b[0]));

  return sortedFiles

}