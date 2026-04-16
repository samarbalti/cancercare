import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;

  connect(userId: string) {
    if (!this.socket) {
      this.socket = io(environment.apiUrl, {
        transports: ['websocket'],
        reconnection: true
      });

      this.socket.on('connect', () => {
        console.log('✅ Socket connecté');
        this.socket?.emit('authenticate', userId);
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Socket déconnecté');
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Méthode générique
  on(event: string): Observable<any> {
    return new Observable(observer => {
      this.socket?.on(event, (data: any) => {
        observer.next(data);
      });
    });
  }

  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }

  // ============================================
  // MÉTHODES SPÉCIFIQUES POUR ALERTES
  // ============================================

  /**
   * Écouter les nouvelles alertes en temps réel
   */
  onNewAlert(): Observable<any> {
    return this.on('NEW_ALERT');
  }

  /**
   * Écouter les mises à jour d'alertes
   */
  onAlertUpdate(): Observable<any> {
    return this.on('ALERT_UPDATE');
  }

  /**
   * Écouter les notifications générales
   */
  onNotification(): Observable<any> {
    return this.on('notification');
  }

  /**
   * Écouter les messages du chatbot
   */
  onChatMessage(): Observable<any> {
    return this.on('chat_message');
  }

  /**
   * Écouter quand un patient se connecte
   */
  onPatientOnline(): Observable<any> {
    return this.on('patient_online');
  }

  /**
   * Écouter les mises à jour de statut patient
   */
  onPatientStatus(): Observable<any> {
    return this.on('patient_status_update');
  }

  /**
   * Rejoindre une room spécifique
   */
  joinRoom(room: string) {
    this.emit('join_room', room);
  }

  /**
   * Quitter une room
   */
  leaveRoom(room: string) {
    this.emit('leave_room', room);
  }

  /**
   * Vérifier si le socket est connecté
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Obtenir l'ID du socket
   */
  getSocketId(): string | undefined {
    return this.socket?.id;
  }
}
