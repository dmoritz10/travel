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
      var hrefDate = DateTime.fromJSDate(new Date(date)).toFormat('yyyy-LL-dd');

      var googleTimelineHref = 'https://timeline.google.com/maps/timeline?pb=!1m2!1m1!1s' + hrefDate

      trp.push(["<div class='text-start text-primary pt-1 h4'>" + dispDate, 
                '<div class="text-end me-2"><a  target="_blank" href=' + googleTimelineHref + '><img class="img-thumbnail border-0 bg-transparent" width="40" height="40" src=  "images/icons/google-my-locn-hist.jpg" /></a>'
              ])

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

  $('#tblTrips tr').click(function(e){         // highlight clicked row

    $('#tblTrips tr').removeClass('ele-selected');
    $(e.currentTarget).addClass('ele-selected')
    
  });


} 

function browseDocument(dir) {

  var idx   = $("#trpdArrIdx").val()*1       

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
  
  gotoTab(sht)

}

async function addNewDest() {

  $("#trpdtl-form")[0].reset();
  $("#trpdtl-modal").modal('show');
  $('#trpmdtlArrIdx').val($("#trpdArrIdx").val())

  $('#btntrpmdtlDelete').addClass('d-none')

}


async function editTripDtl(arrIdx, destIdx) {

  if (user['email'] != 'dmoritz10@gmail.com') return   // only one user allowed to update Trip Detail


  $("#trpdtl-form")[0].reset();

  $("#trpdtl-modal").modal('show');

  $('#trpmdtlArrIdx').val(arrIdx)
  $('#trpmdtlDestIdx').val(destIdx)
                  
  
  var vals = trpVals[arrIdx]

  var trpObj = makeObj(vals, trpHdrs)

  var trpDtl = JSON.parse(trpObj['Destination Detail'])[destIdx]

  var dt = trpDtl.date ? parseDateTime(trpDtl.date) : {date: '', time: ''}

  $('#trpmdtlTrip').val(trpDtl.name)
  $('#trpmdtlDate').val(dt.date)
  $('#trpmdtlTime').val(dt.time)
  $('#trpmdtlCity').val(trpDtl.city)
  $('#trpmdtlState').val(trpDtl.state)

  $('#btntrpmdtlDelete').removeClass('d-none')

}


async function btntrpmdtlSubmitHtml() {

  if (!$('#trpdtl-form').valid()) return

  var arrIdx = $('#trpmdtlArrIdx').val()
  var destIdx = $('#trpmdtlDestIdx').val() ? $('#trpmdtlDestIdx').val()*1 : -1

  var vals = trpVals[arrIdx]

  var destDtl = JSON.parse(vals[trpHdrs.indexOf("Destination Detail")])

  if (destIdx == -1) {
    
    destDtl.push({})
    destIdx = destDtl.length - 1

  }

  var destObj = destDtl[destIdx]

  destObj.name = $('#trpmdtlTrip').val()
  destObj.date = formatDateTime($('#trpmdtlDate').val(), $('#trpmdtlTime').val())
  destObj.city = $('#trpmdtlCity').val()
  destObj.state = $('#trpmdtlState').val()

  sortDest(destDtl)

  vals[trpHdrs.indexOf("Destination Detail")] = JSON.stringify(destDtl)
  vals[trpHdrs.indexOf("Source")] = 'Manual'

  modal(true)

  var trpIdx = arrIdx == -1 ? -1 : trpIdxArr[arrIdx]  // get the row nbr on the sheet from trpIdxArr

  await updateSheetRow(vals, trpIdx, "Trips")

  $("#trpdtl-modal").modal('hide');

  showTrip(arrIdx)

  modal(false)

}

async function btntrpmdtlDeleteHtml() {

  var destIdx = $('#trpmdtlDestIdx').val()

  if (!destIdx) return

  var arrIdx = $('#trpmdtlArrIdx').val()

  var vals = trpVals[arrIdx]

  var destDtl = JSON.parse(vals[trpHdrs.indexOf("Destination Detail")])

  destDtl.splice(destIdx, 1)

  vals[trpHdrs.indexOf("Destination Detail")] = JSON.stringify(destDtl)
  vals[trpHdrs.indexOf("Source")] = 'Manual'

  var trpIdx = trpIdxArr[arrIdx]                  // get the row nbr on the sheet from trpIdxArr

  await updateSheetRow(vals, trpIdx, "Trips")

  $("#trpdtl-modal").modal('hide');

  showTrip(arrIdx)

  modal(false)

}


function sortDest(vals) {

  for (var i=0;i<vals.length;i++) {

    console.log('vals', vals[i])

    vals[i]['sort'] = new Date(vals[i]['date'])
  
  }

  var sortCol = vals[0] ? vals[0].length - 1 : 0    // in case of empty sheet.  ie. hdrs only

  vals.sort((a,b) =>  a.sort < b.sort ? -1 : 1);

  vals.forEach((val, idx, arr)=> delete val['sort']) // remove sort element from end of array
  
}

function dispTimeline(dispDate) {






}