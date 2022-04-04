
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
  
  var trpHdrs = objSht[trpTitle].colHdrs
  var vals = objSht[trpTitle].vals

  for (var i=0;i<vals.length;i++) {

    vals[i].push(i)                    // idx xref
    
    vals[i].push(new Date(vals[i][trpHdrs.indexOf('Start Date')]))
  
  }

  var sortCol = vals[0] ? vals[0].length - 1 : 0    // in case of empty sheet.  ie. hdrs only

  trpVals = vals.sort(function(a,b){return a[sortCol] > b[sortCol] ? 1 : -1; });
  
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

    // ele.find('#trpDocument')[0].innerHTML = trpObj['Trip'].slice(0, -11)
    ele.find('#trpDocument')[0].innerHTML = trpObj['Trip'].split(' - ')[0]
    ele.find('#trpCompositeForSearch')[0].innerHTML = trpObj['Destinations'] + ' ' + trpObj['Month']

    ele.find('#trpMoYr')[0].innerHTML = trpObj['Month']
    ele.find('#trpStartEndDate')[0].innerHTML = trpObj['Start Date'] + ' - ' + trpObj['End Date']
    ele.find('#trpDestinations')[0].innerHTML = trpObj['Destinations'].split(' - ')

    ele.find('#btnTrpEdit')[0].setAttribute("onclick", "editSheet(" + j + ")");

    ele.find('#btnTrpFavorite')[0].setAttribute("onclick", "setFavorite(" + j + ")");

    ele.find('#btnTrpShowSheet')[0].setAttribute("onclick", "showSheet(" + j + ")");


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

      $("#trpContainer #trpCompositeForSearch").filter(function() {

        $(this).parent().parent().parent().toggle($(this).text().toLowerCase().indexOf(srchVal.toLowerCase()) > -1)
      });
   
  }

  $('#trpContainer > div').click(function(e){         // highlight clicked row
    
    $('#trpContainer > div').removeClass('sheets-focus');
    $(e.currentTarget).addClass('sheets-focus')
    
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


async function editSheet(arrIdx) {

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

async function buildImageFile() {

  // Create file in enc/img folder
  // Rename title = sheetId
  // Return sheetId

  var fileIdx = await gapi.client.drive.files.create({

    resource : {                  
                  name : 'Sheet',
                  mimeType: 'application/vnd.google-apps.spreadsheet',
                  parents: ['1eAwbR_yzsEaEpBEpFA0Pqp8KGP2XszDY']

                }

}).then(function(response) {
    console.log(response);
    return response
    
});

console.log(fileIdx)

var fileId = fileIdx.result.id

// rename sheet to that provided by user

const rq = {"requests" : [
  {
    updateSpreadsheetProperties: {
    properties: {
     title: fileId,
    },
    fields: 'title'
    }
   }]}
 ;
 
await gapi.client.sheets.spreadsheets.batchUpdate({
  spreadsheetId: fileId,
  resource: rq})

  .then(response => {

    console.log('rename complete')
    console.log(response)

  }, function (reason) {
    console.error('error updating sheet "' + "title" + '": ' + reason.result.error.message);
    alert('error updating sheet "' + 'title' + '": ' + reason.result.error.message);
  });


  return fileId

}

async function updateUI (valsEnc, arrIdx) {

// update trpVals conditionally encrypting
// secSht[trpTitle].Rows
// update / append trpContainer ? sort ???
// update / append

  var arrIdx = arrIdx*1

  console.log("arrIdx", arrIdx)

  if (arrIdx == -1) {                               // add.  In this case, still use listTrips 

    // trpVals.push(valsEnc)
    // arrIdx = trpVals.length-1
    secSht[trpTitle].rows++

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

function fixUrl(url) {

  if (url.substring(0, 8) !== 'https://' && url.substring(0, 7) !== 'http://') return 'https://' + url

  return url

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
              "sheetId": trpId,
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

    secSht[trpTitle].rows--

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


async function showFile(input) {

  if (input.files && input.files[0]) {
    var reader = new FileReader();

    reader.onload = function (e) {

      if (input.id == "trpmInputFront")   {
        $('#trpmImgFront').attr('src', e.target.result);
        $('#trpmImgFront').removeClass('d-none');
      } else {
        $('#trpmImgBack').attr('src', e.target.result);
        $('#trpmImgBack').removeClass('d-none');
      }
                                      
    }

    reader.readAsDataURL(input.files[0]);
  }

}

async function postImages(trpEnc, fileId, imgs, savImgs, pwd = currUser.pwd) {

  for (var i=0;i<2;i++) {             // 0 = front image, 1 = back image

    var img = imgs[i]
    
    if (img && img != savImgs[i]) {

      var idx = 0
      var encPromiseArr = []

      var removeImage = img.slice(-1) == '#'

      while (idx < img.length) {

        if (trpEnc) encPromiseArr.push(encryptMessage(img.substring(idx, idx + 35000), pwd))
        else        encPromiseArr.push(img.substring(idx, idx + 35000))

        idx = idx+35000

      }

      if (trpEnc) var encArr = await Promise.all(encPromiseArr)
      else        var encArr = encPromiseArr

      console.log('postImage encArr', i, img.length, encArr[0].length, encArr.length)

      await updateImages(fileId, i*1+1, encArr, removeImage)

    }

  }

}

async function updateImages(fileId, imgIdx, vals, removeImage) {

  console.log("updateImages")


  var trpTitle = fileId
  var row = imgIdx

  console.log('updateImages vals', vals)

  await clearImage(trpTitle, row)         // always clear existing image


  if (!removeImage) {               // user has elected to add an image

    var rng = calcRngA1(row, 1, 1, vals.length)

    var params = {
      spreadsheetId: fileId,
      range: "'" + "Sheet1" + "'!" + rng,
      valueInputOption: 'RAW'
    };

    var resource = {
      "majorDimension": "ROWS",
      "values": [vals]    
    }

    await gapi.client.sheets.spreadsheets.values.update(params, resource)
      .then(async function (response) {
        console.log('update successful')
      },

        function (reason) {
          console.error('error updating sheet "' + trpTitle + '": ' + reason.result.error.message);
          bootbox.alert('error updating sheet "' + trpTitle + '": ' + reason.result.error.message);
        });

  }

}


async function fetchImages(trpEnc, trpTitle, pwd = currUser.pwd) {
  console.time("fetchImages")
  console.log("fetchImages")

  var rng = calcRngA1(1, 1, 2, 1000)

  var params = {
    spreadsheetId: trpTitle,
    range: "'" + "Sheet1" + "'!" + rng
  };

  var vals = await gapi.client.sheets.spreadsheets.values.get(params)
    .then(function(response) {
      
      console.timeLog("fetchImages")
      console.log("fetchImages", response);
      return response.result.values

    }, function(reason) {
      console.error('error: ' + reason.result.error.message);
    });

    console.log("fetchImages pre return", trpTitle, "'" + "Sheet1" + "'!" + rng, vals);


    if (!vals) return [null, null]
    console.log("fetchImages post return", vals);

    rtn = []

    for (let i in vals) {

      var val = vals[i]

      if (val.length == 0 ) rtn.push(null)
      else {

        if (trpEnc) {
          var decVals = val.map( ele => decryptMessage(ele, pwd))

          var decArr = await Promise.all(decVals)
        } else
          var decArr = val

        rtn.push(decArr.join(''))
      }
  }
  

  console.timeEnd("fetchImages")

  return rtn

}

async function pasteImage() {

  

  var item = pasteEvent.clipboardData.items[0];

  console.log(item)

 
  if (item.type.indexOf("image") === 0)
  {
      var blob = item.getAsFile();

      var reader = new FileReader();
      reader.onload = function(event) {
          document.getElementById("trpmImgFront").src = event.target.result;
      };

      reader.readAsDataURL(blob);
  }

}

async function clearImage(trpTitle, row) {        // recall that the sheet title is the same as the sheet id for image files

  var rng = calcRngA1(row, 1, 1, 500)

  var params = {
    spreadsheetId: trpTitle,
    range: "'" + "Sheet1" + "'!" + rng
  };

  await gapi.client.sheets.spreadsheets.values.clear(params)
    .then(async function (response) {
      console.log('update successful')
    },

      function (reason) {
        console.error('error updating sheet "' + trpTitle + '": ' + reason.result.error.message);
        bootbox.alert('error updating sheet "' + trpTitle + '": ' + reason.result.error.message);
      });

}
