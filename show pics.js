async function showPics(idx, rtnToPage='Trips') {

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

    listPhotos(strDate, endDate)

  } 

  async function listPhotos(strDate, endDate) {

    console.log('listPhotos')

    var strDt = strDate.split('/')
    var endDt = endDate.split('/')

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
                }
            }
        }


    var mediaArr = []


    do {

        let response = await searchPhotos(params)
        params.pageToken = response.result.nextPageToken
        console.log('response', response)
        let mediaItems = response.result.mediaItems
        mediaArr = mediaArr.concat(mediaItems)
        console.log('pageToken', params.pageToken , response.result.pageToken)

    } while (params.pageToken)

    if (!mediaArr || mediaArr.length == 0) {
        toast('There are no photos for this Trip', 5000)
        return }

    console.log('mediaArr', mediaArr)


    var $tblPics = $("#trppContainer > .d-none").eq(0)  // the 1st one is a template which is always d-none

    var x = $tblPics.clone();
    $("#trppContainer").empty();
    x.appendTo("#trppContainer");

    let dte = '1234567890'
    let medArr = []

    for (var j = mediaArr.length - 1; j >=0 ; j--) {

        let media = mediaArr[j]
        var ele = $tblPics.clone();
        let mediaDate = media.mediaMetadata.creationTime.slice(0, 10)
        console.log('mediaDate', mediaDate, medArr.length)

        if (mediaDate != dte) {
            console.log('break', mediaDate, dte)
            if (medArr.length>0) {
                ele.find('#trppDate')[0].innerHTML = DateTime.fromISO(media.mediaMetadata.creationTime).toFormat('ccc L/d')
                await embed_google_media(medArr, ele.find('#trppPhotos')[0], 'grid');
                medArr = []
                ele.removeClass('d-none');
                ele.appendTo("#trppContainer");
            }

        }

        dte = mediaDate
        medArr.push(media)

    }

    if (medArr.length>0) {
        ele.find('#trppDate')[0].innerHTML = DateTime.fromISO(media.mediaMetadata.creationTime).toFormat('ccc L/d')
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

    mediaArr.push(media_item)

    }   

    container.classList.add('photo-grid') 
    MediaGrid(container,mediaArr,240)

}   


  
function MediaGrid(container, mediaArr, max_height) {

    var space_between_media = 4;

    let media_objects = mediaArr.map(item => new MediaObject(item));
    media_objects.forEach(element => _add_object_to_container(element));

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

        this.dom_object = document.createElement('div')
        this.dom_object.classList.add('media-object')
        this.dom_object.style = `width:${this.aspect_ratio*20}px;height:${20}px`
        this._fill_object()
    }

    _fill_object() {
        // this.content = new Image();
        // this.content.src = this._get_src_url(20)


        if (this.type == 'image') {
            let full_content = new Image();
            full_content.src = this._get_src_url();
            this.content = full_content
            full_content.onload = this._replace_content;

        }else if (this.type == 'video') {
            let full_content = document.createElement('video')
            full_content.src = this._get_src_url();
            full_content.autoplay = true
            full_content.loop = true
            full_content.playsinline = true
            full_content.muted = true
            full_content.poster = this._get_src_url(null, true);
            this.content = full_content
            full_content.onloadeddata = this._replace_content;
            full_content.onerror = (e) => e.target.load()
        }

        this.content.classList.add('blur')
        this.dom_object.appendChild(this.content)
    }



    _replace_content() {
        this.classList.remove('blur')
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

