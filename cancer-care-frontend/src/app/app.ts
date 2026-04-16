import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// FIX NG2012/NG8001: ChatbotComponent retiré des imports du root
// Il doit être chargé via le router dans app.routes.ts, pas ici
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = signal('cancer-care-frontend');
}
