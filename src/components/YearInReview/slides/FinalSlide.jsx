import React from 'react';
import { motion } from 'framer-motion';
import '../YearInReview.css';

const FinalSlide = ({ stats }) => {
  let finalMessage;
  if (stats?.selectedYear === 'all') {
		finalMessage = 'What a Journey!';
  } else if (stats?.selectedYear === 'bike') {
		finalMessage = 'What a Ride!';
  } else {
		finalMessage = 'What a Year!';
  }

  return (
		<motion.div
			initial={{ opacity: 0, y: 50 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -50 }}
			className="slide final-slide"
		>
			<h1>{finalMessage}</h1>
			<motion.img
				src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExYjZ0ZXBscnFmZmtiNm10azJoa2Qzc3MxODNzZW1haTAxY3g1aDg3YSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/7bXAhOi1oyodzRV5kO/giphy.gif"
				alt="Celebration"
				className="final-gif"
				initial={{ scale: 0 }}
				animate={{ scale: 1 }}
				transition={{ delay: 0.5 }}
			/>
		</motion.div>
  );
};

export default FinalSlide;
