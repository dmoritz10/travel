async function showTrip(idx) {


  if (idx === null) return                  // null is from browseDocument

  var trp = []

  var vals = trpVals[idx]
  
  $("#trpdTrip")[0].innerHTML = vals[trpHdrs.indexOf('Trip')]
  $("#trpdMoYr")[0].innerHTML = vals[trpHdrs.indexOf('Month')]
  $("#trpdStartEndDate")[0].innerHTML = vals[trpHdrs.indexOf('Start Date')].slice(0,-5) + ' - ' + vals[trpHdrs.indexOf('End Date')].slice(0,-5)
  $("#trpdArrIdx").val(idx)

  var trpDtl = JSON.parse(vals[trpHdrs.indexOf('Destination Detail')])

  var brkDate

  for (var i=0; i<trpDtl.length;i++) {

    var val = trpDtl[i]

    var parseDate = val.date.split(", ")
    var date = parseDate[0]
    var time = parseDate[1] ? parseDate[1] : ''

    if (date != brkDate) {

      var dispDate = DateTime.fromJSDate(new Date(date)).toFormat('ccc L/d');

      trp.push(["<div class='text-primary h4'>" + dispDate, '<div class="">&nbsp;</div>'])

      brkDate = date

    }

    var icon = '<div class="label ps-5 cursor-pointer" onClick="editTripDtl(' + idx + ", " + i + ')"><span class="material-icons">expand_more</span></div>'

    var place = val.name + "<br><h6>" +
                val.city + (val.state ? ", " : "") +
                val.state + "<br>" +
                icon
    
    trp.push([time, place])

  }
  
  var tbl = new Table();
  
  tbl
    .setHeader()
    .setTableHeaderClass()
    .setData(trp)
    .setTableClass('table table-borderless')
    .setTrClass('d-flex')
    .setTcClass(['text-end col-4 h5 text-success align-items-center', 'text-start col h4'])
    .setTdClass('py-1 pb-0 mb-0 border-0 align-bottom border-bottom')
    .build('#tblTrips');

  gotoTab('ShowTrip')

  // $('#trpContainer > div').eq(idx+1).trigger( "click" )

} 

function browseDocument(dir) {

  var idx   = $("#trpdArrIdx").val()*1       
  var title = $('#shtTitle').text()

  var shtRows = trpVals.length                   

  var eleArr = [...$('#trpContainer > div')].slice(1)      // remove the template

  if (dir=="prev")  {
    var prevIdx = (idx-1 >= 0) ? idx-1 : null
    while (prevIdx !== null) {
      if ($(eleArr[prevIdx]).hasClass('d-none') || $(eleArr[prevIdx]).css('display') == 'none') {  
        prevIdx = (prevIdx-1 >= 0) ? prevIdx-1 : null
      } else {
        break;
      }
    }
    showTrip(prevIdx)
  } else {
    var nextIdx = (idx+1 <  shtRows) ? idx+1 : null
    while (nextIdx) {
      if ($(eleArr[nextIdx]).hasClass('d-none') || $(eleArr[nextIdx]).css('display') == 'none') {  
        nextIdx = (nextIdx+1 <  shtRows) ? nextIdx+1 : null
      } else {
        break;
      }
    }
     showTrip(nextIdx)
  }

}


function clearAndGotoTab(sht) {

  $("#tblTrips").html('')
  // $("#ssSheet").html('')
  
  gotoTab(sht)

}

function editFromTripSheet() {

  clearAndGotoTab("Trips")

  var arrIdx = $("#trpdArrIdx").val()

  editTrip(arrIdx)

}


async function editTripDtl(arrIdx, destIdx) {

  $("#trpdtl-form")[0].reset();

  $("#trpdtl-modal").modal('show');

  $('#trpmdtlArrIdx').val(arrIdx)

  var vals = trpVals[arrIdx]

  var trpObj = makeObj(vals, trpHdrs)

  $('#trpmdtlTrip').val(trpObj['Document'])
  $('#trpmdtDate').val(trpObj['Expiry'])
  $('#trpmdtTime').val(trpObj['Account Nbr'])
  $('#trpmdtlCity').val(trpObj['Notes'])
  $('#trpmdtlState').val(trpObj['Favorite'])

  $('#btntrpmdtlDelete').removeClass('d-none')

}

