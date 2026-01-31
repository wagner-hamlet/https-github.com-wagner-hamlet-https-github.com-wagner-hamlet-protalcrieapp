
import React, { useMemo } from 'react';
import { WorkshopEvent } from '../types.ts';
import EventCard from './EventCard.tsx';

interface DashboardProps {
  events: WorkshopEvent[];
  onViewAll: () => void;
  courseName: string;
}

const Dashboard: React.FC<DashboardProps> = ({ events, onViewAll, courseName }) => {
  const nextEvent = events.find(e => e.timestamp > Date.now()) || events[0];

  const currentDailySummary = useMemo(() => {
    if (!events.length) return null;

    const now = new Date();
    const todayStr = now.toLocaleDateString('pt-BR');
    
    const summaryToday = events.find(e => {
      const eventDate = new Date(e.timestamp).toLocaleDateString('pt-BR');
      return eventDate === todayStr && e.dailySummary && e.dailySummary.trim() !== "";
    });

    if (summaryToday) return summaryToday.dailySummary;

    if (nextEvent) {
      const nextEventDateStr = new Date(nextEvent.timestamp).toLocaleDateString('pt-BR');
      const summaryNext = events.find(e => {
        const eventDate = new Date(e.timestamp).toLocaleDateString('pt-BR');
        return eventDate === nextEventDateStr && e.dailySummary && e.dailySummary.trim() !== "";
      });
      return summaryNext?.dailySummary || `Prepare-se para um dia de muito aprendizado e conexões transformadoras no ${courseName}.`;
    }

    return `Bem-vindo ao ${courseName}. Explore seu cronograma e prepare-se para crescer!`;
  }, [events, nextEvent, courseName]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Welcome */}
      <section className="relative h-56 rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-800 to-black p-8 flex flex-col justify-end">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <svg className="w-32 h-32 text-gold" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
        </div>
        <div className="relative z-10">
          <span className="text-gold text-[10px] font-bold uppercase tracking-[0.3em] mb-2 block">{courseName} apresenta</span>
          <h2 className="text-3xl font-brand font-bold text-white leading-tight">
            {nextEvent?.coverTitle || "Mestres do"}<br/><span className="text-gold">{nextEvent?.coverTitle2 || "Empreendedorismo."}</span>
          </h2>
          <p className="text-[10px] text-zinc-400 mt-3 uppercase tracking-widest font-medium">
            {nextEvent?.subtitle || "Conhecimento • Networking • Crescimento"}
          </p>
        </div>
      </section>

      {/* Motivação do Dia */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-gold/5 rounded-bl-full flex items-center justify-end p-2">
            <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        </div>
        <h3 className="text-gold text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center">
          <span className="w-2 h-2 bg-gold rounded-full mr-2 animate-pulse"></span>
          Motivação do Dia
        </h3>
        <div>
          <p className="text-zinc-300 text-sm leading-relaxed mb-1 italic font-medium">
            "{currentDailySummary}"
          </p>
        </div>
      </section>

      {/* Next Up */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-bold text-lg">Próximo Bloco</h3>
          <button 
            onClick={onViewAll}
            className="text-[11px] text-gold font-bold uppercase tracking-widest bg-gold/5 hover:bg-gold/10 px-3 py-1 rounded-full transition-colors border border-gold/20 active:scale-95"
          >
            Ver tudo
          </button>
        </div>
        {nextEvent && <EventCard event={nextEvent} isNext={true} />}
      </section>
      
      <div className="h-20"></div>
    </div>
  );
};

export default Dashboard;
