async function importFromCalendar() {


    
        var timeMin = '2022-05-05T10:00:00-07:00'
        var timeMax = '2022-05-25T10:00:00-07:00'
   
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
          
        'calendarId': 'dmoritz10@gmail.com',
        'maxResults': 1000,
        'singleEvents': true,
        'orderBy': 'startTime',
        'timeMin': timeMin,
        'timeMax': timeMax
        
      });
  
      var eventId = request.result.id

      console.log(request.result)
  



}