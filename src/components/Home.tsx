import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Home.css';

interface Credentials {
	username: string;
	password: string;
}

const Home: React.FC = () => {
	const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
	const [credentials, setCredentials] = useState<Credentials>({ username: '', password: '' });
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	// Add useEffect to check for cached data
	useEffect(() => {
		const cachedData = localStorage.getItem('pelotonCSVData');
		if (cachedData) {
			// If we have cached data, redirect to year-in-review
			navigate('/year-in-review');
			return;
		}

		// Only check session if no cached data exists
		const checkSession = async () => {
			try {
				const response = await fetch('/auth/check_session', {
					credentials: 'include',
					headers: {
						Accept: 'application/json',
					},
				});

				if (response.ok) {
					const data = await response.json();
					if (data.user?.id) {
						navigate('/year-in-review');
					}
				}
			} catch (err) {
				console.error('Session check error:', err);
			}
		};

		checkSession();
	}, [navigate]);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		try {
			const response = await fetch('/auth/login', {
				method: 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
				body: JSON.stringify({
					username_or_email: credentials.username,
					password: credentials.password,
					with_pubsub: false,
				}),
			});

			// Get the response data first
			const userData = await response.json();

			// Then check if login was successful
			if (!response.ok) {
				throw new Error(userData.message || 'Login failed');
			}

			// Navigate to year-in-review on successful login
			navigate('/year-in-review');
		} catch (err) {
			console.error('Login error:', err);
			// Stay on login page if there's an error
			setError('Login failed. Please check your credentials.');
		}
	};

	const handleDemoMode = () => {
		// Navigate directly to demo version
		navigate('/year-in-review-demo');
		console.log('Navigating to demo version');
	};

	return (
		<motion.div className="home-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
			<div className="background-gradient" />
			<div className="background-pattern" />

			<motion.div className="content" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.8 }}>
				<motion.div className="logo-container" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: 'spring' }}>
					<span className="logo">🚴‍♂️</span>
				</motion.div>

				<motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
					Peloton Year in Review
				</motion.h1>

				<motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }} className="subtitle">
					Discover your fitness journey through beautiful visualizations and insights
				</motion.p>

				<div className="button-group">
					<motion.button
						className="start-button"
						onClick={() => setShowLoginModal(true)}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.8 }}
					>
						<span className="button-icon">🔐</span>
						Log In
					</motion.button>

					<motion.button
						className="demo-button"
						onClick={handleDemoMode}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.9 }}
					>
						<span className="button-icon">✨</span>
						Try Demo
					</motion.button>
				</div>
			</motion.div>

			{showLoginModal && (
				<motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
					<motion.div
						className="modal"
						initial={{ scale: 0.8, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ type: 'spring', duration: 0.5 }}
					>
						<h2>Login to Peloton</h2>
						<form onSubmit={handleLogin}>
							<div className="input-group">
								<input
									type="text"
									placeholder="Username or Email"
									value={credentials.username}
									onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
								/>
							</div>
							<div className="input-group">
								<input
									type="password"
									placeholder="Password"
									value={credentials.password}
									onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
								/>
							</div>
							{error && <div className="error-message">{error}</div>}
							<div className="modal-buttons">
								<button type="submit">Login</button>
								<button type="button" onClick={() => setShowLoginModal(false)}>
									Cancel
								</button>
							</div>
						</form>
					</motion.div>
				</motion.div>
			)}
		</motion.div>
	);
};

export default Home;
