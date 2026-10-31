require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const startCacheWarmingJob = require('./src/jobs/refreshCache');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startCacheWarmingJob();
  });
});