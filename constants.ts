
import { WorkshopEvent } from './types';

export const COLORS = {
  primary: '#C5A073',
  secondary: '#1A1A1A',
  background: '#0F0F0F',
  text: '#FFFFFF',
};

// Helper to get fridays, including one in the past for testing
const getFridays = (baseDate: Date) => {
  const fridays = [];
  let d = new Date(baseDate);
  
  // Retroceder 7 dias para ter uma aula no passado
  d.setDate(d.getDate() - 7);
  
  // Find first Friday
  while (d.getDay() !== 5) {
    d.setDate(d.getDate() + 1);
  }
  
  for (let i = 0; i < 4; i++) {
    fridays.push(new Date(d));
    d.setDate(d.getDate() + 7);
  }
  return fridays;
};

const fridays = getFridays(new Date());

const generateClassSegments = (date: Date, classNum: number): WorkshopEvent[] => {
  const startTime = new Date(date);
  startTime.setHours(19, 0, 0, 0); // 19:00 start

  const classData = [
    {
      theme: "Mentalidade e Visão",
      professor: "Saulo Francisco",
      segments: ["Mindset Empreendedor", "Identificando Oportunidades", "Validação de Negócio", "Networking Estratégico"]
    },
    {
      theme: "Marketing e Vendas",
      professor: "Henrique & Adriano",
      segments: ["Posicionamento de Marca", "Canais de Aquisição", "Funil de Vendas", "Conversão e Retenção"]
    },
    {
      theme: "Operações e Tech",
      professor: "Rafael Santos",
      segments: ["Processos Escaláveis", "IA para Negócios", "Ferramentas No-Code", "Automação Operacional"]
    },
    {
      theme: "Gestão e Finanças",
      professor: "Anderson & Saulo",
      segments: ["Fluxo de Caixa", "Cultura de Alta Performance", "Liderança de Equipes", "Formatura e Pitch"]
    }
  ];

  const currentClass = classData[classNum - 1];

  return currentClass.segments.map((segment, index) => {
    const timestamp = startTime.getTime() + (index * 15 * 60 * 1000);
    const timeStr = new Date(timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    return {
      id: `${classNum}-${index}-${timestamp}`,
      title: `${segment}`,
      time: timeStr,
      location: 'Auditório CRIE / Online',
      description: `Módulo de Empreendedorismo: ${segment}. Aula focada em resultados práticos para pequenos e médios empresários.`,
      speaker: currentClass.professor,
      type: index === 0 ? 'Palestra' : index === 3 ? 'Networking' : 'Workshop',
      timestamp: timestamp,
      dailySummary: "O sucesso é a soma de pequenos esforços repetidos dia após dia."
    };
  });
};

export const MOCK_EVENTS: WorkshopEvent[] = [
  ...generateClassSegments(fridays[0], 1),
  ...generateClassSegments(fridays[1], 2),
  ...generateClassSegments(fridays[2], 3),
  ...generateClassSegments(fridays[3], 4),
];
