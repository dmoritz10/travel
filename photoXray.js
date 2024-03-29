
async function btnPhotoXrayHtml() {

  document.getElementById('pxImg').removeAttribute('src');
  $("#pxTbl").empty();

  if (!trpVals) await openTripsSheet()

  gotoTab('PhotoXray')

}

var photos = {

  reader: null,
  files: null,
  currFile: null

}

function getFiles(input) {

  if (!input.files) return

  photos.reader =  new FileReader();
  photos.files = input.files
  photos.currFile = 0

  if (photos.files.length <= 1) {

    $('#btnPXPrev').addClass('d-none')
    $('#btnPXNext').addClass('d-none')
    // $('#pxCnt').addClass('d-none')
    

  } else {

    $('#btnPXPrev').removeClass('d-none')
    $('#btnPXNext').removeClass('d-none')
    // $('#pxCnt').removeClass('d-none')
    // $('#pxCnt').html('1 of ' + photos.files.length)

  }

  showFile('curr')

}


async function showFile(dir) {

  if (dir == 'prev') {
    if (photos.currFile > 0)  {
      photos.currFile--
    } else {
      return
    }
  } 
  else if (dir == 'next') {
    if (photos.currFile < photos.files.length - 1) {
      photos.currFile++
    } else {
      return
    }
  }

  var disable = photos.currFile <= 0 ? true : false
  $('#btnPXPrev').prop('disabled', disable)
  var disable = photos.currFile >= photos.files.length - 1 ? true : false
  $('#btnPXNext').prop('disabled', disable)

  if (photos.files.length <= 1) {
    $('#pxCnt').addClass('d-none')
  } else {
    $('#pxCnt').removeClass('d-none')
    $('#pxCnt').html((photos.currFile + 1) + ' of ' + photos.files.length)
  }

  console.log('input files', photos)

  photos.reader.onload = async function (e) {

    console.log('e', e)

    let rtn = await validateFile (e.target.result)
    if (!rtn) return

    document.getElementById('pxImg').src = e.target.result

    let img = new Image()
    img.src = e.target.result
    
    await waitForImage(img)

    console.log('img', img.src.length)

    EXIF.getData(img, function() {

        let allMetaData = EXIF.getAllTags(this);
        console.log('allMetaData', allMetaData)
        let xray = xrayMetaData(allMetaData, photos.files[photos.currFile])
        console.log('xray', xray)
        
    });

  }

  photos.reader.readAsDataURL(photos.files[photos.currFile]);

}


function xrayMetaData(allMetaData, file) {

  var rtn = [

    ['File Name', file.name]
    
  ]

  if (Object.keys(allMetaData).length > 0) {
  
    var picDateTime = findBestDate(file.name, allMetaData.DateTimeOriginal)

    if (picDateTime) {
      var picDate = picDateTime.slice(0,10)

      console.log('dates', picDateTime, picDate)

      if (picDate) rtn.push(['Date', picDate])

      let tripInfo = calcTrip(picDateTime)

      if (tripInfo) rtn.push(['Trip', tripInfo.name])
      if (allMetaData.ImageDescription) rtn.push(['Description', allMetaData.ImageDescription])
      if (tripInfo) rtn.push(['Month', tripInfo.month])
      if (tripInfo) rtn.push(['Start', tripInfo.sDate])
      if (tripInfo) rtn.push(['End', tripInfo.eDate])
      if (tripInfo?.loc) rtn.push(['Guess', tripInfo.loc])

      if (allMetaData.GPSLatitude) rtn.push(['GPS', calcGPS(allMetaData.GPSLatitude, allMetaData.GPSLatitudeRef, allMetaData.GPSLongitude, allMetaData.GPSLongitudeRef)])
      if (picDate && new Date(picDate) >= new Date("2012-01-01")) rtn.push(['Timeline', calcTimeLine(picDate)])

      if (tripInfo) rtn.push(['Cities', tripInfo.dest])
      if (tripInfo) rtn.push(['Countries', tripInfo.countries])
    }
  }
   
  $('#pxTbl').empty()

  var tbl = new Table();
    
    
  tbl
      .setHeader()
      .setTableHeaderClass()
      .setData(rtn)
      .setTableClass('table table-borderless')
      .setTrClass('d-flex')
      .setTcClass(['text-end col-4 h5 text-success', 'text-start col h4'])
      .setTdClass('py-1 pb-0 border-0 align-bottom border-bottom')
      .build('#pxTbl');

  return rtn

}

