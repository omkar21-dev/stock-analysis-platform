const cron = require('node-cron');
const nseService = require('./nseService');
const cacheService = require('./cacheService');

class SchedulerService {
  constructor() {
    this.jobs = [];
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) {
      console.log('Scheduler is already running');
      return;
    }

    console.log('Starting scheduler service...');
    this.isRunning = true;

    // Update market status every minute during market hours
    const marketStatusJob = cron.schedule('*/1 * * * *', async () => {
      try {
        console.log('Updating market status...');
        const marketStatus = await nseService.getMarketStatus();
        cacheService.set('market_status', marketStatus, 60000);
      } catch (error) {
        console.error('Error updating market status:', error.message);
      }
    }, {
      scheduled: false
    });

    // Update NIFTY 50 data every 2 minutes during market hours
    const nifty50Job = cron.schedule('*/2 * * * *', async () => {
      try {
        console.log('Updating NIFTY 50 data...');
        const nifty50 = await nseService.getNifty50();
        cacheService.set('nifty50', nifty50, 2 * 60 * 1000);
        cacheService.set('popular_stocks', nifty50, 2 * 60 * 1000);
      } catch (error) {
        console.error('Error updating NIFTY 50:', error.message);
      }
    }, {
      scheduled: false
    });

    // Update top gainers and losers every 3 minutes
    const gainersLosersJob = cron.schedule('*/3 * * * *', async () => {
      try {
        console.log('Updating gainers and losers...');
        
        const [gainers, losers] = await Promise.all([
          nseService.getTopGainers(10),
          nseService.getTopLosers(10)
        ]);
        
        cacheService.set('gainers_10', gainers, 3 * 60 * 1000);
        cacheService.set('losers_10', losers, 3 * 60 * 1000);
      } catch (error) {
        console.error('Error updating gainers/losers:', error.message);
      }
    }, {
      scheduled: false
    });

    // Clean cache every 10 minutes
    const cacheCleanJob = cron.schedule('*/10 * * * *', () => {
      try {
        console.log('Cleaning expired cache entries...');
        cacheService.cleanExpired();
        console.log('Cache stats:', cacheService.getStats());
      } catch (error) {
        console.error('Error cleaning cache:', error.message);
      }
    }, {
      scheduled: false
    });

    // Start all jobs
    marketStatusJob.start();
    nifty50Job.start();
    gainersLosersJob.start();
    cacheCleanJob.start();

    this.jobs = [marketStatusJob, nifty50Job, gainersLosersJob, cacheCleanJob];

    console.log('Scheduler service started successfully');
  }

  stop() {
    if (!this.isRunning) {
      console.log('Scheduler is not running');
      return;
    }

    console.log('Stopping scheduler service...');
    
    this.jobs.forEach(job => {
      if (job) {
        job.stop();
      }
    });

    this.jobs = [];
    this.isRunning = false;
    
    console.log('Scheduler service stopped');
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      jobCount: this.jobs.length,
      cacheStats: cacheService.getStats()
    };
  }

  // Manual trigger for immediate data update
  async triggerUpdate() {
    try {
      console.log('Manual trigger: Updating all data...');
      
      const [marketStatus, nifty50, gainers, losers] = await Promise.all([
        nseService.getMarketStatus(),
        nseService.getNifty50(),
        nseService.getTopGainers(10),
        nseService.getTopLosers(10)
      ]);

      // Update cache
      cacheService.set('market_status', marketStatus, 60000);
      cacheService.set('nifty50', nifty50, 2 * 60 * 1000);
      cacheService.set('popular_stocks', nifty50, 2 * 60 * 1000);
      cacheService.set('gainers_10', gainers, 3 * 60 * 1000);
      cacheService.set('losers_10', losers, 3 * 60 * 1000);

      console.log('Manual update completed successfully');
      return true;
    } catch (error) {
      console.error('Error in manual update:', error.message);
      return false;
    }
  }
}

module.exports = new SchedulerService();
