
import React, { useState, useEffect } from 'react';
import { AuthService } from '../services/authService';
import { User, RegistrationOptions } from '../types';

interface AuthScreenProps {
  onLoginSuccess: (user: User) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [regOptions, setRegOptions] = useState<RegistrationOptions | null>(null);
  const [attemptedNext, setAttemptedNext] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: "", sobrenome: "", email: "", senha: "",
    ddd: "", celular: "", cidade: "", estado: "",
    crie_participa: "", como_participa: "",
    empresa: "", segmento: "", porte: "", estagio: "",
    colaboradores: "", tempo: "", interesses: "", 
    preferencia: "" 
  });

  const [lgpdAccepted, setLgpdAccepted] = useState(false);

  useEffect(() => {
    if (!isLogin && !regOptions) {
      loadOptions();
    }
  }, [isLogin]);

  const loadOptions = async () => {
    setLoading(true);
    try {
      const res = await AuthService.getOptions();
      if (res.success && res.options) {
        setRegOptions(res.options);
      }
    } catch (e) {
      console.error("Erro ao carregar opções:", e);
    } finally {
      setLoading(false);
    }
  };

  const validateStep = () => {
    if (step === 1) {
      return !!(formData.nome && formData.sobrenome && formData.email && formData.senha && 
             formData.ddd && formData.celular.length >= 9 && 
             formData.cidade && formData.estado);
    }
    if (step === 2) {
      // Todos os campos do Passo 2 são obrigatórios conforme solicitado para validação visual
      return !!(formData.crie_participa && formData.como_participa && 
             formData.segmento && formData.porte && formData.tempo && 
             formData.estagio && formData.colaboradores);
    }
    if (step === 3) {
      return lgpdAccepted;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setAttemptedNext(false);
      setError("");
      setStep(s => s + 1);
    } else {
      setAttemptedNext(true);
      if (step === 1 && formData.celular.length > 0 && formData.celular.length < 9) {
        setError("O número do celular deve ter no mínimo 9 dígitos.");
      } else {
        setError("Preencha todos os campos obrigatórios (*) para avançar.");
      }
    }
  };

  const handleBack = () => {
    setAttemptedNext(false);
    setError("");
    setStep(s => s - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (isLogin) {
      if (!formData.email || !formData.senha) {
        setAttemptedNext(true);
        return;
      }
      setLoading(true);
      try {
        const res = await AuthService.login(formData.email, formData.senha);
        if (res.success && res.user) {
          AuthService.saveSession(res.user);
          onLoginSuccess(res.user);
        } else {
          setError(res.message || "E-mail ou senha incorretos.");
        }
      } catch (err) {
        setError("Erro na conexão com o servidor.");
      } finally {
        setLoading(false);
      }
    } else {
      if (step < 3) {
        handleNext();
      } else {
        if (!validateStep()) {
          setAttemptedNext(true);
          setError("Você precisa autorizar o uso dos dados (LGPD) para finalizar.");
          return;
        }
        
        setLoading(true);
        try {
          const finalData = {
            ...formData,
            preferencia: "Aceito"
          };
          
          const res = await AuthService.signup(finalData);
          if (res.success) {
            setIsLogin(true);
            setStep(1);
            setAttemptedNext(false);
            setError("Sucesso! Cadastro realizado.");
            setFormData({
              nome: "", sobrenome: "", email: "", senha: "",
              ddd: "", celular: "", cidade: "", estado: "",
              crie_participa: "", como_participa: "",
              empresa: "", segmento: "", porte: "", estagio: "",
              colaboradores: "", tempo: "", interesses: "", preferencia: ""
            });
            setLgpdAccepted(false);
          } else {
            setError(res.message || "Erro ao realizar cadastro.");
          }
        } catch (err) {
          setError("Falha na comunicação com o servidor.");
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const getFieldClass = (fieldName: keyof typeof formData, isOptional: boolean = false) => {
    const value = formData[fieldName];
    const base = "w-full bg-black border rounded-2xl py-4 px-6 text-sm text-white focus:outline-none transition-all appearance-none";
    
    let hasError = false;
    if (attemptedNext && !isOptional) {
      if (!value) hasError = true;
      if (fieldName === 'celular' && value.length < 9) hasError = true;
    }

    if (hasError) {
      return `${base} border-rose-500 ring-2 ring-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.2)]`;
    }
    return `${base} border-zinc-800 focus:border-gold`;
  };

  const labelStyle = "text-[10px] text-zinc-500 uppercase tracking-widest font-bold ml-1 mb-1 block";

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col items-center justify-center p-6 sm:p-8">
      {/* Brand Header */}
      <div className="text-center mb-8 space-y-4">
        <div className="w-20 h-20 rounded-full border-2 border-gold flex items-center justify-center bg-black mx-auto shadow-[0_0_30px_rgba(197,160,115,0.2)]">
          <span className="text-gold font-bold text-3xl font-brand">C*</span>
        </div>
        <div>
          <h1 className="text-white font-brand text-3xl font-bold tracking-tight">CRIE Portal</h1>
          <p className="text-gold/80 text-[10px] uppercase tracking-[0.4em] font-bold">
            {isLogin ? "Acesso à Conta" : `Cadastro • Etapa ${step} de 3`}
          </p>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="w-full max-w-lg bg-zinc-900/40 border border-zinc-800 p-6 sm:p-10 rounded-[2.5rem] shadow-2xl backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {isLogin ? (
            <div className="space-y-5 animate-in fade-in duration-500">
              <div>
                <label className={labelStyle}>E-mail</label>
                <input required type="email" placeholder="seu@email.com" className={getFieldClass('email')} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className={labelStyle}>Senha</label>
                <input required type="password" placeholder="••••••••" className={getFieldClass('senha')} value={formData.senha} onChange={e => setFormData({...formData, senha: e.target.value})} />
              </div>
            </div>
          ) : (
            <div className="animate-in slide-in-from-right duration-300">
              {step === 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-1">
                    <label className={labelStyle}>Nome *</label>
                    <input className={getFieldClass('nome')} value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
                  </div>
                  <div className="sm:col-span-1">
                    <label className={labelStyle}>Sobrenome *</label>
                    <input className={getFieldClass('sobrenome')} value={formData.sobrenome} onChange={e => setFormData({...formData, sobrenome: e.target.value})} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelStyle}>E-mail *</label>
                    <input type="email" className={getFieldClass('email')} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelStyle}>Senha *</label>
                    <input type="password" className={getFieldClass('senha')} value={formData.senha} onChange={e => setFormData({...formData, senha: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:col-span-2">
                    <div>
                      <label className={labelStyle}>DDD *</label>
                      <input maxLength={2} placeholder="11" className={getFieldClass('ddd')} value={formData.ddd} onChange={e => setFormData({...formData, ddd: e.target.value.replace(/\D/g, '')})} />
                    </div>
                    <div className="col-span-2">
                      <label className={labelStyle}>Celular (Mín. 9 dígitos) *</label>
                      <input maxLength={11} placeholder="999999999" className={getFieldClass('celular')} value={formData.celular} onChange={e => setFormData({...formData, celular: e.target.value.replace(/\D/g, '')})} />
                    </div>
                  </div>
                  <div>
                    <label className={labelStyle}>Cidade *</label>
                    <select className={getFieldClass('cidade')} value={formData.cidade} onChange={e => setFormData({...formData, cidade: e.target.value})}>
                      <option value="">Selecione...</option>
                      {regOptions?.cidades.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelStyle}>Estado *</label>
                    <select className={getFieldClass('estado')} value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value})}>
                      <option value="">Selecione...</option>
                      {regOptions?.estados.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className={labelStyle}>Em qual CRIE você está participando? *</label>
                    <select className={getFieldClass('crie_participa')} value={formData.crie_participa} onChange={e => setFormData({...formData, crie_participa: e.target.value})}>
                      <option value="">Selecione...</option>
                      {regOptions?.series.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelStyle}>Perfil de Participação *</label>
                    <select className={getFieldClass('como_participa')} value={formData.como_participa} onChange={e => setFormData({...formData, como_participa: e.target.value})}>
                      <option value="">Selecione...</option>
                      {regOptions?.perfis.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelStyle}>Empresa / Instituição (Opcional)</label>
                    <input placeholder="Nome da sua empresa" className={getFieldClass('empresa', true)} value={formData.empresa} onChange={e => setFormData({...formData, empresa: e.target.value})} />
                  </div>
                  <div>
                    <label className={labelStyle}>Segmento de Atuação *</label>
                    <select className={getFieldClass('segmento')} value={formData.segmento} onChange={e => setFormData({...formData, segmento: e.target.value})}>
                      <option value="">Selecione o segmento...</option>
                      {regOptions?.segmentos?.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelStyle}>Porte *</label>
                      <select className={getFieldClass('porte')} value={formData.porte} onChange={e => setFormData({...formData, porte: e.target.value})}>
                        <option value="">Selecione...</option>
                        {regOptions?.portes.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelStyle}>Tempo de Atuação *</label>
                      <select className={getFieldClass('tempo')} value={formData.tempo} onChange={e => setFormData({...formData, tempo: e.target.value})}>
                        <option value="">Selecione...</option>
                        {regOptions?.tempos.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelStyle}>Estágio Atual *</label>
                      <select className={getFieldClass('estagio')} value={formData.estagio} onChange={e => setFormData({...formData, estagio: e.target.value})}>
                        <option value="">Selecione...</option>
                        {regOptions?.estagios.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelStyle}>Nº de Colaboradores *</label>
                      <select className={getFieldClass('colaboradores')} value={formData.colaboradores} onChange={e => setFormData({...formData, colaboradores: e.target.value})}>
                        <option value="">Selecione...</option>
                        {regOptions?.colaboradores.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className={labelStyle}>Quais seus interesses principais? (Opcional)</label>
                    <textarea 
                      placeholder="Ex: Networking, parcerias, mentoria..." 
                      className="w-full bg-black border border-zinc-800 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-gold h-32 resize-none pt-4 transition-all" 
                      value={formData.interesses} 
                      onChange={e => setFormData({...formData, interesses: e.target.value})} 
                    />
                  </div>

                  <div className={`p-6 rounded-3xl border transition-all flex items-start space-x-4 ${attemptedNext && !lgpdAccepted ? 'border-rose-500 bg-rose-500/10' : 'border-zinc-800 bg-black/40'}`}>
                    <div className="flex items-center h-5 mt-1">
                      <input
                        id="lgpd"
                        type="checkbox"
                        className="w-5 h-5 rounded border-zinc-700 text-gold focus:ring-gold bg-zinc-900 cursor-pointer"
                        checked={lgpdAccepted}
                        onChange={(e) => setLgpdAccepted(e.target.checked)}
                      />
                    </div>
                    <label htmlFor="lgpd" className="text-[11px] text-zinc-300 leading-relaxed font-medium cursor-pointer">
                      Autorizo o CRIE a armazenar e utilizar meus dados para envio de conteúdos, convites, notícias e comunicações institucionais, conforme a Lei Geral de Proteção de Dados (LGPD). *
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className={`p-4 rounded-2xl border animate-in slide-in-from-top duration-300 ${error.includes('Sucesso') ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
              <p className="text-[10px] text-center font-bold uppercase tracking-widest">{error}</p>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            {!isLogin && step > 1 && (
              <button 
                type="button" 
                onClick={handleBack} 
                className="flex-1 bg-zinc-800 text-white font-bold py-5 rounded-2xl border border-zinc-700 uppercase text-[10px] tracking-widest active:scale-95 transition-all"
              >
                Voltar
              </button>
            )}
            
            <button
              disabled={loading}
              type="submit"
              className="flex-[2] bg-gold text-black font-bold py-5 rounded-2xl transition-all shadow-lg shadow-gold/10 active:scale-95 flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
              ) : (
                <span className="text-[10px] uppercase tracking-widest">
                  {isLogin ? "Entrar" : (step < 3 ? "Avançar" : "Concluir Cadastro")}
                </span>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => { setIsLogin(!isLogin); setStep(1); setError(""); setAttemptedNext(false); }}
            className="text-[11px] text-zinc-500 uppercase tracking-widest hover:text-gold transition-colors font-bold"
          >
            {isLogin ? "Criar nova conta" : "Já sou cadastrado"}
          </button>
        </div>
      </div>
      <p className="mt-8 text-[9px] text-zinc-700 uppercase tracking-[0.3em] font-black opacity-30">CRIE Portal • V5.7</p>
    </div>
  );
};

export default AuthScreen;
