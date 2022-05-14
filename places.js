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

    vals.sort(placeSorter(nameCol, dateUTCCol));

    var arr = []
  
    var nbr = 0
    var brkName

    for (var i=0;i<vals.length;i++) {

        var val = vals[i]

        var name = val[nameCol]
        
        if (brkName != name) {

            if (brkName) arr.push([name, val[monthCol], val[dateCol], nbr])

            brkName = name

            nbr = 0

            var placeObj = {

                place:   name,
                class:  (convertStateToAbbr(cntry) ? "plTreeitem text-success h4" : "plTreeitem text-primary h4"),
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
                class:  (convertStateToAbbr(cntry) ? "plTreeitem text-success h4" : "plTreeitem text-primary h4"),
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

    $("#plNbrDom").html(nbrDom)
    $("#plNbrIntl").html(nbrIntl)
    

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