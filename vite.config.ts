import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import type { ProxyOptions } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		proxy: {
			'/auth': {
				target: 'https://api.onepeloton.com',
				changeOrigin: true,
				secure: false,
				cookieDomainRewrite: {
					'.onepeloton.com': 'localhost'
				},
				headers: {
					'Origin': 'https://members.onepeloton.com',
					'Referer': 'https://members.onepeloton.com/',
					'Peloton-Platform': 'web'
				},
				configure: (proxy: any, _options: ProxyOptions) => {
					proxy.on('proxyReq', (proxyReq: any) => {
						proxyReq.setHeader('Origin', 'https://members.onepeloton.com');
						proxyReq.setHeader('Referer', 'https://members.onepeloton.com/');
					});

					proxy.on('proxyRes', (proxyRes: any) => {
						if (proxyRes.headers['set-cookie']) {
							const cookies = proxyRes.headers['set-cookie'].map((cookie: string) => {
								return cookie.replace(/Domain=[^;]+/, 'Domain=localhost');
							});
							proxyRes.headers['set-cookie'] = cookies;
						}
					});
				}
			},
			'/api': {
				target: 'https://api.onepeloton.com',
				changeOrigin: true,
				secure: false,
				cookieDomainRewrite: {
					'.onepeloton.com': 'localhost'
				},
				headers: {
					'Origin': 'https://members.onepeloton.com',
					'Referer': 'https://members.onepeloton.com/',
					'Peloton-Platform': 'web'
				},
				configure: (proxy: any, _options: ProxyOptions) => {
					proxy.on('proxyReq', (proxyReq: any) => {
						proxyReq.setHeader('Origin', 'https://members.onepeloton.com');
						proxyReq.setHeader('Referer', 'https://members.onepeloton.com/');
					});

					proxy.on('proxyRes', (proxyRes: any) => {
						if (proxyRes.headers['set-cookie']) {
							const cookies = proxyRes.headers['set-cookie'].map((cookie: string) => {
								return cookie.replace(/Domain=[^;]+/, 'Domain=localhost');
							});
							proxyRes.headers['set-cookie'] = cookies;
						}
					});
				}
			}
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
