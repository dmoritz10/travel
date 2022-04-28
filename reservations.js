
async function listReservations(title = "Reservations") {

  modal(true)

  var resOptions = readOption('resFilter')
  var resHidePast = resOptions.resHidePast
  var resShowCal = resOptions.resShowCal

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
    
    // vals[i].push(new Date(vals[i][resHdrs.indexOf('Start Date')]))
  
  }

  // var sortCol = vals[0] ? vals[0].length - 1 : 0    // in case of empty sheet.  ie. hdrs only

  var sortCol = resHdrs.indexOf('Start Date')

  resVals = vals.sort(function(a,b){return a[sortCol] > b[sortCol] ? 1 : -1; });
  
  // resVals.forEach((val, idx, arr)=> arr[idx].pop()) // remove sort element from end of array
  

  $("#resTitle").html(resTitle)
  $("#resNbr").html(vals.length)

  var $tblSheets = $("#resContainer > .d-none").eq(0)  // the 1st one is a template which is always d-none

  var x = $tblSheets.clone();
  $("#resContainer").empty();
  x.appendTo("#resContainer");

  resIdxArr = []

  for (var j = 0; j < resVals.length; j++) {

    var resObj = makeObj(resVals[j], resHdrs)

    var arrIdx = resVals[j].pop()                    // remove idx resVals after sort
    resIdxArr.push(arrIdx)                           // create parallel xref of idxs to sheet

   
    var ele = $tblSheets.clone();

    ele.find('#resReservation')[0].innerHTML = resObj['Reservation']
    ele.find('#resCompositeKey')[0].innerHTML = resObj['Composite Key']

    var st = DateTime.fromISO(resObj['Start Date']).toLocaleString(DateTime.DATETIME_SHORT)
    var stArr = st.split(', ')
    stmd = stArr[0].substring(0, st.lastIndexOf('/'))
    var start = stArr[1] == '12:00 AM' ? stmd : stmd + ', ' + stArr[1]

    if (resObj['End Date']) {
      var et = DateTime.fromISO(resObj['End Date']).toLocaleString(DateTime.DATETIME_SHORT)
      var etArr = et.split(', ')
      var end = etArr[1] == '12:00 AM' ? etArr[0] : et
    } else {
      var end = ''
    }

    var locn = resObj['Location']
    var uriLocn = encodeURIComponent( locn )
    var locnHtml = locn ? `<a href='https://maps.google.com/maps?q=${uriLocn}' target='_blank'>${locn}</a>` : ""

    ele.find('#resArrIdx')[0].innerHTML = j
    ele.find('#resTrip')[0].innerHTML = resObj['Trip']
    ele.find('#resType')[0].innerHTML = resObj['Type']
    ele.find('#resStartEndDateTime')[0].innerHTML = start + (end ? (' - ' + end) : '')
    ele.find('#resStatus')[0].innerHTML = resObj['Status']
    ele.find('#resLocation')[0].innerHTML = locnHtml
    ele.find('#resDescription')[0].innerHTML = resObj['Description'] ? resObj['Description'].replace(/\n/g, "<br>") : ''

    ele.find('#btnResEdit')[0].setAttribute("onclick", "editReservation(" + j + ")");

    ele.find('#btnResFavorite')[0].setAttribute("onclick", "setFavorite(" + j + ")");

   setSmsHref ({
      eventTitle: resObj['Reservation'],
      startDate:  start,
      endDate:    end,
      element:    ele.find('#btnResSms')
    })


    var dt = resObj['End Date'] ? new Date(resObj['End Date']) : new Date(resObj['Start Date'])

    if  (resHidePast && dt < new Date() ) {} 
    else ele.removeClass('d-none');
      
    ele.appendTo("#resContainer");

  }


  gotoTab('Reservations')

  if (resShowCal) btnShowCalendarHtml()
  else            $('#resCalendar').empty()


  var srchVal = $("#resSearch").val().toLowerCase()

  var exc = srchVal.substr(0,1) == '-'

  if (srchVal) {

      $("#resContainer #resCompositeKey").filter(function() {

        var txt = $(this).text().toLowerCase()
        
        if (exc)    var toggle = txt.indexOf(srchVal.substring(1)) == -1
        else        var toggle = txt.indexOf(srchVal) > -1

        $(this).parent().parent().parent().toggle(toggle)     
      
        $("#resNbr").html(countDisplayed("resContainer"))
   
      })

    }

  $('#resContainer > div').click(function(e){         // highlight clicked row
    
    $('#resContainer > div').removeClass('ele-selected');
    $(e.currentTarget).addClass('ele-selected')
    
  });

  modal(false)

}

