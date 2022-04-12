
async function listReservations(title = "Reservations") {

  modal(true)

  var resOptions = readOption('resFilter')
  var resSelectFav = resOptions.resSelectFav

  var objSht = await openShts(
    [
      { title: "Reservations", type: "all" }
    ])

  console.log('objSht', objSht)

  resTitle = "Reservations"
  
  resHdrs = objSht[resTitle].colHdrs
  resVals = objSht[resTitle].vals
  
  var vals = resVals

  for (var i=0;i<vals.length;i++) {

    vals[i].push(i)                    // idx xref
    
    vals[i].push(new Date(vals[i][resHdrs.indexOf('Start Date')]))
  
  }

  var sortCol = vals[0] ? vals[0].length - 1 : 0    // in case of empty sheet.  ie. hdrs only

  resVals = vals.sort(function(a,b){return a[sortCol] < b[sortCol] ? 1 : -1; });
  
  resVals.forEach((val, idx, arr)=> arr[idx].pop()) // remove sort element from end of array
  

  $("#resTitle").html(resTitle)
  $("#resNbr").html(vals.length)

  var $tblSheets = $("#resContainer > .d-none").eq(0)  // the 1st one is a template which is always d-none

  var x = $tblSheets.clone();
  $("#resContainer").empty();
  x.appendTo("#resContainer");

  resIdxArr = []

  for (var j = 0; j < resVals.length; j++) {

    var resObj = makeObj(resVals[j], resHdrs)

    var x = resVals[j].pop()                    // remove idx resVals after sort
    resIdxArr.push(x)                           // create parallel xref of idxs to sheet

   
    var fav = resObj['Favorite']
    var Document = resObj['Reservations']


    var ele = $tblSheets.clone();

    ele.find('#resReservation')[0].innerHTML = resObj['Reservation']
    ele.find('#resCompositeKey')[0].innerHTML = resObj['Composite Key']

    ele.find('#resTrip')[0].innerHTML = resObj['Trip']
    ele.find('#resStartEndDateTime')[0].innerHTML = resObj['Start Date'].slice(0,-5) + ' - ' + resObj['End Date'].slice(0,-5)
    ele.find('#resStatus')[0].innerHTML = resObj['Status']
    ele.find('#resLocation')[0].innerHTML = resObj['Location']
    ele.find('#resDescription')[0].innerHTML = resObj['Description']

    ele.find('#btnResEdit')[0].setAttribute("onclick", "editReservation(" + j + ")");

    ele.find('#btnResFavorite')[0].setAttribute("onclick", "setFavorite(" + j + ")");

    ele.find('#btnResShowDetail')[0].setAttribute("onclick", "showReservation(" + j + ")");


    // var boolFav = fav.toLowerCase() === 'true'

    // if (boolFav) {
    //   ele.find('#ScFavIcon')[0].innerHTML = "star"
    //   ele.find('#ScFavIcon').addClass('text-primary')
    // } else {
    //   ele.find('#ScFavIcon')[0].innerHTML = "star_outline"
    //   ele.find('#ScFavIcon').removeClass('text-primary')
    // }

    // if ( (resSelectFav && !(fav.toLowerCase() === 'true')) ) {}
    // else
      ele.removeClass('d-none');


    ele.appendTo("#resContainer");

  }

  gotoTab('Reservations')

  var srchVal = $("#resSearch").val()

  console.log('srchVal', srchVal)

  if (srchVal) {

      $("#resContainer #resCompositeKey").filter(function() {

        $(this).parent().parent().parent().toggle($(this).text().toLowerCase().indexOf(srchVal.toLowerCase()) > -1)
      });
      
      $("#resNbr").html(countDisplayed("resContainer"))
   
  }

  $('#resContainer > div').click(function(e){         // highlight clicked row
    
    $('#resContainer > div').removeClass('ele-selected');
    $(e.currentTarget).addClass('ele-selected')
    
  });

  modal(false)

}

