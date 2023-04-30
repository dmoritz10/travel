async function showPics(idx, rtnToPage='Trips') {

    alert('hi dan')

    if (idx === null) return                  // null is from browseDocument
  
    var trp = []
  
    var vals = trpVals[idx]
  
    
    $("#trppTrip")[0].innerHTML = vals[trpHdrs.indexOf('Trip')]
    $("#trppMoYr")[0].innerHTML = vals[trpHdrs.indexOf('Month')]
    $("#trppStartEndDate")[0].innerHTML = vals[trpHdrs.indexOf('Start Date')].slice(0,-5) + ' - ' + vals[trpHdrs.indexOf('End Date')].slice(0,-5)
    $("#trppArrIdx").val(idx)
  
    $("#trppRtnToPage")[0].setAttribute("onclick", "clearAndGotoTab('" + rtnToPage + "')");
    // if (rtnToPage == 'Trips') $("#btnTrpAddNew").removeClass('d-none')
    // else                      $("#btnTrpAddNew").addClass('d-none')


    var strDate = vals[trpHdrs.indexOf('Start Date')]
    var endDate = vals[trpHdrs.indexOf('End Date')]

    console.log('Trip', vals[trpHdrs.indexOf('Trip')], strDate, endDate)

    listPhotos()
    gotoTab('ShowPics')

    // var trpDtl = JSON.parse(vals[trpHdrs.indexOf('Destination Detail')])
  
    // var brkDate
    // var priorHdr = -1
  
    // var activities = {}
  
    // for (var i=0; i<trpDtl.length;i++) {
  
    //   var val = trpDtl[i]
  
    //   var parseDate = val.date.split(", ")
    //   var date = parseDate[0]
    //   var time = parseDate[1] ? parseDate[1] : ''
  
      
  
    //   if (date != brkDate) {
  
    //     var dispDate = DateTime.fromJSDate(new Date(date)).toFormat('ccc L/d');
  
    //     var actDisp = formatActivities(activities)
        
    //     if (priorHdr > -1) {
  
    //       var hrefDate = DateTime.fromJSDate(new Date(brkDate)).toFormat('yyyy-LL-dd');
    //       var googleTimelineHref = 'https://timeline.google.com/maps/timeline?pb=!1m2!1m1!1s' + hrefDate
    //       trp[priorHdr][1] = trp[priorHdr][1].replace(/replacementToken/g, actDisp).replace(/hrefDateToken/g, googleTimelineHref)
      
    //     }
        
    //     priorHdr = trp.length
  
  
    //     trp.push(["<div class='text-start my-2'><span class='text-primary h3'>" + dispDate + "</span></div>",
    //               '<div>' + "replacementToken" + '</div>'
    //             ])
  
    //     brkDate = date
  
    //     activities = {}
  
    //   }
    
    //   if (rtnToPage == 'Trips') var icon = '<div class="label ps-5 cursor-pointer" onClick="editTripDtl(' + idx + ", " + i + ')"><span class="material-icons">expand_more</span></div>'
    //   else                      var icon = ''
  
    //   var place = val.name + "<br><h6>" +
    //               val.city + (val.state ? ", " : "") +
    //               val.state + "<br>" +
    //               icon
      
    //   trp.push([time, place])
  
    //   accumActivities( val.activities, activities)
      
    // }
  
    // var actDisp = formatActivities(activities)
    // if (priorHdr > -1) 
  
    //   {
  
    //     var hrefDate = DateTime.fromJSDate(new Date(date)).toFormat('yyyy-LL-dd');
    //     var googleTimelineHref = 'https://timeline.google.com/maps/timeline?pb=!1m2!1m1!1s' + hrefDate
    //     trp[priorHdr][1] = trp[priorHdr][1].replace(/replacementToken/g, actDisp).replace(/hrefDateToken/g, googleTimelineHref)
  
    //   }
    
    
    // var tbl = new Table();
    
    // tbl
    //   .setHeader()
    //   .setTableHeaderClass()
    //   .setData(trp)
    //   .setTableClass('table table-borderless')
    //   .setTrClass('d-flex')
    //   .setTcClass(['text-end col-4 h5 text-success align-items-center', 'text-start col h4'])
    //   .setTdClass('py-1 pb-0 mb-0 border-0 align-bottom border-bottom')
    //   .build('#tblTrips');
  
    // gotoTab('ShowTrip')
  
    // $('#tblTrips tr').click(function(e){         // highlight clicked row
  
    //   $('#tblTrips tr').removeClass('ele-selected');
    //   $(e.currentTarget).addClass('ele-selected')
      
    // });
  
    // $('#tblTrips tr td>div').each( function () {
    //   // console.log(this, $(this))
    //   // $(this).addClass('day-hdr')
    //   $(this).parent().parent().addClass('day-hdr')})
    // // $('#tblTrips tr td>div').addClass('day-hdr')
  
  } 

  async function listPhotos() {

    console.log('listPhotos')

    let request = {
  
        "filters": {
            "dateFilter": {
            "ranges": [
            {
                "startDate": {
                    "year": 2022,
                    "month": 05,
                    "day": 20
                },
                "endDate": {
                    "year": 2022,
                    "month": 06,
                    "day": 17
                }
            }
            ]
            }
        }
    }

    let response;
    try {
        response = await gapi.client.photoslibrary.mediaItems.search(request);
    } catch (err) {
        console.log('search', err)
        return;
    }

    console.log('response', response)

}
  