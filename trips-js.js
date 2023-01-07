
async function listTrips(title = "Trips") {

  modal(true)

  var trpOptions = readOption('trpFilter')
  var trpSelectFav = trpOptions.trpSelectFav

  await openTripsSheet()

  trpTitle = "Trips"
  
  var vals = trpVals

  for (var i=0;i<vals.length;i++) {

    vals[i].push(i)                    // idx xref
    
    vals[i].push(new Date(vals[i][trpHdrs.indexOf('Start Date')]))
  
  }

  var sortCol = vals[0] ? vals[0].length - 1 : 0    // in case of empty sheet.  ie. hdrs only

  trpVals = vals.sort(function(a,b){return a[sortCol] < b[sortCol] ? 1 : -1; });
  
  trpVals.forEach((val, idx, arr)=> arr[idx].pop()) // remove sort element from end of array
  
  var $tblSheets = $("#trpContainer > .d-none").eq(0)  // the 1st one is a template which is always d-none

  var x = $tblSheets.clone();
  $("#trpContainer").empty();
  x.appendTo("#trpContainer");

  trpIdxArr = []
  var arrIdx = 0
  var nbrDays = 0

  for (var j = 0; j < trpVals.length; j++) {

    var trpObj = makeObj(trpVals[j], trpHdrs)

    var x = trpVals[j].pop()                    // remove idx trpVals after sort
    trpIdxArr.push(x)                           // create parallel xref of idxs to sheet

   
    // var fav = trpObj['Favorite']
    // var Document = trpObj['Trip']


    var ele = $tblSheets.clone();

    ele.find('#trpDocument')[0].innerHTML = trpObj['Trip']
    ele.find('#trpCompositeKey')[0].innerHTML = trpObj['Composite Key']
    ele.find('#trpCompositeKey')[0].dataset.nbrdays = trpObj['Nbr Days']
    nbrDays += trpObj['Nbr Days']*1

    ele.find('#trpMoYr')[0].innerHTML = trpObj['Month']
    ele.find('#trpStartEndDate')[0].innerHTML = trpObj['Start Date'].slice(0,-5) + ' - ' + trpObj['End Date'].slice(0,-5)
    ele.find('#trpDestinations')[0].innerHTML = JSON.parse(trpObj['Destinations']).join(' - ')
    ele.find('#trpCountries')[0].innerHTML = JSON.parse(trpObj['Countries']).join(' - ')

    ele.find('#btnTrpEdit')[0].setAttribute("onclick", "editTrip(" + j + ")");

    ele.find('#btnTrpFavorite')[0].setAttribute("onclick", "setFavorite(" + j + ")");

    ele.find('#btnTrpShowDetail')[0].setAttribute("onclick", "showTrip(" + j + ")");


    // var boolFav = fav.toLowerCase() === 'true'

    // if (boolFav) {
    //   ele.find('#ScFavIcon')[0].innerHTML = "star"
    //   ele.find('#ScFavIcon').addClass('text-primary')
    // } else {
    //   ele.find('#ScFavIcon')[0].innerHTML = "star_outline"
    //   ele.find('#ScFavIcon').removeClass('text-primary')
    // }

    // if ( (trpSelectFav && !(fav.toLowerCase() === 'true')) ) {}
    // else
      ele.removeClass('d-none');


    ele.appendTo("#trpContainer");

    arrIdx++

  }

  gotoTab('Trips')

  var srchVal = $("#trpSearch").val().toLowerCase()
  var exc = srchVal.substr(0,1) == '-'
  
  $("#trpTitle").html(trpTitle)

  dispTrpNbrDays(vals.length, nbrDays)

  if (srchVal) {

      var nbrDays = 0

      $("#trpContainer #trpCompositeKey").filter(function() {

        var txt = $(this).text().toLowerCase()

        if (exc)    var toggle = txt.indexOf(srchVal.substring(1)) == -1
        else        var toggle = txt.indexOf(srchVal) > -1

        $(this).parent().parent().parent().toggle(toggle)     

        if (toggle && this.dataset.nbrdays) nbrDays += this.dataset.nbrdays*1
        console.log('this trips', $(this), toggle, this.dataset.nbrdays*1, nbrDays)


      });
      
      // $("#trpNbr").html(countDisplayed("trpContainer"))
      // $("#trpNbrDays").html(formatNumber(nbrDays) + ' days')
      dispTrpNbrDays(countDisplayed("trpContainer"), nbrDays)
      console.log('nbrDays init', nbrDays)
  }

  $('#trpContainer > div').click(function(e){         // highlight clicked row
    
    $('#trpContainer > div').removeClass('ele-selected');
    $(e.currentTarget).addClass('ele-selected')
    
  });

  modal(false)

}

