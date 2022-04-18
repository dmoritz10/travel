async function btnPlacesHtml() {

    modal(true)
  
    var objSht = await openShts(
      [
        { title: "Trips", type: "all" }
      ])
  
    console.log('objSht', objSht)
  
    resTitle = "Trips"
    
    resHdrs = objSht[resTitle].colHdrs
    resVals = objSht[resTitle].vals
    
    var keyCol = resHdrs.indexOf('Composite Key')
    var monthCol = resHdrs.indexOf('Month')
    
    var vals = resVals

    var arr = []
  
    for (var i=0;i<vals.length;i++) {
  
        var key = vals[i][keyCol]
        var month = vals[i][monthCol]

        var wrk = key.split(' | ')

        if (wrk.length < 2) continue

        var countries = wrk[1].split(' - ')
        var x = key.split(' - ' + month)
    
        var trip = x[0]

        console.log(countries, trip, month)
    
        countries.forEach(ele => {

            var sortkey = parseMonth(month)
    
            arr.push([ele, trip, month, sortkey])
    
        })
      
    }
  
    // arr.sort(function(a,b){return a[3] < b[3]  || a[0] > b[0] });
    arr.sort(countrySorter(0, 3));

    console.log('arr', arr)
    
    var treeData = []
    var brkcntry

    for (var i=0;i<arr.length;i++) {

        var ele = arr[i]

        var cntry = ele[0]
        var trip = ele[1]
        var month = ele[2]

        if (brkcntry != cntry) {

            if (brkcntry) treeData.push(cntryObj)

            brkcntry = cntry

            var cntryObj = {

                text:   cntry,
                class:  "text-success h4",
                // icon:   "fa",
                nodes:  []

            }

        }

        cntryObj.nodes.push({

            text:   month + ' - ' + trip,
            class:  "h6"
            // icon:   "fa"

        })

    }
    
    console.log(treeData)

    nbrDom = 0
    nbrIntl = 0

    treeData.forEach( ele => {

        var cntry = ele.text
        console.log('ele', ele.text)

        console.log('cntry', cntry)
        console.log('convertStateToAbbr(cntry)', convertStateToAbbr(cntry))

        if (convertStateToAbbr(cntry) == cntry)     nbrIntl++
        else                                        nbrDom++

    })

    $("#plNbrDom").html(nbrDom)
    $("#plNbrIntl").html(nbrIntl)
    

    $('#plContainer').bstreeview({ 

        // expandIcon: 'fa fa-angle-down',
        // collapseIcon: 'fa fa-angle-up',
        data: treeData
      
    });

      modal(false)
      gotoTab("Places")
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