async function btnPlacesHtml() {

    modal(true)
  
    var objSht = await openShts(
      [
        { title: "Location History Detail", type: "all" }
      ])
  
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

    var arrAct = []
  
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

        pushActivities(hdrs, val, arrAct)

        plDtl.push([val[dateCol], val[cityCol], val[monthCol]])
        nbr++

    }

    console.log(arrAct)

    if (plDtl.length>0) arr.push([name, nbr, plDtl])

    arr.sort(placeSorter(1, 0));

    placeTree = []
    var brkName

    for (var i=0;i<arr.length;i++) {
        // for (var i=0;i<5;i++) {

        var ele = arr[i]

        var name = ele[0]
        var nbr  = ele[1]
        var plDtl = ele[2]

        var placeObj = {

            text:   name,
            nbr:    nbr,
            class:  "plTreeItem text-primary h4",
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

            }

            var currNode = placeObj.nodes.length - 1

            var x = placeObj.nodes[currNode].nodes

            x.push({           
                            text: date + ' - ' + city,
                            class:  "h6"
                        })

        }

        if (placeObj) placeTree.push(placeObj)

    }

    if (placeObj) placeTree.push(placeObj)
    
    for (var i = 0; i < placeTree.length;i++) {

        var ele = placeTree[i]

        ele.text = ele.text + '<span class="text-warning float-end">' + ele.nbr + '</span>'

    }

    console.log('placeTree1', placeTree)


    $("#plNbr").html(arr.length)
    
    var $tblSheets = $("#plContainer > .d-none").eq(0)  // the 1st one is a template which is always d-none

    var x = $tblSheets.clone();
    $("#plContainer").empty();
    x.appendTo("#plContainer");
  
 
    for (var j = 0; j < placeTree.length; j++) {

        var place = placeTree[j]

        var ele = $tblSheets.clone();
    
        ele.find('#plPlace')[0].innerHTML = place.text
        ele.find('#plCompositeKey')[0].innerHTML = place.text + ' - ' + uniqueCities(place).join(' - ')
        ele.find('#plPlace')[0].setAttribute("onclick", "showPlace(" + j + ")");
        
        ele.removeClass('d-none');
    
        ele.appendTo("#plContainer");
    
      }

    var srchVal = $("#plSearch").val().toLowerCase()
    var exc = false
  
    if (srchVal) {

        $("#plContainer #plCompositeKey").filter(function() {

            var txt = $(this).text().toLowerCase()

            if (exc)    var toggle = txt.indexOf(srchVal.substring(1)) == -1
            else        var toggle = txt.indexOf(srchVal) > -1

            $(this).parent().parent().parent().toggle(toggle)

        });

        $("#plNbr").html(countDisplayed("plContainer"))

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

function uniqueCities(place) {

    var uniqCities = []

    var plmonths = place.nodes
  
    for (var i=0; i<plmonths.length;i++) {
  
      var val = plmonths[i]

      var cities = val.nodes

      for (var j=0;j<cities.length;j++) {

        var x = cities[j]

        var dtl = x.text.split(' - ')

        if (uniqCities.indexOf(dtl[1]) == -1) uniqCities.push(dtl[1])

      }
    }

    return uniqCities

}

function pushActivities(hdrs, valLHD, arrAct) {

    var dateCol     = hdrs.indexOf('Date')
    var dateUTCCol  = hdrs.indexOf('UTC Date')
    var actCol     = hdrs.indexOf('Activities')

    var act = JSON.parse(valLHD[actCol])

    for (let [key, val] of Object.entries(act)) {

        
        arrAct.push([valLHD[dateCol], valLHD[dateUTCCol], key, val.duration, val.distance]) 

    }




}