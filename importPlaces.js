function btnImportPlacesHtml() {

  gotoTab('ImportPlaces')


}

async function fetchPlaces(input) {

  console.log('fetchplaces',input.files)

  var objLHD = await openShts(
    [
      { title: 'Location History Detail', type: "all" }
    ])


  var files = input.files
  var placesArr = []

  if (files.length) {

    for (var i=0;i<files.length;i++) {  
      var fileContents = await readFile(files[i])
      var arr = formatPlace(fileContents, objLHD)
      arr.forEach( ele => placesArr.push(ele))
    }
  } 

  updateAppendSht(placesArr, objLHD)

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

  await updateSheet('Location History Detail', shtArr)

}

async function buildTrips(arr, hdrs) {

  // Sort by Date
  // If Distance > 50

  var dateCol = hdrs.indexOf('Date')
  var dateUTCCol = hdrs.indexOf('UTC Date')
  var tripCol = hdrs.indexOf('Trip')
  var distCol = hdrs.indexOf('Distance')
  var stateCol = hdrs.indexOf('State')
  var cntryCol = hdrs.indexOf('Country')

  arr.sort(function(a,b) {return a[dateUTCCol]-b[dateUTCCol]});

  var trip = null

  for (i=i;i<arr.length;i++) {

    var ele = arr[i]

    if (ele[distCol] > 50) {

      if (!trip) {

        var mo = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Jan', 'Jan', ][ele[dateCol].substring(6,7)]

        if (ele[cntryCol] == "USA") {

          trip = ele[stateCol] + ' - ' + mo + ' ' + ele[dateCol].substring(0,4)

        } else {

          trip = ele[cntryCol] + ' - ' + mo + ' ' + ele[dateCol].substring(0,4)
        
        }

      }


      arr[i][tripCol] = trip

    } else {

      trip = null

    }


  }


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

function formatPlace(json, objLHD) {

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

        var addrArr = addr.split(', ')
        var city    = addrArr.length > 3 ? addrArr[1] : addrArr[0]
        // var state   = addrArr.length > 3 ? addrArr[2].replace(/[0-9]/g, '').replace(/-/g, '').trim() : addrArr[1].replace(/[0-9]/g, '').replace(/-/g, '').trim();
        var state   = cleanState(addrArr)

        var cntry   = cleanCntry(addrArr)

        var startDateTime = DateTime.fromISO(x.duration.startTimestamp)
        var dateTimeFormatted = startDateTime.toISODate()

        var duration = DateTime.fromISO(x.duration.endTimestamp).diff(DateTime.fromISO(x.duration.startTimestamp))
        var DDHH = duration.toFormat("hh':'mm");

        ele[hdrs.indexOf('Name')]               = x.location.name ? x.location.name : x.location.placeId
        ele[hdrs.indexOf('Date')]               = dateTimeFormatted
        ele[hdrs.indexOf('UTC Date')]           = x.duration.startTimestamp
        ele[hdrs.indexOf('Duration')]           = DDHH
        ele[hdrs.indexOf('Place Id')]           = x.location.placeId
        ele[hdrs.indexOf('Place Confidence')]   = x.placeConfidence
        ele[hdrs.indexOf('Address')]            = addr
        ele[hdrs.indexOf('City')]               = city
        ele[hdrs.indexOf('State')]              = state
        ele[hdrs.indexOf('Country')]            = cntry
        ele[hdrs.indexOf('Lat')]                = x.centerLatE7
        ele[hdrs.indexOf('Lng')]                = x.centerLngE7
        ele[hdrs.indexOf('Distance')]           = Math.round(distance(homeLat, homeLng, x.centerLatE7/10**7, x.centerLngE7/10**7, 'M'))
        // ele[hdrs.indexOf('Info')]               = 'Info'
        ele[hdrs.indexOf('Info')]               = JSON.stringify(x)

        arr.push(ele)

        cntr++
    }

}

console.log('cntr', cntr)
// console.log('arr', arr)

return arr


}

function cleanState(arr) {

  console.log('addrArr', arr, arr.length)

  var addrArr = []

  for (i=0;i<arr.length;i++) {

    let wrk = arr[i]
    wrk = wrk.replace(/[0-9]/g, '')
    wrk = wrk.replace(/-/g, '')
    wrk = wrk.trim()

    if (wrk) addrArr.push(wrk)

  }

  console.log('addrArr', addrArr, addrArr.length)

  if (addrArr.length < 2) return ''

  switch (addrArr.length) {

    case 6:
      var wrk = addrArr[4]
      break;
    
    case 5:
      var wrk = addrArr[3]
      break;
    
    case 4:
      var wrk = addrArr[2]
      break;

    case 3:
      var wrk = addrArr[1]
      break;
    
    default  :
      var wrk = addrArr[0]
      break;

  }

  // wrk = wrk.replace(/[0-9]/g, '')
  // wrk = wrk.replace(/-/g, '')
  // wrk = wrk.trim()

  return wrk

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