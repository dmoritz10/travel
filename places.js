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

            if (brkName) arr.push([name, nbr, plDtl])

            brkName = name

            nbr = 0

            plDtl = []
            
        }

        plDtl.push([val[dateCol], val[cityCol], val[month]])

    }

    if (plDtl.length>0) arr.push([name, nbr, plDtl])

    arr.sort(placeSorter(1, 0));


    var treeData = []
    var brkName

    for (var i=0;i<arr.length;i++) {

        var ele = arr[i]

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

            if (month != brkMonth) {

       
                placeObj.nodes.push({

                    text:   month,
                    class:  "h6",
                    nodes: []

                })
                
                brkMonth = month
                
console.log('here', name, month)

            }

            console.log('placeobj', placeObj)


            placeObj.nodes.nodes.push({           
                            text: date + ' - ' + city,
                            class:  "h6"
                        })

        }

        if (placeObj) treeData.push(placeObj)

    }

    if (placeObj) treeData.push(placeObj)
    
    nbrDom = 0
    nbrIntl = 0

    for (var i = 0; i < treeData.length;i++) {

        var ele = treeData[i]

        // var cntry = ele.text

        // if (convertStateToAbbr(ele.text))       nbrDom++
        // else                                    nbrIntl++

        ele.text = ele.text + '<span class="text-warning float-end">' + ele.nodes.length + '</span>'

    }

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