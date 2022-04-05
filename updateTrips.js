async function updateTrips() {

    var objShts = await openShts(
        [
          { title: 'Location History Detail', type: 'all' },
          { title: 'Trips', type: 'all'}

        ])
    
    var valsLHD    = objShts['Location History Detail'].vals
    var hdrsLHD   = objShts['Location History Detail'].colHdrs
  
    var valsTRP  = objShts['Trips'].vals
    var hdrsTRP = objShts['Trips'].colHdrs
  
    const LHDTripCol = hdrsLHD.indexOf('Trip')
    const LHDDestCol = hdrsLHD.indexOf('Destinations')
    const LHDMonthCol = hdrsLHD.indexOf('Month')

    const TRPKeyCol  = hdrsTRP.indexOf('Composite Key')
    const colTRPKeys = valsTRP.map(x => x[TRPKeyCol]);
  
    var updateCntr = 0
    var appendCntr = 0
  

    for (var i = 0;i<valsLHD.length;i++) {
  
      var ele = valsLHD[i]

      if (ele[LHDTripCol])
        {
          var trip = buildTrip(i, valsLHD, hdrsLHD, valsTRP, hdrsTRP)
          i = trip.endIdx*1 + 1

        } else continue
      
        
      let key = ele[LHDDestCol].split(' - ') + ' - ' + ele[LHDMonthCol]

console.log('key', key)


      let row = colTRPKeys.indexOf(key)

console.log('row', key)

      if (row == -1)   {

        valsTRP.push(trip.val);
        appendCntr++
      } else {
        // if (trp[hdrsTRP.indexOf('Source')] != 'Manual') {
          valsTRP[row] = trip.val;
          updateCntr++
        // }
      }
  
    }
  
    console.log('updateAppendSht')
    console.log('updateCntr', updateCntr)
    console.log('appendCntr', appendCntr)
    console.log('total', appendCntr + updateCntr)
  
    var shtArr = [hdrsTRP].concat(valsTRP)
  
    console.time('updateSheet')
  
    await updateSheet('Trips', shtArr)
  
    console.timeEnd('updateSheet')
  
    console.log('Update complete')
  
}

function buildTrip(strIdx, valsLHD, hdrsLHD, valsTRP, hdrsTRP) {

  var trp = []
  var ele = valsLHD[strIdx]

  console.log('ele', ele)

  // console.log('destginations', ele[hdrsLHD.indexOf('Destinations')])
  
  trp[hdrsTRP.indexOf('Composite Key')]  = JSON.parse(ele[hdrsLHD.indexOf('Destinations')]).join(' - ') + ' - ' + ele[hdrsLHD.indexOf('Trip')]
  trp[hdrsTRP.indexOf('Trip')]           = ele[hdrsLHD.indexOf('Trip')]
  trp[hdrsTRP.indexOf('Month')]          = ele[hdrsLHD.indexOf('Month')]
  trp[hdrsTRP.indexOf('Destinations')]   = ele[hdrsLHD.indexOf('Destinations')]
  trp[hdrsTRP.indexOf('Type')]           = ele[hdrsLHD.indexOf('Country')] == "USA" ? "Domestic" : "International"
  trp[hdrsTRP.indexOf('Start Date')]     = ele[hdrsLHD.indexOf('Date')].split(',')[0]
  trp[hdrsTRP.indexOf('Source')]         = 'LHD'

  var destArr = []
  
  for (var i=strIdx;i<valsLHD.length;i++) {

    var dest = valsLHD[i]

    if (dest[hdrsLHD.indexOf('Trip')]) {

      destArr.push({

        name:   dest[hdrsLHD.indexOf('Name')],
        date:   dest[hdrsLHD.indexOf('Date')],
        city:   dest[hdrsLHD.indexOf('City')],
        state:  dest[hdrsLHD.indexOf('Country')] == "USA" ? dest[hdrsLHD.indexOf('State')] : dest[hdrsLHD.indexOf('Country')]

      })

    } else {

      trp[hdrsTRP.indexOf('End Date')]              = dest[hdrsLHD.indexOf('Date')].split(',')[0]
      trp[hdrsTRP.indexOf('Destination Detail')]    = JSON.stringify(destArr)
      trp[hdrsTRP.indexOf('Nbr Days')]              = calcNbrDays(trp[hdrsTRP.indexOf('Start Date')], trp[hdrsTRP.indexOf('End Date')])
      return {val: trp, endIdx: i-1}

    }

  }

  trp[hdrsTRP.indexOf('End Date')]              = dest[hdrsLHD.indexOf('Date')].split(',')[0]
  trp[hdrsTRP.indexOf('Destination Detail')]    = JSON.stringify(destArr)
  trp[hdrsTRP.indexOf('Nbr Days')]              = calcNbrDays(trp[hdrsTRP.indexOf('Start Date')], trp[hdrsTRP.indexOf('End Date')])
      
  return {val: trp, endIdx: i-1}

}


function calcNbrDays(str, end) {

  var strDate = DateTime.fromJSDate(new Date(str))
  var endDate = DateTime.fromJSDate(new Date(end))

  const diff = endDate.diff(strDate, ["days"]).days

  return diff*1 + 1

}