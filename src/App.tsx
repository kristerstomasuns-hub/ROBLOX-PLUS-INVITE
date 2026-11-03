import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { useMotionPresets } from './motion/tokens'
import { CheckPage } from './pages/CheckPage'
import { FaqPage } from './pages/FaqPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { ProofPage } from './pages/ProofPage'
import { TermsPage } from './pages/TermsPage'

function ScrollToTop() {
  const { pathname } = useLocation()
  const previous = useRef(pathname)

  useEffect(() => {
    if (previous.current === pathname) return
    previous.current = pathname
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export function AppRoutes() {
  const location = useLocation()
  const { pageVariants } = useMotionPresets()

  return (
    <MotionConfig reducedMotion="user">
      <ScrollToTop />
      <div className="flex min-h-svh flex-col bg-bg text-ink">
        <Header />
        <AnimatePresence initial={false} mode="wait">
          <motion.main
            animate="visible"
            className="flex-1"
            exit="exit"
            initial="hidden"
            key={location.pathname}
            variants={pageVariants}
          >
            <Routes location={location}>
              <Route element={<HomePage />} path="/" />
              <Route element={<HomePage />} path="/plus/invite/*" />
              <Route element={<CheckPage />} path="/check" />
              <Route element={<ProofPage />} path="/proof" />
              <Route element={<FaqPage />} path="/faq" />
              <Route element={<TermsPage />} path="/terms" />
              <Route element={<PrivacyPage />} path="/privacy" />
              <Route element={<NotFoundPage />} path="*" />
            </Routes>
          </motion.main>
        </AnimatePresence>
        <Footer />
      </div>
    </MotionConfig>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
