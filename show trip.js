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
  var priorHdr = -1

  var activities = {}

  for (var i=0; i<trpDtl.length;i++) {

    var val = trpDtl[i]

    var parseDate = val.date.split(", ")
    var date = parseDate[0]
    var time = parseDate[1] ? parseDate[1] : ''

    

    if (date != brkDate) {

      var dispDate = DateTime.fromJSDate(new Date(date)).toFormat('ccc L/d');
      var hrefDate = DateTime.fromJSDate(new Date(date)).toFormat('yyyy-LL-dd');

      console.log(hrefDate)
      console.log(dispDate)

      console.log(DateTime.fromJSDate(new Date(date)).toFormat('LL-dd'))
      console.log(DateTime.fromJSDate(new Date(date)).toFormat('L/d'))
      console.log(DateTime.fromJSDate(new Date(date)).toFormat('ccc L/d'))
      console.log(DateTime.fromJSDate(new Date(date)).toFormat('yyyy L/d'))
      console.log(DateTime.fromJSDate(new Date(date)).toFormat('yyyy LL dd'))
      console.log(DateTime.fromJSDate(new Date(date)).toFormat('yyyy-LL-dd'))

      console.log(DateTime.fromJSDate(new Date(date)).toFormat('yyyy'))
      console.log(DateTime.fromJSDate(new Date(date)).toFormat('y'))
      console.log(DateTime.fromJSDate(new Date(date)).toFormat('yy'))


      var googleTimelineHref = 'https://timeline.google.com/maps/timeline?pb=!1m2!1m1!1s' + hrefDate

      var actDisp = formatActivities(activities)
      if (priorHdr > -1) trp[priorHdr][1] = trp[priorHdr][1].replace(/replacementToken/g, actDisp).replace(/hrefDateToken/g, googleTimelineHref)
      console.log('trp', trp[priorHdr][1])
      
      priorHdr = trp.length


      trp.push(["<div class='text-start pt-1'><span class='text-primary h4'>" + dispDate + "</span></div>",
                '<div>' + "replacementToken" + '</div>'
              ])

      brkDate = date

      activities = {}

    }
  
    var icon = '<div class="label ps-5 cursor-pointer" onClick="editTripDtl(' + idx + ", " + i + ')"><span class="material-icons">expand_more</span></div>'

    var place = val.name + "<br><h6>" +
                val.city + (val.state ? ", " : "") +
                val.state + "<br>" +
                icon
    
    trp.push([time, place])

    accumActivities( val.activities, activities)
    
  }

  var actDisp = formatActivities(activities)
  if (priorHdr > -1) trp[priorHdr][1] = trp[priorHdr][1].replace(/replacementToken/g, actDisp)

  
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

function accumActivities( objAct, accumAct) {

  if (!objAct) return

  Object.entries(objAct).forEach(([key, val]) => {
    
    if (!accumAct[key]) accumAct[key] = {duration: 0, distance: 0}

    accumAct[key]['duration'] += val.duration
    accumAct[key]['distance'] += val.distance

  });

}

function formatActivities(activities) {

  var actHtml = '<div class="timeline-item top-activities"\>'

  var actTemplate = `
  <a style="text-decoration: none" target="_blank" href="hrefDateToken">
  <div class="top-activity" tabindex="0">
        <div class="top-activity-icon"
          style="background-image:url(iconToken)"
          title="activityToken"> </div>
        <div class="top-activity-text">
          <div>distanceToken</div>
          <div>durationToken</div>
        </div>  
    </div>
    </a>
    `

console.log('before', activities)
var sorted = {};

Object
    .keys(activities).sort(function(a, b){
        return activities[b].duration - activities[a].duration;
    })
    .forEach(function(key) {
        sorted[key] = activities[key];
    });

    console.log('after', sorted)

  var actFormatted = ''
  Object.entries(sorted).forEach(([key, val]) => {
    
    var x = actTemplate.replace(/durationToken/, formatDuration(val.duration))
    x = x.replace(/distanceToken/, formatDistance(val.distance))
    x = x.replace(/activityToken/, key)
    x = x.replace(/iconToken/, getActivityIcon(key))
    
    actFormatted += x

  });


  actHtml += actFormatted

  actHtml += '</div>'

  console.log('actHtml', actHtml)

  return actHtml

}

function getActivityIcon(activityType) {

  switch (activityType) {

    case 'Boating':
      var url = 'https://www.gstatic.com/images/icons/material/system/2x/directions_boat_black_24dp.png'
    break;
    case 'Cycling':
      var url = 'https://maps.gstatic.com/mapsactivities/icons/activity_icons/2x/ic_activity_biking_black_24dp.png'
    break;
    case 'Flying':
      var url = 'https://www.gstatic.com/images/icons/material/system/2x/local_airport_black_24dp.png'
    break;
    case 'Hiking':
      var url = 'https://maps.gstatic.com/mapsactivities/icons/activity_icons/2x/ic_activity_hiking_black_24dp.png'
    break;
    case 'On a bus':
      var url = 'https://www.gstatic.com/images/icons/material/system/2x/directions_bus_black_24dp.png'
    break;
    case 'On a ferry':
      var url = 'https://www.gstatic.com/images/icons/material/system/2x/directions_boat_black_24dp.png'
    break;
    case 'In a gondola lift':
      var type = 'In a gondola lift'
      var url = 'https://maps.gstatic.com/mapsactivities/icons/activity_icons/2x/ic_activity_gondola_black_24dp.png'
    break;
    case 'Driving':
      var url = 'https://www.gstatic.com/images/icons/material/system/2x/directions_car_black_24dp.png'
    break;
    case 'On the subway':
      var url = 'https://maps.gstatic.com/mapsactivities/icons/activity_icons/2x/ic_activity_subway_black_24dp.png'
    break;
    case 'In a taxi':
      var url = 'https://www.gstatic.com/images/icons/material/system/2x/local_taxi_black_24dp.png'
    break;
    case 'On a train':
      var url = 'https://www.gstatic.com/images/icons/material/system/2x/directions_railway_black_24dp.png'
    break;
    case 'On a tram':
      var url = 'https://maps.gstatic.com/mapsactivities/icons/activity_icons/2x/ic_activity_tram_black_24dp.png'
    break;
    case 'IN_VEHICLE':
      var url = 'https://www.gstatic.com/images/icons/material/system/2x/directions_car_black_24dp.png'
    break;
    case 'Skiing':
      var url = 'https://maps.gstatic.com/mapsactivities/icons/activity_icons/2x/ic_activity_downhill_skiing_black_24dp.png'
    break;
    case 'Walking':
      var url = 'https://maps.gstatic.com/mapsactivities/icons/activity_icons/2x/ic_activity_walking_black_24dp.png'
    break;
    default:
      var url = 'https://maps.gstatic.com/mapsactivities/icons/activity_icons/2x/ic_activity_moving_black_24dp.png'
    break;
  }

  return url

}


function formatDuration(duration) {

  var hr = parseInt(duration / 60)
  var min = Math.round(duration % 60)

  return (hr ? hr + 'h': '') +  ' ' + min + 'm'

}

function formatDistance(distance) {

  return Math.round(10 * distance / 1609.34)/ 10 + ' mi'

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