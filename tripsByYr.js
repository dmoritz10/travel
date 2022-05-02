async function btnTripByYrHtml() {

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
  
      vals[i].push(i)                    
      
      vals[i].push(new Date(vals[i][trpHdrs.indexOf('Start Date')]))
    
    }

    trpHdrs.push('dStart')
  
    var sortCol = vals[0] ? vals[0].length - 1 : 0    // in case of empty sheet.  ie. hdrs only
  
    trpVals = vals.sort(function(a,b){return a[sortCol] < b[sortCol] ? 1 : -1; });
    
    // trpVals.forEach((val, idx, arr)=> arr[idx].pop()) // remove sort element from end of array
    
  
    var trp = [["", "J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"]]
    var circle = '<span class="material-icons" style="font-size: 16px;color:#cccc00;">circle</span>'
    // var circle = '<span class="rounded-circle border border-1">&nbsp;</span>'

    // for (var i = 0; i < trpVals.length; i++) {
        for (var i=0;i<31;i++) {


        var val = trpVals[i]

        var row = [i+1, circle, circle, circle, circle, circle, circle, circle, circle, circle, circle, circle, circle]
        
        trp.push(row)

    }

    console.log('trp', trp)
    
    var tbl = new Table();
    
    tbl
        .setHeader()
        .setTableHeaderClass()
        .setData(trp)
        .setTableClass('table table-borderless')
        .setTrClass('d-flex')
        .setTcClass(['col-1','col','col','col','col','col','col','col','col','col','col','col','col'])
        .setTdClass('m-0 p-0 border-0')
        .build('#tblTripsByYr');


    modal(false)

    gotoTab('TripsByYear')

}