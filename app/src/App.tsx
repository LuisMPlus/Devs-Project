import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Carreras from './pages/Carreras'
import CareerPage from './features/careers/pages/CareerPage'
import SubjectCalculator from './features/careers/pages/SubjectCalculator'
import Header from './shared/components/Header'
import Footer from './shared/components/Footer'
import { CareerProgressProvider } from './features/careers/context/CareerProgressContext'
import { CAREERS } from './features/careers/config/careersRegistry'

// Look up careers from the central registry
const computerEngineering = CAREERS.find(c => c.slug === 'computer-engineering')!
const bachelorInSystems   = CAREERS.find(c => c.slug === 'bachelor-in-systems')!

function App() {
  return (
    <div className="flex flex-col min-h-screen relative w-full" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <Header />
      <main className="w-full flex flex-col items-center">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/carreras" element={<Carreras />} />

          {/* ── Ingeniería Informática ── */}
          <Route
            path="/carreras/ingenieria-informatica"
            element={
              <CareerProgressProvider careerSlug={computerEngineering.slug}>
                <CareerPage career={computerEngineering} />
              </CareerProgressProvider>
            }
          />
          <Route
            path="/carreras/ingenieria-informatica/calculadora"
            element={
              <CareerProgressProvider careerSlug={computerEngineering.slug}>
                <SubjectCalculator career={computerEngineering} />
              </CareerProgressProvider>
            }
          />

          {/* ── Licenciatura en Sistemas ── */}
          <Route
            path="/carreras/licenciatura-en-sistemas"
            element={
              <CareerProgressProvider careerSlug={bachelorInSystems.slug}>
                <CareerPage career={bachelorInSystems} />
              </CareerProgressProvider>
            }
          />
          <Route
            path="/carreras/licenciatura-en-sistemas/calculadora"
            element={
              <CareerProgressProvider careerSlug={bachelorInSystems.slug}>
                <SubjectCalculator career={bachelorInSystems} />
              </CareerProgressProvider>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
