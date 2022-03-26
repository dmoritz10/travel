
async function goHome() {

  var signinStatus = await gapi.auth2.getAuthInstance().isSignedIn.get()
   if (!signinStatus) {
     gotoTab('Auth')
     return
   }
  
  gotoTab('Home')

}
