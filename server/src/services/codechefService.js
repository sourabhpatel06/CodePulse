const axios = require('axios');
const cheerio = require('cheerio');

const getContestHistory = ($) => {
  const scripts = $('script').toArray();
  const target = scripts.find((el) => $(el).html()?.includes('var all_rating'));
  if (!target) return [];

  const match = $(target).html().match(/var all_rating\s*=\s*(\[.*?\]);/s);
  if (!match) return [];

  try {
    const raw = JSON.parse(match[1]);
    return raw
      .map((c) => ({
        date: new Date(c.end_date),
        rating: parseInt(c.rating, 10),
        contestName: c.name,
      }))
      .filter((c) => !isNaN(c.rating) && !isNaN(c.date.getTime()))
      .sort((a, b) => a.date - b.date);
  } catch {
    return [];
  }
};

const getNormalizedStats = async (handle) => {
  const { data: html } = await axios.get(`https://www.codechef.com/users/${handle}`, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });

  const $ = cheerio.load(html);

  const rating = parseInt($('.rating-number').first().text().trim(), 10) || 0;
  const stars = $('.rating-star').first().text().trim();

  const highestText = $('.rating-header small')
    .filter((i, el) => $(el).text().includes('Highest Rating'))
    .text();
  const maxRatingFromPage = parseInt(highestText.replace(/\D/g, ''), 10) || rating;

  const globalRank = $('.rating-ranks strong').eq(0).text().trim();
  const solvedCount = $('.problems-solved h5')
    .filter((i, el) => $(el).text().includes('Fully Solved'))
    .parent()
    .find('a').length;

  if (!rating && !solvedCount) {
    throw new Error('CodeChef profile not found, or page structure changed');
  }

  const ratingHistory = getContestHistory($);
  const maxRating = ratingHistory.length ? Math.max(maxRatingFromPage, ...ratingHistory.map((c) => c.rating)) : maxRatingFromPage;

  return {
    platform: 'codechef',
    handle,
    rating,
    maxRating,
    rank: stars || (globalRank ? `Global #${globalRank}` : 'unrated'),
    solvedCount,
    ratingHistory,
    difficultyBreakdown: { easy: 0, medium: 0, hard: 0 },
    topicBreakdown: [],
    submissionHeatmap: [],
    syncStatus: 'ok',
    syncError: null,
  };
};

module.exports = { getNormalizedStats };