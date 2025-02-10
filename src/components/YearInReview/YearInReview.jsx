import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './YearInReview.css';

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
        <h1>Your 2023 Peloton Journey</h1>
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
  }
];

const YearInReview = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Here we'll process the workout data to generate stats
    const processWorkoutData = async () => {
      try {
        // We'll implement the data fetching and processing here
        // For now, using placeholder data
        setStats({
          totalWorkouts: 156,
          workoutsPerWeek: 3,
          favoriteInstructor: {
            name: "Hannah Corbin",
            workouts: 45,
            image: "placeholder.jpg"
          },
          workoutTypes: [
            { name: "Cycling", count: 80, percentage: 80 },
            { name: "Strength", count: 40, percentage: 40 },
            { name: "Yoga", count: 20, percentage: 20 },
            { name: "Meditation", count: 16, percentage: 16 }
          ]
        });
        setLoading(false);
      } catch (error) {
        console.error('Error processing workout data:', error);
        setLoading(false);
      }
    };

    processWorkoutData();
  }, []);

  const CurrentSlideComponent = slides[currentSlide]?.component;

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  if (loading) {
    return (
      <div className="year-in-review loading">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="loading-spinner"
        />
        <p>Loading your year in review...</p>
      </div>
    );
  }

  return (
    <div className="year-in-review">
      <AnimatePresence mode="wait">
        {CurrentSlideComponent && (
          <CurrentSlideComponent
            key={slides[currentSlide].id}
            stats={stats}
            onNext={handleNext}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default YearInReview;
