async function btnPhotoXrayHtml() {


    gotoTab('PhotoXray')



}


async function showFile(input) {

    console.log('input', input)


    if (input.files && input.files[0]) {
        var reader = new FileReader();
    
        reader.onload = async function (e) {

            console.log('e',e)
    console.log('e.target.result', e.target.result)

    
        //   var rtn = await displayFile (e.target.result, frntback)
        //   if (!rtn) return

        var file = e.target.files[0]
        if (file && file.name) {
            EXIF.getData(file, function() {
                console.log('this', this)
                var exifData = EXIF.pretty(this);
                if (exifData) {
                    alert(exifData);
                } else {
                    alert("No EXIF data found in image '" + file.name + "'.");
                }
            });
        }
    
        }
    
        reader.readAsDataURL(input.files[0]);
      }
    

    // var file = e.target.files[0]
    // if (file && file.name) {
    //     EXIF.getData(file, function() {
    //         var exifData = EXIF.pretty(this);
    //         if (exifData) {
    //             alert(exifData);
    //         } else {
    //             alert("No EXIF data found in image '" + file.name + "'.");
    //         }
    //     });
    // }
  
}

  
async function displayFile (imgSrc) {

    var fileInfo = parseFile(imgSrc)

    console.log('fileInfo', fileInfo)
  
    if (fileInfo.invalidFile) {
      toast(fileInfo.invalidFile, 5000)
      return null
    }
  
    // clearCanvas(frntback)
  
      await xrayPhoto(imgSrc)
                                      
    return true
    
  }

  function parseFile(f) {

    var parseFileType = f.split(';');
    var fileType = parseFileType[0]
    var x = parseFileType[1].split(',')
    var base = x[0]
    var data = x[1]
  
    var validFileTypes = [
      'data:application/pdf',
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
  
async function  xrayPhoto(imgSrc) {

    modal(true)
  
    var xray = []

    console.log('exif', exif)

    EXIF.getData(imgSrc, function() {

        console.log('getData')

        var allMetaData = EXIF.getAllTags(this);

        console.log('all metadata', allMetaData)

    });
  
    console.log('timeing')
  
    // for (var i=1; i<shtHdrs.length;i++) {
  
      
    //     imgs[1] ? val = '<span><img class="showImg" src=' + imgs[1] + "></embed></span>" : val=''
    //     icon = '<div class="label cursor-pointer" onClick="openImg(' + "'" + imgs[1] + "'" + ')"><span class="material-icons">open_in_new</span></div>'
    
    //     sht.push(['Back', val, icon])

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

// document.getElementById("pxChooseFile").onchange = function(e) {
//     console.log('e', e)
//     console.log('e.target.result', e.target.result)
    
//     var file = e.target.files[0]
//     if (file && file.name) {
//         EXIF.getData(file, function() {
//             console.log('this', this)
//             var exifData = EXIF.pretty(this);
//             if (exifData) {
//                 alert(exifData);
//             } else {
//                 alert("No EXIF data found in image '" + file.name + "'.");
//             }
//         });
//     }
// }