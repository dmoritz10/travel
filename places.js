async function btnPlacesHtml() {

    modal(true)
  
    var objSht = await openShts(
      [
        { title: "Reservations", type: "all" }
      ])
  
    console.log('objSht', objSht)
  
    resTitle = "Reservations"
    
    resHdrs = objSht[resTitle].colHdrs
    resVals = objSht[resTitle].vals
    
  var keyCol = resHdrs.indexOf('Composite Key')
  
  var vals = resVals

    var arr = []
  
    for (var i=0;i<vals.length;i++) {
  
        var key = vals[i][keyCol]

        var countries = key.split(' | ')
        var x = key.split(' - ')
    
        var trip = x[0]
        var month = x[1]
    
        countries.forEach(ele => {
    
            arr.push([ele, trip, month])
    
        })
      
    }
  
    arr.sort(function(a,b){return a[0] > b[0] ? 1 : -1; });
    
    var treeData = []
    var brkcntry

    arr.forEach( ele => {

        var cntry = ele[0]
        var trip = ele[1]
        var month = ele[2]

        if (brkcntry != cntry) {


            if (brkcntry) treeData.push(cntryObj)

            brkcntry = cntry

            var cntryObj = {

                text: cntry,
                nodes: []

            }

        }

        cntryObj.nodes.push({

            text: month + ' - ' + trip

        })

    })

    console.log(cntryObj)

    $('#plContainer').bstreeview({ 
        data: treeData
      });

}