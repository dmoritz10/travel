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

  $('#tblTrips tr').click(function(e){         // highlight clicked row

    console.log('sel', $('#tblTrips tr'), e.currentTarget)
    
    $('#tblTrips tr').removeClass('ele-selected');
    $(e.currentTarget).addClass('ele-selected')
    
  });


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

  var trpDtl = JSON.parse(trpObj['Destination Detail'])[destIdx]
  console.log('trpDtl.date', trpDtl.date)

  var dt = trpDtl.date ? parseDateTime(trpDtl.date) : {date: '', time: ''}

  console.log('dt', dt, trpDtl.date)

  $('#trpmdtlTrip').val(trpDtl.name)
  $('#trpmdtlDate').val(dt.date)
  $('#trpmdtlTime').val(dt.time)
  $('#trpmdtlCity').val(trpDtl.city)
  $('#trpmdtlState').val(trpDtl.state)

  $('#btntrpmdtlDelete').removeClass('d-none')

}


async function btntrpmdtlSubmitHtml() {

  /*
   update trpVals[arrIdx][trpHdrs.indexOf("Destination Detail")]
   add will be more difficult because have to insert based on date/time
  
   somehow update screen.  If update, need idx nbr of screen element
  
  */
  if (!$('#trpdtl-form').valid()) return

  var arrIdx = $('#trpmdtlArrIdx').val() ? $('#trpmdtlArrIdx').val()*1 : -1

  if (arrIdx > -1) {                                                       // update existing course

    var vals = [...trpVals[arrIdx]]

    vals[trpHdrs.indexOf("Document")] = $('#trpmDocument').val()
    vals[trpHdrs.indexOf("Expiry")] = $('#trpmExpiry').val()
    vals[trpHdrs.indexOf("Img Front")] = $('#trpmImgFront').val()
    vals[trpHdrs.indexOf("Img Back")] = $('#trpmImgBack').val()
    vals[trpHdrs.indexOf("Notes")] = $('#trpmNotes').val()
    vals[trpHdrs.indexOf("Last Change")] = formatDate(new Date())
    vals[trpHdrs.indexOf("Favorite")] = $('#trpmFavorite').val()
    vals[trpHdrs.indexOf("File Id")] = $('#trpmFileId').val()

    var fileId = $('#trpmFileId').val()


  } else {

    if (dupDocument($('#trpmDocument').val())) {
      toast("Document already exists")
      return
    }

    var fileId = await buildImageFile()

    var vals = []

    vals[trpHdrs.indexOf("Document")] = $('#trpmDocument').val()
    vals[trpHdrs.indexOf("Expiry")] = $('#trpmExpiry').val()
    vals[trpHdrs.indexOf("Img Front")] = $('#trpmImgFront').val()
    vals[trpHdrs.indexOf("Img Back")] = $('#trpmImgBack').val()
    vals[trpHdrs.indexOf("Notes")] = $('#trpmNotes').val()
    vals[trpHdrs.indexOf("Last Change")] = formatDate(new Date())
    vals[trpHdrs.indexOf("Favorite")] = $('#trpmFavorite').val()
    vals[trpHdrs.indexOf("File Id")] = fileId

  }

  modal(true)

  var trpIdx = arrIdx == -1 ? -1 : trpIdxArr[arrIdx]  // get the row nbr on the sheet from trpIdxArr

  var valsEnc = trpEnc ? await encryptArr(vals) : vals

  await updateSheetRow(valsEnc, trpIdx)

  var imgs = []
  var savImgs = []

  imgs[0] = document.getElementById("trpmImgFront").src
  imgs[1] = document.getElementById("trpmImgBack").src
  savImgs[0] = document.getElementById("trpmSaveImgFront").src;
  savImgs[1] = document.getElementById("trpmSaveImgBack").src;

  // console.log('submit', [...imgs])
  // console.log('submit', [...savImgs])

  console.log('fileId', fileId)

  await postImages(trpEnc, fileId, imgs, savImgs)

  $('#trpmImgFront').removeAttr('src').addClass('d-none')
  $('#trpmImgBack').removeAttr('src').addClass('d-none')

  $("#sheet-modal").modal('hide');
  // $("#sheet-modal").modal('dispose');

  updateUI(valsEnc, arrIdx)

  modal(false)
}
