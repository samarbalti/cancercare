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
}
