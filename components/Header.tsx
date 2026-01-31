
import React from 'react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  title = "CRIE PORTAL", 
  subtitle = "Cristãos Empreendedores" 
}) => {
  return (
    <header className="sticky top-0 z-50 bg-[#0F0F0F]/80 backdrop-blur-md border-b border-gray-800 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full border-2 border-gold flex items-center justify-center bg-black overflow-hidden shadow-[0_0_10px_rgba(197,160,115,0.3)]">
          <span className="text-gold font-bold text-lg font-brand">C*</span>
        </div>
        <div>
          <h1 className="text-white font-brand text-lg tracking-wider font-bold uppercase">{title}</h1>
          <p className="text-[10px] text-gray-400 tracking-widest uppercase font-semibold">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
         <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
         <span className="text-[10px] text-gray-400 font-medium">ON-LINE</span>
      </div>
    </header>
  );
};

export default Header;
