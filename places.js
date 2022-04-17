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
    
        arr.push([ele, trip, month])
    
        })
      
    }
  
    arr.sort(function(a,b){return a[0] > b[0] ? 1 : -1; });

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

                text: cntry,
                icon: "fa",
                nodes: []

            }

        }

        cntryObj.nodes.push({

            text: month + ' - ' + trip,
            icon: "fa"

        })

    }
    
    
    
    console.log(treeData)

    $('#plContainer').bstreeview({ 
        data: treeData
      });
      modal(false)
      gotoTab("Places")
}