async function btnResMoreVertHtml() {

  var resOptions = readOption('resFilter')
  var resSelectFav = resOptions.resSelectFav

  $('#resSelectFav').prop("checked", resSelectFav);

}

async function btnResSelectHtml(e) {

  var resSelectFavVal = $('#resSelectFav').prop('checked')

  await updateOption('resFilter', {
    'resSelectFav': resSelectFavVal
  })

  listReservations(resTitle)

}

async function setFavorite(arrIdx) {

  var favCurr = resVals[arrIdx][resHdrs.indexOf("Favorite")]

  if (resEnc) {
    var x = await decryptMessage(favCurr)
    var fav = x.toLowerCase() === 'true'

    if (fav) {
      resVals[arrIdx][resHdrs.indexOf("Favorite")] = await encryptMessage("FALSE")
    } else {
      resVals[arrIdx][resHdrs.indexOf("Favorite")] = await encryptMessage("TRUE")
    }

  } else {
    var fav = favCurr.toLowerCase() === 'true'

    if (fav) {
      resVals[arrIdx][resHdrs.indexOf("Favorite")] = "FALSE"
    } else {
      resVals[arrIdx][resHdrs.indexOf("Favorite")] = "TRUE"
    }
  }

  var resIdx = resIdxArr[arrIdx]

  await updateSheetRow(resVals[arrIdx], resIdx)

  updateUI(resVals[arrIdx], arrIdx)

}


async function editReservation(arrIdx) {

  modal(true)

  $("#reservation-form")[0].reset();

  $("#reservation-modal").modal('show');

  $('#resmArrIdx').val(arrIdx)

  var vals = resVals[arrIdx]

  var resObj = makeObj(vals, resHdrs)

  console.log('hi dan')
  console.log(resObj)

  $('#resmReservation').val(resObj['Reservation'])
  $('#resmTrip').val(resObj['Trip'])
  $('#resmSource').val(resObj['Source'])
  $('#resmLocation').val(resObj['Location'])
  $('#resmStartDateTime').val(parseDateTime(resObj['Start Date']).date)
  $('#resmEndDateTime').val(parseDateTime(resObj['End Date']).date)
  $('#resmDescription').val(resObj['Description'])
  
  $('#btnResmDelete').removeClass('d-none')

  modal(false)

}

async function btnResmSubmitSheetHtml() {

  // if (!$('#trip-form').valid()) return

  var arrIdx = $('#resmArrIdx').val() ? $('#resmArrIdx').val()*1 : -1

  if (arrIdx > -1) {                                                       // update existing course

    var vals = [...resVals[arrIdx]]

    vals[resHdrs.indexOf("Reservation")] = $('#resmReservation').val()
    vals[resHdrs.indexOf("Month")] = formatMonth($('#resmMonth').val())
    vals[resHdrs.indexOf("Type")] = $('#resmType').val()
    vals[resHdrs.indexOf("Start Date")] = formatDateTime($('#resmStartDate').val())
    vals[resHdrs.indexOf("End Date")] = formatDateTime($('#resmEndDate').val())
    vals[resHdrs.indexOf("Destinations")] = JSON.stringify($('#resmDestinations').val().split(' - '))
    vals[resHdrs.indexOf("Source")] = 'Manual'
    vals[resHdrs.indexOf("Nbr Days")] = calcNbrDays(vals[resHdrs.indexOf("Start Date")], vals[resHdrs.indexOf("End Date")])

  } else {

    // if (dupDocument($('#resmDocument').val())) {
    //   toast("Document already exists")
    //   return
    // }

    var vals = []

    vals[resHdrs.indexOf("Reservation")] = $('#resmReservation').val()
    vals[resHdrs.indexOf("Month")] = formatMonth($('#resmMonth').val())
    vals[resHdrs.indexOf("Type")] = $('#resmType').val()
    vals[resHdrs.indexOf("Start Date")] = formatDateTime($('#resmStartDate').val())
    vals[resHdrs.indexOf("End Date")] = formatDateTime($('#resmEndDate').val())
    vals[resHdrs.indexOf("Destinations")] = JSON.stringify($('#resmDestinations').val().split(' - '))
    vals[resHdrs.indexOf("Source")] = 'Manual'
    vals[resHdrs.indexOf("Destination Detail")] = JSON.stringify([])
    vals[resHdrs.indexOf("Composite Key")] = $('#resmReservation').val() + ' - ' + formatMonth($('#resmMonth').val())
    vals[resHdrs.indexOf("Nbr Days")] = calcNbrDays(vals[resHdrs.indexOf("Start Date")], vals[resHdrs.indexOf("End Date")])


  }

  modal(true)

  var resIdx = arrIdx == -1 ? -1 : resIdxArr[arrIdx]  // get the row nbr on the sheet from resIdxArr


  await updateSheetRow(vals, resIdx)


  $("#trip-modal").modal('hide');

  updateUI(vals, arrIdx)

  modal(false)
}


