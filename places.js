async function btnPlacesHtml() {

    modal(true)
  
    var objSht = await openShts(
      [
        { title: "Location History Detail", type: "all" }
      ])
  
    console.log('objSht', objSht)
  
    var title  = "Location History Detail"
    
    var hdrs = objSht[title].colHdrs
    var vals = objSht[title].vals
    
    var nameCol     = hdrs.indexOf('Name')
    var monthCol     = hdrs.indexOf('Month')
    var dateCol     = hdrs.indexOf('Date')
    var dateUTCCol  = hdrs.indexOf('UTC Date')
    var cityCol  = hdrs.indexOf('City')

    vals.sort(placeSorter(nameCol, dateUTCCol));

    var arr = []
  
    var nbr = 0
    var plDtl = []

    var brkName

    for (var i=0;i<vals.length;i++) {

        var val = vals[i]

        var name = val[nameCol]
        
        if (brkName != name) {

            if (brkName) arr.push([brkName, nbr, plDtl])

            brkName = name

            nbr = 0

            plDtl = []
            
        }

        plDtl.push([val[dateCol], val[cityCol], val[monthCol]])
        nbr++

    }

    if (plDtl.length>0) arr.push([name, nbr, plDtl])

    arr.sort(placeSorter(1, 0));

    console.log('arr', arr)


    var treeData = []
    var brkName

    // for (var i=0;i<arr.length;i++) {
        for (var i=0;i<20;i++) {

        var ele = arr[i]

        // console.log('ele', ele)

        var name = ele[0]
        var nbr  = ele[1]
        var plDtl = ele[2]

        var placeObj = {

            text:   name,
            class:  "plTreeitem text-primary h4",
            nodes:  []

        }


        var brkMonth

        for (var j=0;j<plDtl.length;j++) {

            var dtl = plDtl[j]

            var date = dtl[0]
            var city = dtl[1]
            var month = dtl[2]

            if (month + name != brkMonth) {

       
                placeObj.nodes.push({

                    text:   month,
                    class:  "h6",
                    nodes: []

                })
                
                brkMonth = month + name

console.log('here', name, month, placeObj)

            }

            console.log('placeobj', placeObj)

            var currNode = placeObj.nodes.length - 1

            var x = placeObj.nodes[currNode].nodes

            // console.log('x', x)
            x.push({           
                            text: date + ' - ' + city,
                            class:  "h6"
                        })

        }

        if (placeObj) treeData.push(placeObj)

    }

    if (placeObj) treeData.push(placeObj)
    
    console.log('treeData1', treeData)

    for (var i = 0; i < treeData.length;i++) {

        var ele = treeData[i]

        ele.text = ele.text + '<span class="text-warning float-end">' + ele.nodes.length + '</span>'

    }

    console.log('treeData1', treeData)


    $("#plNbr").html(arr.length)
    

    $('#plContainer').bstreeview({ data: treeData });

    var srchVal = $("#plSearch").val().toLowerCase()
    var exc = false
  
    if (srchVal) {

        $(".plTreeitem").filter(function() {

            var txt = $(this).text().toLowerCase()

            if (exc)    var toggle = txt.indexOf(srchVal.substring(1)) == -1
            else        var toggle = txt.indexOf(srchVal) > -1

            $(this).toggle(toggle)

        });

        // $("#resNbr").html(countDisplayed("resContainer"))

    };

      modal(false)
      gotoTab("Places")
}

function placeSorter(firstKey, secondKey) {
    return function(a, b) {  
        if (a[firstKey] < b[firstKey]) {  
            return 1;  
        } else if (a[firstKey] > b[firstKey]) {  
            return -1;  
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