function updateTripsHtml() {

    var objShts = await openShts(
        [
          { title: 'Location History Detail', type: 'all' },
          { title: 'Trips', type: 'all'},
          { title: 'Settings', type: 'all'}
        ])
    
        var valsLHD    = objLHD['Location History Detail'].vals
        var hdrsLHD   = objLHD['Location History Detail'].colHdrs
      
        var valsTRP  = objLHD['Trips'].vals
        var hdrsTRP = objLHD['Trips'].colHdrs
     
        const LHDTripCol = hdrsLHD.indexOf('Trip')

        const TRPTripCol = hdrsTRP.indexOf('Trip')
        const colTRPTrips = valsTRP.map(x => x[TRPTripCol]);
      
        var updateCntr = 0
        var appendCntr = 0
      
        
        for (var i = 0;i<valsLHD.length;i++) {
      
          var ele = valsLHD[i]

          if (ele[LHDTripCol])
            var trip = buildTrip(i, valsLHD, hdrsLHD, valsTRP, hdrsTRP)
          else
            continue

          i = trip.endRow + 1
      
          let row = colTRPTrips.indexOf(ele[LHDTripCol])
          
          if (row == -1)   {

            arrLHD.push(trip.val);
            appendCntr++
          } else {
            // if (trp[hdrsTRP.indexOf('Source')] != 'Manual') {
              arrLHD[row] = trip.val;
              updateCntr++
            // }
          }
      
        }
      
        console.log('updateAppendSht')
        console.log('arr', arr.length)
        console.log('arrLHD', arrLHD)
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

  var dateCol     = hdrsLHD.indexOf('Date')
  var dateUTCCol  = hdrsLHD.indexOf('UTC Date')

  var trp = []
  var ele = vals[strIdx]

  trp[hdrsTRP.indexOf('Trip')]           = ele[hdrsTRP.indexOf('Trip')]
  trp[hdrsTRP.indexOf('Month')]          = ele[hdrsTRP.indexOf('Month')]
  trp[hdrsTRP.indexOf('Destinations')]   = ele[hdrsTRP.indexOf('Trip')].split(' - ')[0]
  trp[hdrsTRP.indexOf('Type')]           = ''
  trp[hdrsTRP.indexOf('Start Date')]     = ele[hdrsTRP.indexOf('Date')].split(',')[0]
  trp[hdrsTRP.indexOf('Source')]         = 'LHD'

  var destArr = []
  
  for (var i=strIdx;i<valsLDH.length;i++) {

    var dest = valsLHD[i]

    if (ele[hdrsTRP.indexOf('Trip')]) {

      destArr.push({

        name:   ele[hdrsTRP.indexOf('Name')],
        date:   ele[hdrsTRP.indexOf('Date')].split(',')[0],
        city:   ele[hdrsTRP.indexOf('City')],
        state:  ele[hdrsTRP.indexOf('Country')] == "USA" ? ele[hdrsTRP.indexOf('State')] : ele[hdrsTRP.indexOf('Country')]

      })

    }

  }

  trp[hdrsTRP.indexOf('End Date')]              = trpDtl[hdrsTRP.indexOf('Date')].split(',')[0]
  trp[hdrsTRP.indexOf('Destination Detail')]    = JSON.stringify(destArr)
  

  return {val: trp, endIdx: i-1}

}
