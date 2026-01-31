
import { User, RegistrationOptions } from "../types";

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby5-wVj95xj12ctLi7GSyKVqKaevSStmIPFuEBTWwBxns9OlIVgK8eoLnWVksJ6RanqEQ/exec";
const OPTIONS_SHEET_ID = "12T-SOGYQ7CVTpo6RRwDeXEgifwT7Xk3fz7dFxyd0HHc";
const PAGINA2_GID = "445119039"; 

export class AuthService {
  private static splitCSVLine(line: string): string[] {
    const values: string[] = [];
    let currentField = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') inQuotes = !inQuotes;
      else if (char === ',' && !inQuotes) {
        values.push(currentField.trim());
        currentField = "";
      } else currentField += char;
    }
    values.push(currentField.trim());
    return values;
  }

  static async getOptions(): Promise<{ success: boolean; options?: RegistrationOptions; message?: string }> {
    try {
      const response = await fetch(`${APPS_SCRIPT_URL}?action=getOptions`, {
        method: "GET",
        mode: "cors",
        redirect: "follow"
      });
      
      let data = { success: false, options: null as any };
      if (response.ok) {
        data = await response.json();
      }

      // Sincronização direta com a Página 2 para Segmentos, Estágio e Colaboradores
      try {
        const csvUrl = `https://docs.google.com/spreadsheets/d/${OPTIONS_SHEET_ID}/export?format=csv&gid=${PAGINA2_GID}&t=${Date.now()}`;
        const csvRes = await fetch(csvUrl);
        if (csvRes.ok) {
          const text = await csvRes.text();
          const lines = text.split(/\r?\n/).filter(l => l.trim() !== "");
          
          const estagios: string[] = [];
          const colaboradores: string[] = [];
          const segmentos: string[] = [];

          lines.slice(1).forEach(line => {
            const columns = this.splitCSVLine(line);
            
            // F = 5, G = 6, M = 12
            const est = columns[5]?.replace(/"/g, '').trim();
            const col = columns[6]?.replace(/"/g, '').trim();
            const seg = columns[12]?.replace(/"/g, '').trim();

            if (est && est !== "Estágio" && est !== "undefined") estagios.push(est);
            if (col && col !== "Colaboradores" && col !== "undefined") colaboradores.push(col);
            if (seg && seg !== "Segmento de Atuação" && seg !== "undefined") segmentos.push(seg);
          });

          if (!data.options) {
            data.options = {} as any;
          }

          // Atualiza as listas com valores únicos e limpos
          data.options.estagios = [...new Set(estagios)];
          data.options.colaboradores = [...new Set(colaboradores)];
          data.options.segmentos = [...new Set(segmentos)];
          data.success = true;
        }
      } catch (e) {
        console.error("Erro ao sincronizar opções da Página 2:", e);
      }

      return data;
    } catch (error) {
      console.error("Auth Options Error:", error);
      return { success: false, message: "Erro ao carregar opções." };
    }
  }

  static async login(email: string, senha: string): Promise<{ success: boolean; user?: User; message?: string }> {
    try {
      const params = new URLSearchParams({ action: "login", email: email.trim(), senha });
      const response = await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`, {
        method: "GET",
        mode: "cors",
        redirect: "follow"
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: "Erro de conexão." };
    }
  }

  static async signup(userData: any): Promise<{ success: boolean; message?: string }> {
    try {
      const params = new URLSearchParams({ ...userData, action: "signup" });
      const response = await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`, {
        method: "GET",
        mode: "cors",
        redirect: "follow"
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: "Erro ao cadastrar." };
    }
  }

  static saveSession(user: User) {
    localStorage.setItem("crie_user_session", JSON.stringify(user));
  }

  static getSession(): User | null {
    const session = localStorage.getItem("crie_user_session");
    try { return session ? JSON.parse(session) : null; } catch { return null; }
  }

  static logout() {
    localStorage.removeItem("crie_user_session");
    const keys = Object.keys(localStorage);
    keys.forEach(key => { if (key.startsWith('crie_')) localStorage.removeItem(key); });
    window.location.reload();
  }
}
