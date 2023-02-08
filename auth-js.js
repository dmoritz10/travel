
var g = await import('./gothic.js');
var Goth = g.default
console.log('goth', Goth)

const API_KEY = 'AIzaSyCObS1ZM8aAyPfqXZDtq2-rRrMqpJZxBc0'  // TODO: Update placeholder with desired API key.
const CLI_ID = '8803561872-jd3c7f4e1ugeld0l6ssfmse40n5nfr6l.apps.googleusercontent.com'  // TODO: Update placeholder with desired client ID.

// const CLI_ID = '764306262696-esbdj8daoee741d44fdhrh5fehjtjjm5.apps.googleusercontent.com';
// const API_KEY = 'AIzaSyBG5YxMTiBdvxD5-xxVp0LA1M8IXz8Xtbo';
// const SCOPES = 'https://www.googleapis.com/auth/drive.metadata'; // Space delimited if more than one
// const DISCOVERY = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

const SCOPES = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.metadata.readonly'; // Space delimited if more than one
const DISCOVERY =   [
                    "https://sheets.googleapis.com/$discovery/rest?version=v4", 
                    "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
                    ];

/**
 * The google libraries are loaded, and ready for action!
 */
function proceedAsLoaded() {
  if (Goth.recognize()) {
    Goth.onetap();
  } else {
    forceSignin();
  }
}

/**
 * They have to correctly get through the button click / sign up flow to proceed.
 */
function forceSignin() {
  Goth.button('signin', {type: 'standard', size: 'large', text: 'signup_with'});
}

function signoutEvent() {
  document.getElementById('content').innerHTML = '';
  document.getElementById('signout').style.display = 'none';
  document.getElementById('signin').style.display = 'block';
  forceSignin();
}

function proceedAsSignedIn() {
  document.getElementById('signin').style.display = 'none';
  document.getElementById('signout').style.display = 'block';
  runApp();
}
/**
 * Just to demonstrate that the APIs *can* successfully be called.
 */
async function list_files() {

  let params = {
    'pageSize': 5,
    'fields': 'files(id, name)',
  }

                                            console.log('before gapi')

  let response = await window.gapi.client.drive.files.list(params)
    .then(async response => {               console.log('gapi first try', response)
        
        return response})

    .catch(async err  => {                  console.log('gapi token1', err)
        
        if (err.result.error.code == 401 || err.result.error.code == 403) {
            await Goth.token()              // for authorization errors obtain an access token
            let retryResponse = await window.gapi.client.drive.files.list(params)
                .then(async retry => {      console.log('gapi retry', retry) 
                    
                    return retry})

                .catch(err  => {            console.log('gapi error2', err)
                    
                    bootbox.alert('gapi error: ' + err.result.error.code + ' - ' + err.result.error.message);

                    return null });         // cancelled by user, timeout, etc.

            return retryResponse

        } else {
            
            bootbox.alert('gapi error: ' + err.result.error.code + ' - ' + err.result.error.message);
            return null

        }
            
    })
    
                                            console.log('after gapi')


  if (!response) return null

  const files = response.result.files;
  if (!files || files.length == 0) {
    document.getElementById('content').innerText = 'No files found.';
    return;
  }
  // Flatten to string to display
  const output = files.reduce(
      (str, file) => `${str}${file.name} (${file.id}\n`,
      'Files:\n');
  document.getElementById('content').innerText = output + '\n' + new Date();
}

/**
 * Handle the lifecycle of authenticated status
 */
function gothWatch(event) {
  switch (event) {
    case 'signin':
      proceedAsSignedIn();
      break;
    case 'revoke':
    case 'signout': 
      signoutEvent();
      break;
    case 'loaded':
      proceedAsLoaded();
      break;
    case 'onetap_suppressed':
      forceSignin();  // If a user bypasses onetap flows, we land them with a button.
      break;
    default: 
      console.log("Well, this is a surprise!");
      console.log(event);
  }
}

/**
 * Wire up the main ux machinery.
 */
window.authorize = function () {
  Goth.observe(gothWatch);
  Goth.load(CLI_ID, API_KEY, SCOPES, DISCOVERY);
  const signout = document.getElementById('signout');
  signout.style.display = 'none';
  const signout_btn = document.getElementById('btnSignout');
  const revoke_btn = document.getElementById('btnRevoke');
  const runapp_btn = document.getElementById('btnRunApp');
  signout_btn.onclick = Goth.signout;
  revoke_btn.onclick = Goth.revoke;
  runapp_btn.onclick = runApp;
}

// authorize()

async function runApp() {

  user = Goth.user()

  if (user.firstName) {
      $('#authSigninStatus').html('Hi ' + user.firstName + '.<br>You are signed in.')
  } else {
      $('#authSigninStatus').html('Hi ' + user.emailName + '.<br>You are signed in.')
  }

  var rtn = await getSSId('Travel Companion');

  if (rtn.fileId) {spreadsheetId = rtn.fileId}
  else {$('#authSigninStatus').html(rtn.msg);return}
  
  await initialUI();

  goHome()

    
}
