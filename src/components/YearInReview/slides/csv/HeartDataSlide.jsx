import React from 'react';
import { motion } from 'framer-motion';
import '../../YearInReview.css';

const HeartDataSlide = ({ stats }) => {
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

  const filteredHeartRateData = {
    long: heartRateData.byDuration.long.count >= 3 ? heartRateData.byDuration.long : null,
    short: heartRateData.byDuration.short.count >= 3 ? heartRateData.byDuration.short : null,
  };

  const filteredByDiscipline = Object.fromEntries(
    Object.entries(heartRateData.byDiscipline).filter(([discipline, data]) => data.count >= 3)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="slide stats-slide"
    >
      <h2>Your Average Heart Rates</h2>

      {heartRateData.highestHeartRateWorkout && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="heart-data-card highest-hr-card"
        >
          <h3>Highest Heart Rate Workout</h3>
          <p className='best'>{heartRateData.highestHeartRateWorkout.heartRate} BPM</p>
          <div className="workout-details">
            <p className="workout-title">{heartRateData.highestHeartRateWorkout.title}</p>
            <small>
              with {heartRateData.highestHeartRateWorkout.instructor} • {heartRateData.highestHeartRateWorkout.length} mins
            </small>
          </div>
        </motion.div>
      )}

      <div className="discipline-grid">
        {Object.entries(filteredByDiscipline).map(([discipline, data], index) => (
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

    </motion.div>
  );
};

export default HeartDataSlide;
