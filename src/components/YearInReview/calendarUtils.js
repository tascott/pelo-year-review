/**
 * Calendar Data Processing
 * These functions process data that was originally loaded from the Calendar API and stored in localStorage
 */

/**
 * Process calendar data for a specific year
 */
export const processCalendarData = (calendarData,selectedYear) => {
  if(!calendarData || !Array.isArray(calendarData)) {
    console.error('Invalid calendar data:',calendarData);
    return null;
  }

  // Filter months based on year parameter
  let filteredMonths = calendarData;
  if(typeof selectedYear === 'number') {
    filteredMonths = calendarData.filter(month => month.year === selectedYear);
  } else if(selectedYear?.mode === 'bike') {
    const bikeStart = new Date(selectedYear.earliestBikeDate);
    filteredMonths = calendarData.filter(month => {
      const monthDate = new Date(month.year,month.month - 1,1);
      return monthDate >= bikeStart;
    });
  }

  // Create array of all active days with proper filtering
  const allDays = new Set(); // Use Set to avoid duplicates
  filteredMonths.forEach(month => {
    if(month.active_days && Array.isArray(month.active_days)) {
      month.active_days.forEach(day => {
        const date = new Date(month.year,month.month - 1,day);
        allDays.add(date.getTime()); // Store timestamp to ensure uniqueness
      });
    }
  });

  // Convert Set back to array of dates
  const sortedDays = Array.from(allDays).map(timestamp => new Date(timestamp));
  sortedDays.sort((a,b) => b.getTime() - a.getTime()); // Sort newest first

  // Calculate current streak
  let currentStreak = 0;
  let checkDate = new Date();
  checkDate.setHours(0,0,0,0);

  // Check if today is an active day
  const todayStr = checkDate.toISOString().split('T')[0];
  const hasWorkoutToday = sortedDays.some(date =>
    date.toISOString().split('T')[0] === todayStr
  );

  // If no workout today, start checking from yesterday
  if(!hasWorkoutToday) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Calculate current streak
  for(const activeDate of sortedDays) {
    const activeDateStr = activeDate.toISOString().split('T')[0];
    const checkDateStr = checkDate.toISOString().split('T')[0];

    if(activeDateStr === checkDateStr) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 1;
  let prevDate = null;

  for(const date of sortedDays) {
    if(!prevDate) {
      prevDate = date;
      continue;
    }

    const dayDiff = Math.round(
      (prevDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if(dayDiff === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak,tempStreak);
    } else {
      tempStreak = 1;
    }
    prevDate = date;
  }

  // Make sure to count single-day streaks
  longestStreak = Math.max(longestStreak,tempStreak);

  return {
    currentStreak,
    longestStreak,
    totalActiveDays: sortedDays.length
  };
};

/**
 * Calculate workout streaks from calendar events
 */
const calculateStreaks = (dates) => {
  if(!dates || dates.length === 0) return {longest: 0,current: 0,history: []};

  let currentStreak = 1; // Start at 1 since one workout is a streak of 1
  let longestStreak = 1;
  let streakHistory = [];
  let streakStart = dates[0];

  // Process each date
  for(let i = 0;i < dates.length - 1;i++) {
    const currentDate = dates[i];
    const nextDate = dates[i + 1];


    // Continue streak
    const isConsecutive = isNextDay(currentDate,nextDate);

    if(isConsecutive) {
      currentStreak++;
    }
    // Break in streak
    else {
      streakHistory.push({
        start: streakStart,
        end: currentDate,
        length: currentStreak
      });
      longestStreak = Math.max(longestStreak,currentStreak);
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
  longestStreak = Math.max(longestStreak,currentStreak);

  // Calculate if current streak is still active
  const lastDate = dates[dates.length - 1];
  const today = new Date();
  const isCurrentStreakActive = isNextDay(lastDate,today);

  return {
    longest: longestStreak,
    current: isCurrentStreakActive ? currentStreak : 0,
    history: streakHistory
  };
};

/**
 * Helper function to check if two dates are consecutive
 */
const isNextDay = (date1,date2) => {
  // Convert dates to UTC to avoid timezone issues
  const d1 = new Date(Date.UTC(date1.getFullYear(),date1.getMonth(),date1.getDate()));
  const d2 = new Date(Date.UTC(date2.getFullYear(),date2.getMonth(),date2.getDate()));

  const oneDayInMs = 24 * 60 * 60 * 1000;
  const diffInDays = Math.round((d2.getTime() - d1.getTime()) / oneDayInMs);

  return diffInDays === 1;
};

export {calculateStreaks};
