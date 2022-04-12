async function importFromCalendar() {


    var resource = {
  
        'calendarId': 'primary',
        'maxResults': 1000,
        'orderBy': 'startTime',
        'timeMin': '2021-11-01T10:00:00-07:00',
        'timeMax': '2022-02-01T10:00:00-07:00'

     };
       
      await checkAuth()
      var request = await gapi.client.calendar.events.list({
          
        'calendarId': 'christinamoritz@gmail.com',
        'maxResults': 1000,
        'singleEvents': true,
        'orderBy': 'startTime',
        'timeMin': '2022-05-19T10:00:00-07:00',
        'timeMax': '2022-05-30T10:00:00-07:00'
        
      });
  
      var eventId = request.result.id

      console.log(request.result)
  



}