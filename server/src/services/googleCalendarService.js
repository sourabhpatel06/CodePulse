const { google } = require('googleapis');

const createOAuthClient = () =>
  new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);

const getAuthUrl = (state) => {
  const client = createOAuthClient();
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // forces Google to re-issue a refresh_token every time, not just on first-ever consent
    scope: ['https://www.googleapis.com/auth/calendar.events'],
    state,
  });
};

const getTokensFromCode = async (code) => {
  const client = createOAuthClient();
  const { tokens } = await client.getToken(code);
  return tokens;
};

const createCalendarEvent = async (refreshToken, contest) => {
  const client = createOAuthClient();
  client.setCredentials({ refresh_token: refreshToken });

  const calendar = google.calendar({ version: 'v3', auth: client });
  const endTime = new Date(contest.startTime.getTime() + contest.durationMinutes * 60000);

  const event = {
    summary: `${contest.name} (${contest.platform})`,
    description: `Contest link: ${contest.url}`,
    start: { dateTime: contest.startTime.toISOString() },
    end: { dateTime: endTime.toISOString() },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 60 },
        { method: 'popup', minutes: 10 },
      ],
    },
  };

  const res = await calendar.events.insert({ calendarId: 'primary', requestBody: event });
  return res.data;
};

module.exports = { getAuthUrl, getTokensFromCode, createCalendarEvent };