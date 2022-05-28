async function showPlace(idx) {

    if (idx === null) return                  // null is from browseDocument
  
    var pl = []
  
    var vals = placeTree[idx]
    
    var plmonths = vals.nodes
  
    var brkMonth
  
    for (var i=0; i<plmonths.length;i++) {
  
      var val = plmonths[i]

      var month = vals.text
  
      if (month != brkMonth) {
  
        pl.push(["<div class='text-start text-primary h4'>" + month, '<div class="">&nbsp;</div>'])
  
        brkMonth = month
  
      }

      for (var j=0;j<val.length;j++) {

        var dtl = val.text.split(' - ')
    
        // var dtl = val.name + "<br><h6>" +
        //             val.city + (val.state ? ", " : "") +
        //             val.state + "<br>" +
        //             icon
        
        trp.push([dtl[0], dtl[1]])
    
      }
    }
    
    var tbl = new Table();
    
    tbl
      .setHeader()
      .setTableHeaderClass()
      .setData(trp)
      .setTableClass('table table-borderless')
      .setTrClass('d-flex')
      .setTcClass(['text-end col-4 h5 text-success align-items-center', 'text-start col h4'])
      .setTdClass('py-1 pb-0 mb-0 border-0 align-bottom border-bottom')
      .build('#tblPlaces');
  
    gotoTab('ShowPlace')
  
    $('#tblPlaces tr').click(function(e){         // highlight clicked row
  
      $('#tblPlaces tr').removeClass('ele-selected');
      $(e.currentTarget).addClass('ele-selected')
      
    });
  
  
  } 
  
  function browseDocument(dir) {
  
    var idx   = $("#pldArrIdx").val()*1       
  
    var shtRows = trpVals.length                   
  
    var eleArr = [...$('#trpContainer > div')].slice(1)      // remove the template
  
    if (dir=="prev")  {
      var prevIdx = (idx-1 >= 0) ? idx-1 : null
      while (prevIdx !== null) {
        if ($(eleArr[prevIdx]).hasClass('d-none') || $(eleArr[prevIdx]).css('display') == 'none') {  
          prevIdx = (prevIdx-1 >= 0) ? prevIdx-1 : null
        } else {
          break;
        }
      }
      showTrip(prevIdx)
    } else {
      var nextIdx = (idx+1 <  shtRows) ? idx+1 : null
      while (nextIdx) {
        if ($(eleArr[nextIdx]).hasClass('d-none') || $(eleArr[nextIdx]).css('display') == 'none') {  
          nextIdx = (nextIdx+1 <  shtRows) ? nextIdx+1 : null
        } else {
          break;
        }
      }
       showTrip(nextIdx)
    }
  
  }
  
  
  function clearAndGotoTab(sht) {
  
    $("#tblPlaces").html('')
    
    gotoTab(sht)
  
  }
  
  
  
  function sortDest(vals) {
  
    for (var i=0;i<vals.length;i++) {
  
      console.log('vals', vals[i])
  
      vals[i]['sort'] = new Date(vals[i]['date'])
    
    }
  
    var sortCol = vals[0] ? vals[0].length - 1 : 0    // in case of empty sheet.  ie. hdrs only
  
    vals.sort((a,b) =>  a.sort < b.sort ? -1 : 1);
  
    vals.forEach((val, idx, arr)=> delete val['sort']) // remove sort element from end of array
    
  }