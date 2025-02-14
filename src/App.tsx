import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import YearInReview from './components/YearInReview/YearInReview';
import { useState, useEffect } from 'react';
import Home from './components/Home';

interface HandleAuthProps {
	userId: string;
	csvData: string;
}

function App() {
	const [csvData, setCsvData] = useState<string | null>(() => {
		const saved = localStorage.getItem('pelotonCSVData');
		return saved || null;
	});

	const handleAuth = (props: HandleAuthProps) => {
		localStorage.setItem('pelotonCSVData', props.csvData);
		setCsvData(props.csvData);
	};

	useEffect(() => {
	}, [csvData]);

	return (
		<Router>
			<div className="app">
				<Routes>
					<Route path="/" element={<Home onAuth={handleAuth} />} />
					{/* <Route path="/authlogin" element={<AuthComponent onAuth={handleAuth} />} /> */}
					<Route path="/year-in-review" element={<YearInReview csvData={csvData} />} />
				</Routes>
			</div>
		</Router>
	);
}

export default App;