function dispTrpNbrDays(nbrTrips, nbrDays) {

  $("#trpNbr").html(formatNumber(nbrTrips) + ' trips - ' + formatNumber(nbrDays) + ' days')


}
async function btnTrpMoreVertHtml() {

  var trpOptions = readOption('trpFilter')
  var trpSelectFav = trpOptions.trpSelectFav

  $('#trpSelectFav').prop("checked", trpSelectFav);

}

async function btnTrpSelectHtml(e) {

  var trpSelectFavVal = $('#trpSelectFav').prop('checked')

  await updateOption('trpFilter', {
    'trpSelectFav': trpSelectFavVal
  })

  listTrips(trpTitle)

}


async function setFavorite(arrIdx) {

  var favCurr = trpVals[arrIdx][trpHdrs.indexOf("Favorite")]

  if (trpEnc) {
    var x = await decryptMessage(favCurr)
    var fav = x.toLowerCase() === 'true'

    if (fav) {
      trpVals[arrIdx][trpHdrs.indexOf("Favorite")] = await encryptMessage("FALSE")
    } else {
      trpVals[arrIdx][trpHdrs.indexOf("Favorite")] = await encryptMessage("TRUE")
    }

  } else {
    var fav = favCurr.toLowerCase() === 'true'

    if (fav) {
      trpVals[arrIdx][trpHdrs.indexOf("Favorite")] = "FALSE"
    } else {
      trpVals[arrIdx][trpHdrs.indexOf("Favorite")] = "TRUE"
    }
  }

  var trpIdx = trpIdxArr[arrIdx]

  await updateSheetRow(trpVals[arrIdx], trpIdx, "Trips")

  updateUI(trpVals[arrIdx], arrIdx)

}


async function editTrip(arrIdx) {

  $("#trip-form")[0].reset();

  $("#trip-modal").modal('show');

  $('#trpmArrIdx').val(arrIdx)

  var vals = trpVals[arrIdx]

  var trpObj = makeObj(vals, trpHdrs)

  $('#trpmTrip').val(trpObj['Trip'])
  $('#trpmMonth').val(parseMonth(trpObj['Month']))
  setMSelVals('trpmType', JSON.parse(trpObj['Type']))
  $('#trpmStartDate').val(parseDateTime(trpObj['Start Date']).date)
  $('#trpmEndDate').val(parseDateTime(trpObj['End Date']).date)
  $('#trpmDestinations').val(JSON.parse(trpObj['Destinations']).join(' - '))
  $('#trpmCountries').val(JSON.parse(trpObj['Countries']).join(' - '))
  
  $('#btnTrpmDelete').removeClass('d-none')

  if (JSON.parse(trpObj['Destination Detail']).length == 0) {
    $('#btnTrpmBuildDest').prop('disabled', true);
  } else {
    $('#btnTrpmBuildDest').prop('disabled', false);
  }

  

}

