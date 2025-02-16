import React from 'react';
import { motion } from 'framer-motion';
import '../../YearInReview.css';

const HeartDataSlide = ({ stats, onNext, onPrevious, slideIndex }) => {
  const { heartRateData } = stats;

  if (!heartRateData || !heartRateData.byDuration) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="slide stats-slide"
      >
        <h2>Heart Rate Data</h2>
        <p>No heart rate data available</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="slide stats-slide"
    >
      <h2>Your Average Heart Rates</h2>

      <div className="heart-data-grid">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="heart-data-card"
        >
          <h3>Long Rides (20+ mins)</h3>
          <p>{heartRateData.byDuration.long.avgHeartRate} BPM</p>
          <small>{heartRateData.byDuration.long.count} workouts</small>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="heart-data-card"
        >
          <h3>Quick Rides (under 20 mins)</h3>
          <p>{heartRateData.byDuration.short.avgHeartRate} BPM</p>
          <small>{heartRateData.byDuration.short.count} workouts</small>
        </motion.div>
      </div>

      {heartRateData.highestHeartRateWorkout && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="heart-data-card highest-hr-card"
        >
          <h3>Highest Heart Rate Workout</h3>
          <p>{heartRateData.highestHeartRateWorkout.heartRate} BPM</p>
          <div className="workout-details">
            <p className="workout-title">{heartRateData.highestHeartRateWorkout.title}</p>
            <small>
              with {heartRateData.highestHeartRateWorkout.instructor} • {heartRateData.highestHeartRateWorkout.length} mins
            </small>
          </div>
        </motion.div>
      )}

      <h3 className="discipline-header">By Discipline</h3>
      <div className="discipline-grid">
        {Object.entries(heartRateData.byDiscipline).map(([discipline, data], index) => (
          <motion.div
            key={discipline}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + (index * 0.1) }}
            className="heart-data-card discipline-card"
          >
            <h4>{discipline}</h4>
            <p>{data.avgHeartRate} BPM</p>
            <small>{data.count} workouts</small>
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

export default HeartDataSlide;
