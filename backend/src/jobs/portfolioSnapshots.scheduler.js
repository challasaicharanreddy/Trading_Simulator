// jobs/portfolioSnapshotScheduler.js
import cron from "node-cron";
import { takeSnapshotsForAllUsers } from "../services/portfolio.services.js";

function startPortfolioSnapshotScheduler() {
  // Runs at 4:05 PM Eastern Time, Monday–Friday
  // Cron format: minute hour day-of-month month day-of-week
  cron.schedule(
    "5 16 * * 1-5",
    () => {
      console.log("Running daily portfolio snapshot job...");
      takeSnapshotsForAllUsers();
    },
    {
      timezone: "America/New_York", // critical — ties the schedule to US market hours regardless of your server's own timezone
    }
  );

  console.log("Portfolio snapshot scheduler started (4:05 PM ET, weekdays)");
}

export default startPortfolioSnapshotScheduler;