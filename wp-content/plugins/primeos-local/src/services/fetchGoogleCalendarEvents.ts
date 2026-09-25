import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const primeos = createClientFromRequest(req);
    const user = await primeos.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    if (!startDate || !endDate) {
      return Response.json({ error: 'Missing startDate or endDate' }, { status: 400 });
    }

    // Get sync settings
    const settings = await primeos.entities.CRMSyncSettings.filter({ user_email: user.email });
    const userSettings = settings[0] || {
      google_calendar_enabled: true,
      calendar_id: 'primary'
    };

    if (!userSettings.google_calendar_enabled) {
      return Response.json({ events: [] });
    }

    // Get Google Calendar access token
    const accessToken = await primeos.asServiceRole.connectors.getAccessToken('googlecalendar');

    const timeMin = new Date(startDate).toISOString();
    const timeMax = new Date(endDate).toISOString();

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${userSettings.calendar_id}/events?` +
      `timeMin=${encodeURIComponent(timeMin)}&` +
      `timeMax=${encodeURIComponent(timeMax)}&` +
      `singleEvents=true&` +
      `orderBy=startTime`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google Calendar API error: ${error}`);
    }

    const data = await response.json();

    // Transform events to match our format
    const events = data.items.map(event => ({
      id: event.id,
      title: event.summary,
      description: event.description || '',
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      location: event.location || '',
      htmlLink: event.htmlLink,
      isGoogleCalendarEvent: true,
      source: 'google_calendar'
    }));

    return Response.json({ events });

  } catch (error) {
    console.error('Error fetching Google Calendar events:', error);
    return Response.json({ 
      error: error.message,
      events: []
    }, { status: 500 });
  }
});
