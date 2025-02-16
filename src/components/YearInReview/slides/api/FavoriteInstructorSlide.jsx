import React from 'react';
import { motion } from 'framer-motion';
import '../../YearInReview.css';

const FavoriteInstructorSlide = ({ stats, onNext, onPrevious, slideIndex }) => {
  const { favoriteInstructor } = stats;

  const instructorName = favoriteInstructor?.name?.name || 'Unknown Instructor';
  const instructorImage = favoriteInstructor?.name?.gif_url || favoriteInstructor?.gif_url;
  const workoutCount = favoriteInstructor?.workouts?.length || 0;

  const workouts = favoriteInstructor?.workouts || [];
  const totalSeconds = workouts.reduce((sum, w) => sum + w.duration, 0);
  const totalMinutes = Math.round(totalSeconds / 60);
  const totalHours = Math.round(totalMinutes / 60);

  const favoriteDiscipline = Object.entries(
    workouts.reduce((acc, workout) => {
      acc[workout.fitness_discipline] = (acc[workout.fitness_discipline] || 0) + 1;
      return acc;
    }, {})
  )
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';


  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="slide stats-slide"
    >
      <h2>Your Favorite Instructor</h2>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
        className="instructor-profile"
      >
        {instructorImage && (
          <img
            src={instructorImage}
            alt={instructorName}
            className="instructor-image"
          />
        )}
        <h1>{instructorName}</h1>
        <h2>{workoutCount} workouts</h2>
        <h3>Total hours: {totalHours}</h3>
        <h4>Favorite Discipline: {favoriteDiscipline}</h4>
      </motion.div>

      <div className="slide-buttons">
        {slideIndex > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onPrevious}
            className="back-button"
          >
            Back
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNext}
          className="next-button"
        >
          Next
        </motion.button>
      </div>
    </motion.div>
  );
};

export default FavoriteInstructorSlide;
