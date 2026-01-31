
import { WorkshopEvent, CourseType, Partner } from "../types";

/**
 * IDs das Planilhas do Google
 */
export const COURSES_CONFIG: Record<string, string> = {
  SCHOOL: "1ypwNwtBfLt0keb253EX75lgkQ0G-uDJ49f-ranAVP-w",
  JUMPSTART: "1pC8-rO8qq2Q2pN-jo1QD0LE-yTg3nJXRez91POAOfTc",
  EXPERIENCE: "1ah7cbO6NBBjCOB8T37v3ey4NIUxJumfkzXESJyqQVic",
  PARTNERS: "1WKOTAzLKOfG-fXUiG0nzkUl615YU9jDmo950hzUrWgo"
};

export class SheetService {
  static async fetchEvents(courseId: CourseType): Promise<WorkshopEvent[]> {
    const sheetId = COURSES_CONFIG[courseId];
    try {
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0&t=${Date.now()}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Falha ao acessar planilha.");
      const csvText = await response.text();
      return this.parseCSV(csvText, courseId);
    } catch (error) {
      console.error("Erro ao sincronizar planilha:", error);
      throw error;
    }
  }

  static async fetchPartners(): Promise<Partner[]> {
    const sheetId = COURSES_CONFIG.PARTNERS;
    try {
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0&t=${Date.now()}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Falha ao acessar planilha de parceiros.");
      const csvText = await response.text();
      return this.parsePartnersCSV(csvText);
    } catch (error) {
      console.error("Erro ao sincronizar parceiros:", error);
      return [];
    }
  }

  private static parsePartnersCSV(csvText: string): Partner[] {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== "");
    if (lines.length < 2) return [];

    return lines.slice(1).map((line, index) => {
      const values = this.splitCSVLine(line);
      const [name, category, description, whatsapp, instagram, imageUrl] = values;

      return {
        id: `partner-${index}`,
        name: name || "Empresa sem nome",
        category: category || "Geral",
        description: description || "",
        whatsapp: whatsapp || "",
        instagram: instagram || "",
        imageUrl: imageUrl || ""
      };
    });
  }

  private static parseCSV(csvText: string, courseId: CourseType): WorkshopEvent[] {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== "");
    if (lines.length < 2) return [];

    return lines.slice(1).map((line, index) => {
      const values = this.splitCSVLine(line);
      const [
        dateStr, timeStr, title, professor, location, description, 
        typeStr, facultyBody, dailySummary, coverTitle, coverTitle2, 
        subtitle, subInicial
      ] = values;

      if (!dateStr || !timeStr || !title) return null;

      try {
        const dateParts = dateStr.replace(/-/g, '/').split('/').map(Number);
        const timeParts = timeStr.split(':').map(Number);
        const dateObj = new Date(dateParts[2], dateParts[1] - 1, dateParts[0], timeParts[0], timeParts[1]);
        if (isNaN(dateObj.getTime())) return null;

        return {
          id: `${courseId}-${index}-${dateObj.getTime()}`,
          title,
          time: timeStr,
          location: location || "Auditório CRIE",
          description: description || "",
          speaker: professor,
          type: typeStr || "Workshop",
          timestamp: dateObj.getTime(),
          facultyBody: facultyBody || "",
          dailySummary: dailySummary || "",
          coverTitle: coverTitle || "",
          coverTitle2: coverTitle2 || "",
          subtitle: subtitle || "",
          subInicial: subInicial || ""
        };
      } catch (e) { return null; }
    }).filter(event => event !== null) as WorkshopEvent[];
  }

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

  static saveToCache(key: string, data: any) {
    localStorage.setItem(`crie_${key}_cache`, JSON.stringify(data));
  }

  static getFromCache(key: string): any | null {
    const cached = localStorage.getItem(`crie_${key}_cache`);
    return cached ? JSON.parse(cached) : null;
  }
}
