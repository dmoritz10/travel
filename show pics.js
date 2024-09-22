async function showPics(idx) {

    console.log('idx', idx)

    if (!idx) {
        var idx = $("#trppArrIdx").val()
    }

    if (idx != $("#trppArrIdx").val()) $("#trppSearch").val('')

    var vals = trpVals[idx]

    console.log('vals', idx, vals)
  
    $("#trppTrip")[0].innerHTML = vals[trpHdrs.indexOf('Trip')]
    $("#trppMoYr")[0].innerHTML = vals[trpHdrs.indexOf('Month')]
    $("#trppStartEndDate")[0].innerHTML = vals[trpHdrs.indexOf('Start Date')].slice(0,-5) + ' - ' + vals[trpHdrs.indexOf('End Date')].slice(0,-5)
    $("#trppArrIdx").val(idx)
  
    $("#trppRtnToPage")[0].setAttribute("onclick", "clearAndGotoTab('" + 'Trips' + "')");
    // if (rtnToPage == 'Trips') $("#btnTrpAddNew").removeClass('d-none')
    // else                      $("#btnTrpAddNew").addClass('d-none')


    var strDate = vals[trpHdrs.indexOf('Start Date')]
    var endDate = vals[trpHdrs.indexOf('End Date')]
    var trpDtl = buildLocArr(JSON.parse(vals[trpHdrs.indexOf('Destination Detail')]))

    console.log('Trip', vals[trpHdrs.indexOf('Trip')], strDate, endDate)

    listPhotos(strDate, endDate, trpDtl)

  }
  
  function buildLocArr(trpDtl) {

    var brkDate
    var trp = []
  
    for (var i=0; i<trpDtl.length;i++) {
  
      var val = trpDtl[i]
  
      var parseDate = val.date.split(", ")
      var date = parseDate[0]
      var time = parseDate[1] ? parseDate[1] : ''
  
      if (date != brkDate) {
  
        var dispDate = DateTime.fromJSDate(new Date(date)).toFormat('ccc L/d');
  
        
        // if (priorHdr > -1) {
  
        //     var actDisp = formatActivities(activities)
        //     var hrefDate = DateTime.fromJSDate(new Date(brkDate)).toFormat('yyyy-LL-dd');
        //     var googleTimelineHref = 'https://timeline.google.com/maps/timeline?pb=!1m2!1m1!1s' + hrefDate
        //     trp[priorHdr][1] = trp[priorHdr][1].replace(/replacementToken/g, actDisp).replace(/hrefDateToken/g, googleTimelineHref)
      
        // }
        
        priorHdr = trp.length
  
  
        trp.push(["<div class='text-start my-2'><span class='text-primary h3'>" + dispDate + "</span></div>",
                  '<div>' + "replacementToken" + '</div>'
                ])
  
        brkDate = date
  
      }
    
      if (rtnToPage == 'Trips') var icon = '<div class="label ps-5 cursor-pointer" onClick="editTripDtl(' + idx + ", " + i + ')"><span class="material-icons">expand_more</span></div>'
      else                      var icon = ''
  
      var place = val.name + "<br><h6>" +
                  val.city + (val.state ? ", " : "") +
                  val.state + "<br>" +
                  icon
      
      trp.push([time, place])
  
    //   accumActivities( val.activities, activities)
      
    }


  }

  async function listPhotos(strDate, endDate) {

    console.log('listPhotos')

    var strDt = strDate.split('/')
    var endDt = endDate.split('/')

    var category = $("#trppSearch").val() ? [$("#trppSearch").val()] : []

    var params = {
            "pageSize": 50,
            "pageToken": null,
            
            "filters": {
                "mediaTypeFilter": {
                    "mediaTypes": [
                      'ALL_MEDIA'
                    ]
                },
                "dateFilter": {
                    "ranges": [
                        {
                        "startDate": {
                            "year": strDt[2],
                            "month": strDt[0],
                            "day": strDt[1]
                            },
                        "endDate": {
                            "year": endDt[2],
                            "month": endDt[0],
                            "day": endDt[1]
                            }
                        }
                    ]
                },
                "contentFilter": {
                    "includedContentCategories": [
                        category
                    ]
                  }
            }
        }


    var mediaArr = []


    do {

        let response = await searchPhotos(params)
        params.pageToken = response.result.nextPageToken
        let mediaItems = response.result.mediaItems
        mediaArr = mediaArr.concat(mediaItems)

    } while (params.pageToken)

    if (!mediaArr[0] || mediaArr.length == 0) {
        toast('There are no photos for this Trip', 5000)
        return }

    console.log('mediaArr', mediaArr)


    var $tblPics = $("#trppContainer > .d-none").eq(0)  // the 1st one is a template which is always d-none

    var x = $tblPics.clone();
    $("#trppContainer").empty();
    x.appendTo("#trppContainer");
    
    // let dte = DateTime.fromISO(mediaArr[mediaArr.length - 1].mediaMetadata.creationTime).toFormat('yyyyLLLdd')
    let dte = mediaArr[0].mediaMetadata.creationTime.slice(0,10)
    let medArr = []
    var dupFnameDate
    var prevDte

    // for (var j = mediaArr.length - 1; j >=0 ; j--) {
    for (var j = 0; j < mediaArr.length ; j++) {

        var media = mediaArr[j]
       
        var fnameDate = media.filename.toLowerCase() + media.mediaMetadata.creationTime
        if (fnameDate == dupFnameDate) {
            console.log('dup', dupFnameDate)
            continue
        }

        dupFnameDate = fnameDate

        var ele = $tblPics.clone();
        let mediaDate = media.mediaMetadata.creationTime.slice(0,10)
        console.log('break', dte, mediaDate != dte, medArr.length, mediaDate, media.mediaMetadata.creationTime, prevDte, DateTime.fromISO(prevDte).toFormat('ccc L/d'))

        if (mediaDate != dte) {
            if (medArr.length>0) {
                var ele = $tblPics.clone();
                ele.find('#trppDate')[0].innerHTML = DateTime.fromISO(prevDte).toFormat('ccc L/d')
                await embed_google_media(medArr, ele.find('#trppPhotos')[0], 'grid');
                console.log(DateTime.fromISO(prevDte).toFormat('ccc L/d'), medArr)
                medArr = []
                ele.removeClass('d-none');
                ele.appendTo("#trppContainer");
            }
        }
        
        prevDte = media.mediaMetadata.creationTime.slice(0,10)
        dte = mediaDate
        medArr.push(media)
    }

    if (medArr.length>0) {
        var ele = $tblPics.clone();
        ele.find('#trppDate')[0].innerHTML = DateTime.fromISO(prevDte).toFormat('ccc L/d')
        console.log(DateTime.fromISO(prevDte).toFormat('ccc L/d'), medArr)
        await embed_google_media(medArr, ele.find('#trppPhotos')[0], 'grid');
        medArr = []
        ele.removeClass('d-none');
        ele.appendTo("#trppContainer");
    }

    gotoTab('ShowPics')

}