async function btnTrpmSubmitSheetHtml() {

  if (!$('#trip-form').valid()) return

  var arrIdx = $('#trpmArrIdx').val() ? $('#trpmArrIdx').val()*1 : -1

  if (arrIdx > -1) {                                        // update existing trip

    var vals = trpVals[arrIdx]
    vals[trpHdrs.indexOf("Source")] = calcSource(vals)

  } else {                                                  // add new trip course

    var vals = []

    vals[trpHdrs.indexOf("Destination Detail")] = JSON.stringify([])
    vals[trpHdrs.indexOf("Source")] = 'Manual'

  }

  vals[trpHdrs.indexOf("Trip")] = $('#trpmTrip').val()
  vals[trpHdrs.indexOf("Month")] = formatMonth($('#trpmMonth').val())
  vals[trpHdrs.indexOf("Type")] = JSON.stringify(getMSelVals(document.getElementById('trpmType')))
  vals[trpHdrs.indexOf("Start Date")] = formatDateTime($('#trpmStartDate').val())
  vals[trpHdrs.indexOf("End Date")] = formatDateTime($('#trpmEndDate').val())
  vals[trpHdrs.indexOf("Destinations")] = JSON.stringify($('#trpmDestinations').val().split(' - '))
  vals[trpHdrs.indexOf("Countries")] = JSON.stringify($('#trpmCountries').val().split(' - '))
  vals[trpHdrs.indexOf("Nbr Days")] = calcNbrDays(vals[trpHdrs.indexOf("Start Date")], vals[trpHdrs.indexOf("End Date")])
  vals[trpHdrs.indexOf("Composite Key")] = $('#trpmTrip').val() + ' - ' + formatMonth($('#trpmMonth').val()) + ' - ' + $('#trpmDestinations').val() + ' - ' + $('#trpmCountries').val() + ' - ' + getMSelVals(document.getElementById('trpmType')).join(' - ')


  modal(true)

  var trpIdx = arrIdx == -1 ? -1 : trpIdxArr[arrIdx]  // get the row nbr on the sheet from trpIdxArr

  await updateSheetRow(vals, trpIdx, "Trips")

  $("#trip-modal").modal('hide');

  updateUI(vals, arrIdx)

  modal(false)
}

function calcSource(vals) {

// If Source was already Manual, it stays
if (vals[trpHdrs.indexOf("Source")] == "Manual") return "Manual"

// If any input field except Trip changes, change Source to Manual.  Other leave as LHD

if (vals[trpHdrs.indexOf("Month")] != formatMonth($('#trpmMonth').val()) ) return "Manual"
// if (vals[trpHdrs.indexOf("Type")] != JSON.stringify(getMSelVals(document.getElementById('trpmType')))) return "Manual"
if (vals[trpHdrs.indexOf("Start Date")] != formatDateTime($('#trpmStartDate').val())) return "Manual"
if (vals[trpHdrs.indexOf("End Date")] != formatDateTime($('#trpmEndDate').val())) return "Manual"
if (vals[trpHdrs.indexOf("Destinations")] != JSON.stringify($('#trpmDestinations').val().split(' - '))) return "Manual"
if (vals[trpHdrs.indexOf("Countries")] != JSON.stringify($('#trpmCountries').val().split(' - '))) return "Manual"
if (vals[trpHdrs.indexOf("Nbr Days")] != calcNbrDays(vals[trpHdrs.indexOf("Start Date")], vals[trpHdrs.indexOf("End Date")])) return "Manual"

return vals[trpHdrs.indexOf("Source")]

}

function getMSelVals(ele) {

  return Array.from(ele.selectedOptions).map(option => option.value)

}

function setMSelVals(element, arr) {

  var ele = document.getElementById(element)

  console.log('set', ele.options, arr)

  for (var i = 0; i < ele.options.length; i++) {

    ele.options[i].selected = arr.indexOf(ele.options[i].value) >= 0;

  }

}

