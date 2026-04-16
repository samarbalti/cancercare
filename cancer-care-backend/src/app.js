import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatbotModule } from './components/chatbot/chatbot.module';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ChatbotModule],  // ✅ Utiliser ChatbotModule, pas ChatbotComponent
  template: `
    <router-outlet></router-outlet>
  `,
  styles: []
})
export class App {
  title = 'cancer-care-frontend';
}