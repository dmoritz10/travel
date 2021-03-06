

async function getSSId(currUser) {

  // var q = "name = 'secsht - " + currUser +
  var q = "name = '" + currUser +
      "' AND " + "mimeType='application/vnd.google-apps.spreadsheet'" +
      " AND " + "trashed = false"

  var ssId = await gapi.client.drive.files.list({
      q: q,
      fields: 'nextPageToken, files(id, name, ownedByMe)',
      spaces: 'drive'
  }).then(function (response) {

      var files = response.result.files

      // files = files.filter(item => item.ownedByMe);    // remove files that are shared with me
      if (!files || files.length == 0)
          return { fileId: null, msg: "'Travel Journal' not found" }

      if (files.length > 1)
          return { fileId: null, msg: "'Travel Journal' not unique" }

      return { fileId: files[0].id, msg: 'ok' }

  })

  return ssId

}

async function initialUI() {
  timerStart = new Date()

    arrShts = await openShts(
      [
        { title: 'Settings', type: "all" }
      ])
    

  console.log('initialUI', arrShts)

  arrOptions    = toObject(arrShts.Settings.vals)
  optionsIdx    = toObjectIdx(arrShts.Settings.vals)

  // disable add/change/delete for Trips and Trip Detail

  if (user['email'] != 'dmoritz10@gmail.com') {

    $('#btnTrpEdit').addClass('d-none')
    $('#btnTrpAddTrip').addClass('d-none')
    $('#btnTrpAddNew').addClass('d-none')
    $('#btnImportPlaces').addClass('d-none')
    
  }

};

var confirm = function (msg) {

  return new Promise(resolve => {

    bootbox.confirm({

      closeButton: false,
      // size: "small",
      message: '<h5>' + msg + '</h5>',
      centerVertical: true,


      callback: function (result) { /* result is a boolean; true = OK, false = Cancel*/

        if (result) {

          resolve(true)

        } else {

          resolve(false)

        }
      }
    });
  });
}


var prompt = function (title, inputType) {

  return new Promise(resolve => {

    bootbox.prompt({

      closeButton: false,
      backdrop: true,
      title: '<h5>' + title + '</h5>',
      centerVertical: true,
      inputType: inputType,


      callback: function (result) { /* result is a boolean; true = OK, false = Cancel*/

          resolve(result)

      }
    });
  });
}

