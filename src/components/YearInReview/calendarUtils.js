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

  // Filter events based on selected year parameter
  let yearEvents = calendarData;

  // Get active days (days with at least one workout)
  const activeDays = new Set();
  const workoutDates = [];
  // Process calendar data
  yearEvents.forEach(month => {
    if (month.active_days && Array.isArray(month.active_days)) {
      month.active_days.forEach(day => {
        const date = new Date(month.year, month.month - 1, day);
        const dateStr = `${month.year}-${month.month}-${day}`;

        // For 'bike' selection, check against earliest bike date
        if (selectedYear?.mode === 'bike') {
          const earliestDate = new Date(selectedYear.earliestBikeDate);
          if (date >= earliestDate) {
            activeDays.add(dateStr);
            workoutDates.push(date);
          }
        }
        // For specific year, check the year matches
        else if (typeof selectedYear === 'number') {
          if (date.getFullYear() === selectedYear) {
            activeDays.add(dateStr);
            workoutDates.push(date);
          }
        }
        // For 'all' or invalid parameter, include everything
        else {
          activeDays.add(dateStr);
          workoutDates.push(date);
        }
      });
    }
  });

  // Sort dates chronologically
  workoutDates.sort((a, b) => a.getTime() - b.getTime());

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
    const isConsecutive = isNextDay(currentDate, nextDate);

    if (isConsecutive) {
      currentStreak++;
    }
    // Break in streak
    else {
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
  // Convert dates to UTC to avoid timezone issues
  const d1 = new Date(Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate()));
  const d2 = new Date(Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate()));

  const oneDayInMs = 24 * 60 * 60 * 1000;
  const diffInDays = Math.round((d2.getTime() - d1.getTime()) / oneDayInMs);

  return diffInDays === 1;
};

export {
  processCalendarData,
  calculateStreaks
};
