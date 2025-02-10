import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './YearInReview.css';

import { processWorkoutData } from './yearInReviewUtils';

const slides = [
  {
    id: 'intro',
    component: ({ onNext }) => (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="slide intro-slide"
      >
        <h1>Your Pelo Wrapped</h1>
        <p>Let's look back at your amazing year of fitness</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNext}
          className="next-button"
        >
          Let's Go!
        </motion.button>
      </motion.div>
    )
  },
  {
    id: 'total-workouts',
    component: ({ stats, onNext }) => (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="slide stats-slide"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="stat-circle"
        >
          <h1>{stats?.totalWorkouts || 0}</h1>
          <p>Total Workouts</p>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          That's {stats?.workoutsPerWeek || 0} workouts per week!
        </motion.p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNext}
          className="next-button"
        >
          Next
        </motion.button>
      </motion.div>
    )
  },
  {
    id: 'favorite-instructor',
    component: ({ stats, onNext }) => (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="slide instructor-slide"
      >
        <motion.img
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 1.5 }}
          src={stats?.favoriteInstructor?.image}
          alt={stats?.favoriteInstructor?.name}
          className="instructor-image"
        />
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2>Your Favorite Instructor</h2>
          <h1>{stats?.favoriteInstructor?.name || 'Loading...'}</h1>
          <p>{stats?.favoriteInstructor?.workouts || 0} workouts together</p>
        </motion.div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNext}
          className="next-button"
        >
          Next
        </motion.button>
      </motion.div>
    )
  },
  {
    id: 'workout-types',
    component: ({ stats, onNext }) => (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="slide types-slide"
      >
        <h2>Your Favorite Workout Types</h2>
        <div className="type-bars">
          {stats?.workoutTypes?.map((type, index) => (
            <motion.div
              key={type.name}
              className="type-bar"
              initial={{ width: 0 }}
              animate={{ width: `${type.percentage}%` }}
              transition={{ delay: index * 0.2 }}
            >
              <span className="type-name">{type.name}</span>
              <span className="type-count">{type.count}</span>
            </motion.div>
          ))}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNext}
          className="next-button"
        >
          Next
        </motion.button>
      </motion.div>
    )
  },
  {
    id: 'time-calories',
    component: ({ stats, onNext }) => (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="slide stats-slide"
      >
        <div className="stat-grid">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="stat-box"
          >
            <h2>{stats?.totalMinutes || 0}</h2>
            <p>Hours of Exercise</p>
          </motion.div>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="stat-box"
          >
            <h2>{stats?.totalCalories?.toLocaleString() || 0}</h2>
            <p>Calories Burned</p>
          </motion.div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNext}
          className="next-button"
        >
          Next
        </motion.button>
      </motion.div>
    )
  },
  {
    id: 'achievements',
    component: ({ stats, onNext }) => (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="slide achievements-slide"
      >
        <h2>Your Achievements</h2>
        <div className="achievements-overview">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="achievement-box total"
          >
            <h2>{stats?.achievements || 0}</h2>
            <p>Total Achievements</p>
          </motion.div>
        </div>

        <div className="achievements-categories">
          {stats?.achievementCategories
            ?.filter(cat => cat.earnedCount > 0)
            ?.slice(0, 6)
            ?.map((category, index) => (
              <motion.div
                key={category.slug}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + (index * 0.1) }}
                className="category-item"
              >
                <span className="category-name">{category.name}</span>
                <span className="category-count">{category.earnedCount}</span>
              </motion.div>
            ))}
        </div>

        <div className="achievements-footer">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8, type: "spring" }}
            className="achievement-box"
          >
            <h2>{stats?.personalRecords || 0}</h2>
            <p>Personal Records</p>
          </motion.div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNext}
          className="next-button"
        >
          Next
        </motion.button>
      </motion.div>
    )
  },
  {
    id: 'final',
    component: ({ stats }) => (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="slide final-slide"
      >
        <h1>What a Year!</h1>
        <p>Keep up the amazing work in {new Date().getFullYear()}!</p>
        <div className="final-stats">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {stats?.totalWorkouts} workouts
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            {stats?.totalMinutes} hours
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            {stats?.personalRecords} personal records
          </motion.p>
        </div>
      </motion.div>
    )
  }
];