async function updateUI (vals, arrIdx) {

// update resVals conditionally encrypting
// update / append resContainer ? sort ???
// update / append

  var arrIdx = arrIdx*1

  console.log("arrIdx", arrIdx)

  if (arrIdx == -1) {                               // add.  In this case, still use listReservations 

    // resVals.push(valsEnc)
    // arrIdx = resVals.length-1

    listReservations(resTitle)
    return
  
  }

  // update. Update ui directly w/o listReservations
  resVals[arrIdx] = vals

  $('#resContainer #resDocument').eq(arrIdx+1).html(vals[resHdrs.indexOf("Reservation")])        
  $('#resContainer #resMoYr').eq(arrIdx+1).html(vals[resHdrs.indexOf("Month")])        
  $('#resContainer #resStartEndDate').eq(arrIdx+1).html(vals[resHdrs.indexOf('Start Date')].slice(0,-5) + ' - ' + vals[resHdrs.indexOf('End Date')].slice(0,-5))        
  $('#resContainer #resDestinations').eq(arrIdx+1).html(JSON.parse(vals[resHdrs.indexOf("Destinations")]).join(' - '))        
  
}

async function btnAddReservationHtml() {

  $("#reservation-form")[0].reset();
  $("#reservation-modal").modal('show');

   $('#btnResmDelete').addClass('d-none')

}

async function btnResmDeleteSheetHtml() {

  var confirmOK = await confirm("Are you sure you want to delete this Reservation ?")

  if (!confirmOK) return

  modal(true)


  var idx = resIdxArr[$('#resmArrIdx').val() * 1]

  console.log('btnResmDelete',idx,$('#resmArrIdx').val(), resIdxArr)

  var shtId = await getSheetId('Reservations')

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

  listReservations(resTitle)

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

  let arrDocuments = resVals.map(a => a[resHdrs.indexOf('Document')]);

  if (arrDocuments.indexOf(Document) > -1) {
    return true
  } else {
    return false
  }

}






async function importFromCalendar() {


    
        var timeMin = '2022-05-05T10:00:00-07:00'
        var timeMax = '2022-05-25T10:00:00-07:00'
   
      await checkAuth()
      var request = await gapi.client.calendar.events.list({
          
        'calendarId': 'christinamoritz@gmail.com',
        'maxResults': 1000,
        'singleEvents': true,
        'orderBy': 'startTime',
        'timeMin': timeMin,
        'timeMax': timeMax
        
      });
  
      var eventId = request.result.id

      console.log(request.result)
  
      var timeMin = '2022-04-04T10:00:00-07:00'
      var timeMax = '2022-04-08T10:00:00-07:00'

      await checkAuth()
      var request = await gapi.client.calendar.events.list({
          
        'calendarId': 'dmoritz10@gmail.com',
        'maxResults': 1000,
        'singleEvents': true,
        'orderBy': 'startTime',
        'timeMin': timeMin,
        'timeMax': timeMax
        
      });
  
      var eventId = request.result.id

      console.log(request.result)
  



}