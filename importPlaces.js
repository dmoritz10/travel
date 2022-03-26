function btnImportPlacesHtml() {

  gotoTab('ImportPlaces')


}

async function fetchPlaces(input) {

  console.log('fetchplaces',input.files)

  var files = input.files
  var placesArr = []

  if (files.length) {

    for (var i=0;i<files.length;i++) {  
      var fileContents = await readFile(files[i])
      var arr = formatPlace(fileContents)
      arr.forEach( ele => placesArr.push(ele))
      console.log('file', i)
    }
  } 

  console.log('places', placesArr)

  updateAppendSht(placesArr)

}

async function updateAppendSht(arr) {

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

  var objLHD = await openShts(
    [
      { title: 'Location History Detail', type: "all" }
    ])

    console.log("objLHD['Location History Detail']", objLHD['Location History Detail'])
  var arrLHD = objLHD['Location History Detail'].vals

  const hdrs = objLHD['Location History Detail'].colHdrs

  const UTCDateCol = hdrs.indexOf('UTC Date')
  const arrUTCDate = arrLHD.map(x => x[UTCDateCol]);

  var updateCntr = 0
  var appendCntr = 0

  for (var i = 0;i<arr.length;i++) {

    var ele = arr[i]

    console.log('ele', ele)

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

function formatPlace(json) {

var a = JSON.parse(json)

var DateTime = luxon.DateTime;
var b = a.timelineObjects

var arr = []

var cntr = 0

for (var i in b) {

    var type = Object.keys(b[i])[0]

    if (type == "placeVisit") {

        var x = b[i].placeVisit

        var ele = []

        var addr = x.location.address ? x.location.address.replace(/\n/g, ", ") : ''
        var cntry = addr ? addr.split(', ').pop() : ''

        console.log('lcn', x.location.address)
        console.log('addr', addr)
        console.log('cntry', cntry)

       
        var startDateTime = DateTime.fromISO(x.duration.startTimestamp)
        var dateTimeFormatted = startDateTime.toISODate()
        var endDateTime = DateTime.fromISO(x.duration.endTimestamp)

        var duration = DateTime.fromISO(x.duration.endTimestamp).diff(DateTime.fromISO(x.duration.startTimestamp))
        var DDHH = duration.toFormat("hh':'mm");

        ele[hdrs.indexOf('Name')]               = x.location.name ? x.location.name : x.location.placeId
        ele[hdrs.indexOf('Date')]               = dateTimeFormatted
        ele[hdrs.indexOf('UTC Date')]           = x.duration.startTimestamp
        ele[hdrs.indexOf('Duration')]           = DDHH
        ele[hdrs.indexOf('Place Id')]           = x.location.placeId
        ele[hdrs.indexOf('Place Confidence')]   = x.placeConfidence
        ele[hdrs.indexOf('Address')]            = addr
        ele[hdrs.indexOf('Country')]            = cntry
        ele[hdrs.indexOf('Lat')]                = x.centerLatE7
        ele[hdrs.indexOf('Lng')]                = x.centerLngE7
        ele[hdrs.indexOf('Id')]                 = x.location.placeId + x.duration.startTimestamp
        // ele[hdrs.indexOf('Info')]               = 'Info'
        ele[hdrs.indexOf('Info')]               = JSON.stringify(x)

        arr.push(ele)

        cntr++
    }

}

console.log('cntr', cntr)
console.log('arr', arr)

return arr


}

function btnPlacesHtml() {

    
}


function btnTripsHtml() {

    
}