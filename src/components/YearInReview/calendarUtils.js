/**
 * Calendar Data Processing
 * These functions process data that was originally loaded from the Calendar API and stored in localStorage
 */

/**
 * Process calendar data for a specific year
 */
const processCalendarData = (calendarData, selectedYear) => {
  if (!calendarData || !Array.isArray(calendarData)) {
    console.error('Invalid calendar data:', calendarData);
    return null;
  }

  // Filter events for selected year
  const yearEvents = calendarData.filter(event => {
    const eventDate = new Date(event.start_time * 1000);
    return eventDate.getFullYear() === selectedYear;
  });

  // Get active days (days with at least one workout)
  const activeDays = new Set(
    yearEvents.map(event => {
      const date = new Date(event.start_time * 1000);
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    })
  );

  // Get streaks
  const streaks = calculateStreaks(yearEvents);

  return {
    activeDays: activeDays.size,
    totalEvents: yearEvents.length,
    longestStreak: streaks.longest,
    currentStreak: streaks.current,
    streakHistory: streaks.history
  };
};

/**
 * Calculate workout streaks from calendar events
 */
const calculateStreaks = (events) => {
  if (!events.length) return { longest: 0, current: 0, history: [] };

  // Sort events by date
  const sortedEvents = events.sort((a, b) => a.start_time - b.start_time);

  // Get unique dates
  const uniqueDates = new Set(
    sortedEvents.map(event => {
      const date = new Date(event.start_time * 1000);
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    })
  );

  const dates = Array.from(uniqueDates).sort();
  let currentStreak = 0;
  let longestStreak = 0;
  let streakHistory = [];
  let streakStart = null;

  // Calculate streaks
  for (let i = 0; i < dates.length; i++) {
    const currentDate = new Date(dates[i]);
    const nextDate = i < dates.length - 1 ? new Date(dates[i + 1]) : null;

    // Continue streak
    if (!nextDate || isNextDay(currentDate, nextDate)) {
      currentStreak++;
      if (!streakStart) streakStart = currentDate;
    } 
    // Break in streak
    else {
      if (currentStreak > 0) {
        streakHistory.push({
          start: streakStart,
          end: currentDate,
          length: currentStreak
        });
      }
      longestStreak = Math.max(longestStreak, currentStreak);
      currentStreak = 1;
      streakStart = nextDate;
    }
  }

  // Handle final streak
  if (currentStreak > 0) {
    const lastDate = new Date(dates[dates.length - 1]);
    streakHistory.push({
      start: streakStart,
      end: lastDate,
      length: currentStreak
    });
    longestStreak = Math.max(longestStreak, currentStreak);
  }

  return {
    longest: longestStreak,
    current: currentStreak,
    history: streakHistory
  };
};

/**
 * Helper function to check if two dates are consecutive
 */
const isNextDay = (date1, date2) => {
  const oneDayInMs = 24 * 60 * 60 * 1000;
  const diffInDays = Math.round((date2 - date1) / oneDayInMs);
  return diffInDays === 1;
};

export {
  processCalendarData,
  calculateStreaks
};
