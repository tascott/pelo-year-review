import React, { useState, useEffect } from 'react';
import './AuthComponent.css';
import WorkoutChart from './WorkoutChart';

const AuthComponent = ({ onAuth }) => {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [showLoginModal, setShowLoginModal] = useState(false);
	const [credentials, setCredentials] = useState({ username: '', password: '' });
	const [userInfo, setUserInfo] = useState(null);
	const [sessionInfo, setSessionInfo] = useState(null);
	const [error, setError] = useState('');
	const [apiResponses, setApiResponses] = useState({});
	const [loading, setLoading] = useState({});
	const [showSessionInfo, setShowSessionInfo] = useState(false);
	const [workoutId, setWorkoutId] = useState('');

	// Initial session check on mount and periodic checks
	useEffect(() => {
		const checkSession = async () => {
			try {
				const response = await fetch('/auth/check_session', {
					credentials: 'include',
					headers: {
						Accept: 'application/json',
					},
				});

				if (!response.ok) {
					throw new Error(`Session check failed: ${response.status}`);
				}

				const data = await response.json();

				if (!data || data.is_valid === false) {
					throw new Error('Invalid session');
				}

				// Update user info if available
				if (data.user) {
					setUserInfo(data.user);
				} else if (data.user_id && !userInfo) {
					try {
						const userResponse = await fetch(`/api/user/${data.user_id}`, {
							credentials: 'include',
							headers: {
								Accept: 'application/json',
							},
						});

						if (userResponse.ok) {
							const userData = await userResponse.json();
							setUserInfo(userData);
						}
					} catch (err) {
						console.error('Failed to fetch user data:', err);
					}
				}

				setIsLoggedIn(true);
				setSessionInfo(data);
				return true;
			} catch (err) {
				console.error('Session check error:', err);
				setIsLoggedIn(false);
				setUserInfo(null);
				setSessionInfo(null);
				return false;
			}
		};

		// Check session immediately
		checkSession();

		// Set up periodic checks if logged in - every 5 minutes instead of 30 seconds
		const interval = setInterval(checkSession, 5 * 60 * 1000);

		return () => clearInterval(interval);
	}, []); // Only run on mount

	const checkSession = async () => {
		try {
			console.log('Checking session status...');
			const response = await fetch('/auth/check_session', {
				credentials: 'include',
				headers: {
					Accept: 'application/json',
				},
			});
			console.log('Session check response:', response.status);

			if (!response.ok) {
				throw new Error(`Session check failed with status: ${response.status}`);
			}

			let data;
			try {
				data = await response.json();
				console.log('Session data:', data);
			} catch (e) {
				console.error('Failed to parse session response:', e);
				throw new Error('Invalid session response');
			}

			// Check if we have valid session data
			if (!data) {
				throw new Error('No session data received');
			}

			// Check authentication status
			const isAuthenticated = data.is_valid !== false;

			if (!isAuthenticated) {
				throw new Error('Session is not valid');
			}

			// If we have user data, include it in the session info
			if (data.user) {
				setUserInfo(data.user);
				setIsLoggedIn(true);
				setSessionInfo(data);

				// Fetch CSV data immediately
				console.log('Fetching CSV data after session check');
				await fetchEndpoint(`/api/user/${data.user.id}/workout_history_csv?timezone=Europe%2FLondon`, 'WorkoutHistory', { isCSV: true });
			}

			return true;
		} catch (err) {
			console.error('Session check failed:', err);
			setIsLoggedIn(false);
			setSessionInfo(null);
			return false;
		}
	};

	const handleLogin = async (e) => {
		e.preventDefault();

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

			if (!response.ok) {
				const errorData = await response.text();
				throw new Error(`Login failed: ${response.status} ${errorData}`);
			}

			// After successful login, check session and fetch CSV
			const sessionValid = await checkSession();
			if (!sessionValid) {
				throw new Error('Login succeeded but session check failed');
			}

			setShowLoginModal(false);
			setError('');
		} catch (err) {
			console.error('Login error:', err);
			setError(`Login failed: ${err.message}`);
			setIsLoggedIn(false);
			setSessionInfo(null);
			setUserInfo(null);
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

			// Use different headers for auth endpoints vs API endpoints
			const headers = {
				Accept: options.isCSV ? 'text/csv' : 'application/json',
				'Peloton-Platform': 'web'
			};

			// For API endpoints, use the session token instead of cookies
			if (endpoint.startsWith('/api/') && sessionInfo?.session_id) {
				headers['Cookie'] = `peloton_session_id=${sessionInfo.session_id}`;
			}

			const response = await fetch(finalEndpoint, {
				// Only include credentials for auth endpoints
				credentials: endpoint.startsWith('/auth/') ? 'include' : 'same-origin',
				headers
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
		<div className="auth-container">
			<div className="status-bar">
				<div className={`status-indicator ${isLoggedIn ? 'logged-in' : 'logged-out'}`}>
					{isLoggedIn ? '🟢 Logged In' : '🔴 Logged Out'}
					{apiResponses['User']?.id && <div className="user-id">User ID: {apiResponses['User'].id}</div>}
				</div>
				{sessionInfo && (
					<div className="session-info">
						<div className="session-header" onClick={() => setShowSessionInfo(!showSessionInfo)}>
							<h3>Session Info</h3>
							<span className="toggle-icon">{showSessionInfo ? '▼' : '▶'}</span>
						</div>
						{showSessionInfo && <pre>{JSON.stringify(sessionInfo, null, 2)}</pre>}
					</div>
				)}
				{isLoggedIn ? (
					<button className="logout-button" onClick={handleLogout}>
						Logout
					</button>
				) : (
					<button className="login-button" onClick={() => setShowLoginModal(true)}>
						Login
					</button>
				)}
			</div>

			{isLoggedIn && (
				<div className="api-buttons">
					<button
						onClick={() => fetchEndpoint(`/api/user/${sessionInfo?.user?.id}/calendar`, 'Calendar')}
						disabled={loading['Calendar'] || !sessionInfo?.user?.id}
						title={sessionInfo?.user?.id ? `/api/user/${sessionInfo.user.id}/calendar` : 'Need user ID'}
						className="api-button"
					>
						{loading['Calendar'] ? 'Loading...' : 'Get Calendar'}
						<span className="api-url">{sessionInfo?.user?.id ? `/api/user/${sessionInfo.user.id}/calendar` : '(Get User ID first)'}</span>
					</button>

					<button
						onClick={() => fetchEndpoint(`/api/user/${sessionInfo?.user?.id}/workouts?joins=peloton.ride`, 'Workouts')}
						disabled={loading['Workouts'] || !sessionInfo?.user?.id}
						title={sessionInfo?.user?.id ? `/api/user/${sessionInfo.user.id}/workouts?joins=peloton.ride` : 'Need user ID'}
						className="api-button"
					>
						{loading['Workouts'] ? 'Loading...' : 'Get Workouts'}
						<span className="api-url">
							{sessionInfo?.user?.id ? `/api/user/${sessionInfo.user.id}/workouts?joins=peloton.ride` : '(Get User ID first)'}
						</span>
					</button>

					<button
						onClick={() => fetchEndpoint(`/api/user/${sessionInfo?.user?.id}/achievements?limit=100&page=0`, 'Achievements')}
						disabled={loading['Achievements'] || !sessionInfo?.user?.id}
						title={sessionInfo?.user?.id ? `/api/user/${sessionInfo.user.id}/achievements?limit=100&page=0` : 'Need user ID'}
						className="api-button"
					>
						{loading['Achievements'] ? 'Loading...' : 'Get Achievements'}
						<span className="api-url">
							{sessionInfo?.user?.id ? `/api/user/${sessionInfo.user.id}/achievements?limit=100&page=0` : '(Get User ID first)'}
						</span>
					</button>

					<div className="workout-input">
						<input type="text" value={workoutId} onChange={(e) => setWorkoutId(e.target.value)} placeholder="Enter Workout ID" />
						<button
							onClick={() => fetchEndpoint(`/api/ride/${workoutId}/details`, `Workout ${workoutId}`)}
							disabled={loading[`Workout ${workoutId}`] || !workoutId}
							title={`/api/ride/${workoutId}/details`}
							className="api-button"
						>
							{loading[`Workout ${workoutId}`] ? 'Loading...' : 'Get Workout'}
							<span className="api-url">{`/api/ride/${workoutId}/details`}</span>
						</button>
					</div>

					{sessionInfo?.user?.id && (
						<button
							onClick={() =>
								fetchEndpoint(`/api/user/${sessionInfo.user.id}/workout_history_csv?timezone=Europe%2FLondon`, 'WorkoutHistory', {
									isCSV: true,
								})
							}
							disabled={loading['WorkoutHistory']}
							className="history-button api-button"
							title={`/api/user/${sessionInfo.user.id}/workout_history_csv?timezone=Europe%2FLondon`}
						>
							{loading['WorkoutHistory'] ? 'Loading...' : 'By Month and Type'}
							<span className="api-url">{`/api/user/${sessionInfo.user.id}/workout_history_csv?timezone=Europe%2FLondon`}</span>
						</button>
					)}
				</div>
			)}

			{Object.entries(apiResponses).map(([label, data]) => (
				<div key={label} className="api-response">
					<h3>{label}</h3>
					{data.error ? (
						<pre>{JSON.stringify(data, null, 2)}</pre>
					) : label === 'WorkoutHistory' ? (
						<div className="csv-container">
							<button className="download-button" onClick={() => downloadCSV(data, 'workout_history.csv')}>
								Download CSV
							</button>
							<WorkoutChart csvData={data} />
							<div className="csv-raw">
								<h4>Raw CSV Data</h4>
								<pre>{data}</pre>
							</div>
						</div>
					) : (
						<pre>{JSON.stringify(data, null, 2)}</pre>
					)}
				</div>
			))}

			{showLoginModal && (
				<div className="modal-overlay">
					<div className="modal">
						<h2>Login</h2>
						<form onSubmit={handleLogin}>
							<input
								type="text"
								placeholder="Username"
								value={credentials.username}
								onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
							/>
							<input
								type="password"
								placeholder="Password"
								value={credentials.password}
								onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
							/>
							<div className="modal-buttons">
								<button type="submit">Login</button>
								<button type="button" onClick={() => setShowLoginModal(false)}>
									Cancel
								</button>
							</div>
						</form>
						{error && <div className="error-message">{error}</div>}
					</div>
				</div>
			)}
		</div>
	);
};

export default AuthComponent;
