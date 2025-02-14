import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Home.css';
import WorkoutChart from './WorkoutChart';

const Home = ({ onAuth }) => {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [showLoginModal, setShowLoginModal] = useState(false);
	const [credentials, setCredentials] = useState({ username: '', password: '' });
	const [userInfo, setUserInfo] = useState(null);
	const [sessionInfo, setSessionInfo] = useState(null);
	const [error, setError] = useState(null);
	const [apiResponses, setApiResponses] = useState({});
	const [loading, setLoading] = useState({});
	const [showSessionInfo, setShowSessionInfo] = useState(false);
	const [workoutId, setWorkoutId] = useState('');
	const navigate = useNavigate();

	// Add useEffect to check for cached data
	useEffect(() => {
		const cachedData = localStorage.getItem('pelotonCSVData');
		if (cachedData) {
			// If we have cached data, redirect to year-in-review?
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

	const handleLogin = async (e) => {
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

	const fetchUserInfo = async () => {
		try {
			console.log('Fetching user info...');
			// First check session to get user data
			const sessionResponse = await fetch('/auth/check_session', {
				credentials: 'include',
				headers: {
					Accept: 'application/json',
				},
			});

			if (!sessionResponse.ok) {
				throw new Error('Failed to check session');
			}

			const sessionData = await sessionResponse.json();
			console.log('Session data with user info:', sessionData);

			if (sessionData.user) {
				setUserInfo(sessionData.user);
				setError('');
			} else {
				throw new Error('No user data in session');
			}
		} catch (err) {
			console.error('Failed to fetch user info:', err);
			setError('Failed to fetch user information');
			setIsLoggedIn(false);
		}
	};

	const handleLogout = async () => {
		try {
			console.log('Logging out...');
			const response = await fetch('/auth/logout', {
				method: 'POST',
				credentials: 'include',
				headers: {
					Accept: 'application/json',
				},
			});

			if (!response.ok) {
				throw new Error('Logout failed');
			}

			setIsLoggedIn(false);
			setUserInfo(null);
			setSessionInfo(null);
			setError('');

			// Double-check session status
			await checkSession();
		} catch (err) {
			console.error('Logout error:', err);
			setError('Failed to logout: ' + err.message);
		}
	};

	const downloadCSV = (csvContent, filename) => {
		const blob = new Blob([csvContent], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.setAttribute('hidden', '');
		a.setAttribute('href', url);
		a.setAttribute('download', filename);
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
	};

	const fetchEndpoint = async (endpoint, label, options = {}) => {
		try {
			setLoading((prev) => ({ ...prev, [label]: true }));

			const userId = sessionInfo?.user?.id || userInfo?.id;
			const finalEndpoint = endpoint.replace('{userId}', userId);

			console.log(`Fetching ${label} from:`, finalEndpoint);

			const response = await fetch(finalEndpoint, {
				credentials: 'include',
				headers: {
					Accept: options.isCSV ? 'text/csv' : 'application/json',
					'Peloton-Platform': 'web',
				},
			});

			const responseText = await response.text();
			console.log(`${label} response:`, {
				status: response.status,
				length: responseText.length,
				preview: responseText.slice(0, 100),
			});

			if (!response.ok) {
				throw new Error(`Request failed: ${response.status} - ${responseText}`);
			}

			const data = options.isCSV ? responseText : JSON.parse(responseText);
			setApiResponses((prev) => ({ ...prev, [label]: data }));

			// This will be our single point of calling onAuth
			if (options.isCSV && label === 'WorkoutHistory') {
				console.log('Got CSV data:', {
					length: data.length,
					preview: data.slice(0, 100),
				});
				onAuth(userId, data);
			}
		} catch (err) {
			console.error(`Error fetching ${label}:`, err);
			setApiResponses((prev) => ({ ...prev, [label]: { error: err.message } }));
		} finally {
			setLoading((prev) => ({ ...prev, [label]: false }));
		}
	};

	return (
		<motion.div className="home-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
			<motion.div className="content" initial={{ y: 20 }} animate={{ y: 0 }} transition={{ delay: 0.2 }}>
				<h1>Peloton Year in Review 1</h1>
				<p>Discover your fitness journey through the year</p>
				<motion.button
					className="start-button"
					onClick={() => setShowLoginModal(true)}
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
				>
					Log In
				</motion.button>
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
