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
        {favoriteWorkouts?.map((workout, index) => {
          const isCycling = workout.discipline?.toLowerCase() === 'cycling';
          const showCyclingBadge = index === 3 && isCycling; // Show badge if it's the 4th item and cycling

          return (
            <motion.div
              key={workout.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="favorite-workout-row"
            >
              <div className="rank-number">{index + 1}</div>
              <div className="workout-info">
                <h3>{workout.title}</h3>
                <p>Completed {workout.timesCompleted} times</p>
              </div>
              {showCyclingBadge && (
                <div className="top-cycling-badge">
                  <span>🚲 Top Cycling Workout</span>
                </div>
              )}
            </motion.div>
          );
        })}
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
