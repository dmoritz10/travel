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
    
    trpHdrs = objSht[trpTitle].colHdrs.push('sDate')
    trpVals = objSht[trpTitle].vals
    
    var vals = trpVals
  
    for (var i=0;i<vals.length;i++) {
  
      vals[i].push(i)                    // idx xref
      
      vals[i].push(new Date(vals[i][trpHdrs.indexOf('Start Date')]))
    
    }
  
    var sortCol = vals[0] ? vals[0].length - 1 : 0    // in case of empty sheet.  ie. hdrs only
  
    trpVals = vals.sort(function(a,b){return a[sortCol] < b[sortCol] ? 1 : -1; });
    
    // trpVals.forEach((val, idx, arr)=> arr[idx].pop()) // remove sort element from end of array
    
  
    var $tblSheets = $("#tblTripsByYr") 

    var trp = ['', 'J', "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"]
    var circle = '<span class="material-icons">circle</span></div>'

  
  
    for (var j = 0; j < trpVals.length; j++) {

        var val = trpVals[i]

        var row = [j+1, circle, circle, circle, circle, circle, circle, circle, circle, circle, circle, circle]
        
        
        trp.push([row])

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

}