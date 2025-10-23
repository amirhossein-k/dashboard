import cron from "node-cron";
// Daily reminder job - runs every hour to check for reminders
cron.schedule("0 * * * *", async () => {
  console.log("Checking for supplier reminders...");

  try {
    // Call the internal API endpoint
    const response = await fetch("http://localhost:3000/api/reminders/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const result = await response.json();
      console.log("Reminder job completed:", result);
    } else {
      console.error("Failed to send reminders:", response.statusText);
    }
  } catch (error) {
    console.error("Error in reminder job:", error);
  }
});

console.log("Daily reminder cron job started");

// Keep the process running
process.on("SIGINT", () => {
  console.log("Stopping reminder cron job...");
  process.exit(0);
});
