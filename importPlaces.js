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

  console.log('updateAppendSht')
  console.log('arr', arr.length)
  console.log('arrLHD', arrLHD)
  console.log('updateCntr', updateCntr)
  console.log('appendCntr', appendCntr)
  console.log('total', appendCntr + updateCntr)

  var shtArr = [hdrs].concat(arrLHD)

  await updateSheet('Location History Detail', shtArr)

}

async function fetchLHD() {

  var objSht = await openShts(
    [
      { title: title, type: "all" }
    ])


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
        var city = addrArr > 3 ? addrArr[1] : addrArr[0]
        var state = addrArr > 3 ? addrArr[2] : addrArr[1]

        var cntry = cleanCntry(addrArr)

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