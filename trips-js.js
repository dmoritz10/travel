
async function listTrips(title = "Trips") {

  modal(true)

  var trpOptions = readOption('trpFilter')
  var trpSelectFav = trpOptions.trpSelectFav

  var objSht = await openShts(
    [
      { title: "Trips", type: "all" }
    ])

  console.log('objSht', objSht)

  trpTitle = "Trips"
  
  trpHdrs = objSht[trpTitle].colHdrs
  trpVals = objSht[trpTitle].vals
  
  var vals = trpVals

  for (var i=0;i<vals.length;i++) {

    vals[i].push(i)                    // idx xref
    
    vals[i].push(new Date(vals[i][trpHdrs.indexOf('Start Date')]))
  
  }

  var sortCol = vals[0] ? vals[0].length - 1 : 0    // in case of empty sheet.  ie. hdrs only

  trpVals = vals.sort(function(a,b){return a[sortCol] < b[sortCol] ? 1 : -1; });
  
  trpVals.forEach((val, idx, arr)=> arr[idx].pop()) // remove sort element from end of array
  

  $("#trpTitle").html(trpTitle)
  $("#trpNbr").html(vals.length)

  var $tblSheets = $("#trpContainer > .d-none").eq(0)  // the 1st one is a template which is always d-none

  var x = $tblSheets.clone();
  $("#trpContainer").empty();
  x.appendTo("#trpContainer");

  trpIdxArr = []
  var arrIdx = 0

  for (var j = 0; j < trpVals.length; j++) {

    var trpObj = makeObj(trpVals[j], trpHdrs)

    var x = trpVals[j].pop()                    // remove idx trpVals after sort
    trpIdxArr.push(x)                           // create parallel xref of idxs to sheet

   
    var fav = trpObj['Favorite']
    var Document = trpObj['Trip']


    var ele = $tblSheets.clone();
    // ele.find('#trpDocument')[0].innerHTML = trpObj['Trip'].split(' - ')[0]

    ele.find('#trpDocument')[0].innerHTML = trpObj['Trip']
    ele.find('#trpCompositeKey')[0].innerHTML = trpObj['Composite Key']

    ele.find('#trpMoYr')[0].innerHTML = trpObj['Month']
    ele.find('#trpStartEndDate')[0].innerHTML = trpObj['Start Date'].slice(0,-5) + ' - ' + trpObj['End Date'].slice(0,-5)
    ele.find('#trpDestinations')[0].innerHTML = JSON.parse(trpObj['Destinations']).join(' - ')

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

  var srchVal = $("#trpSearch").val()

  console.log('srchVal', srchVal)

  if (srchVal) {

      $("#trpContainer #trpCompositeKey").filter(function() {

        $(this).parent().parent().parent().toggle($(this).text().toLowerCase().indexOf(srchVal.toLowerCase()) > -1)
      });
      
      $("#trpNbr").html(countDisplayed("trpContainer"))
   
  }

  $('#trpContainer > div').click(function(e){         // highlight clicked row
    
    $('#trpContainer > div').removeClass('ele-selected');
    $(e.currentTarget).addClass('ele-selected')
    
  });

  modal(false)

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

  await updateSheetRow(trpVals[arrIdx], trpIdx)

  updateUI(trpVals[arrIdx], arrIdx)

}


async function editTrip(arrIdx) {

  modal(true)

  $("#sheet-form")[0].reset();

  $('#trpmImgFront').removeAttr('src').addClass('d-none')
  $('#trpmImgBack').removeAttr('src').addClass('d-none')

  $('#trpmSheetName').html(trpTitle)

  $("#sheet-modal").modal('show');


  $('#trpmArrIdx').val(arrIdx)

  var vals = trpEnc ? await decryptArr(trpVals[arrIdx]) : trpVals[arrIdx]


  var trpObj = makeObj(vals, trpHdrs)

  var imgs = await fetchImages(trpEnc, trpObj['File Id'])

  console.log('imgs', imgs.length)

  $('#trpmDocument').val(trpObj['Document'])
  $('#trpmExpiry').val(trpObj['Expiry'])
  $('#trpmImgBack').val(trpObj['Account Nbr'])
  $('#trpmNotes').val(trpObj['Notes'])
  $('#trpmFavorite').val(trpObj['Favorite'])
  $('#trpmFileId').val(trpObj['File Id'])
  $('#trpmImgFront').attr('src', imgs[0])
  $('#trpmImgBack').attr('src', imgs[1])
  $('#trpmSaveImgFront').attr('src', imgs[0])
  $('#trpmSaveImgBack').attr('src', imgs[1])

  if (imgs[0])  $('#trpmImgFront').removeClass('d-none')
  else          $('#trpmImgFront').addClass('d-none');
  if (imgs[1])  $('#trpmImgBack').removeClass('d-none')
  else          $('#trpmImgBack').addClass('d-none');
  // document.getElementById("trpmImgFront").src = imgs[0];
  // document.getElementById("trpmImgBack").src = imgs[1];
  // document.getElementById("trpmSaveImgFront").src = imgs[0];
  // document.getElementById("trpmSaveImgBack").src = imgs[1];

  $('#btnTrpmDelete').removeClass('d-none')

  modal(false)

}

async function btnTrpmSubmitSheetHtml() {

  if (!$('#sheet-form').valid()) return

  var arrIdx = $('#trpmArrIdx').val() ? $('#trpmArrIdx').val()*1 : -1

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

  $("#sheet-modal").modal('hide');
  // $("#sheet-modal").modal('dispose');

  updateUI(valsEnc, arrIdx)

  modal(false)
}


async function updateUI (valsEnc, arrIdx) {

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
  trpVals[arrIdx] = valsEnc

  var DocumentDec = trpEnc ? await decryptMessage(valsEnc[0]) : valsEnc[0]
  var $Document = $('#trpContainer > div').find('#trpDocument').eq(arrIdx+1) // first ele is template d-none
  $Document.html(DocumentDec)

  var fav = valsEnc[trpHdrs.indexOf('Favorite')]

  if (trpEnc) {
    var favDec = await decryptMessage(fav)
  } else {
    var favDec = fav
  }

  var $fav = $('#trpContainer > div').find('#ScFavIcon').eq(arrIdx+1) 

  var boolFav = favDec.toLowerCase() === 'true'
  console.log('boolFav', boolFav)

  if (boolFav) {
    $fav[0].innerHTML = "star"
    $fav.addClass('text-primary')
  } else {
    $fav[0].innerHTML = "star_outline"
    $fav.removeClass('text-primary')
  }

}

async function btnAddSheetHtml() {

  $('#trpmImgFront').removeAttr('src').addClass('d-none')
  $('#trpmImgBack').removeAttr('src').addClass('d-none')

  $("#sheet-form")[0].reset();
  $('#trpmModalTitle').html('')
  $("#sheet-modal").modal('show');

   $('#btnTrpmDelete').addClass('d-none')

}

async function btnDeleteSheetHtml() {

  var confirmOK = await confirm("Are you sure you want to delete this Document ?")

  if (!confirmOK) return

  modal(true)


  var idx = trpIdxArr[$('#trpmArrIdx').val() * 1]

  console.log('btnTrpmDelete',idx,$('#trpmArrIdx').val(), trpIdxArr)

  var request = {
    "requests":
      [
        {
          "deleteDimension": {
            "range": {
              "sheetId": trpShtId,
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
console.log('delete file id', $('#trpmFileId').val())

  await gapi.client.drive.files.delete({
                
        fileId : $('#trpmFileId').val()

}).then(function(response) {
    console.log(response);
    return response
    
});

  $("#sheet-modal").modal('hide');
  // $("#sheet-modal").modal('dispose');

  modal(false)

  listTrips(trpTitle)

}

function dupDocument(Document) {

  let arrDocuments = trpVals.map(a => a[trpHdrs.indexOf('Document')]);

  if (arrDocuments.indexOf(Document) > -1) {
    return true
  } else {
    return false
  }

}

