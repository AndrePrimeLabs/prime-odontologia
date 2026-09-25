import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const primeos = createClientFromRequest(req);
    const user = await primeos.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, date, time, duration = 60, description = '' } = await req.json();

    if (!title || !date || !time) {
      return Response.json({ 
        error: 'Campos obrigatórios: title, date, time' 
      }, { status: 400 });
    }

    // Get access token
    const accessToken = await primeos.asServiceRole.connectors.getAccessToken('googlecalendar');

    if (!accessToken) {
      return Response.json({ 
        error: 'Google Calendar não conectado',
        needsAuth: true
      }, { status: 400 });
    }

    // Create datetime objects
    const startDateTime = new Date(`${date}T${time}`);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

    // Create event in Google Calendar
    const calendarUrl = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
    
    const eventData = {
      summary: title,
      description: description,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'America/Sao_Paulo'
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'America/Sao_Paulo'
      }
    };

    const response = await fetch(calendarUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData)
    });

    if (!response.ok) {
      const error = await response.text();
      return Response.json({ 
        error: 'Erro ao criar evento no Google Calendar',
        details: error
      }, { status: response.status });
    }

    const createdEvent = await response.json();

    return Response.json({
      success: true,
      message: 'Evento criado no Google Calendar',
      eventId: createdEvent.id,
      eventLink: createdEvent.htmlLink
    });

  } catch (error) {
    console.error('Create event error:', error);
    return Response.json({ 
      error: error.message || 'Erro ao criar evento'
    }, { status: 500 });
  }
});
