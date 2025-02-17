import React from 'react';
import { motion } from 'framer-motion';
import '../../YearInReview.css';

const WorkoutTimesSlide = ({ stats, onNext, onPrevious, slideIndex }) => {
  const { afternoonWorkouts, eveningWorkouts, morningWorkouts, nightWorkouts } = stats.workoutTimeProfile;

  // Create schedule data from existing stats
  const scheduleData = [
    {
      id: 1,
      name: 'Post Work Pro',
      timeRange: '4:30pm-8pm',
      workouts: eveningWorkouts || 0,
    },
    {
      id: 2,
      name: 'Daytime Rider',
      timeRange: '10am-4:30pm',
      workouts: afternoonWorkouts || 0,
    },
    {
      id: 3,
      name: 'Early Bird',
      timeRange: 'Midnight-10am',
      workouts: morningWorkouts || 0,
    },
    {
      id: 4,
      name: 'Night Owl',
      timeRange: '8pm-Midnight',
      workouts: nightWorkouts || 0,
    },
  ].sort((a, b) => b.workouts - a.workouts);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="slide stats-slide"
    >
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ textAlign: 'center', margin: '0.5rem 0' }}
      >
        Your Workout Schedule
      </motion.h2>

      <div className="workout-schedule times">
        {scheduleData.map((schedule) => (
          <motion.div
            key={schedule.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: schedule.id * 0.2 }}
            className="schedule-row"
            style={{
              backgroundColor: schedule.workouts === Math.max(...scheduleData.map(s => s.workouts))
                ? '#ff6b6b'
                : 'rgba(255, 255, 255, 0.1)',
              padding: '0.5rem',
              margin: '0.25rem 0',
              borderRadius: '8px',
            }}
          >
            <div className="schedule-number">{schedule.id}</div>
            <div className="schedule-info">
              <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.25rem 0' }}>{schedule.name}</h3>
              <p style={{ fontSize: '0.8rem', margin: '0', opacity: 0.8 }}>{schedule.timeRange}</p>
              <p style={{ fontSize: '0.9rem', margin: '0.25rem 0 0 0', fontWeight: 'bold' }}>{schedule.workouts} workouts</p>
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

export default WorkoutTimesSlide;
