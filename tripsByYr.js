async function btnTripByYrHtml() {

    // modal(true)

    if ($('#tbyYr').html() != '')  {
        var selectedYr = $('#tbyYr').html()
    } else {
        var selectedYr = new Date().getFullYear()
        $('#tbyYr').html(selectedYr)
    }

    console.log('t', tbyYr)

    var objSht = await openShts(
      [
        { title: "Trips", type: "all" }
      ])
  
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
    var circle = '<span class="dot color"></span>'

    for (var i = 0; i < 31; i++) {

        var row = [i+1, circle, circle, circle, circle, circle, circle, circle, circle, circle, circle, circle, circle]
        
        trp.push(row)

    }

    var nbrTrips = 0
    var nbrDays = 0

    for (var i = 0; i < trpVals.length; i++) {

        // read dates until 1st sDate is in the selected year
        // fill in corresopnding dot
        // so the same until either eDate or end of year
        //          of end of year break
        //          else read next trip


        

        var vals = trpVals[i]

        var sDate = vals[trpHdrs.indexOf("Start Date")]
        var eDate = vals[trpHdrs.indexOf("End Date")]

        var sDt = calcUTCDate(sDate)

        var sYr = sDt.getFullYear()
        var sMo = sDt.getMonth()+1
        var sDa = sDt.getDate();
         
        var eDt = calcUTCDate(eDate)
        var eYr = eDt.getFullYear()
        var eMo = eDt.getMonth()+1
        var eDa = eDt.getDate();

        var firstOfYr = calcUTCDate('1/1/' + selectedYr);
        var lastOfYr = calcUTCDate('12/31/' + selectedYr);

        if (sDt < firstOfYr && eDt < firstOfYr || sDt > lastOfYr && eDt > lastOfYr) continue;

        nbrTrips++

        nbrDays += placeDot(sDt, eDt, trp, firstOfYr, lastOfYr, nbrDays)

        clearSpuriousDots(trp, firstOfYr)

        $('#tbyNbrDays').html(nbrDays)
        $('#tbyNbrTrips').html(nbrTrips)

    }

    var tbl = new Table();
    
    tbl
        .setHeader()
        .setTableHeaderClass()
        .setData(trp)
        .setTableClass('table table-borderless')
        .setTrClass('d-flex')
        .setTcClass(['col-1  text-center','col','col','col','col','col','col','col','col','col','col','col','col'])
        .setTdClass('m-0 p-0 border-0')
        .build('#tblTripsByYr');


    // modal(false)

    gotoTab('TripsByYear')

}

function placeDot(sDt, eDt, trp, firstOfYr, lastOfYr) {

    var nbrDays = 0

    var dt = sDt < firstOfYr ? eDt : sDt

    while (dt <= lastOfYr && dt <= eDt) {

        var eMo = dt.getMonth()+1
        var eDa = dt.getDate()-1;

        var col = eMo
        var row = eDa + 1

        var color = ['red', 'purple', 'lightblue', 'green', 'lightpurple', 'blue', 'red', 'purple', 'lightblue', 'green', 'lightpurple', 'blue'][eMo]

        trp[row][col] = trp[row][col].replace(/color/g, color)

        dt.setDate(dt.getDate() + 1);

        nbrDays++

    }

    return nbrDays

}

function clearSpuriousDots(trp, firstOfYr) {

    var ja = firstOfYr.getMonth()+1
    var yr = firstOfYr.getFullYear()

    for (var i=0; i<13;i++) {

        var mo = ja + i

        var lastDyOfMo = new Date(yr, mo, 0).getDate()

        for (var j = lastDyOfMo + 1; j<32;j++) {

            var col = mo
            var row = j

            trp[row][col] = trp[row][col].replace(/dot/g, "")

        }

    }

}


function calcUTCDate(dateStr) {

    var dt = dateStr.split('/')

    var yr = dt[2]
    var mo = ('0' + dt[0]).slice(-2)
    var da = ('0' + dt[1]).slice(-2)

    return new Date(yr + '-' + mo + '-' + da + 'T00:00:00') 

}

function changeYr(dir) {

    var selectedYr = $('#tbyYr').html()*1

    if (dir == 'prev') {
        selectedYr--
    } else {
        selectedYr++
    }

    $('#tbyYr').html(selectedYr)

    btnTripByYrHtml()   
    
}