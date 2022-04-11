
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

  $("#trip-form")[0].reset();

  $("#trip-modal").modal('show');

  $('#trpmArrIdx').val(arrIdx)

  var vals = trpVals[arrIdx]

  var trpObj = makeObj(vals, trpHdrs)

  console.log('hi dan')
  console.log(parseMonth(trpObj['Month']))
  console.log(parseDateTime(trpObj['Start Date']).date)

  $('#trpmTrip').val(trpObj['Trip'])
  $('#trpmMonth').val(parseMonth(trpObj['Month']))
  $('#trpmType').val(trpObj['Type'])
  $('#trpmStartDate').val(parseDateTime(trpObj['Start Date']).date)
  $('#trpmEndDate').val(parseDateTime(trpObj['End Date']).date)
  $('#trpmDestinations').val(JSON.parse(trpObj['Destinations']).join(' - '))
  
  $('#btnTrpmDelete').removeClass('d-none')

  modal(false)

}

async function btnTrpmSubmitSheetHtml() {

  // if (!$('#trip-form').valid()) return

  var arrIdx = $('#trpmArrIdx').val() ? $('#trpmArrIdx').val()*1 : -1

  if (arrIdx > -1) {                                                       // update existing course

    var vals = [...trpVals[arrIdx]]

    vals[trpHdrs.indexOf("Trip")] = $('#trpmTrip').val()
    vals[trpHdrs.indexOf("Month")] = formatMonth($('#trpmMonth').val())
    vals[trpHdrs.indexOf("Type")] = $('#trpmType').val()
    vals[trpHdrs.indexOf("Start Date")] = formatDateTime($('#trpmStartDate').val())
    vals[trpHdrs.indexOf("End Date")] = formatDateTime($('#trpmEndDate').val())
    vals[trpHdrs.indexOf("Destinations")] = JSON.stringify($('#trpmDestinations').val().split(' - '))
    vals[trpHdrs.indexOf("Source")] = 'Manual'

  } else {

    // if (dupDocument($('#trpmDocument').val())) {
    //   toast("Document already exists")
    //   return
    // }

    var vals = []

    vals[trpHdrs.indexOf("Trip")] = $('#trpmTrip').val()
    vals[trpHdrs.indexOf("Month")] = formatMonth($('#trpmMonth').val())
    vals[trpHdrs.indexOf("Type")] = $('#trpmType').val()
    vals[trpHdrs.indexOf("Start Date")] = formatDateTime($('#trpmStartDate').val())
    vals[trpHdrs.indexOf("End Date")] = formatDateTime($('#trpmEndDate').val())
    vals[trpHdrs.indexOf("Destinations")] = JSON.stringify($('#trpmDestinations').val().split(' - '))
    vals[trpHdrs.indexOf("Source")] = 'Manual'
    vals[trpHdrs.indexOf("Destination Detail")] = JSON.stringify([])

  }

  modal(true)

  var trpIdx = arrIdx == -1 ? -1 : trpIdxArr[arrIdx]  // get the row nbr on the sheet from trpIdxArr


  await updateSheetRow(vals, trpIdx)


  $("#trip-modal").modal('hide');

  updateUI(vals, arrIdx)

  modal(false)
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
  
}

async function btnAddTripHtml() {

  console.log('tripform', $("#trip-form"))

  $("#trip-form")[0].reset();
  $("#trip-modal").modal('show');

   $('#btnTrpmDelete').addClass('d-none')

}

async function btnTrpmDeleteSheetHtml() {

  var confirmOK = await confirm("Are you sure you want to delete this Trip ?")

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

  $("#trip-modal").modal('hide');
  // $("#trip-modal").modal('dispose');

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

