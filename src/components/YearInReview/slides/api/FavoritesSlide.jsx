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

      {/* Top 3 Most Completed Workouts */}
      <div className="workout-section">
        {favoriteWorkouts?.slice(0, 3).map((workout, index) => (
          <motion.div
            key={workout.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`favorite-workout-row ${workout.discipline?.toLowerCase() === 'cycling' ? 'cycling-row' : ''}`}
          >
            <div className="rank-number">{index + 1}</div>
            <div className="workout-info">
              <h3>{workout.title}</h3>
              <p>Completed {workout.timesCompleted} times</p>
            </div>
            {workout.discipline?.toLowerCase() === 'cycling' && (
              <div className="cycling-badge">
                <span>🚲</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Show Top Cycling Workout if not in top 3 */}
      {!favoriteWorkouts?.slice(0, 3).some(w => w.discipline?.toLowerCase() === 'cycling') && (
        <div className="workout-section">
          {favoriteWorkouts
            ?.filter(w => w.discipline?.toLowerCase() === 'cycling')
            .slice(0, 1)
            .map(workout => (
              <motion.div
                key={workout.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="favorite-workout-row cycling-row"
              >
                <div className="workout-info">
                  <h3>{workout.title}</h3>
                  <p>Completed {workout.timesCompleted} times</p>
                </div>
                <div className="cycling-badge">
                  <span>🚲</span>
                </div>
              </motion.div>
            ))}
        </div>
      )}


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