var openShts = async function (shts) {


  return new Promise(async resolve => {

    shtRngs = []
    
    for (s in shts) {

      var sheet = shts[s]

      switch (sheet.type) {

        case "headers":
          shtRngs.push("'" + sheet.title + "'!1:1")
          break;

        case "all"  :
          shtRngs.push("'" + sheet.title + "'!A1:ZZ100000")
          break;

      }

    }

  await checkAuth()

  gapi.client.sheets.spreadsheets.values.batchGet({spreadsheetId: spreadsheetId, ranges: shtRngs})

  .then(async function(response) {

    console.log('getresponse', response)
    
    var allShts = response.result.valueRanges

    console.log('openShts', response)

    var arr = []

    for (s in allShts) {
    
      var shtVals = allShts[s].values

      var colHdrs = shtVals[0]
      var vals = shtVals.slice(1)
      var rowCnt = vals ? vals.length : 0

      var shtTitle = allShts[s].range.split('!')[0].replace(/'/g,"")

      arr[shtTitle] =  {  
        colHdrs:      colHdrs,
        vals:         shtVals.slice(1),
        columnCount:  colHdrs.length,
        rowCount:     rowCnt
      }
      
    }

    resolve(arr)
      
  },

    function(response) {

      console.log('Error: ' + shtTitle + ' - ' + response.result.error.message);
          
    });

  })

}




function parseDateISOString(s) {
  let ds = s.split(/\D/).map(s => parseInt(s));
  ds[1] = ds[1] - 1; // adjust month
  return new Date(...ds);
}


function calcRngA1(r, col, nbrRows, nbrCols) {

  const n2c = n => {
    // Column number to 26 radix. From 0 to p.
    // Column number starts from 1. Subtract 1.
    return [...(n-1).toString(26)]
      // to ascii number
      .map(c=>c.charCodeAt())
      // Subtract 1 except last digit.
      // Look at 10. This should be AA not BA.
      .map((c,i,arr)=>i<arr.length-1?c-1:c)
      // Convert with the ascii table. [0-9]->[A-J] and [a-p]->[K-Z]
      .map(a=>a>96?a-22:a+17)
      // to char
      .map(a=>String.fromCharCode(a))
      .join('');
  };

  var rngA1 = n2c(col) + r + ':' + n2c(col + nbrCols - 1) + (r + nbrRows - 1)

  return rngA1

}

function countDisplayed(container) {

  var $eleArr = $('#' + container + ' > div').slice(1)       // remove template

  var tot = $eleArr.length
  var dnone    = $eleArr.filter( function() {
                  return $(this).hasClass('d-none') || $(this).css('display') == 'none'}).length
  var totDisp = tot - dnone

  return totDisp == tot ? tot : totDisp + ' of ' + tot 

}

function toObject(arr) {
  var rv = { };
  for (var i = 0; i < arr.length; ++i)
  if (arr[i] !== undefined) rv[arr[i][0]] = arr[i][1];
  return rv;
}

function toObjectIdx(arr) {
  var rv = { };
  for (var i = 0; i < arr.length; ++i)
  if (arr[i] !== undefined) rv[arr[i][0]] = i;
  return rv;
}

function makeObj(courseInfo, cols) {

  var rtnObj = { }
  for (var i = 0; i < courseInfo.length; ++i)
  if (courseInfo[i] !== undefined) rtnObj[cols[i]] = courseInfo[i];

  return rtnObj;

}

function formattime(dte){

   if (isNaN(Date.parse(dte))) return


  var zero = '0', hours, minutes, seconds, time;
  time = new Date(dte);

  var hh = (zero + time.getHours()).slice( - 2);
  var mm = (zero + time.getMinutes()).slice( - 2);
  var ss = (zero + time.getSeconds()).slice( - 2);
  return hh +':' + mm +':' + ss;
}

function formatNumber (str) { 

    if (!str) {return}
  var x = str.toString().split('.');
  var x1 = x[0]; 
    var x2 = x.length > 1 ? '.' + x[1] : '';
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2'); 
    }
  return x1 + x2; 

};

function toast(e, delay = 5000) {

  $("#toast-content").html(e)

  $("#myToast").toast({delay: delay});

  $("#myToast").toast('show');

}


function promiseRun (func) {

// this is a trick to convert the arguments array into an array, and drop the first one
  var runArgs = Array.prototype.slice.call(arguments).slice(1);

  return new Promise (function (resolve, reject) {

    google.script.run
      .withSuccessHandler(function (result) {
        resolve(result);
      })
      .withFailureHandler(function (error) {
        reject(error);
      })

    [func].apply(this, runArgs) ;
        
  })
}

function gotoTab(tabName) {

  var $tab = $('#' + tabName )

  console.log('gotoTab', tabName, $tab)

  $( '.tab-content > div.active' ).removeClass( 'active show' );
  
  $tab.addClass( 'active show' );

}

function formatDate(d) {

  return (d.getMonth()+1)+'/'+ d.getDate()+'/'+d.getFullYear()

}

function setupFormValidation() {

    $.validator.setDefaults({
      highlight: function (element) {
        $(element).parent().addClass('text-danger');
      },
      unhighlight: function (element) {
        $(element).parent().removeClass('text-danger');
      },
      errorElement: 'bold',
      errorClass: 'form-control-feedback d-block',
      errorPlacement: function (error, element) {
        if (element.parent('.input-group').length) {
          error.insertAfter(element.parent());
        } else if (element.prop('type') === 'checkbox') {
          error.appendTo(element.parent().parent().parent());
        } else if (element.prop('type') === 'radio') {
          error.appendTo(element.parent().parent().parent());
        } else {
          error.insertAfter(element);
        }
      },
    });

 
  $("#trip-form").validate();
 
}

function validateUrl(value) {
  return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
}


function readOption(key, defaultReturn = '') {

  if (!arrOptions[key]) return defaultReturn
  if (arrOptions[key] == 'null') return defaultReturn

  try { var rtn = JSON.parse(arrOptions[key]) }
  catch (err) { var rtn = arrOptions[key] }

  return rtn

}

