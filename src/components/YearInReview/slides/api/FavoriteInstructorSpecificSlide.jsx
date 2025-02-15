import React from 'react';
import { motion } from 'framer-motion';
import '../../YearInReview.css';
import instructorIds from '../../../../data/instructorIDs.json';

const FavoriteInstructorSpecificSlide = ({ stats, onNext, onPrevious, slideIndex }) => {
  const { favoriteInstructor } = stats;
  const instructorName = instructorIds[favoriteInstructor?.id] || 'Unknown Instructor';

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="slide stats-slide"
    >
      <h2>Your Journey with {instructorName}</h2>

      <div className="instructor-specific-stats">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="instructor-stat-card"
        >
          <h3>Total Workouts</h3>
          <p>{favoriteInstructor?.workoutCount || 0}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="instructor-stat-card"
        >
          <h3>Total Minutes</h3>
          <p>{favoriteInstructor?.totalMinutes || 0}</p>
        </motion.div>

        {favoriteInstructor?.favoriteWorkoutType && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 }}
            className="instructor-stat-card"
          >
            <h3>Favorite Class Type</h3>
            <p>{favoriteInstructor.favoriteWorkoutType}</p>
          </motion.div>
        )}
      </div>

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

export default FavoriteInstructorSpecificSlide;
