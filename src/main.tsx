import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from "@sentry/react" // 👈 1. Import Sentry
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './components/theme-provider.tsx'

// 👇 2. Initialize Sentry right here
Sentry.init({
  dsn: "https://8ec30af889fafc2f2ea7fb6053b5d2ec@o4511004193652736.ingest.us.sentry.io/4511004203810816", // 👈 Paste your exact DSN string from the Sentry dashboard here
  
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  
  // Performance Monitoring
  tracesSampleRate: 1.0, // Captures 100% of transactions
  
  // Session Replay (Records a video of the user's screen when it crashes!)
  replaysSessionSampleRate: 0.1, 
  replaysOnErrorSampleRate: 1.0, 
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <App />
    </ThemeProvider>
  </StrictMode>,
)