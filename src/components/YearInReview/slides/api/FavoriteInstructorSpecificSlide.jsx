import React from 'react';
import { motion } from 'framer-motion';
import '../../YearInReview.css';

const FavoriteInstructorSpecificSlide = ({ stats, onNext, onPrevious, slideIndex }) => {
  const topInstructorsByDiscipline = stats?.topInstructorsByDiscipline || [];
  console.log('topInstructorsByDiscipline from stats:', topInstructorsByDiscipline);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="slide stats-slide"
    >
      <h2>Your Favorite Instructors by Discipline</h2>

      <div className="instructor-specific-stats">
        {Array.isArray(topInstructorsByDiscipline) && topInstructorsByDiscipline.map(({ discipline, topInstructor }) => (
          topInstructor && (
            <motion.div
              key={discipline}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="instructor-stat-card"
            >
              <h3>{discipline}</h3>
              {/* Image removed since we don't have instructor images in this context */}
              <h4>{topInstructor.name || 'Unknown'}</h4>
              <p>{topInstructor.count || 0} workouts</p>
            </motion.div>
          )
        ))}
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