async function updateUI (vals, arrIdx) {

// update trpVals conditionally encrypting
// update / append trpContainer ? sort ???
// update / append

  var arrIdx = arrIdx*1

  console.log("arrIdx", arrIdx)

  if (arrIdx == -1) {                               // add.  In this case, still use listTrips 

    // trpVals.push(valsEnc)
    // arrIdx = trpVals.length-1

    listTrips(trpTitle)
    return
  
  }

  // update. Update ui directly w/o listTrips
  trpVals[arrIdx] = vals

  $('#trpContainer #trpDocument').eq(arrIdx+1).html(vals[trpHdrs.indexOf("Trip")])        
  $('#trpContainer #trpMoYr').eq(arrIdx+1).html(vals[trpHdrs.indexOf("Month")])        
  $('#trpContainer #trpStartEndDate').eq(arrIdx+1).html(vals[trpHdrs.indexOf('Start Date')].slice(0,-5) + ' - ' + vals[trpHdrs.indexOf('End Date')].slice(0,-5))        
  $('#trpContainer #trpDestinations').eq(arrIdx+1).html(JSON.parse(vals[trpHdrs.indexOf("Destinations")]).join(' - '))        
  $('#trpContainer #trpCountries').eq(arrIdx+1).html(JSON.parse(vals[trpHdrs.indexOf("Countries")]).join(' - '))        
  $('#trpContainer #trpCompositeKey').eq(arrIdx+1).html(vals[trpHdrs.indexOf("Composite Key")])        
  
}

async function btnAddTripHtml() {

  console.log('tripform', $("#trip-form"))

  $("#trip-form")[0].reset();
  $("#trip-modal").modal('show');

   $('#btnTrpmDelete').addClass('d-none')

}

function btnTrpmBuildDestHtml() {

  var idx = $('#trpmArrIdx').val() * 1

  var vals = [...trpVals[idx]]

  var dests = JSON.parse(vals[trpHdrs.indexOf("Destination Detail")])

  var uniqueDests = []
  var uniqueCntrys = []

  dests.forEach( ele => {

    var city = ele.city
    var state = ele.state

    if (uniqueDests.indexOf(city) == -1) uniqueDests.push(city)
    if (uniqueCntrys.indexOf(state) == -1) uniqueCntrys.push(state)

  })

  var txt = ''

  if (uniqueDests.length > 0) txt = uniqueDests.join(' - ')
  $('#trpmDestinations').val(txt)
  if (uniqueCntrys.length > 0) txt = uniqueCntrys.join(' - ')
  $('#trpmCountries').val(txt)

}


async function btnTrpmDeleteSheetHtml() {

  var confirmOK = await confirm("Are you sure you want to delete this Trip ?")

  if (!confirmOK) return

  modal(true)


  var idx = trpIdxArr[$('#trpmArrIdx').val() * 1]

  var shtId = await getSheetId('Trips')

  var request = {
    "requests":
      [
        {
          "deleteDimension": {
            "range": {
              "sheetId": shtId,
              "dimension": "ROWS",
              "startIndex": idx + 1,
              "endIndex": idx + 2
            }
          }
        }
      ]
  }


  await gapi.client.sheets.spreadsheets.batchUpdate({
    spreadsheetId: spreadsheetId,
    resource: request

  }).then(response => {

    console.log('delete complete - ', idx)
    console.log(response)

  })

  $("#trip-modal").modal('hide');
  // $("#trip-modal").modal('dispose');

  modal(false)

  listTrips(trpTitle)

}

async function getSheetId(shtTitle) {

  var sheets = await gapi.client.sheets.spreadsheets.get({
        
    spreadsheetId: spreadsheetId
  
  }).then(function(response) {
    
    return response.result.sheets
  
  }, function(response) {
    console.log('Error: ' + response.result.error.message);
    return null

  });


  for (var j = 0; j < sheets.length; j++) {

    var sht = sheets[j].properties

    if (sht.title == shtTitle) return sht.sheetId

  }

  return null
}

function dupDocument(Document) {

  let arrDocuments = trpVals.map(a => a[trpHdrs.indexOf('Document')]);

  if (arrDocuments.indexOf(Document) > -1) {
    return true
  } else {
    return false
  }

}

async function openTripsSheet() {

  var objSht = await openShts(
    [
      { title: "Trips", type: "all" }
    ])

  trpHdrs = objSht["Trips"].colHdrs
  trpVals = objSht["Trips"].vals
  
}