
import { WorkshopEvent } from "../types";

class NotificationService {
  private scheduledIds: Set<string> = new Set();

  async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    return false;
  }

  scheduleNotifications(events: WorkshopEvent[]) {
    if (Notification.permission !== "granted") return;

    const now = Date.now();

    events.forEach((event) => {
      // 1. Alarme: 24 horas antes
      const oneDayBefore = event.timestamp - 24 * 60 * 60 * 1000;
      const id24h = `${event.id}-24h`;
      
      if (oneDayBefore > now && !this.scheduledIds.has(id24h)) {
        const timeout = oneDayBefore - now;
        setTimeout(() => {
          this.sendNotification(
            "CRIE School: Aula Amanhã! 🚀",
            `Preparamos algo especial para você às ${event.time}.`
          );
        }, timeout);
        this.scheduledIds.add(id24h);
      }

      // 2. Alarme: 3 horas antes
      const threeHoursBefore = event.timestamp - 3 * 60 * 60 * 1000;
      const id3h = `${event.id}-3h`;

      // Se o horário do alarme foi há menos de 10 minutos, avisa agora.
      const isWithinGracePeriod = now >= threeHoursBefore && (now - threeHoursBefore) < (10 * 60 * 1000);

      if (!this.scheduledIds.has(id3h)) {
        if (threeHoursBefore > now) {
          const timeout = threeHoursBefore - now;
          setTimeout(() => {
            this.sendNotification(
              "CRIE: Começamos em 3h! 🕒",
              `A aula "${event.title}" já vai começar. Nos vemos lá!`
            );
          }, timeout);
          this.scheduledIds.add(id3h);
        } else if (isWithinGracePeriod) {
          // Dispara imediatamente se abriu o app logo após o horário do alarme
          this.sendNotification(
            "CRIE: Aula em breve! 🕒",
            `A aula "${event.title}" começa às ${event.time}. Prepare-se!`
          );
          this.scheduledIds.add(id3h);
        }
      }
    });
  }

  private sendNotification(title: string, body: string) {
    if ('serviceWorker' in navigator && Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, {
          body,
          icon: '/icon.png',
          badge: '/icon.png',
          vibrate: [200, 100, 200]
        } as any);
      });
    } else {
      new Notification(title, { body, icon: '/icon.png' });
    }
  }

  get hasPermission(): boolean {
    return "Notification" in window && Notification.permission === "granted";
  }
}

export const notificationService = new NotificationService();
