async function importFromCalendar() {


    
        var timeMin = '2021-11-01T10:00:00-07:00'
        var timeMax = '2022-02-01T10:00:00-07:00'
   
      await checkAuth()
      var request = await gapi.client.calendar.events.list({
          
        'calendarId': 'christinamoritz@gmail.com',
        'maxResults': 1000,
        'singleEvents': true,
        'orderBy': 'startTime',
        'timeMin': timeMin,
        'timeMax': timeMax
        
      });
  
      var eventId = request.result.id

      console.log(request.result)
  
      var timeMin = '2022-04-04T10:00:00-07:00'
      var timeMax = '2022-04-08T10:00:00-07:00'

      await checkAuth()
      var request = await gapi.client.calendar.events.list({
          
        'calendarId': 'primary',
        'maxResults': 1000,
        'singleEvents': true,
        'orderBy': 'startTime',
        'timeMin': timeMin,
        'timeMax': timeMax
        
      });
  
      var eventId = request.result.id

      console.log(request.result)
  



}