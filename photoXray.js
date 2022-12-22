async function btnPhotoXrayHtml() {

    gotoTab('PhotoXray')

}


// async function showFile(input) {

//     if (input.files && input.files[0]) {
//         var reader = new FileReader();
    
//         reader.onload = async function (e) {
    
//           var rtn = await validateFile (e.target.result)
//           if (!rtn) return

//           var img = document.getElementById('pxImg')
//           img.src = e.target.result
//           await waitForImage(img)

//           EXIF.getData(img, function() {
//               var allMetaData = EXIF.getAllTags(this);
//               xrayPhoto(allMetaData)
              
//           });
  
//         }
    
//         reader.readAsDataURL(input.files[0]);

//       }
  
// }

async function showFile(input) {

  var metaArr = [[
    'FileName',
    'FileSize',
    'FileType',
    'FileLastModified',
    'FileLastModifiedDate',
    'ImageDescription',
    'Make',
    'Model',
    'ExifVersion',
    'DateTime',
    'DateTimeDigitized',
    'DateTimeOriginal',
    'GPSLatitude',
    'GPSLongitude'
  ]]

  var cntr = 0

  console.log('input', input.files)

  for (let i=0;i<input.files.length;i=i+200) {

      cntr++
      let lCntr = cntr

      console.log('input file', input.files[i])

      let reader = new FileReader();
  
      reader.onload = async function (e) {

        console.log('e', e)

        let rtn = validateFile (e.target.result)
        if (!rtn) return

        let img = new Image()
        img.src = e.target.result

        console.log('img1', lCntr, img.src.length)
        await waitForImage(img)

        console.log('img2', lCntr, img.src.length)

        EXIF.getData(img, function() {
            let allMetaData = EXIF.getAllTags(this);
            console.log('allMetaData', allMetaData)
            xrayMetaData(allMetaData, metaArr, input.files[i])
            
        });

        console.log('metaArr', metaArr)

      }
  
      reader.readAsDataURL(input.files[i]);

  }

}


  // const showFile = async (event) => {
  
  //   // Convert the FileList into an array and iterate
  //   let files = Array.from(event.files).map(file => {

  //       // Define a new file reader
  //       let reader = new FileReader();

  //       // Create a new promise
  //       return new Promise(resolve => {

  //           // Resolve the promise after reading file
  //           reader.onload = () => resolve(reader.result);

  //           // Read the file as a text
  //           reader.readAsDataURL(file);

  //       });

  //   });

  //   // At this point you'll have an array of results
  //   let res = await Promise.all(files);

  //   var metaObj = {}


  //   console.log('res', res)

  //   for (let i=0;i<res.length;i++) {

  //             let img = new Image()
  //             img.src = res[i]
      
  //             console.log('img1', img.src.length)
  //             await waitForImage(img)
  //             console.log('img2', img.src.length)
      
  //             EXIF.getData(img, function() {
  //                 let allMetaData = EXIF.getAllTags(this);
  //                 console.log('allMetaData', allMetaData)
  //                 xrayMetaData(allMetaData, metaObj)
                  
  //             });
  
  //   }

  //   console.log('metaObj', metaObj)


  // }

function xrayMetaData(allMetaData, arr, file) {

    arr.push([

      file.name,
      file.size,
      file.type,
      file.lastModified,
      file.lastModifiedDate,
      allMetaData.ImageDescription,
      allMetaData.Make,
      allMetaData.Model,
      allMetaData.ExifVersion,
      allMetaData.DateTime,
      allMetaData.DateTimeDigitized,
      allMetaData.DateTimeOriginal,
      allMetaData.GPSLatitude,
      allMetaData.GPSLongitude

    ])






    // var k = key.toLowerCase()

    // if (k.indexOf('date') > -1 || k.indexOf('gps') > -1 || key == 'ExifVersion') {

    //   if (metaObj[key]) ++metaObj[key]
    //   else              metaObj[key] = 1
    // }
  
  
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
  
async function  xrayPhoto(exif) {

    modal(true)
  
    var xray = []

    console.log('exif', exif)
  
    // for (var i=0; i<exif.length;i++) {

    //   xray.push(['Trip', ])

    //   imgs[1] ? val = '<span><img class="showImg" src=' + imgs[1] + "></embed></span>" : val=''
    //   icon = '<div class="label cursor-pointer" onClick="openImg(' + "'" + imgs[1] + "'" + ')"><span class="material-icons">open_in_new</span></div>'
  
    //   sht.push(['Back', val, icon])

    // }
    
    // var tbl = new Table();
    
    // tbl
    //   .setHeader()
    //   .setTableHeaderClass()
    //   .setData(sht)
    //   .setTableClass('table table-borderless')
    //   .setTrClass('d-flex')
    //   .setTcClass(['text-end col-4 h5 text-success', 'text-start col h4', 'col-1'])
    //   .setTdClass('py-1 pb-0 border-0 align-bottom border-bottom')
    //   .build('#tblSheet');
  
    // gotoTab('ShowSheet')
  
    // $('#shtContainer > div').eq(idx+1).trigger( "click" )
  
    modal(false)
  
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

function parseExif(exif) {

  var allMetaData = EXIF.getAllTags(exif);

  console.log('allMetaData', allMetaData)




}