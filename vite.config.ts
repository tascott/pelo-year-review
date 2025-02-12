import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		proxy: {
			'/api': {
				target: 'https://api.onepeloton.com',
				changeOrigin: true,
				secure: true,
				headers: {
					Origin: 'https://members.onepeloton.com',
					Referer: 'https://members.onepeloton.com/',
				},
			},
			'/auth': {
				target: 'https://api.onepeloton.com',
				changeOrigin: true,
				secure: true,
				headers: {
					Origin: 'https://members.onepeloton.com',
					Referer: 'https://members.onepeloton.com/',
				},
			},
		},
	},
	build: {
		outDir: 'dist',
		sourcemap: true,
		rollupOptions: {
			output: {
				manualChunks: {
					'react-vendor': ['react', 'react-dom', 'react-router-dom'],
					'chart-vendor': ['chart.js', 'react-chartjs-2'],
					'motion-vendor': ['framer-motion'],
				},
			},
		},
	},
});
