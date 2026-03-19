import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Carreras from './pages/Carreras'
import IngenieriaInformatica from './features/careers/pages/IngenieriaInformatica'
import MateriaCalculator from './features/careers/pages/MateriaCalculator'
import Header from './shared/components/Header'
import Footer from './shared/components/Footer'
import { CareerProgressProvider } from './features/careers/context/CareerProgressContext'

function App() {
  return (
    <CareerProgressProvider>
      <div className="flex flex-col min-h-screen relative w-full" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
        <Header />
        <main className="w-full flex flex-col items-center">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/carreras" element={<Carreras />} />
            <Route path="/carreras/ingenieria-informatica" element={<IngenieriaInformatica />} />
            <Route path="/carreras/ingenieria-informatica/calculadora" element={<MateriaCalculator />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </CareerProgressProvider>
  )
}

export default App
