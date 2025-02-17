import React from 'react';
import { motion } from 'framer-motion';
import '../../YearInReview.css';
import { capitalizeFirstLetter } from '../../../../utils/textHelpers.js';

const FavoriteInstructorSpecificSlide = ({ stats, onNext, onPrevious, slideIndex }) => {
  const topInstructorsByDiscipline = stats?.topInstructorsByDiscipline || [];

  const sortedInstructors = topInstructorsByDiscipline.sort((a, b) => (b.topInstructor.count || 0) - (a.topInstructor.count || 0));

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="slide stats-slide"
    >
      <h2>Your Favorite Instructors by Discipline</h2>

      <div className="instructor-specific-stats">
        {Array.isArray(sortedInstructors) && sortedInstructors.sort((a, b) => (b.topInstructor.count || 0) - (a.topInstructor.count || 0)).map(({ discipline, topInstructor }) => (
          topInstructor && (
            <motion.div
              key={discipline}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="instructor-stat-card"
            >
              {capitalizeFirstLetter(discipline)}
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
