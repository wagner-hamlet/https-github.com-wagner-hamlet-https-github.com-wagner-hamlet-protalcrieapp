
import React from 'react';
import { WorkshopEvent } from '../types';

interface EventCardProps {
  event: WorkshopEvent;
  isNext?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, isNext }) => {
  const getTypeColor = (type: string) => {
    const t = type.toLowerCase();
    // Cores específicas para palavras-chave, mas o padrão agora é ROXO
    if (t.includes('palestra')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (t.includes('intervalo') || t.includes('café') || t.includes('coffee') || t.includes('almoço')) return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    if (t.includes('networking') || t.includes('conexão')) return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    
    // Padrão para Aula Prática, Mentoria, Workshop ou qualquer outro texto: ROXO
    return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
  };

  return (
    <div className={`relative p-5 rounded-2xl border ${isNext ? 'bg-zinc-900 border-gold shadow-[0_0_20px_rgba(197,160,115,0.1)]' : 'bg-zinc-900/40 border-zinc-800'} transition-all duration-300`}>
      {isNext && (
        <span className="absolute -top-3 left-6 bg-gold text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
          Próximo
        </span>
      )}
      
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-white mb-1">{event.time}</span>
          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border self-start ${getTypeColor(event.type)}`}>
            {event.type}
          </span>
        </div>
        <div className="text-right">
           <p className="text-xs text-zinc-400 font-medium">{event.location}</p>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-white mb-1">{event.title}</h3>
      {event.speaker && (
        <p className="text-sm text-gold font-medium mb-2 flex items-center">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
          {event.speaker}
        </p>
      )}
      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
        {event.description}
      </p>
    </div>
  );
};

export default EventCard;
