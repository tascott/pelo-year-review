import React, { useState, useEffect } from 'react';
import './AuthComponent.css';

const AuthComponent = () => {
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
            'Accept': 'application/json'
          }
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
                'Accept': 'application/json'
              }
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

    // Set up periodic checks if logged in
    const interval = setInterval(checkSession, 30000);

    return () => clearInterval(interval);
  }, []); // Only run on mount

  const checkSession = async () => {
    try {
      console.log('Checking session status...');
      const response = await fetch('/auth/check_session', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
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
      } else if (data.user_id) {
        // If we only have user_id, we might need to fetch full user data
        console.log('Have user_id but no user data:', data.user_id);
      }
      
      setIsLoggedIn(true);
      setSessionInfo(data);
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
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username_or_email: credentials.username,
          password: credentials.password,
          with_pubsub: false
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Login failed: ${response.status} ${errorData}`);
      }

      // After successful login, check session
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
          'Accept': 'application/json'
        }
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
          'Accept': 'application/json'
        }
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

  const fetchEndpoint = async (endpoint, label) => {
    try {
      setLoading(prev => ({ ...prev, [label]: true }));
      
      // Replace userId in URL if needed
      const userId = sessionInfo?.user?.id || userInfo?.id;
      const finalEndpoint = endpoint.replace('{userId}', userId);
      
      const response = await fetch(finalEndpoint, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }
      
      const data = await response.json();
      setApiResponses(prev => ({ ...prev, [label]: data }));
    } catch (err) {
      console.error(`Error fetching ${label}:`, err);
      setApiResponses(prev => ({ ...prev, [label]: { error: err.message } }));
    } finally {
      setLoading(prev => ({ ...prev, [label]: false }));
    }
  };

  return (
    <div className="auth-container">
      <div className="status-bar">
        <div className={`status-indicator ${isLoggedIn ? 'logged-in' : 'logged-out'}`}>
          {isLoggedIn ? '🟢 Logged In' : '🔴 Logged Out'}
        </div>
        {sessionInfo && (
          <div className="session-info">
            <div className="session-header" onClick={() => setShowSessionInfo(!showSessionInfo)}>
              <h3>Session Info</h3>
              <span className="toggle-icon">{showSessionInfo ? '▼' : '▶'}</span>
            </div>
            {showSessionInfo && (
              <pre>{JSON.stringify(sessionInfo, null, 2)}</pre>
            )}
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
            onClick={() => fetchEndpoint('/api/me', 'Me')} 
            disabled={loading['Me']}
          >
            {loading['Me'] ? 'Loading...' : 'Get Me'}
          </button>
          
          <button 
            onClick={() => fetchEndpoint(`/api/user/${sessionInfo?.user?.id}`, 'User')} 
            disabled={loading['User']}
          >
            {loading['User'] ? 'Loading...' : 'Get User'}
          </button>
          
          <button 
            onClick={() => fetchEndpoint('/api/user/{userId}/calendar', 'Calendar')} 
            disabled={loading['Calendar']}
          >
            {loading['Calendar'] ? 'Loading...' : 'Get Calendar'}
          </button>
          
          <button 
            onClick={() => fetchEndpoint('/api/user/{userId}/workouts', 'Workouts')} 
            disabled={loading['Workouts']}
          >
            {loading['Workouts'] ? 'Loading...' : 'Get Workouts'}
          </button>
          
          <button 
            onClick={() => fetchEndpoint('/api/me/achievements', 'Achievements')} 
            disabled={loading['Achievements']}
          >
            {loading['Achievements'] ? 'Loading...' : 'Get Achievements'}
          </button>
          
          <button 
            onClick={() => fetchEndpoint('/api/me/overview', 'Overview')} 
            disabled={loading['Overview']}
          >
            {loading['Overview'] ? 'Loading...' : 'Get Overview'}
          </button>

          <div className="workout-input">
            <input
              type="text"
              value={workoutId}
              onChange={(e) => setWorkoutId(e.target.value)}
              placeholder="Enter Workout ID"
            />
            <button 
              onClick={() => fetchEndpoint(`/api/workout/${workoutId}`, `Workout ${workoutId}`)} 
              disabled={loading[`Workout ${workoutId}`] || !workoutId}
            >
              {loading[`Workout ${workoutId}`] ? 'Loading...' : 'Get Workout'}
            </button>
          </div>
        </div>
      )}

      {Object.entries(apiResponses).map(([label, data]) => (
        <div key={label} className="api-response">
          <h3>{label}</h3>
          <pre>{JSON.stringify(data, null, 2)}</pre>
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
                <button type="button" onClick={() => setShowLoginModal(false)}>Cancel</button>
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
