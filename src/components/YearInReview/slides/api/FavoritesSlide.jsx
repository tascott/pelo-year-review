import React from 'react';
import { motion } from 'framer-motion';
import '../../YearInReview.css';

const FavoritesSlide = ({ stats, onNext, onPrevious, slideIndex }) => {
  const { favoriteWorkouts } = stats;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="slide stats-slide"
    >
      <h2>Your Favorite Workouts</h2>

      <div className="favorite-workouts">
        {favoriteWorkouts?.map((workout, index) => (
          <motion.div
            key={workout.id}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
            className="favorite-workout-card"
          >
            {workout.imageUrl && (
              <img
                src={workout.imageUrl}
                alt={workout.title}
                className="workout-thumbnail"
              />
            )}
            <div className="workout-info">
              <h3>{workout.title}</h3>
              <p>{workout.instructor}</p>
              <p>{workout.timesCompleted} times completed</p>
            </div>
          </motion.div>
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

export default FavoritesSlide;
