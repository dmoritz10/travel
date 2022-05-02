async function btnTripByYrHtml() {

    modal(true)

    var selectedYr = "2022"
  
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
    
    console.log('hdrs', trpHdrs)
    console.log('vals', trpVals)
  
    var trp = [["", "J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"]]
    var circle = '<span class="dot"></span>'

    for (var i = 0;i < 31;i++) {

        var row = [i+1, circle, circle, circle, circle, circle, circle, circle, circle, circle, circle, circle, circle]
        
        trp.push(row)

    }


    // var circle = '<span class="rounded-circle border border-1">&nbsp;</span>'

    for (var i = 0; i < trpVals.length; i++) {
        // for (var i=0;i<31;i++) {

        // read dates until 1st sDate is in the selected year
        // fill in corresopnding dot
        // so the same until either eDate or end of year
        //          of end of year break
    //              else read next trip


        

        var val = trpVals[i]

        var sDate = vals[trpHdrs.indexOf("Start Date")]
        var eDate = vals[trpHdrs.indexOf("End Date")]

        var sDt = new Date(sDate)
        var sYr = sDt.getFullYear()
        var sMo = sDt.getMonth()+1
        var sDa = sDt.getDate();
         
        var eDt = new Date(eDate)
        var eYr = eDt.getFullYear()
        var eMo = eDt.getMonth()+1
        var eDa = eDt.getDate();

        var firstOfYr = new Date(new Date(selectedYr).getFullYear(), 0, 1);
        var lastOfYr = new Date(new Date(selectedYr).getFullYear(), 11, 31);

        console.log(sDt)
        console.log(firstOfYr)
        console.log(eDt)
        console.log(firstOfYr)

        if (sDt < firstOfYr && eDt < firstOfYr || sDt > lastOfYr && eDt > lastOfYr) continue;

        placeDot(sDt, eDt, trp, selectedYr)

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

function placeDot(sDt, eDt, trp, selectedYr) {

    var sYr = sDt.getFullYear()
    var sMo = sDt.getMonth()+1
    var sDa = sDt.getDate();

    var eYr = eDt.getFullYear()
    var eMo = eDt.getMonth()+1
    var eDa = eDt.getDate();

    var firstOfYr = new Date(new Date(selectedYr).getFullYear(), 0, 1);
    var lastOfYr = new Date(new Date(selectedYr).getFullYear(), 11, 31);

    var dt = sDt < firstOfYr ? eDt : sDt

    while (dt <= lastOfYr) {

        var eMo = dt.getMonth()+1
        var eDa = dt.getDate();

        var col = eMo
        var row = eDa + 1

        console.log('rowcol', row, col)

        trp[row][col].addClass('bg-primary')

        dt.setDate(dt.getDate() + 1);


    }


}


