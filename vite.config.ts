import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

function apiDevMiddleware(): Plugin {
  return {
    name: 'candle-studio-api-dev-middleware',
    apply: 'serve',
    configureServer(server) {
      const mount = (route: string, modulePath: string, exportName: string) => {
        server.middlewares.use(route, async (req, res, next) => {
          if (req.method !== 'POST') return next()
          try {
            const [{ withJsonHandler }, handlerModule] = await Promise.all([
              server.ssrLoadModule('/api/_lib/httpJson.ts'),
              server.ssrLoadModule(modulePath),
            ])
            await withJsonHandler(req, res, (body: unknown) => handlerModule[exportName](body))
          } catch (err) {
            next(err)
          }
        })
      }

      mount('/api/generate', '/api/_lib/generateHandler.ts', 'handleGenerate')
      mount('/api/analyze', '/api/_lib/analyzeHandler.ts', 'handleAnalyze')
    },
  }
}

export default defineConfig(({ mode }) => {
  // api/_lib/gemini.ts reads process.env directly (matching Vercel's runtime),
  // so local dev needs GEMINI_API_KEY forwarded from .env.local into process.env.
  const env = loadEnv(mode, process.cwd(), '')
  if (env.GEMINI_API_KEY) {
    process.env.GEMINI_API_KEY = env.GEMINI_API_KEY
  }

  return {
    plugins: [
      react(),
      apiDevMiddleware(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg'],
        devOptions: {
          enabled: true,
          type: 'module',
        },
        manifest: {
          name: 'CANDLE STUDIO AI',
          short_name: 'Candle Studio',
          description: '사진 한 장으로 만드는 캔들 브랜드 콘텐츠',
          theme_color: '#111111',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          icons: [
            { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
            { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg}'],
        },
      }),
    ],
    server: {
      host: true,
    },
  }
})