async function updateOption(key, val) {

  if (typeof val === "object") {
    var strVal = JSON.stringify(val)
  } else {
    var strVal = val
  }

  arrOptions[key] = strVal

  var resource = {
    "majorDimension": "ROWS",
    "values": [[
      key,
      strVal
    ]]
  }

  var row = optionsIdx[key] + 2

  var params = {
    spreadsheetId: spreadsheetId,
    range: "'Settings'!A" + row + ":B" + row,
    valueInputOption: 'RAW'
  };

  await checkAuth()

  var gapiResult = await gapi.client.sheets.spreadsheets.values.update(params, resource)

    .then(
      async response => {
        return response
      },

      async reason => {

        console.log('updateOption')
        console.log(reason)

        bootbox.alert('error updating option "' + key + '": ' + reason.result.error.message);

        return null

      }
    );

}

async function checkAuth() {

  var signinStatus = await gapi.auth2.getAuthInstance().isSignedIn.get()
 
   if (!signinStatus) {
     gotoTab('Auth')
     return
   }
  

  var minAuthRemaining = (new Date(gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().expires_at) - new Date()) / (1000 * 60)
  if (minAuthRemaining < 10) {
    console.log('auth reload - ' + Math.round(minAuthRemaining));
    // alert('auth reload - ' + Math.round(minAuthRemaining));
    await gapi.auth2.getAuthInstance().currentUser.get().reloadAuthResponse()
  } else {
    console.log('auth ok - ' + minAuthRemaining);
  }

}

function msToHHMMSS(ms) {

  ms = Math.abs(ms)

  let seconds = Math.floor((ms / 1000) % 60);
  let minutes = Math.floor((ms / 1000 / 60) % 60);
  let hours = Math.floor((ms / 1000 / 3600) % 24)

  if (hours) hours = (hours < 10) ? "0" + hours : hours
  else hours = false
  if (hours) minutes = (minutes < 10) ? "0" + minutes : minutes
  else minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  var hhmmss = []

  if (hours) hhmmss.push(hours)
  hhmmss.push(minutes)
  hhmmss.push(seconds)

  return hhmmss.join(':');

}

function is2dArray(array){

  if(array[0] === undefined){
    return false;
  } else {
    return (array[0].constructor === Array);
  }
}

async function updateSheet(title, vals) {

  await checkAuth()

  

  var nbrRows = vals.length
  var maxRows = 5000
  var strtRow = 0
  var currRow = 0

  var promiseArr = []

  while (vals.length > 0) {

    strtRow = currRow

    var chunk = vals.splice(0, maxRows)

    currRow += chunk.length

    console.log('strtRow', strtRow)
    console.log('currRow', currRow)
    console.log('chunk', chunk)
    console.log('vals.length', vals.length)


    var resource = {
      "majorDimension": "ROWS",
      "values": chunk   
    }

    var rng = calcRngA1(strtRow + 1, 1, chunk.length, chunk[0].length)

    var params = {
    spreadsheetId: spreadsheetId,
    range: "'" + title + "'!" + rng,
    valueInputOption: 'RAW'
    };


    promiseArr.push(
       gapi.client.sheets.spreadsheets.values.update(params, resource)
        .then(function (response) {
            console.log('Sheet update successful')
            console.log(response)
        }, function (reason) {
            console.error('error updating sheet "' + title + '": ' + reason.result.error.message);
            alert('error updating sheet "' + title + '": ' + reason.result.error.message);
      })
    )
  }

  await Promise.all(promiseArr)

} 

