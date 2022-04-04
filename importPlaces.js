function btnImportPlacesHtml() {

  gotoTab('ImportPlaces')


}

async function fetchPlaces(input) {

  console.log('fetchplaces',input.files)

  var objLHD = await openShts(
    [
      { title: 'Location History Detail', type: 'all' },
      { title: 'City Timezone Xref', type: 'all'}
    ])


  var files = input.files
  var placesArr = []

  if (files.length) {

    for (var i=0;i<files.length;i++) {  
      var fileContents = await readFile(files[i])
      var arr = await formatPlace(fileContents, objLHD)
      arr.forEach( ele => placesArr.push(ele))
    }
  } 

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
      arr[i][destCol] = trip.dest


    } else {

      trip = null

    }

  }

}

function calcTripName(arr, hdrs, strIdx) {

  var dateCol = hdrs.indexOf('Date')
  var dateUTCCol = hdrs.indexOf('UTC Date')
  var tripCol = hdrs.indexOf('Trip')
  var distCol = hdrs.indexOf('Distance')
  var cityCol = hdrs.indexOf('City')
  var stateCol = hdrs.indexOf('State')
  var cntryCol = hdrs.indexOf('Country')

  var tripArr = []
  var newDate = null

  for (var i=strIdx;i<arr.length;i++) {

    var ele = arr[i]

    if (ele[distCol] <= 50) break

    if (ele[dateCol] == newDate) continue

    newDate = ele[dateCol]

    if (ele[cntryCol] == "USA") {
      tripArr.push(ele[cityCol] + ' ' + convertStateToAbbr(ele[stateCol]))
    } else {
      tripArr.push(ele[cntryCol])
    }
  }

  console.log('tripArr', tripArr)

  var counts = {}
  tripArr.forEach(el => counts[el] = 1  + (counts[el] || 0))

  console.log('counts', counts)
  
  const tripSorted = Object.keys(counts)
  .sort((key1, key2) => counts[key2] - counts[key1])
  .reduce((obj, key) => ({
    ...obj,
    [key]: counts[key]
  }), {})

  // var tripName = ''
  // for (let [key, value] of Object.entries(tripSorted)) {
  //   if (value >= 2) tripName += key + ' - '
  // }

  // if (tripName == '') tripName = Object.keys(tripSorted)[0] + ' - '

  // tripName += tripMonth(newDate)
  
  // console.log('tripName1', tripName)

  // return tripName

 var tripDest = []]
  for (let [key, value] of Object.entries(tripSorted)) {
    tripDest.push(key) 
  }

  var tripName = destinations[0]

  var tripMoYr = tripMonth(newDate)
  
  console.log('tripName1', tripName)

  return {
    
    name: tripName,
    moYr: tripMoYr,
    dest: tripDest
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

var DateTime = luxon.DateTime;
var b = a.timelineObjects

var homeLat = readOption('Home Lat')
var homeLng = readOption('Home Lng')

var hdrs = objLHD['Location History Detail'].colHdrs

var arr = []

var cntr = 0

for (var i in b) {

    var type = Object.keys(b[i])[0]

    if (type == "placeVisit") {

        var x = b[i].placeVisit

        var ele = []

        if (!x.location.address)  continue;
        if (!x.location.name)     continue;

        var addr = x.location.address ? x.location.address.replace(/\n/g, ", ") : ''

        var addrArr = prepAddr(addr)
        
        var cntry   = cleanCntry(addrArr)
        var cityState = cleanCityState(addrArr, cntry)

        if (!cityState.city) continue
        
        var lat = x.location.latitudeE7 ? x.location.latitudeE7/10**7 : x.otherCandidateLocations[0].latitudeE7/10**7
        var lng = x.location.longitudeE7 ? x.location.longitudeE7/10**7 : x.otherCandidateLocations[0].longitudeE7/10**7

        var localTime = await calcLocalTime(cityState.city, x.duration.startTimestamp, lat, lng, objLHD['City Timezone Xref'], DateTime)
        var dateTimeFormatted = localTime.toLocaleString(DateTime.DATETIME_SHORT)

        var duration = DateTime.fromISO(x.duration.endTimestamp).diff(DateTime.fromISO(x.duration.startTimestamp))
        var DDHH = duration.toFormat("hh':'mm");

 
        ele[hdrs.indexOf('Name')]               = x.location.name ? x.location.name : x.location.placeId
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
        ele[hdrs.indexOf('Distance')]           = Math.round(distance(homeLat, homeLng, lat, lng, 'M'))
        ele[hdrs.indexOf('Info')]               = JSON.stringify(x)
        ele[hdrs.indexOf('Month')]              = tripMonth(dateTimeFormatted)

        arr.push(ele)   

        cntr++
    }

}

console.log('cntr', cntr)

return arr

}

async function calcLocalTime(city, startTimestamp, lat, lng, cityXref, DateTime) {

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
    wrk = wrk.replace(/[0-9]/g, '')
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

  } else {

    var state = ''
    var city  = addrArr[addrArr.length - 1]


  }

  // switch (addrArr.length) {

  //   case 7:
  //     var city  = noStateCntry ? addrArr[1] : addrArr[1]
  //     var state = noStateCntry ? ''         : addrArr[2]
  //     break;
    
  //   case 6:
  //     var city  = noStateCntry ? addrArr[5] : addrArr[4]
  //     var state = noStateCntry ? ''         : addrArr[5]
  //     break;
    
  //   case 5:
  //     var city  = noStateCntry ? addrArr[4] : addrArr[3]
  //     var state = noStateCntry ? ''         : addrArr[4]
  //      break;
    
  //   case 4:
  //     var city  = noStateCntry ? addrArr[3] : addrArr[2]
  //     var state = noStateCntry ? ''         : addrArr[3]
  //      break;

  //   case 3:
  //     var city  = noStateCntry ? addrArr[2] : addrArr[1]
  //     var state = noStateCntry ? ''         : addrArr[2]
  //     break;
    
  //   case 2:
  //     var city  = noStateCntry ? addrArr[1] : addrArr[0]
  //     var state = noStateCntry ? ''         : addrArr[1]
  //     break;
    
  //   case 1:
  //     var city  = noStateCntry ? addrArr[0] : addrArr[0]
  //     var state = noStateCntry ? ''         : ''        
  //     break;

  //   default  :
  //   var city  = ''
  //   var state = ''
  //    break;

  // }

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


function distance(lat1, lon1, lat2, lon2, unit) {
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


function btnPlacesHtml() {

    
}


function btnTripsHtml() {

    
}