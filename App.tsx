
import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header.tsx';
import Dashboard from './components/Dashboard.tsx';
import EventCard from './components/EventCard.tsx';
import PartnerDirectory from './components/PartnerDirectory.tsx';
import AuthScreen from './components/AuthScreen.tsx';
import { WorkshopEvent, ViewMode, CourseType, Partner, User } from './types.ts';
import { MOCK_EVENTS } from './constants.ts';
import { notificationService } from './services/notificationService.ts';
import { SheetService, COURSES_CONFIG } from './services/sheetService.ts';
import { AuthService } from './services/authService.ts';

const COURSE_HEADER_INFO: Record<string, { title: string, subtitle: string }> = {
  SCHOOL: {
    title: "CRIE SCHOOL",
    subtitle: "Cristãos Empreendedores"
  },
  JUMPSTART: {
    title: "CRIE JUMP START",
    subtitle: "Seu caminho começa aqui"
  },
  EXPERIENCE: {
    title: "CRIE EXPERIENCE",
    subtitle: "O conhecimento te transforma"
  },
  PARTNERS: {
    title: "CRIE ECOSYSTEM",
    subtitle: "Empresas & Serviços"
  }
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CourseType | null>(null);
  const [events, setEvents] = useState<WorkshopEvent[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.HOME);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const session = AuthService.getSession();
    if (session) {
      setCurrentUser(session);
    }
    setIsInitialized(true);

    const setupNotifications = async () => {
      await notificationService.requestPermission();
    };
    setupNotifications();
  }, []);

  const courseSubtitles = useMemo(() => {
    const getSub = (id: string, fallback: string) => {
      const cached = SheetService.getFromCache(`events_${id}`);
      if (cached && cached.length > 0) {
        const dynamicSub = cached.find((e: any) => e.subInicial && e.subInicial.trim() !== "")?.subInicial;
        return dynamicSub || fallback;
      }
      return fallback;
    };

    return {
      SCHOOL: getSub('SCHOOL', 'Um chamado para cristãos'),
      JUMPSTART: getSub('JUMPSTART', 'Aceleração de Negócios'),
      EXPERIENCE: getSub('EXPERIENCE', 'Imersão e Networking'),
      PARTNERS: 'Conectando Membros e Negócios'
    };
  }, [viewMode]);

  const syncWithCloud = async (courseId: CourseType) => {
    setIsSyncing(true);
    try {
      if (courseId === 'PARTNERS') {
        const freshPartners = await SheetService.fetchPartners();
        setPartners(freshPartners);
        SheetService.saveToCache('partners', freshPartners);
      } else {
        const freshEvents = await SheetService.fetchEvents(courseId);
        if (freshEvents.length > 0) {
          setEvents(freshEvents);
          SheetService.saveToCache(`events_${courseId}`, freshEvents);
          if (notificationService.hasPermission) {
            notificationService.scheduleNotifications(freshEvents);
          }
        }
      }
    } catch (error) {
      console.error("Erro na sincronização:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const selectCourse = (courseId: CourseType) => {
    setSelectedCourse(courseId);
    if (courseId === 'PARTNERS') {
      const cached = SheetService.getFromCache('partners');
      setPartners(cached || []);
      setViewMode(ViewMode.DIRECTORY);
    } else {
      const cached = SheetService.getFromCache(`events_${courseId}`);
      setEvents(cached || MOCK_EVENTS);
      setViewMode(ViewMode.DASHBOARD);
    }
    syncWithCloud(courseId);
  };

  const handleManualSync = () => selectedCourse && syncWithCloud(selectedCourse);

  const facultyList = useMemo(() => {
    const uniqueFaculty = Array.from(new Set(
      events.map(e => e.facultyBody).filter((f): f is string => !!f && f.trim() !== "")
    ));
    return uniqueFaculty.length > 0 ? uniqueFaculty.join(', ') : "Saulo, Henrique, Adriano, Rafael e Anderson";
  }, [events]);

  const { upcomingGrouped } = useMemo(() => {
    const now = Date.now();
    const FOUR_HOURS = 4 * 60 * 60 * 1000;
    const upcoming: WorkshopEvent[] = [];

    events.forEach(e => {
      if (!(e.timestamp + FOUR_HOURS < now)) upcoming.push(e);
    });

    const groups: { [key: string]: WorkshopEvent[] } = {};
    const sorted = [...upcoming].sort((a, b) => a.timestamp - b.timestamp);
    sorted.forEach(event => {
      const date = new Date(event.timestamp).toLocaleDateString('pt-BR', { 
        day: '2-digit', month: 'long', weekday: 'long' 
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(event);
    });
    return { upcomingGrouped: groups };
  }, [events]);

  if (!isInitialized) return null;

  if (!currentUser) {
    return <AuthScreen onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  if (viewMode === ViewMode.HOME) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex flex-col items-center justify-center p-6 space-y-12 animate-in fade-in duration-700">
        <div className="text-center space-y-2">
          <div className="w-24 h-24 rounded-full border-2 border-gold flex items-center justify-center bg-black mx-auto mb-6 shadow-[0_0_40px_rgba(197,160,115,0.25)] relative group">
            <div className="absolute inset-0 rounded-full bg-gold/5 animate-pulse"></div>
            <span className="text-gold font-bold text-4xl font-brand relative z-10">C*</span>
          </div>
          <h1 className="text-white font-brand text-4xl font-bold tracking-tight">CRIE Portal</h1>
          <p className="text-gold/80 text-[10px] uppercase tracking-[0.4em] font-bold">Olá, {currentUser.nome.split(' ')[0]}</p>
        </div>

        <div className="w-full max-sm:px-2 space-y-4 max-w-sm">
          {[
            { id: 'SCHOOL', name: 'CRIE School', sub: courseSubtitles.SCHOOL, icon: '🚀', color: 'from-orange-500/20' },
            { id: 'JUMPSTART', name: 'CRIE Jump Start', sub: courseSubtitles.JUMPSTART, icon: '⚡', color: 'from-blue-500/20' },
            { id: 'EXPERIENCE', name: 'CRIE Experience', sub: courseSubtitles.EXPERIENCE, icon: '🌟', color: 'from-purple-500/20' },
            { id: 'PARTNERS', name: 'Empresas & Serviços', sub: courseSubtitles.PARTNERS, icon: '🤝', color: 'from-emerald-500/20' }
          ].map((course) => (
            <button
              key={course.id}
              onClick={() => selectCourse(course.id as CourseType)}
              className={`w-full group relative overflow-hidden bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-gold p-5 rounded-[1.8rem] transition-all duration-500 text-left active:scale-95 shadow-xl`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${course.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>
              <div className="flex items-center space-x-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-black border border-zinc-800 group-hover:border-gold/50 flex items-center justify-center text-2xl shadow-inner transition-all duration-500 group-hover:scale-110">
                  {course.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-brand font-bold text-lg group-hover:text-gold transition-colors duration-300">{course.name}</h3>
                  <p className="text-zinc-500 group-hover:text-zinc-300 text-[9px] uppercase tracking-wider font-bold line-clamp-1 transition-colors duration-300">{course.sub}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                  <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg>
                </div>
              </div>
            </button>
          ))}
        </div>

        <button 
          onClick={() => AuthService.logout()}
          className="text-zinc-700 hover:text-rose-900 transition-colors text-[9px] uppercase tracking-[0.3em] font-black"
        >
          Sair da Conta
        </button>
      </div>
    );
  }

  const currentHeaderInfo = selectedCourse ? COURSE_HEADER_INFO[selectedCourse as string] : COURSE_HEADER_INFO.SCHOOL;

  const renderContent = () => {
    switch (viewMode) {
      case ViewMode.DIRECTORY:
        return <PartnerDirectory partners={partners} onBack={() => setViewMode(ViewMode.HOME)} />;
      case ViewMode.DASHBOARD:
        return <Dashboard events={events} onViewAll={() => setViewMode(ViewMode.SCHEDULE)} courseName={currentHeaderInfo.title} />;
      case ViewMode.SCHEDULE:
        return (
          <div className="space-y-8 pb-32">
            <div className="flex justify-between items-center mb-2">
               <div>
                 <h2 className="text-2xl font-brand font-bold text-white">Agenda</h2>
                 <p className="text-[10px] text-gold uppercase tracking-widest mt-1 font-bold">{currentHeaderInfo.title}</p>
               </div>
               <button onClick={handleManualSync} disabled={isSyncing} className="p-3 rounded-full bg-zinc-900 border border-zinc-800">
                  <svg className={`w-5 h-5 text-gold ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
               </button>
            </div>
            <div className="space-y-10">
              {Object.keys(upcomingGrouped).length === 0 ? (
                <p className="text-zinc-500 text-sm italic text-center py-10">Nenhuma aula programada.</p>
              ) : (
                Object.entries(upcomingGrouped).map(([date, dayEvents]) => (
                  <div key={date} className="space-y-4">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] border-l-2 border-gold pl-3">{date}</h4>
                    <div className="space-y-4">
                      {(dayEvents as WorkshopEvent[]).map((event) => <EventCard key={event.id} event={event} />)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      case ViewMode.INFO:
        return (
          <div className="space-y-6 pb-24 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 space-y-8">
              <div className="flex flex-col items-center justify-center text-center space-y-4 py-4">
                <div className="w-16 h-16 rounded-full border-2 border-gold flex items-center justify-center bg-black">
                   <span className="text-gold font-bold text-2xl font-brand">C*</span>
                </div>
                <div>
                   <h3 className="text-white font-brand text-xl font-bold">
                    {selectedCourse === 'SCHOOL' ? 'CRIE School' : selectedCourse === 'JUMPSTART' ? 'CRIE Jump Start' : selectedCourse === 'EXPERIENCE' ? 'CRIE Experience' : 'CRIE Ecosystem'}
                   </h3>
                   <p className="text-gold text-xs uppercase tracking-widest font-bold">Conta: {currentUser.email}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-gold font-bold text-[10px] uppercase tracking-[0.2em] mb-2">Corpo Docente</h4>
                  <p className="text-zinc-300 text-sm leading-relaxed">
                    Mentores: <span className="text-white font-medium">{facultyList}.</span>
                  </p>
                </div>
                <div>
                  <h4 className="text-gold font-bold text-[10px] uppercase tracking-[0.2em] mb-2">Avisos</h4>
                  <p className="text-zinc-300 text-sm leading-relaxed">
                    Você está conectado como <span className="text-white">{currentUser.nome}</span>. Suas notificações estão ativas para lembretes de aula.
                  </p>
                </div>
              </div>
              
              <div className="pt-8 border-t border-zinc-800/50 space-y-4">
                <button 
                  onClick={() => setViewMode(ViewMode.HOME)}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-2xl border border-zinc-700 transition-all text-xs uppercase tracking-widest active:scale-95"
                >
                  Trocar de Caminho
                </button>
                <button 
                  onClick={() => AuthService.logout()}
                  className="w-full text-rose-500/50 hover:text-rose-500 transition-colors text-[9px] uppercase tracking-widest font-bold"
                >
                  Sair do Aplicativo
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col max-w-md mx-auto relative shadow-2xl">
      <Header title={currentHeaderInfo.title} subtitle={currentHeaderInfo.subtitle} />
      <main className="flex-1 overflow-y-auto px-6 pt-6">
        {renderContent()}
      </main>
      
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-zinc-950/90 backdrop-blur-2xl border-t border-zinc-800/50 px-8 pt-4 pb-10 flex justify-between items-center z-50">
        <button onClick={() => setViewMode(selectedCourse === 'PARTNERS' ? ViewMode.DIRECTORY : ViewMode.DASHBOARD)} className={`flex flex-col items-center space-y-1 ${[ViewMode.DASHBOARD, ViewMode.DIRECTORY].includes(viewMode) ? 'text-gold' : 'text-zinc-500'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span className="text-[9px] font-bold uppercase">Início</span>
        </button>
        {selectedCourse !== 'PARTNERS' && (
          <button onClick={() => setViewMode(ViewMode.SCHEDULE)} className={`flex flex-col items-center space-y-1 ${viewMode === ViewMode.SCHEDULE ? 'text-gold' : 'text-zinc-500'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span className="text-[9px] font-bold uppercase">Agenda</span>
          </button>
        )}
        <button onClick={() => setViewMode(ViewMode.INFO)} className={`flex flex-col items-center space-y-1 ${viewMode === ViewMode.INFO ? 'text-gold' : 'text-zinc-500'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="text-[9px] font-bold uppercase">Info</span>
        </button>
      </nav>

      {isSyncing && (
        <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center">
           <div className="bg-zinc-900 border border-gold/30 p-8 rounded-3xl flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin"></div>
              <p className="text-gold font-bold text-xs uppercase tracking-widest text-center">Sincronizando...</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
