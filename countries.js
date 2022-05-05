async function btnCountriesHtml() {

    modal(true)
  
    var objSht = await openShts(
      [
        { title: "Trips", type: "all" }
      ])
  
    console.log('objSht', objSht)
  
    resTitle = "Trips"
    
    resHdrs = objSht[resTitle].colHdrs
    resVals = objSht[resTitle].vals
    
    var monthCol = resHdrs.indexOf('Month')
    var tripCol  = resHdrs.indexOf('Trip')
    var cntryCol = resHdrs.indexOf('Countries')
    var strDtCol = resHdrs.indexOf('Start Date')
    var endDtCol = resHdrs.indexOf('End Date')
    var destCol  = resHdrs.indexOf('Destinations')
    
    var vals = resVals

    var arr = []
  
    for (var i=0;i<vals.length;i++) {
  
        var month = vals[i][monthCol]
        var cntries = vals[i][cntryCol]
        var trip = vals[i][tripCol]
        var dateRng = vals[i][strDtCol].slice(0,-5) + ' - ' + vals[i][endDtCol].slice(0,-5)
        var dest = JSON.parse(vals[i][destCol])
        var countries = JSON.parse(cntries)
        
            countries.forEach(ele => {

                var sortkey = parseMonth(month)
                arr.push([ele, trip, month, sortkey, dateRng, dest, countries])
        
            })
      
    }
  
    arr.sort(countrySorter(0, 3));

    var treeData = []
    var brkcntry

    for (var i=0;i<arr.length;i++) {

        var ele = arr[i]

        var cntry = ele[0]
        var trip = ele[1]
        var month = ele[2]
        var dates = ele[4]
        var dests = ele[5].join(' - ')
        var cntys = ele[6].join(' - ')

        if (brkcntry != cntry) {

            if (brkcntry) treeData.push(cntryObj)

            brkcntry = cntry

            var cntryObj = {

                text:   cntry,
                class:  (convertStateToAbbr(cntry) ? "cntTreeitem text-success h4" : "cntTreeitem text-primary h4"),
                nodes:  []

            }

        }

        cntryObj.nodes.push({

            text:   month + ' - ' + trip,
            class:  "h6",
            nodes: [

                {
                    text: dates,
                    class:  "h6"
                },
                {
                    text: dests,
                    class:  "h6"
                },
                {
                    text: cntys,
                    class:  "h6"
                }

            ]

        })

    }

    if (cntryObj) treeData.push(cntryObj)
    
    nbrDom = 0
    nbrIntl = 0

    for (var i = 0; i < treeData.length;i++) {

        var ele = treeData[i]

        var cntry = ele.text

        if (convertStateToAbbr(ele.text))       nbrDom++
        else                                    nbrIntl++

        ele.text = ele.text + '<span class="text-warning float-end">' + ele.nodes.length + '</span>'

    }

    $("#cntNbrDom").html(nbrDom)
    $("#cntNbrIntl").html(nbrIntl)
    

    $('#cntContainer').bstreeview({ data: treeData });

    var srchVal = $("#cntSearch").val().toLowerCase()
    var exc = false
  
    if (srchVal) {

        $(".cntTreeitem").filter(function() {

            var txt = $(this).text().toLowerCase()

            if (exc)    var toggle = txt.indexOf(srchVal.substring(1)) == -1
            else        var toggle = txt.indexOf(srchVal) > -1

            $(this).toggle(toggle)

        });

        // $("#resNbr").html(countDisplayed("resContainer"))

    };

      modal(false)
      gotoTab("Countries")
}

function countrySorter(firstKey, secondKey) {
    return function(a, b) {  
        if (a[firstKey] < b[firstKey]) {  
            return -1;  
        } else if (a[firstKey] > b[firstKey]) {  
            return 1;  
        }  
        else {
            if (a[secondKey] > b[secondKey]) {  
                return -1;  
            } else if (a[secondKey] < b[secondKey]) {  
                return 1;  
            } else {
                return 0;
            }
        } 
    }  
}