function findBestDate(fileName, metaDateTimeOriginal) {

  if (metaDateTimeOriginal) {
    var dt = metaDateTimeOriginal.replace(/:/,"-")
    var dt = dt.replace(/:/,"-")
    return dt
  }
  
  var regex = /\d{8}_\d{6}/;
  var x = fileName.match(regex)?.[0];
  if (x) return x.slice(0,4) + '-' + x.slice(4,6) + '-' + x.slice(6,8) + ' ' + x.slice(9,11) + ':' + x.slice(11,13) + ':' + x.slice(13)

  var regex = /\d{8} \d{6}/;
  var x = fileName.match(regex)?.[0];
  if (x) return x.slice(0,4) + '-' + x.slice(4,6) + '-' + x.slice(6,8) + ' ' + x.slice(9,11) + ':' + x.slice(11,13) + ':' + x.slice(13)

  var regex = /\d{8}/;
  var x = fileName.match(regex)?.[0];
  if (x) return x.slice(0,4) + '-' + x.slice(4,6) + '-' + x.slice(6)

  return null

}

function calcTimeLine(picDate) {

  var href = 'https://timeline.google.com/maps/timeline?pb=!1m2!1m1!1s' + picDate

  return '<div class="label cursor-pointer "><a target="_blank"  href=' + href + '><span class="material-icons">open_in_new</span></a></div>' 

}

function calcGPS(lat, latRef, lng, lngRef) {

  if (!lat || !lng) return null

  let latdec = lat[0] + (lat[1] / 60) + (lat[2] / 3600) 
  let lngdec = lng[0] + (lng[1] / 60) + (lng[2] / 3600) 

  if (latRef == "S" || latRef == "W") 
    latdec = latdec * -1;

  if (lngRef == "S" || lngRef == "W") 
    lngdec = lngdec * -1;

  var href = `https://www.google.com/maps/@${latdec},${lngdec},14z`

  return '<div class="label cursor-pointer "><a target="_blank"  href=' + href + '><span class="material-icons">open_in_new</span></a></div>'
     
}

function calcTrip(picDate) {

  let picDte = new Date(picDate)

  let strCol = trpHdrs.indexOf('Start Date')
  let endCol = trpHdrs.indexOf('End Date')
  let tripCol = trpHdrs.indexOf('Trip')
  let monthCol = trpHdrs.indexOf('Month')
  let destCol = trpHdrs.indexOf('Destinations')
  let countriesCol = trpHdrs.indexOf('Countries')
  let destDtlCol = trpHdrs.indexOf('Destination Detail')

  for (let i=0;i<trpVals.length;i++) {

    let trp = trpVals[i]

    let sdt = new Date(trp[strCol])
    let edt = new Date(trp[endCol])

    if (picDte >= sdt.setDate(sdt.getDate() - 2) && picDte <= edt.setDate(edt.getDate() + 2)) {

      let guessLoc = srchDestdtl(picDte, trp[destDtlCol])

      return {

        name:       trp[tripCol],
        sDate:      trp[strCol],
        eDate:      trp[endCol],
        month:      trp[monthCol],
        loc:        guessLoc,
        dest:       trp[destCol].slice(1).slice(0, -1).replace(/"/g, '').replace(/,/g, ', '),
        countries:  trp[countriesCol].slice(1).slice(0, -1).replace(/"/g, '').replace(/,/g, ', ')

      }

    }

  }

  return null

}

function srchDestdtl(picDte, dtl) {

  let destDtl = JSON.parse(dtl)

  for (let i=0;i<destDtl.length;i++) {

    var d = destDtl[i]

    if (new Date(d.date) >= picDte) {
      console.log('i',i)
      if (i>0) var d  = destDtl[i-1]
      return d.name + '<br>' + d.city + ' ' + d.state
    }

  }

    console.log('no hit')
  if (destDtl.length > 0 ) return d.name + '<br>' + d.city + ' ' + d.state
  else return null

}

async function validateFile (imgSrc) {

    var fileInfo = await parseFile(imgSrc)

    if (fileInfo.invalidFile) {
      toast(fileInfo.invalidFile, 5000)
      return false
    }
                                      
    return true
    
  }

  async function parseFile(f) {

    var parseFileType = f.split(';');
    var fileType = parseFileType[0]
    var x = parseFileType[1].split(',')
    var base = x[0]
    var data = x[1]
  
    var validFileTypes = [
      'data:image/png',
      'data:image/jpeg'
    ]
  
    if (validFileTypes.indexOf(fileType) == -1) {
      return { invalidFile: 'Invalid file type'}
    }
  
    return {
  
      type:         parseFileType[0],
      base:         base,
      data:         data, 
      invalidFile:  false
  
    }
  
  }
  
async function waitForImage(imgElem) {
    return new Promise((res, rej) => {
        if (imgElem.complete) {
            return res();
        }
        imgElem.onload = () => res();
        imgElem.onerror = () => rej(imgElem);
    });
  }

