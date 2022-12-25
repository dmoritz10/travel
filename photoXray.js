
async function btnPhotoXrayHtml() {

  document.getElementById('pxImg').removeAttribute('src');
  $("#pxTbl").empty();

  if (!trpVals) await openTripsSheet()

  gotoTab('PhotoXray')

}


async function showFile(input) {

  console.log('input file', input.files[0])

  if (!input.files) return

  let reader = new FileReader();

  reader.onload = async function (e) {

    console.log('e', e)

    let rtn = validateFile (e.target.result)
    if (!rtn) return

    document.getElementById('pxImg').src = e.target.result

    let img = new Image()
    img.src = e.target.result
    console.log('img', img.src.length)

    await waitForImage(img)

    console.log('img', img.src.length)

    EXIF.getData(img, function() {

        console.log('this', this.src.length)
        let allMetaData = EXIF.getAllTags(this);
        console.log('allMetaData', allMetaData)
        let xray = xrayMetaData(allMetaData, input.files[0])
        console.log('xray', xray)
        
    });

  }

  reader.readAsDataURL(input.files[0]);

}


function xrayMetaData(allMetaData, file) {


  var picDate = findBestDate(file.name, allMetaData.DateTimeOriginal)

  var rtn = [

    ['File Name', file.name]
    
  ]
  
    if (picDate) rtn.push(['Date', picDate])

    let tripInfo = calcTrip(picDate)

    if (tripInfo) rtn.push(['Trip', tripInfo.name])
    if (allMetaData.ImageDescription) rtn.push(['Description', allMetaData.ImageDescription])
    if (tripInfo) rtn.push(['Month', tripInfo.month])
    if (tripInfo) rtn.push(['Start', tripInfo.sDate])
    if (tripInfo) rtn.push(['End', tripInfo.eDate])

    if (allMetaData.GPSLatitude) rtn.push(['GPS', calcGPS(allMetaData.GPSLatitude, allMetaData.GPSLatitudeRef, allMetaData.GPSLongitude, allMetaData.GPSLongitudeRef)])
    if (picDate && new Date(picDate) > new Date("2011-01-01")) rtn.push(['Timeline', calcTimeLine(picDate)])

    if (tripInfo) rtn.push(['Cities', tripInfo.dest])
    if (tripInfo) rtn.push(['Countries', tripInfo.countries])
   
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

  if (metaDateTimeOriginal) return metaDateTimeOriginal.slice(0, 10).replace(/:/g,"-")
  
  const regex = /\d{8}/;
  const x = fileName.match(regex)[0];
  
  if (x) return x.slice(0,4) + '-' + x.slice(4,6) + '-' + x.slice(6)

  return dte

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

  for (let i=0;i<trpVals.length;i++) {

    let trp = trpVals[i]

    let sdt = new Date(trp[strCol])
    let edt = new Date(trp[endCol])

    if (picDte >= sdt.setDate(sdt.getDate() - 2) && picDte <= edt.setDate(edt.getDate() + 2)) {

      return {

        name:       trp[tripCol],
        sDate:      trp[strCol],
        eDate:      trp[endCol],
        month:      trp[monthCol],
        dest:       trp[destCol].slice(1).slice(0, -1).replace(/"/g, '').replace(/,/g, ', '),
        countries:  trp[countriesCol].slice(1).slice(0, -1).replace(/"/g, '').replace(/,/g, ', ')

      }

    }

  }

  return null

}

async function validateFile (imgSrc) {

    var fileInfo = parseFile(imgSrc)

    if (fileInfo.invalidFile) {
      toast(fileInfo.invalidFile, 5000)
      return null
    }
                                      
    return true
    
  }

  function parseFile(f) {

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



