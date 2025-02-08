import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
          'Referer': 'https://members.onepeloton.com/'
        },
        configure: (proxy, _options) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // Copy cookies from API response
            const cookies = proxyRes.headers['set-cookie'];
            if (cookies) {
              // Rewrite cookie domain and make them work with localhost
              const newCookies = cookies.map(cookie =>
                cookie
                  .replace(/Domain=[^;]+/, 'Domain=localhost')
                  .replace(/SameSite=None/, 'SameSite=Lax')
                  .replace(/; Secure/, '')
              );
              proxyRes.headers['set-cookie'] = newCookies;
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
          'Referer': 'https://members.onepeloton.com/'
        },
        configure: (proxy, _options) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // Copy cookies from API response
            const cookies = proxyRes.headers['set-cookie'];
            if (cookies) {
              // Rewrite cookie domain and make them work with localhost
              const newCookies = cookies.map(cookie =>
                cookie
                  .replace(/Domain=[^;]+/, 'Domain=localhost')
                  .replace(/SameSite=None/, 'SameSite=Lax')
                  .replace(/; Secure/, '')
              );
              proxyRes.headers['set-cookie'] = newCookies;
            }
          });
        }
      }
    }
  }
})