async function embed_google_media(mediaItems, id, type='grid', height = 240, ){
    
    // let container = document.getElementById(id)
    let container = id

    var mediaArr = []

    for (let i=0;i<mediaItems.length;i++) {
 
        let media_item = {}
        media_item.base_url = mediaItems[i].baseUrl
        media_item.type = mediaItems[i].mimeType.split('/')[0]
        media_item.aspect_ratio = mediaItems[i].mediaMetadata.width / mediaItems[i].mediaMetadata.height

        media_item.product_url = mediaItems[i].productUrl
        media_item.createTime = mediaItems[i].mediaMetadata.creationTime.replace(/:/g,'')

        mediaArr.push(media_item)

    }   

    container.classList.add('photo-grid') 
    MediaGrid(container,mediaArr,240)

}   


  
function MediaGrid(container, mediaArr, max_height) {

    var space_between_media = 4;

    let media_objects = mediaArr.map(item => new MediaObject(item));
    media_objects.forEach(element => _add_object_to_container(element));

    // let mapArea_objects = mediaArr.map(item => new MapAreaObject(item));
    // mapArea_objects.forEach(element => _add_object_to_container(element));





    console.log('mediaobj', media_objects)
    console.log('container', container)

    window.onresize= () => _calc_rows();

    let timer = window.setInterval(() => {
        if(container.clientWidth>0){
            _calc_rows()
            _kill_timer()
        }
    },100)

    function _kill_timer(){
        window.clearInterval(timer)
    }

    function _calc_rows() {
        let min_aspect = _get_min_aspect_ratio()
    
        let rows = []
        let current_aspect_ratio = 0
        let current_row = []
        for(let object of media_objects){
            current_aspect_ratio += object.aspect_ratio
            current_row.push(object)
            if (current_aspect_ratio > min_aspect){ // this row is full we can cap it
                let row_item  = {}
                row_item.items = current_row
                row_item.aspect_ratio = current_aspect_ratio
                rows.push(row_item)
                // resetting the temp loop vars 
                current_aspect_ratio = 0 
                current_row = []
            } 
        }
        // check if theres photos left that dont make a whole row

        if(current_aspect_ratio > 0) {
            let row_item  = {}
            row_item.items = current_row
            row_item.aspect_ratio = min_aspect
            rows.push(row_item)
        }

        _populate_container(rows)  
    }


    function _populate_container(rows) {
        let x = 0
        let y = 0 
        for (let row of rows){
            let image_width = container.clientWidth - space_between_media * (row.items.length - 1);
            let row_height = image_width / row.aspect_ratio;
            for (let object of row.items) {
                object._update_position(x,y,row_height);
                x = x+ object.aspect_ratio*row_height + space_between_media
            }
            x = 0 
            y = y + row_height + space_between_media
        }

        container.style = `height:${y}px`
        
    }

    function _add_object_to_container(object) {
        container.appendChild(object.dom_object)

    }

    // dynamically calculates the min aspect ration needed to fill the screen based on the desired max_height for images
    function _get_min_aspect_ratio() {
        let width = container.clientWidth;
        return width/max_height;
    }
   
}

