async function showTrip(idx) {


  if (idx === null) return                  // null is from browseDocument

  modal(true)
  
  var trp = []

  var vals = trpVals[idx]
  
  $("#trpdTrip")[0].innerHTML = vals[trpHdrs.indexOf('Trip')]
  $("#trpdMoYr")[0].innerHTML = vals[trpHdrs.indexOf('Month')]
  $("#trpdStartEndDate")[0].innerHTML = vals['Start Date'].slice(0,-5) + ' - ' + vals['End Date'].slice(0,-5)
  $("#trpArrIdx").val(idx)

  var trpDtl = JSON.parse(vals[trpHdrs.indexOf('Destination Detail')])

  for (var i=1; i<trpDtl.length;i++) {

    var val = JSON.parse(trpDtl[i])

    trp.push([val.name, val.date, val.city, val.state])

  }
  
  var tbl = new Table();
  
  tbl
    .setHeader()
    .setTableHeaderClass()
    .setData(trp)
    .setTableClass('table table-borderless')
    .setTrClass('d-flex')
    .setTcClass(['text-end col-4 h5 text-success', 'text-start col h4', 'col-1'])
    .setTdClass('py-1 pb-0 border-0 align-bottom border-bottom')
    .build('#tblSheet');

  gotoTab('showTrip')

  $('#shtContainer > div').eq(idx+1).trigger( "click" )

  modal(false)


} 

function openImg(img) {

  var newTab = window.open("", "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=400,height=400");
  newTab.document.body.innerHTML = '<img src=' + img + '>'

}

function browseDocument(dir) {

  var idx   = $("#ssArrIdx").val()*1       
  var title = $('#shtTitle').text()

  var shtRows = secSht[title].rows*1 - 1                   // rows includes hdrs

  var eleArr = [...$('#shtContainer > div')].slice(1)      // remove the templace

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


function copyToClpbrd(txt) {

  navigator.clipboard.writeText(txt).then(function() {
    console.log('Async: Copying to clipboard was successful!');
    toast('Copied to clipboard', 1000)
  }, function(err) {
    console.error('Async: Could not copy text: ', err);
  });

}

function clearAndGotoTab(sht) {

  $("#tblSheet").html('')
  $("#ssSheet").html('')
  
  gotoTab(sht)

}

function editFromTripSheet() {

  clearAndGotoTab("Trips")

  var arrIdx = $("#ssArrIdx").val()

  editTrip(arrIdx)

}
