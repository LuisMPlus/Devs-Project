'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, PlayCircle, Atom, Zap, ChevronRight } from 'lucide-react';
import { TOPICS, getSimulatorsByTopic } from '../simulators';

export const TopicCatalog: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  return (
    <div className="min-h-screen bg-[#0c154c] text-[#eff6ff] font-sans p-6 md:p-10 space-y-10">
      {/* Header Banner */}
      <header className="max-w-6xl mx-auto space-y-4 text-center md:text-left border-b border-[#1d4ed8]/30 pb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#02ffff]/10 border border-[#02ffff]/40 rounded-full text-xs font-semibold text-[#02ffff] uppercase tracking-wider">
          <Atom size={16} className="animate-spin-slow" />
          <span>Módulo Interactivo de Física</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#02ffff] via-[#42d7c7] to-[#1d4ed8]">
          Simuladores de Física
        </h1>
        <p className="text-gray-300 text-base md:text-lg max-w-3xl">
          Explora los conceptos fundamentales de la física mediante escenarios interactivos. Modifica parámetros en tiempo real, construye tu escena y observa el comportamiento teórico paso a paso.
        </p>

        {/* Search bar */}
        <div className="relative max-w-md pt-2">
          <Search className="absolute left-3.5 top-5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar simulador (ej: MRU, tiro oblicuo, atwood...)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0c154c] border border-[#1d4ed8]/60 focus:border-[#02ffff] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#eff6ff] placeholder-gray-400 focus:outline-none shadow-lg transition-all"
          />
        </div>
      </header>

      {/* Topics Sections */}
      <main className="max-w-6xl mx-auto space-y-12">
        {TOPICS.map((topic) => {
          const topicSimulators = getSimulatorsByTopic(topic.id).filter(
            (sim) =>
              sim.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              sim.description.toLowerCase().includes(searchQuery.toLowerCase())
          );

          if (topicSimulators.length === 0 && searchQuery) return null;

          return (
            <section key={topic.id} className="space-y-6">
              <div className="flex items-center space-x-3 border-l-4 border-[#02ffff] pl-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#02ffff]">{topic.title}</h2>
                  <p className="text-sm text-gray-400">{topic.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topicSimulators.map((sim) => (
                  <div
                    key={sim.id}
                    className="group bg-[#0c154c]/80 border border-[#1d4ed8]/40 hover:border-[#02ffff]/80 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-[#02ffff]/10 flex flex-col justify-between space-y-5 backdrop-blur-sm hover:-translate-y-1"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 bg-[#1d4ed8]/30 border border-[#1d4ed8]/60 rounded-md text-[11px] font-mono text-[#02ffff] font-semibold uppercase">
                          {sim.topicId}
                        </span>
                        <Zap size={16} className="text-[#42d7c7] opacity-60 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <h3 className="text-xl font-bold text-[#eff6ff] group-hover:text-[#02ffff] transition-colors">
                        {sim.title}
                      </h3>
                      <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">
                        {sim.description}
                      </p>
                    </div>

                    <Link
                      href={`/simulators/${sim.topicId}/${sim.id}`}
                      className="inline-flex items-center justify-between w-full px-4 py-2.5 bg-[#1d4ed8]/40 hover:bg-[#02ffff] text-[#02ffff] hover:text-[#0c154c] font-bold text-sm rounded-xl transition-all shadow-md group-hover:shadow-[#02ffff]/20"
                    >
                      <span className="flex items-center space-x-2">
                        <PlayCircle size={18} />
                        <span>Abrir Simulador</span>
                      </span>
                      <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
};
