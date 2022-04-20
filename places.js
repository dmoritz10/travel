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
    
    var monthCol = resHdrs.indexOf('Month')
    var tripCol  = resHdrs.indexOf('Trip')
    var cntryCol = resHdrs.indexOf('Countries')
    
    var vals = resVals

    var arr = []
  
    for (var i=0;i<vals.length;i++) {
  
        var month = vals[i][monthCol]
        var cntries = vals[i][cntryCol]
        var trip = vals[i][tripCol]

        var countries = JSON.parse(cntries)
    
        console.log(countries, states, trip, month)

        // if (countries[0] == 'USA') {

        //     states.forEach(ele => {

        //         var sortkey = parseMonth(month)
        
        //         arr.push([ele, trip, month, sortkey])
        
        //     })

        // } else {
    
            countries.forEach(ele => {

                var sortkey = parseMonth(month)
        
                arr.push([ele, trip, month, sortkey])
        
            })
      
        // }
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
                class:  (convertStateToAbbr(cntry) ? "text-success h4" : "text-primary h4"),
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

    if (cntryObj) treeData.push(cntryObj)

    
    console.log(treeData)

    nbrDom = 0
    nbrIntl = 0

    for (var i = 0; i < treeData.length;i++){

        var ele = treeData[i]

        var cntry = ele.text

        if (convertStateToAbbr(ele.text))     nbrDom++
        else                               nbrIntl++

        ele.text = ele.text + '<span class="text-warning float-end">' + ele.nodes.length + '</span>'

    }

    $("#plNbrDom").html(nbrDom)
    $("#plNbrIntl").html(nbrIntl)
    

    $('#plContainer').bstreeview({ 

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