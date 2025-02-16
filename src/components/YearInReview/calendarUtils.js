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
  const activeDays = new Set();

  // Count active days from the calendar data
  calendarData.forEach(month => {
    if (month.active_days && Array.isArray(month.active_days)) {
      month.active_days.forEach(day => {
        activeDays.add(`${month.year}-${month.month}-${day}`);
      });
    }
  });

  // Convert calendar data into sorted dates for streak calculation
  const workoutDates = [];
  calendarData.forEach(month => {
    if (month.active_days && Array.isArray(month.active_days)) {
      month.active_days.forEach(day => {
        workoutDates.push(new Date(month.year, month.month - 1, day));
      });
    }
  });

  // Sort dates chronologically
  workoutDates.sort((a, b) => a - b);

  // Get streaks
  const streaks = calculateStreaks(workoutDates);

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
const calculateStreaks = (dates) => {
  if (!dates || dates.length === 0) return { longest: 0, current: 0, history: [] };

  let currentStreak = 1; // Start at 1 since one workout is a streak of 1
  let longestStreak = 1;
  let streakHistory = [];
  let streakStart = dates[0];

  // Process each date
  for (let i = 0; i < dates.length - 1; i++) {
    const currentDate = dates[i];
    const nextDate = dates[i + 1];


    // Continue streak
    if (isNextDay(currentDate, nextDate)) {
      currentStreak++;
    }
    // Break in streak
    else {
      console.log(`Streak broken at ${currentStreak}`);
      streakHistory.push({
        start: streakStart,
        end: currentDate,
        length: currentStreak
      });
      longestStreak = Math.max(longestStreak, currentStreak);
      currentStreak = 1; // Reset to 1 for the next date
      streakStart = nextDate;
    }
  }

  // Handle final streak
  streakHistory.push({
    start: streakStart,
    end: dates[dates.length - 1],
    length: currentStreak
  });
  longestStreak = Math.max(longestStreak, currentStreak);

  // Calculate if current streak is still active
  const lastDate = dates[dates.length - 1];
  const today = new Date();
  const isCurrentStreakActive = isNextDay(lastDate, today);

  return {
    longest: longestStreak,
    current: isCurrentStreakActive ? currentStreak : 0,
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