class MediaObject{
    constructor(item){
        this.base_url = item.base_url
        this.type = item.type
        this.aspect_ratio = item.aspect_ratio
        this.createTime = item.createTime
        this.product_url = item.product_url

        this.dom_object = document.createElement('div')
        this.dom_object.classList.add('media-object')
        this.dom_object.style = `width:${this.aspect_ratio*20}px;height:${20}px`
        this._fill_MapArea_object()
        this._fill_object()

    }


    
    _fill_MapArea_object() {

        let full_content = document.createElement('map')
        full_content.name=this.createTime;
        let area=document.createElement('area')
        area.shape="default"
        area.href=this.product_url
        full_content.appendChild(area)
        
        this.content = full_content

        this.dom_object.appendChild(this.content)
    }

    _fill_object() {
        // this.content = new Image();
        // this.content.src = this._get_src_url(20)

        if (this.type == 'image') {
            let full_content = new Image();
            full_content.src = this._get_src_url();
            full_content.useMap = "#" + this.createTime
            this.content = full_content

            console.log('full_content', full_content)
            full_content.onload = this._replace_content();
            this.dom_object.appendChild(this.content)


        }else if (this.type == 'video') {
            let full_content = document.createElement('video')
            full_content.src = this._get_src_url();
            full_content.autoplay = true
            full_content.loop = true
            full_content.playsinline = true
            full_content.muted = true
            full_content.poster = this._get_src_url(null, true);
            full_content.classList.add('position-absolute')
            this.content = full_content
            console.log('full_content video', full_content)

            full_content.onloadeddata = this._replace_content();
            full_content.onerror = (e) => {console.log('video load error', e)}
            // full_content.onerror = (e) => e.target.load()
            this.dom_object.appendChild(this.content)

            // usemap only valid for img and object tags.  Place an empt, transparent img over the video
            let useMap = new Image();
            useMap.useMap = "#" + this.createTime
            useMap.classList.add('opacity-0')
            this.useMap = useMap

            this.dom_object.appendChild(this.useMap)

        }

        // this.content.classList.add('blur')
    }






    _replace_content() {

        console.log('_replace_content', this)

        // this.classList.remove('blur')
    }

    _update_position(x,y,height) {
        

        this.dom_object.style = `width:${parseInt(this.aspect_ratio*height)}px;height:${parseInt(height)}px;transform:translate(${parseInt(x)}px,${parseInt(y)}px)`
    }

    _get_src_url(size=null,poster=false){
        let url = this.base_url + '='
        if(poster){
            url = url + 'd-no'
        } else if (size == null) { // get the full size thing
            url = url +'d'
            if (this.type == 'video') {
                url = url+'v'
            }
        } else {
            url = `${url}w${size}-h${size}`
            if (this.type == 'video') {
                url = url + '-no'
            }
        }

        return url
    }
}