const YearInReview = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear -1 ); // Start with last year by default
  
  // Generate year options (current year and last 3 years)
  const yearOptions = Array.from({length: 4}, (_, i) => currentYear - i); // Show current year and last 3 years


  const startYearInReview = async () => {
    if (!sessionData?.user?.id) {
      setError('No session data available');
      return;
    }
    setIsLoading(true);
    setIsFetching(true);
    setError(null);
    
    try {
      // Fetch achievements
      const achievementsResponse = await fetch(`/api/user/${sessionData.user.id}/achievements`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Origin': 'https://members.onepeloton.com',
          'Referer': 'https://members.onepeloton.com/',
          'Peloton-Platform': 'web'
        }
      });

      if (!achievementsResponse.ok) {
        throw new Error(`Failed to fetch achievements: ${achievementsResponse.status} ${achievementsResponse.statusText}`);
      }

      // Fetch all workout data with pagination
      const limit = 100;
      let allWorkouts = [];
      let page = 0;
      let hasMore = true;
      const seenPages = new Set(); // Track which pages we've already fetched
      
      while (hasMore) {
        // Skip if we've already fetched this page
        if (seenPages.has(page)) {
          page++;
          continue;
        }
        seenPages.add(page);

        const workoutsResponse = await fetch(`/api/user/${sessionData.user.id}/workouts?limit=${limit}&page=${page}`, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Origin': 'https://members.onepeloton.com',
            'Referer': 'https://members.onepeloton.com/',
            'Peloton-Platform': 'web'
          }
        });

        if (!workoutsResponse.ok) {
          throw new Error(`Failed to fetch workouts: ${workoutsResponse.status} ${workoutsResponse.statusText}`);
        }

        const data = await workoutsResponse.json();
        const workouts = data.data || [];
        allWorkouts = [...allWorkouts, ...workouts];
        
        // Check if we have more pages
        hasMore = workouts.length === limit;
        page++;
      }

      // Process the workout data
      const processedStats = processWorkoutData(allWorkouts, selectedYear);
      if (!processedStats) {
        throw new Error(`No workout data found for ${selectedYear}`);
      }
      setStats(processedStats);
    } catch (err) {
      console.error('Error starting year in review:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  };
  // Initialize session data on mount
  useEffect(() => {
    const initializeSession = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check session
        const sessionResponse = await fetch('/auth/check_session', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Origin': 'https://members.onepeloton.com',
            'Referer': 'https://members.onepeloton.com/',
            'Peloton-Platform': 'web'
          }
        });

        if (!sessionResponse.ok) {
          throw new Error('Failed to check session');
        }

        const data = await sessionResponse.json();
        console.log('Session data:', data);

        if (!data?.is_valid || !data?.user?.id) {
          throw new Error('User not authenticated');
        }

        setSessionData(data);
      } catch (error) {
        console.error('Session initialization failed:', error);
        setError('Please log in to view your Year in Review');
        setSessionData(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();
  }, []); // Only run on mount



  const CurrentSlideComponent = slides[currentSlide]?.component;

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  return (
    <div className="year-in-review">
      {error ? (
        <div className="error-message">
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
        </div>
      ) : !sessionData ? (
        <div className="loading-message">
          <h2>Checking session...</h2>
        </div>
      ) : !stats ? (
        <div className="start-screen">
          <h2>Year In Review {selectedYear}</h2>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="year-selector"
          >
            {yearOptions.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button 
            onClick={startYearInReview} 
            disabled={isLoading}
            className="start-button"
          >
            {isLoading ? (
              <>
                <div className="loading-spinner"></div>
                <span>Building your Year in Review...</span>
              </>
            ) : (
              'Start Year in Review'
            )}
          </button>
          {isFetching && (
            <div className="fetch-progress">
              Fetching workout data...
            </div>
          )}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {CurrentSlideComponent && (
            <CurrentSlideComponent
              key={slides[currentSlide].id}
              stats={stats}
              onNext={handleNext}
            />
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default YearInReview;
