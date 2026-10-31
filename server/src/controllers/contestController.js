const User = require('../models/User');
const { getUpcomingContests } = require('../services/contestService');
const { getAuthUrl, getTokensFromCode, createCalendarEvent } = require('../services/googleCalendarService');

const listContests = async (req, res, next) => {
  try {
    const contests = await getUpcomingContests();
    res.json({ contests });
  } catch (err) {
    next(err);
  }
};

const googleAuthStart = (req, res) => {
  // state carries the userId through Google's redirect — this callback has no Authorization
  // header to read req.user from, so this is how we know whose account to attach the token to
  const url = getAuthUrl(req.user._id.toString());
  res.json({ url });
};

const googleAuthCallback = async (req, res, next) => {
  try {
    const { code, state } = req.query;
    if (!code || !state) return res.status(400).send('Missing code or state');

    const tokens = await getTokensFromCode(code);
    if (tokens.refresh_token) {
      await User.findByIdAndUpdate(state, { googleRefreshToken: tokens.refresh_token });
    }

    res.redirect(`${process.env.APP_URL}/contests?calendar=connected`);
  } catch (err) {
    next(err);
  }
};

const calendarStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+googleRefreshToken');
    res.json({ connected: !!user.googleRefreshToken });
  } catch (err) {
    next(err);
  }
};

const addToCalendar = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+googleRefreshToken');
    if (!user.googleRefreshToken) {
      return res.status(400).json({ message: 'Connect Google Calendar first' });
    }

    const { name, platform, startTime, durationMinutes, url } = req.body;
    if (!name || !startTime) return res.status(400).json({ message: 'Missing contest details' });

    const event = await createCalendarEvent(user.googleRefreshToken, {
      name,
      platform,
      startTime: new Date(startTime),
      durationMinutes: durationMinutes || 120,
      url,
    });

    res.json({ message: 'Added to calendar', eventLink: event.htmlLink });
  } catch (err) {
    next(err);
  }
};

module.exports = { listContests, googleAuthStart, googleAuthCallback, calendarStatus, addToCalendar };