async function btnResMoreVertHtml() {

  var resOptions = readOption('resFilter')
  var resHidePast = resOptions.resHidePast
  var resShowCal = resOptions.resShowCal

  $('#resHidePast').prop("checked", resHidePast);
  $('#resShowCal').prop("checked", resShowCal);

}

async function btnResSelectHtml(e) {

  var resHidePastVal = $('#resHidePast').prop('checked')
  var resShowCalVal = $('#resShowCal').prop('checked')

  await updateOption('resFilter', {
    'resHidePast': resHidePastVal,
    'resShowCal': resShowCalVal

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

  await updateSheetRow(resVals[arrIdx], resIdx, "Reservations")

  // updateUI(resVals[arrIdx], arrIdx)

}


async function editReservation(arrIdx) {

  modal(true)

  $("#reservation-form")[0].reset();

  $("#reservation-modal").modal('show');

  $('#resmArrIdx').val(arrIdx)

  var vals = resVals[arrIdx]

  var resObj = makeObj(vals, resHdrs)

  console.log(resObj)

  $('#resmReservation').val(resObj['Reservation'])
  $('#resmTrip').val(resObj['Trip'])
  $('#resmType').val(resObj['Type'])
  $('#resmStatus').val(resObj['Status'])
  $('#resmSource').val(resObj['Source'])
  $('#resmLocation').val(resObj['Location'])
  $('#resmStartDateTime').val(resObj['Start Date'])
  $('#resmEndDateTime').val(resObj['End Date'])
  $('#resmDescription').val(resObj['Description'])

  buildTripList('resmTripsList')
  
  $('#btnResmDelete').removeClass('d-none')
  // $('#resmReservation').focus()

  modal(false)

}

function buildTripList(listId) {

  var trips = resVals.map(x => x[resHdrs.indexOf('Trip')])

  var uniqueTrips = [...new Set(trips)].sort()

  $("#" + listId).empty();

  $.each(uniqueTrips, function(i, item) {
    $("#" + listId).append($("<option>").text(item));
  });

}

async function btnResmSubmitSheetHtml() {

  if (!$('#reservation-form').valid()) return

  var arrIdx = $('#resmArrIdx').val() ? $('#resmArrIdx').val()*1 : -1

  if (arrIdx > -1) {                                                       // update existing course

    var vals = resVals[arrIdx]

  } else {

    var vals = []

  }

  vals[resHdrs.indexOf("Reservation")]    = $('#resmReservation').val()
  vals[resHdrs.indexOf("Trip")]           = $('#resmTrip').val()
  vals[resHdrs.indexOf("Type")]           = $('#resmType').val()
  vals[resHdrs.indexOf("Status")]         = $('#resmStatus').val()
  vals[resHdrs.indexOf("Source")]         = $('#resmSource').val()
  vals[resHdrs.indexOf("Location")]       = $('#resmLocation').val()
  vals[resHdrs.indexOf("Start Date")]     = $('#resmStartDateTime').val()
  vals[resHdrs.indexOf("End Date")]       = $('#resmEndDateTime').val()
  vals[resHdrs.indexOf("Description")]    = $('#resmDescription').val()
  vals[resHdrs.indexOf("Composite Key")]  = $('#resmReservation').val() + ' - ' + $('#resmTrip').val() + ' - ' + $('#resmType').val() + ' - ' + $('#resmLocation').val() + ' - ' + $('#resmStatus').val()

  modal(true)

  var resIdx = arrIdx == -1 ? -1 : resIdxArr[arrIdx]  // get the row nbr on the sheet from resIdxArr


  await updateSheetRow(vals, resIdx, "Reservations")


  $("#reservation-modal").modal('hide');

  listReservations(resTitle)

  // updateUI(vals, arrIdx)

  modal(false)
}


// async function updateUI (vals, arrIdx) {

// // update resVals conditionally encrypting
// // update / append resContainer ? sort ???
// // update / append

//   var arrIdx = arrIdx*1

//   console.log("arrIdx", arrIdx)

//   // if (arrIdx == -1) {                               // add.  In this case, still use listReservations 

//     // resVals.push(valsEnc)
//     // arrIdx = resVals.length-1

//     listReservations(resTitle)
//     return
  
//   // }

//   // update. Update ui directly w/o listReservations
//   resVals[arrIdx] = vals

//   $('#resContainer #resDocument').eq(arrIdx+1).html(vals[resHdrs.indexOf("Reservation")])        
//   $('#resContainer #resMoYr').eq(arrIdx+1).html(vals[resHdrs.indexOf("Month")])        
//   $('#resContainer #resStartEndDate').eq(arrIdx+1).html(vals[resHdrs.indexOf('Start Date')].slice(0,-5) + ' - ' + vals[resHdrs.indexOf('End Date')].slice(0,-5))        
//   $('#resContainer #resDestinations').eq(arrIdx+1).html(JSON.parse(vals[resHdrs.indexOf("Destinations")]).join(' - '))        
  
// }

async function btnAddReservationHtml() {

  $("#reservation-form")[0].reset();
  $("#reservation-modal").modal('show');

  $('#resmSource').val('Manual')

  buildTripList('resmTripsList')

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

  $("#reservation-modal").modal('hide');
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

async function makeReservationsFromCalendarEvents() {

  var objSht = await openShts(
    [
      { title: "Reservations", type: "all" },
      { title: "Calendar Events", type: "all" }

    ])

  console.log('objSht', objSht)

  var resTitle = "Reservations"
  var resHdrs = objSht[resTitle].colHdrs
  var resVals = objSht[resTitle].vals
  
  var ceTitle = "Calendar Events"
  var ceHdrs = objSht[ceTitle].colHdrs
  var ceVals = objSht[ceTitle].vals
  
  var vals = ceVals

  var nbrRejected = 0
  var nbrAccepted = 0

  var defaultTrip = ''

  for (var i=0;i<vals.length;i++) {

    var ceObj = makeObj(vals[i], ceHdrs)

    if (ceObj.reviewed) continue              // has already been accepted or rejected

    var msg = "Add this event to your Reservations ?<br><br>" +
              ceObj.summary + '<br>' + DateTime.fromISO(ceObj.start).toLocaleString(DateTime.DATETIME_SHORT);

    var trip = await promptTrip(msg, defaultTrip)

    console.log('trip', trip)

    if (trip == null) {

      nbrRejected++
      await markEvent('rejected', i, vals[i], ceHdrs)
    
    } else {

      nbrAccepted++
      await addToReservations(vals[i], trip, ceHdrs, resHdrs)
      await markEvent('accepted', i, vals[i], ceHdrs)
      defaultTrip = trip

    }
    
  }

  console.log('nbrAccepted', nbrAccepted)
  console.log('nbrRejected', nbrRejected)

}

function promptTrip(msg, defaultVal) {

  return new Promise(resolve => {
 
    bootbox.prompt({
    
      title: msg,
      onEscape: false,
      closeButton: false,
      value: defaultVal ? defaultVal : '',
      callback: function(result){ resolve(result)},
      buttons: {
        cancel: {
            label: "no",
            className: 'btn-primary'
        },

        confirm: {
          label: "yes",
          className: 'btn-primary'
          }
        }
      });

  })

}

async function markEvent(status, i, vals, ceHdrs) {



  vals[ceHdrs.indexOf('reviewed')] = status

console.log('vals', vals, ceHdrs.indexOf('reviewed'))

  await updateSheetRow(vals, i, "Calendar Events")

}

async function addToReservations(vals, trip, ceHdrs, resHdrs) {

  var resVals = []

  var startDate = vals[ceHdrs.indexOf('start')].length == 10 ? vals[ceHdrs.indexOf('start')] + 'T00:00:00' : vals[ceHdrs.indexOf('start')].slice(0,-6)
  var endDate = vals[ceHdrs.indexOf('end')].length == 10 ? vals[ceHdrs.indexOf('end')] + 'T00:00:00' : vals[ceHdrs.indexOf('end')].slice(0,-6)
  
  resVals[resHdrs.indexOf('Trip')] = trip
  resVals[resHdrs.indexOf('Reservation')] = vals[ceHdrs.indexOf('summary')]
  resVals[resHdrs.indexOf('Start Date')] = startDate
  resVals[resHdrs.indexOf('End Date')] = endDate
  resVals[resHdrs.indexOf('Source')] = 'Calendar'
  resVals[resHdrs.indexOf('Location')] = vals[ceHdrs.indexOf('location')]
  resVals[resHdrs.indexOf('Description')] = vals[ceHdrs.indexOf('description')]
  resVals[resHdrs.indexOf('Status')] = vals[ceHdrs.indexOf('status')]
  resVals[resHdrs.indexOf('Composite Key')] = vals[ceHdrs.indexOf('summary')] + ' - ' + trip

  //Reservation	Trip	Start Date	End Date	Source	Status	Location	Description	Composite Key

  await updateSheetRow(resVals, -1, "Reservations")

}


function readFromClpbrd(ele) {

  var $ele = $('#' + ele)


  navigator.clipboard.readText().then(function(txt) {
    
    var type = $ele.attr('type');

    if (type == 'datetime-local') {
      
      var sh = sherlockToHtml(txt)
      $ele.val(sh.startDate)

    } else {

     $ele.val(txt)

    }


  }, function(err) {
      console.error('Async: Could not paste text: ', err);
  });

}

function sherlock(ele) {

  var txt = $('#' + ele).val()

  console.log('sherlock', txt)

  var sh = sherlockToHtml(txt)

  console.log(sh)

  if (sh.eventTitle) {

    $('#resmReservation').val(sh.eventTitle)

  }

  if (sh.startDate) {
    
    $('#resmStartDateTime').val(sh.startDate)

  }

  if (sh.endDate) {

    $('#resmEndDateTime').val(sh.endDate)

  }

}

function sherlockToHtml(txt) {

  var sh = Sherlock.parse(txt)
  var endDt = DateTime.fromJSDate(new Date(sh.endDate)).toISO().slice(0,-13)
  var strDt = DateTime.fromJSDate(new Date(sh.startDate)).toISO().slice(0,-13)

  return {

    eventTitle: sh.eventTitle,
    startDate:  strDt,
    endDate:    endDt

  }

}

async function setSmsHref(d) {

    if (d.eventTitle.substr(0,7).toLowerCase() == "flight ") {

      var dt1 = "Dep: " + d.startDate
      var dt2 = "Arr: " + d.endDate

    } else {

      var dt1 = d.startDate
      var dt2 = d.endDate

    }

    var txtBody = d.eventTitle + '%0a' + dt1 + '%0a' + dt2

    d.element.prop('disabled', false)
    d.element.prop('href', 'sms:' + '' + "?body=" + txtBody  )
          
}


function btnPrintResHtml () {

  var eleArr = [...$('#resContainer > div')].slice(1)      // remove the templace

  var resRpt = []

  for (let i=0; i<eleArr.length;i++) {

    var $ele = $(eleArr[i])

    if ($ele.hasClass('d-none') || $ele.css('display') == 'none') continue
 
    var eleC = $ele.children()

    var res = '<h4>' + eleC[0].innerText.slice(0,-13) + '</h4><br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp' + eleC[2].innerText

    var dtl = eleC[1].innerText + '<br>' + eleC[3].innerText + '<br>' + eleC[4].innerText + '<br>' + eleC[5].innerText
      
    resRpt.push({
        
      'Reservation':  res,
      'Detail':       dtl

    })

  }

  printJS({
    
    printable:        resRpt,
    properties:       [ 'Reservation', 'Detail' ],
    type:             'json',
    targetStyles:     ["*"], //accepts all the styles
    targetStyle:      ["*"], 
    style:            'body { font-family:arial; }',
    gridHeaderStyle:  'font-family:arial;font-size: 18px; border-bottom: 2px solid darkgrey;',
    gridStyle:        'border-bottom: 4px solid lightgrey;'
      
  })

}

function btnShowCalendarHtml() {

  var calendarEl = document.getElementById('resCalendar');

  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView:          'dayGridMonth',
    themeSystem:          'bootstrap5',
    editable:             false,
    headerToolbar: {
      left:               'title',
      right:              'prev,next' 
    },

    eventClick: function(info) {
      console.log('info: ', info);

      var eleArr = [...$('#resContainer > div')].slice(1)

      console.log('eleArr', eleArr)

      var id = info.event._def.publicId

      console.log('id', id)

      var $ele = $(eleArr[id])

      eleArr[id].click()

      eleArr[id].scrollIntoView({
        behavior: "smooth", // or "auto" or "instant"
        block: "end" // or "end"
    })

      $(eleArr[id]).scrollTop(300);

      return
      
      var idx = info.event.id
      console.log(idx)
      
      var resObj = makeObj(resVals[idx], resHdrs)

      console.log('info: ', info);

      var rpt = []
      rpt.push(['Trip', resObj['Trip'] ])
      rpt.push(['Type', resObj['Type'] + ' - ' + resObj['Status']])
      rpt.push(['Start', formatISODate(resObj['Start Date'])])
      rpt.push(['End', formatISODate(resObj['End Date'])])
      rpt.push(['', resObj['Description']])
    
    var tbl = new Table();
    
    tbl
      .setHeader()
      .setTableHeaderClass()
      .setData(rpt)
      .setTableClass('table table-borderless')
      .setTrClass('d-flex')
      .setTcClass(['text-end col-3 h5 text-success align-items-center', 'text-start col h5'])
      .setTdClass('py-1 pb-0 mb-0 border-0 align-bottom border-bottom')
      .build();

      bootbox.alert({

        title: resObj['Reservation'],
        message: tbl.html,
        closeButton: false
    
      });

    }
    
  });
  

  // render the calendar
  calendar.render();

  $(".bi-chevron-right").removeClass("bi bi-chevron-right").addClass("material-icons").html("chevron_right");
  $(".bi-chevron-left").removeClass("bi bi-chevron-left").addClass("material-icons").html("chevron_left");

  var eleArr = [...$('#resContainer > div')].slice(1)      // remove the templace


  for (let i=0; i<eleArr.length;i++) {

    var $ele = $(eleArr[i])

    console.log($ele.find('#resArrIdx'))

    var idx = $ele.find('#resArrIdx')[0].innerText
    console.log(idx)
    
    var resObj = makeObj(resVals[idx], resHdrs)


    if ($ele.hasClass('d-none') || $ele.css('display') == 'none') continue
 
    switch (resObj['Type']) {
      case 'Hotel':
        var bc = 'blue';
        break;
      case 'Car':
        var bc = 'green';
        break;
      case 'Restaurant':
        var bc = 'red';
        break;
      case 'Tour':
        var bc = '#FFC033';
        break;
              
      default:
        var bc = '';
    }
    
    calendar.addEvent (  
      {
        id:                   idx,
        title:                resObj['Reservation'],
        start:                resObj['Start Date'],
        end:                  resObj['End Date'],
        allDay:               true,
        backgroundColor:      bc
      }
    )
  }
}

function formatISODate(date) {

  var st = DateTime.fromISO(date).toLocaleString(DateTime.DATETIME_SHORT)
  var stArr = st.split(', ')
  stmd = stArr[0].substring(0, st.lastIndexOf('/'))
  var start = stArr[1] == '12:00 AM' ? stmd : stmd + ', ' + stArr[1]

  return start

}