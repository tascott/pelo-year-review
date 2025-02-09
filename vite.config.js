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
          'Referer': 'https://members.onepeloton.com/',
          'Peloton-Platform': 'web'
        },
        configure: (proxy, _options) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            const cookies = proxyRes.headers['set-cookie'];
            if (cookies) {
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
      '^/api/v2/.*': {
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
        configure: (proxy, _options) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            const cookies = proxyRes.headers['set-cookie'];
            if (cookies) {
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
      '^/api/user/.*': {
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
        configure: (proxy, _options) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            const cookies = proxyRes.headers['set-cookie'];
            if (cookies) {
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
