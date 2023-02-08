// database access

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

      let response = await gapi.client.sheets.spreadsheets.values.batchGet({spreadsheetId: spreadsheetId, ranges: shtRngs})
        .then(async response => {               console.log('gapi first try', response)
            
            return response})

        .catch(async err  => {                  console.log('gapi token1', err)
            
            if (err.result.error.code == 401 || err.result.error.code == 403) {
                await Goth.token()              // for authorization errors obtain an access token
                let retryResponse = await gapi.client.sheets.spreadsheets.values.batchGet({spreadsheetId: spreadsheetId, ranges: shtRngs})
                    .then(async retry => {      console.log('gapi retry', retry) 
                        
                        return retry})

                    .catch(err  => {            console.log('gapi error2', err)
                        
                        bootbox.alert('gapi error: ' + err.result.error.code + ' - ' + err.result.error.message);

                        return null });         // cancelled by user, timeout, etc.

                return retryResponse

            } else {
                
                bootbox.alert('gapi error: ' + shtTitle + ' - ' + response.result.error.message);
                return null

            }
                
        })
        
                                                console.log('after gapi')
  
   
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
  
    })
  
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
  
        },
  
          function (reason) {
  
            console.error('error appending sheet "' + trpTitle + '": ' + reason.result.error.message);
            bootbox.alert('error appending sheet "' + trpTitle + '": ' + reason.result.error.message);
  
          });
  
    }
  
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
  