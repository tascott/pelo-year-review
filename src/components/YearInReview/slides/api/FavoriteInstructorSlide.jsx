import React from 'react';
import { motion } from 'framer-motion';
import '../../YearInReview.css';
import instructorIds from '../../../../data/instructorIDs.json';

const FavoriteInstructorSlide = ({ stats, onNext, onPrevious, slideIndex }) => {
  const { favoriteInstructor } = stats;
  const instructorName = instructorIds[favoriteInstructor?.id] || 'Unknown Instructor';

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
        {favoriteInstructor?.imageUrl && (
          <img
            src={favoriteInstructor.imageUrl}
            alt={instructorName}
            className="instructor-image"
          />
        )}
        <h3>{instructorName}</h3>
        <p>{favoriteInstructor?.workoutCount || 0} workouts</p>
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