async function updateSheetRow(vals, shtIdx, shtTitle) {


  await checkAuth()

  var resource = {
    "majorDimension": "ROWS",
    "values": [vals]    
  }

  if (shtIdx > -1) {

    console.log('update', shtIdx)

    var row = shtIdx * 1 + 2
    var rng = calcRngA1(row, 1, 1, vals.length)

    var params = {
      spreadsheetId: spreadsheetId,
      range: "'" + shtTitle + "'!" + rng,
      valueInputOption: 'RAW'
    };


    await gapi.client.sheets.spreadsheets.values.update(params, resource)
      .then(function (response) {
        console.log('Sheet update successful')
        console.log(response)
      }, function (reason) {
        console.error('error updating sheet "' + row + '": ' + reason.result.error.message);
        alert('error updating sheet "' + row + '": ' + reason.result.error.message);
      });

  } else {

    var row = 2
    var rng = calcRngA1(row, 1, 1, vals.length)

    var params = {
      spreadsheetId: spreadsheetId,
      range: "'" + shtTitle + "'!" + rng,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS'
    };

    await gapi.client.sheets.spreadsheets.values.append(params, resource)
      .then(async function (response) {

        // console.log('sheetId', shtId)

        // var request = { "requests": 
        //   [{ "sortRange": 
        //     { "range": { 
        //       "sheetId": shtId, 
        //       "startRowIndex": 1, 
        //       "endRowIndex": shtVals.length+2, 
        //       "startColumnIndex": 0, 
        //       "endColumnIndex": shtHdrs.length 
        //     }, 
        //     "sortSpecs": 
        //     [{ "sortOrder": "ASCENDING", "dimensionIndex": 0 }] 
        //     } 
        //   }] 
        // }

        // await gapi.client.sheets.spreadsheets.batchUpdate({
        //   spreadsheetId: spreadsheetId,
        //   resource: request
        // }).then(response => {

        //   console.log('sort complete')
        //   console.log(response)

        // })

      },

        function (reason) {

          console.error('error appending sheet "' + trpTitle + '": ' + reason.result.error.message);
          bootbox.alert('error appending sheet "' + trpTitle + '": ' + reason.result.error.message);

        });

  }

}

function modal(state) {
  if (state) {
    $("#overlay").fadeIn("slow");;

    // $("#overlay").css({"display":"block"});
  } else {
    $("#overlay").fadeOut("slow");;
  }
}

function parseDateTime(d) {

  var x = d.split(', ')

  var date = x[0]
  var time = x[1]

  var wrk = date.split('/')

  const pad = x => ('0' + x).slice(-2)

  var dateyymmdd = wrk[2] + '-' + pad(wrk[0]) + '-' + pad(wrk[1])

  if (time) {

    var wrk = time.split(':')
    var hh = wrk[0]*1
    var mm = wrk[1]
    var ampm = mm.substr(3,2)
    var hr = ampm == "PM" && hh < 12 ? hh + 12 : hh
    var min = pad(mm.split(' ')[0])
    var time = hr + ':' + min

  } else {

    var time = ''

  }

  return {

      date: dateyymmdd,
      time: time

  }

}

function formatDateTime(d, t) {

  var wrk = d.split('-')

  var date = wrk[1]*1 + '/' + wrk[2]*1 + '/' + wrk[0]*1

  if (t) {
    // 
    var wrk = t.split(':')
    var hr = wrk[0]*1
    var mm = wrk[1].substr(0,2)
    var ampm = hr > 11 ? "PM" : "AM"
    var hh = hr > 12 ? hr - 12 : hr

    var time = hh + ':' + mm + ' ' + ampm

  } else {

    var time = ''

  }

  return date + (time ? ', ' : '')  + time

}

function parseMonth(mo) {

  const moNbr = new Map([
    ['Jan', '01'],
    ['Feb', '02'],
    ['Mar', '03'],
    ['Apr', '04'],
    ['May', '05'],
    ['Jun', '06'],
    ['Jul', '07'],
    ['Aug', '08'],
    ['Sep', '09'],
    ['Oct', '10'],
    ['Nov', '11'],
    ['Dec', '12']
  ])

  var d = mo.split(' ')
  var yr = d[1]

  var mo =moNbr.get(d[0])

  return yr + '-' + mo

}

function formatMonth(mo) {

  const moAbbr = new Map([
    ['01', 'Jan'],
    ['02', 'Feb'],
    ['03', 'Mar'],
    ['04', 'Apr'],
    ['05', 'May'],
    ['06', 'Jun'],
    ['07', 'Jul'],
    ['08', 'Aug'],
    ['09', 'Sep'],
    ['10', 'Oct'],
    ['11', 'Nov'],
    ['12', 'Dec']
  ])

  var d = mo.split('-')
  var yr = d[0]

  var mo =moAbbr.get(d[1])

  return mo + ' ' + yr

}

function debounce(callback, wait) {
  let timeout;
  return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(function () { callback.apply(this, args); }, wait);
  };
}

