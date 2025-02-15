import React from 'react';
import { motion } from 'framer-motion';
import '../../YearInReview.css';

const WorkoutTypesSlide = ({ stats, onNext, onPrevious, slideIndex }) => {
  const { workoutTypes } = stats || {};

  console.log('workoutTypessssssssss', workoutTypes);

  // Make sure we have workout types data
  if (!workoutTypes || !Array.isArray(workoutTypes) || workoutTypes.length === 0) {
    console.error('No workout types data available');
    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="slide stats-slide"
      >
        <h2>No workout data available</h2>
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
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ textAlign: 'center', marginBottom: '2rem' }}
      >
        Your Workout Mix
      </motion.h2>

      <div className="workout-types-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '2rem',
        padding: '2rem',
        justifyItems: 'center'
      }}>
        {workoutTypes.map((type, index) => (
          <motion.div
            key={type.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.5,
              delay: index * 0.1 
            }}
            className="workout-type-card"
            style={{
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: `radial-gradient(circle at center, rgba(255, 107, 107, 0.1), rgba(255, 142, 83, 0.1))`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              textAlign: 'center'
            }}
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              style={{
                margin: '0 0 0.5rem 0',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                color: 'rgba(255, 107, 107, 0.8)'
              }}
            >
              {type.percentage}%
            </motion.p>

            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.4 }}
              style={{ 
                margin: '0 0 0.5rem 0', 
                color: 'white', 
                fontSize: '1.5rem'
              }}
            >
              {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
            </motion.h3>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.5 }}
              style={{ 
                margin: '0', 
                fontSize: '3rem', 
                fontWeight: 'bold' 
              }}
            >
              {type.count}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.6 }}
              style={{ 
                margin: 0, 
                fontSize: '1rem', 
                opacity: 0.8 
              }}
            >
              workouts
            </motion.p>
          </motion.div>
        ))}
      </div>

      <div className="slide-buttons" style={{ marginTop: '2rem' }}>
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

export default WorkoutTypesSlide;
