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
                    "month": 06,
                    "day": 30
                },
                "endDate": {
                    "year": 2022,
                    "month": 06,
                    "day": 01
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


    var mediaItems = response.results.mediaItems


    let element= await embed_google_media(mediaItems, 'grid');

}

async function embed_google_media(mediaItems,  type='grid', height = 240, ){
 
    const album_url = `https://photos.app.goo.gl/${sharable_id.trim()}`

 
    var urls = mediaItems.map(item => item.baseUrl) //find all links in the html that matter get the group we found
    var media = await Promise.all(urls.map(url => _url_to_media_item(url))) // make array by mapping urls using the url to media item function
    
    if (type=='grid'){
        return _elements_to_grid(media, container, height)
    // } else if (type=='carousel') {
    //     return _element_to_carousel(media, container)
    }
}   

async function  _url_to_media_item(url,proxy_function){
    let media_item = {}
    media_item.base_url = url
    
    // try seeing if this media item is a video 
    let json = await proxy_function(`${url}=dv`) 
    
    if (json.body.redirected){ // if this is a success then the object is a video / moving picture if it fails then it is not
        media_item.type = 'video'
    } else { //media is a image
        media_item.type = 'image'
    }
    media_item.aspect_ratio = await _get_aspect_ratio(`${url}=w20-h20`)
    return media_item
}

function _get_aspect_ratio(url) {
    return new Promise((resolve, reject) => {
        let img = new Image();
        img.onload = () => resolve(img.naturalWidth/img.naturalHeight);
        img.onerror = () => reject();
        img.src = url;

    });
}

function _elements_to_grid(media, container, max_row_height){
    container.classList.add('photo-grid') 
    MediaGrid(container,media,max_row_height)
}

// function _element_to_carousel(media,container) {
//     container.classList.add('photo-carousel')
//     MediaCarousel(container,media)
// }


async function _make_request(url){

    var proxy_url = 'https://cors.bridged.cc/'
    var response = await fetch(`${proxy_url}${encodeURIComponent(url)}`) // get request the album page
        
    var json = await response.json() // get html  

    return json 
}
  
function MediaGrid(container, media, max_height) {
    var space_between_media = 4;

    let media_objects = media.map(item => new MediaObject(item));
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

