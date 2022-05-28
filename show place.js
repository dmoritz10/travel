async function showPlace(idx) {

    if (idx === null) return                  // null is from browseDocument
  
    var pl = []
  
    var vals = placeTree[idx]
    
    $("#pldPlace")[0].innerHTML = vals[trpHdrs.indexOf('Trip')]
  
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
      .build('#tblTrips');
  
    gotoTab('ShowTrip')
  
    $('#tblTrips tr').click(function(e){         // highlight clicked row
  
      $('#tblTrips tr').removeClass('ele-selected');
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
  
    $("#tblTrips").html('')
    
    gotoTab(sht)
  
  }
  
  async function addNewDest() {
  
    $("#pldtl-form")[0].reset();
    $("#pldtl-modal").modal('show');
    $('#trpmdtlArrIdx').val($("#pldArrIdx").val())
  
    $('#btntrpmdtlDelete').addClass('d-none')
  
  }
  
  
  async function editTripDtl(arrIdx, destIdx) {
  
    if (user['email'] != 'dmoritz10@gmail.com') return   // only one user allowed to update Trip Detail
  
  
    $("#pldtl-form")[0].reset();
  
    $("#pldtl-modal").modal('show');
  
    $('#trpmdtlArrIdx').val(arrIdx)
    $('#trpmdtlDestIdx').val(destIdx)
                    
    
    var vals = trpVals[arrIdx]
  
    var trpObj = makeObj(vals, trpHdrs)
  
    var pldtl = JSON.parse(trpObj['Destination Detail'])[destIdx]
  
    var dt = pldtl.date ? parseDateTime(pldtl.date) : {date: '', time: ''}
  
    $('#trpmdtlTrip').val(pldtl.name)
    $('#trpmdtlDate').val(dt.date)
    $('#trpmdtlTime').val(dt.time)
    $('#trpmdtlCity').val(pldtl.city)
    $('#trpmdtlState').val(pldtl.state)
  
    $('#btntrpmdtlDelete').removeClass('d-none')
  
  }
  
  
  async function btntrpmdtlSubmitHtml() {
  
    if (!$('#pldtl-form').valid()) return
  
    var arrIdx = $('#trpmdtlArrIdx').val()
    var destIdx = $('#trpmdtlDestIdx').val() ? $('#trpmdtlDestIdx').val()*1 : -1
  
    var vals = trpVals[arrIdx]
  
    var destDtl = JSON.parse(vals[trpHdrs.indexOf("Destination Detail")])
  
    if (destIdx == -1) {
      
      destDtl.push({})
      destIdx = destDtl.length - 1
  
    }
  
    var destObj = destDtl[destIdx]
  
    destObj.name = $('#trpmdtlTrip').val()
    destObj.date = formatDateTime($('#trpmdtlDate').val(), $('#trpmdtlTime').val())
    destObj.city = $('#trpmdtlCity').val()
    destObj.state = $('#trpmdtlState').val()
  
    sortDest(destDtl)
  
    vals[trpHdrs.indexOf("Destination Detail")] = JSON.stringify(destDtl)
    vals[trpHdrs.indexOf("Source")] = 'Manual'
  
    modal(true)
  
    var trpIdx = arrIdx == -1 ? -1 : trpIdxArr[arrIdx]  // get the row nbr on the sheet from trpIdxArr
  
    await updateSheetRow(vals, trpIdx, "Trips")
  
    $("#pldtl-modal").modal('hide');
  
    showTrip(arrIdx)
  
    modal(false)
  
  }
  
  async function btntrpmdtlDeleteHtml() {
  
    var destIdx = $('#trpmdtlDestIdx').val()
  
    if (!destIdx) return
  
    var arrIdx = $('#trpmdtlArrIdx').val()
  
    var vals = trpVals[arrIdx]
  
    var destDtl = JSON.parse(vals[trpHdrs.indexOf("Destination Detail")])
  
    destDtl.splice(destIdx, 1)
  
    vals[trpHdrs.indexOf("Destination Detail")] = JSON.stringify(destDtl)
    vals[trpHdrs.indexOf("Source")] = 'Manual'
  
    var trpIdx = trpIdxArr[arrIdx]                  // get the row nbr on the sheet from trpIdxArr
  
    await updateSheetRow(vals, trpIdx, "Trips")
  
    $("#pldtl-modal").modal('hide');
  
    showTrip(arrIdx)
  
    modal(false)
  
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