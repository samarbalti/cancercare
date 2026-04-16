import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ChatbotService } from '../../services/chatbot.service';
import { Message, PatientReport, Alert } from '../../models/chatbot.model';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent {

  messages: Message[] = [];
  inputMessage = '';
  isLoading = false;

  filteredAlerts: Alert[] = [];

  patientReport: PatientReport | null = null;
  showReportModal = false;

  stats = { total: 0 };

  constructor(private chatbotService: ChatbotService) {}

  sendMessage(): void {
    if (!this.inputMessage.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: this.inputMessage.trim()
    };

    this.messages.push(userMessage);
    const text = this.inputMessage.trim();
    this.inputMessage = '';
    this.isLoading = true;

    this.chatbotService.sendMessage(text).subscribe({
      next: (res: any) => {
        this.messages.push({
          role: 'assistant',
          content: res.response
        });
        this.isLoading = false;
      },
      error: (err: unknown) => {
        console.error('Erreur chatbot:', err);
        this.messages.push({
          role: 'assistant',
          content: '❌ Une erreur est survenue. Veuillez réessayer.'
        });
        this.isLoading = false;
      }
    });
  }

formatContent(content: string | undefined): string {
  if (!content) return ''; // 🔥 الحماية المهمة
  return content.replace(/\n/g, '<br>');
}

  getStressColor(score: number): string {
    if (score > 70) return 'red';
    if (score > 40) return 'orange';
    return 'green';
  }

  getStressIcon(score: number): string {
    if (score > 70) return '🔥';
    if (score > 40) return '⚠️';
    return '🙂';
  }

  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
