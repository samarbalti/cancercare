import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { PatientHeaderComponent } from '../shared/header.component';
import { TranslationService } from '../services/translation.service';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, PatientHeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  user: any = {};
  appointments: any[] = [];
  medicalRecords: any[] = [];
  prescriptions: any[] = [];
  messages: any[] = [];
  activeSection = 'overview';
  newMessage = '';
  doctorEmail = '';
  editMode = false;
  showResourceModal = false;
  selectedResource: any = null;
  showRecordModal = false;
  selectedRecord: any = null;
  showPrescriptionModal = false;
  selectedPrescription: any = null;
resources = [
  {
    id: 'cancer-info',
    icon: '📖',
    title: 'Comprendre le cancer',
    description: 'Articles et vidéos sur les différents types de cancer et leurs traitements',
    contentFr: `
      <div style="max-height: 600px; overflow-y: auto; padding: 20px;">
        <h2>📖 Comprendre le Cancer</h2>

        <img src="https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&h=400&fit=crop"
             alt="Recherche cancer" style="width:100%; border-radius:10px; margin:20px 0;">

        <h3>🔬 Qu'est-ce que le Cancer ?</h3>
        <p>Le cancer est une maladie caractérisée par une croissance cellulaire anormale avec le potentiel d'envahir ou de se propager à d'autres parties du corps.</p>

        <h3>📊 Types Principaux de Cancer</h3>

        <h4>1. Carcinomes (85% des cancers)</h4>
        <ul>
          <li><strong>Cancer du sein</strong> - Le plus fréquent chez les femmes</li>
          <li><strong>Cancer du poumon</strong> - Première cause de décès par cancer</li>
          <li><strong>Cancer colorectal</strong> - Affecte le côlon et le rectum</li>
          <li><strong>Cancer de la prostate</strong> - Le plus fréquent chez les hommes</li>
          <li><strong>Cancer de la peau</strong> - Mélanome et carcinomes</li>
        </ul>

        <h4>2. Sarcomes</h4>
        <ul>
          <li>Cancers des os (ostéosarcome)</li>
          <li>Cancers des tissus mous (muscles, graisse)</li>
        </ul>

        <h4>3. Leucémies</h4>
        <ul>
          <li>Leucémie lymphoïde aiguë (LLA)</li>
          <li>Leucémie myéloïde aiguë (LMA)</li>
          <li>Leucémie lymphoïde chronique (LLC)</li>
          <li>Leucémie myéloïde chronique (LMC)</li>
        </ul>

        <h4>4. Lymphomes</h4>
        <ul>
          <li>Lymphome de Hodgkin</li>
          <li>Lymphome non hodgkinien</li>
        </ul>

        <h3>💊 Traitements Disponibles</h3>

        <h4>🔪 Chirurgie</h4>
        <p>Ablation de la tumeur et des tissus environnants. Efficace pour les cancers localisés.</p>

        <h4>💉 Chimiothérapie</h4>
        <p>Médicaments qui détruisent les cellules cancéreuses. Peut être administrée par voie orale ou intraveineuse.</p>

        <h4>☢️ Radiothérapie</h4>
        <p>Utilisation de rayons à haute énergie pour détruire les cellules cancéreuses.</p>

        <h4>🛡️ Immunothérapie</h4>
        <p>Stimule le système immunitaire pour combattre le cancer.</p>

        <h4>🎯 Thérapies Ciblées</h4>
        <p>Médicaments qui ciblent des anomalies spécifiques dans les cellules cancéreuses.</p>

        <h4>🧬 Hormonothérapie</h4>
        <p>Bloque ou réduit les hormones qui alimentent certains cancers.</p>

        <h3>📹 Vidéos Éducatives</h3>
        <div style="margin: 20px 0;">
          <iframe width="100%" height="315" src="https://www.youtube.com/embed/RZfRMcuGvVw"
                  title="Comprendre le cancer" frameborder="0" allowfullscreen></iframe>
          <p><em>Qu'est-ce que le cancer ? - Explication simple</em></p>
        </div>

        <div style="margin: 20px 0;">
          <iframe width="100%" height="315" src="https://www.youtube.com/embed/BmvNNdYDS5k"
                  title="Traitements du cancer" frameborder="0" allowfullscreen></iframe>
          <p><em>Les différents traitements du cancer</em></p>
        </div>

        <h3>📚 Ressources Supplémentaires</h3>
        <ul>
          <li>📄 <a href="#" style="color:#667eea;">Guide complet sur le cancer (PDF)</a></li>
          <li>📄 <a href="#" style="color:#667eea;">Glossaire médical du cancer</a></li>
          <li>📄 <a href="#" style="color:#667eea;">Questions fréquentes sur le cancer</a></li>
          <li>🔗 <a href="https://www.cancer.org" target="_blank" style="color:#667eea;">American Cancer Society</a></li>
          <li>🔗 <a href="https://www.cancer.gov" target="_blank" style="color:#667eea;">National Cancer Institute</a></li>
        </ul>

        <h3>💡 Le Saviez-vous ?</h3>
        <div style="background:#f0f4ff; padding:15px; border-radius:8px; margin:20px 0;">
          <p>✓ Plus de 50% des cancers peuvent être prévenus par un mode de vie sain</p>
          <p>✓ Le dépistage précoce augmente considérablement les chances de guérison</p>
          <p>✓ Les taux de survie au cancer s'améliorent chaque année grâce aux progrès médicaux</p>
        </div>
      </div>
    `,
    contentAr: `
      <div style="max-height: 600px; overflow-y: auto; padding: 20px; direction:rtl;">
        <h2>📖 فهم السرطان</h2>

        <img src="https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&h=400&fit=crop"
             alt="أبحاث السرطان" style="width:100%; border-radius:10px; margin:20px 0;">

        <h3>🔬 ما هو السرطان؟</h3>
        <p>السرطان هو مرض يتميز بنمو غير طبيعي للخلايا مع القدرة على غزو أو الانتشار إلى أجزاء أخرى من الجسم.</p>

        <h3>📊 الأنواع الرئيسية للسرطان</h3>

        <h4>1. السرطانات (85% من السرطانات)</h4>
        <ul>
          <li><strong>سرطان الثدي</strong> - الأكثر شيوعًا عند النساء</li>
          <li><strong>سرطان الرئة</strong> - السبب الأول للوفاة بالسرطان</li>
          <li><strong>سرطان القولون والمستقيم</strong> - يؤثر على القولون والمستقيم</li>
          <li><strong>سرطان البروستاتا</strong> - الأكثر شيوعًا عند الرجال</li>
          <li><strong>سرطان الجلد</strong> - الميلانوما والسرطانات</li>
        </ul>

        <h3>💊 العلاجات المتاحة</h3>

        <h4>🔪 الجراحة</h4>
        <p>إزالة الورم والأنسجة المحيطة. فعال للسرطانات الموضعية.</p>

        <h4>💉 العلاج الكيميائي</h4>
        <p>أدوية تدمر الخلايا السرطانية. يمكن إعطاؤها عن طريق الفم أو الوريد.</p>

        <h4>☢️ العلاج الإشعاعي</h4>
        <p>استخدام أشعة عالية الطاقة لتدمير الخلايا السرطانية.</p>

        <h4>🛡️ العلاج المناعي</h4>
        <p>يحفز جهاز المناعة لمحاربة السرطان.</p>

        <h3>📹 فيديوهات تعليمية</h3>
        <div style="margin: 20px 0;">
          <iframe width="100%" height="315" src="https://www.youtube.com/embed/RZfRMcuGvVw"
                  title="فهم السرطان" frameborder="0" allowfullscreen></iframe>
          <p><em>ما هو السرطان؟ - شرح بسيط</em></p>
        </div>

        <h3>💡 هل تعلم؟</h3>
        <div style="background:#f0f4ff; padding:15px; border-radius:8px; margin:20px 0;">
          <p>✓ يمكن الوقاية من أكثر من 50% من السرطانات بنمط حياة صحي</p>
          <p>✓ الكشف المبكر يزيد بشكل كبير من فرص الشفاء</p>
          <p>✓ معدلات البقاء على قيد الحياة من السرطان تتحسن كل عام</p>
        </div>
      </div>
    `
  },
  {
    id: 'nutrition',
    icon: '🥗',
    title: 'Nutrition et cancer',
    description: 'Conseils alimentaires et recettes adaptées pendant le traitement',
    contentFr: `
      <div style="max-height: 600px; overflow-y: auto; padding: 20px;">
        <h2>🥗 Nutrition et Cancer</h2>

        <img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=400&fit=crop"
             alt="Nutrition saine" style="width:100%; border-radius:10px; margin:20px 0;">

        <h3>🍎 Aliments Recommandés</h3>

        <h4>Fruits et Légumes (5-10 portions/jour)</h4>
        <ul>
          <li>🥦 Brocoli, chou-fleur (anti-cancer)</li>
          <li>🍅 Tomates (lycopène)</li>
          <li>🥕 Carottes (bêta-carotène)</li>
          <li>🫐 Baies (antioxydants)</li>
          <li>🍊 Agrumes (vitamine C)</li>
        </ul>

        <h4>Protéines Maigres</h4>
        <ul>
          <li>🐟 Poisson (oméga-3)</li>
          <li>🐔 Poulet sans peau</li>
          <li>🥚 Œufs</li>
          <li>🫘 Légumineuses (lentilles, pois chiches)</li>
        </ul>

        <h4>Céréales Complètes</h4>
        <ul>
          <li>🌾 Riz complet</li>
          <li>🍞 Pain complet</li>
          <li>🥣 Avoine</li>
          <li>🌽 Quinoa</li>
        </ul>

        <h3>❌ Aliments à Éviter</h3>
        <ul>
          <li>🍔 Aliments ultra-transformés</li>
          <li>🍬 Sucres raffinés</li>
          <li>🍷 Alcool</li>
          <li>🥓 Viandes rouges et charcuterie</li>
          <li>🧂 Excès de sel</li>
        </ul>

        <h3>📹 Vidéos Nutrition</h3>
        <div style="margin: 20px 0;">
          <iframe width="100%" height="315" src="https://www.youtube.com/embed/Kb24RrHIbFk"
                  title="Nutrition cancer" frameborder="0" allowfullscreen></iframe>
          <p><em>Alimentation pendant le traitement du cancer</em></p>
        </div>

        <h3>🍽️ Recettes Adaptées</h3>
        <div style="background:#f0fff4; padding:15px; border-radius:8px; margin:10px 0;">
          <h4>Smoothie Énergisant</h4>
          <p>• 1 banane • 1 tasse de baies • 1 tasse de lait d'amande • 1 c. à soupe de graines de chia</p>
        </div>

        <div style="background:#f0fff4; padding:15px; border-radius:8px; margin:10px 0;">
          <h4>Soupe Anti-Cancer</h4>
          <p>• Brocoli • Carottes • Oignons • Ail • Curcuma • Bouillon de légumes</p>
        </div>

        <h3>💧 Hydratation</h3>
        <p><strong>Objectif : 2-3 litres d'eau par jour</strong></p>
        <ul>
          <li>💧 Eau pure</li>
          <li>🍵 Thé vert (antioxydants)</li>
          <li>🥤 Jus de fruits frais (sans sucre ajouté)</li>
          <li>🥣 Soupes et bouillons</li>
        </ul>
      </div>
    `,
    contentAr: `
      <div style="max-height: 600px; overflow-y: auto; padding: 20px; direction:rtl;">
        <h2>🥗 التغذية والسرطان</h2>

        <img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=400&fit=crop"
             alt="تغذية صحية" style="width:100%; border-radius:10px; margin:20px 0;">

        <h3>🍎 الأطعمة الموصى بها</h3>

        <h4>الفواكه والخضروات (5-10 حصص/يوم)</h4>
        <ul>
          <li>🥦 البروكلي والقرنبيط (مضاد للسرطان)</li>
          <li>🍅 الطماطم (ليكوبين)</li>
          <li>🥕 الجزر (بيتا كاروتين)</li>
          <li>🫐 التوت (مضادات الأكسدة)</li>
          <li>🍊 الحمضيات (فيتامين C)</li>
        </ul>

        <h3>❌ الأطعمة التي يجب تجنبها</h3>
        <ul>
          <li>🍔 الأطعمة المصنعة</li>
          <li>🍬 السكريات المكررة</li>
          <li>🍷 الكحول</li>
          <li>🥓 اللحوم الحمراء والمعالجة</li>
          <li>🧂 الملح الزائد</li>
        </ul>

        <h3>💧 الترطيب</h3>
        <p><strong>الهدف: 2-3 لتر من الماء يوميًا</strong></p>
      </div>
    `
  },
  {
    id: 'physical-activity',
    icon: '🏃',
    title: 'Activité physique',
    description: 'Exercices adaptés et recommandations pendant le traitement',
    contentFr: `
      <div style="max-height: 600px; overflow-y: auto; padding: 20px;">
        <h2>🏃 Activité Physique et Cancer</h2>

        <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=400&fit=crop"
             alt="Exercice physique" style="width:100%; border-radius:10px; margin:20px 0;">

        <div style="background:#e3f2fd; padding:20px; border-radius:10px; margin:20px 0;">
          <h3>💪 Pourquoi l'exercice est important ?</h3>
          <ul>
            <li>✓ Réduit la fatigue liée au traitement</li>
            <li>✓ Améliore la qualité de vie</li>
            <li>✓ Renforce le système immunitaire</li>
            <li>✓ Réduit le stress et l'anxiété</li>
            <li>✓ Améliore le sommeil</li>
            <li>✓ Maintient la masse musculaire</li>
          </ul>
        </div>

        <h3>🎯 Recommandations Générales</h3>
        <div style="background:#fff3e0; padding:15px; border-radius:8px; margin:10px 0;">
          <p><strong>Objectif hebdomadaire :</strong></p>
          <ul>
            <li>150 minutes d'activité modérée OU</li>
            <li>75 minutes d'activité intense</li>
            <li>+ Exercices de renforcement 2-3 fois/semaine</li>
          </ul>
        </div>

        <h3>🏋️ Exercices Adaptés</h3>

        <h4>1. Exercices Cardiovasculaires Doux</h4>
        <ul>
          <li>🚶 Marche (20-30 min/jour)</li>
          <li>🚴 Vélo d'appartement</li>
          <li>🏊 Natation ou aquagym</li>
          <li>💃 Danse douce</li>
        </ul>

        <h4>2. Renforcement Musculaire</h4>
        <ul>
          <li>🦵 Squats assistés (10-15 répétitions)</li>
          <li>💪 Pompes murales (8-12 répétitions)</li>
          <li>🪑 Levées de chaise (10 répétitions)</li>
          <li>🏋️ Bandes élastiques (résistance légère)</li>
        </ul>

        <h4>3. Étirements et Flexibilité</h4>
        <ul>
          <li>🧘 Yoga doux (15-20 min)</li>
          <li>🤸 Étirements quotidiens</li>
          <li>🌅 Tai Chi</li>
          <li>🧘‍♀️ Pilates adapté</li>
        </ul>

        <h3>📹 Vidéos d'Exercices</h3>
        <div style="margin: 20px 0;">
          <iframe width="100%" height="315" src="https://www.youtube.com/embed/sTANio_2E0Q"
                  title="Exercices cancer" frameborder="0" allowfullscreen></iframe>
          <p><em>Exercices adaptés pendant le traitement du cancer</em></p>
        </div>

        <div style="margin: 20px 0;">
          <iframe width="100%" height="315" src="https://www.youtube.com/embed/v7AYKMP6rOE"
                  title="Yoga cancer" frameborder="0" allowfullscreen></iframe>
          <p><em>Yoga doux pour patients en oncologie</em></p>
        </div>

        <h3>🌟 Images de Motivation</h3>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin:20px 0;">
          <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop"
               alt="Motivation" style="width:100%; border-radius:8px;">
          <img src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop"
               alt="Force" style="width:100%; border-radius:8px;">
        </div>

        <div style="background:#e8f5e9; padding:20px; border-radius:10px; margin:20px 0; text-align:center;">
          <h3>💚 Citations Motivantes</h3>
          <p style="font-size:18px; font-style:italic;">"Chaque pas compte, chaque mouvement est une victoire"</p>
          <p style="font-size:18px; font-style:italic;">"La force ne vient pas du corps, elle vient de la volonté"</p>
          <p style="font-size:18px; font-style:italic;">"Vous êtes plus fort que vous ne le pensez"</p>
        </div>

        <h3>⚠️ Précautions Importantes</h3>
        <div style="background:#ffebee; padding:15px; border-radius:8px;">
          <ul>
            <li>🩺 Consultez votre médecin avant de commencer</li>
            <li>🎯 Commencez doucement et progressez graduellement</li>
            <li>💧 Hydratez-vous bien</li>
            <li>🛑 Arrêtez si vous ressentez douleur ou fatigue excessive</li>
            <li>😴 Respectez vos périodes de repos</li>
            <li>🌡️ Évitez l'exercice en cas de fièvre</li>
          </ul>
        </div>

        <h3>📅 Programme Hebdomadaire Suggéré</h3>
        <table style="width:100%; border-collapse:collapse; margin:20px 0;">
          <tr style="background:#f5f5f5;">
            <th style="padding:10px; border:1px solid #ddd;">Jour</th>
            <th style="padding:10px; border:1px solid #ddd;">Activité</th>
            <th style="padding:10px; border:1px solid #ddd;">Durée</th>
          </tr>
          <tr>
            <td style="padding:10px; border:1px solid #ddd;">Lundi</td>
            <td style="padding:10px; border:1px solid #ddd;">Marche + Étirements</td>
            <td style="padding:10px; border:1px solid #ddd;">30 min</td>
          </tr>
          <tr>
            <td style="padding:10px; border:1px solid #ddd;">Mardi</td>
            <td style="padding:10px; border:1px solid #ddd;">Renforcement musculaire</td>
            <td style="padding:10px; border:1px solid #ddd;">20 min</td>
          </tr>
          <tr>
            <td style="padding:10px; border:1px solid #ddd;">Mercredi</td>
            <td style="padding:10px; border:1px solid #ddd;">Yoga doux</td>
            <td style="padding:10px; border:1px solid #ddd;">25 min</td>
          </tr>
          <tr>
            <td style="padding:10px; border:1px solid #ddd;">Jeudi</td>
            <td style="padding:10px; border:1px solid #ddd;">Repos ou marche légère</td>
            <td style="padding:10px; border:1px solid #ddd;">15 min</td>
          </tr>
          <tr>
            <td style="padding:10px; border:1px solid #ddd;">Vendredi</td>
            <td style="padding:10px; border:1px solid #ddd;">Natation ou vélo</td>
            <td style="padding:10px; border:1px solid #ddd;">30 min</td>
          </tr>
          <tr>
            <td style="padding:10px; border:1px solid #ddd;">Samedi</td>
            <td style="padding:10px; border:1px solid #ddd;">Renforcement + Étirements</td>
            <td style="padding:10px; border:1px solid #ddd;">25 min</td>
          </tr>
          <tr>
            <td style="padding:10px; border:1px solid #ddd;">Dimanche</td>
            <td style="padding:10px; border:1px solid #ddd;">Repos actif</td>
            <td style="padding:10px; border:1px solid #ddd;">-</td>
          </tr>
        </table>

        <h3>📱 Applications Recommandées</h3>
        <ul>
          <li>📲 Nike Training Club (exercices adaptables)</li>
          <li>📲 Down Dog (yoga personnalisé)</li>
          <li>📲 Strava (suivi de marche/course)</li>
          <li>📲 MyFitnessPal (suivi d'activité)</li>
        </ul>

        <h3>👥 Groupes de Support</h3>
        <div style="background:#f3e5f5; padding:15px; border-radius:8px;">
          <p>🏃‍♀️ Rejoignez des groupes d'activité physique pour patients en oncologie</p>
          <p>💪 Séances collectives hebdomadaires à l'hôpital</p>
          <p>🤝 Partagez vos progrès et motivez-vous mutuellement</p>
        </div>
      </div>
    `,
    contentAr: `
      <div style="max-height: 600px; overflow-y: auto; padding: 20px; direction:rtl;">
        <h2>🏃 النشاط البدني والسرطان</h2>

        <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=400&fit=crop"
             alt="التمارين الرياضية" style="width:100%; border-radius:10px; margin:20px 0;">

        <div style="background:#e3f2fd; padding:20px; border-radius:10px; margin:20px 0;">
          <h3>💪 لماذا التمرين مهم؟</h3>
          <ul>
            <li>✓ يقلل من التعب المرتبط بالعلاج</li>
            <li>✓ يحسن نوعية الحياة</li>
            <li>✓ يقوي جهاز المناعة</li>
            <li>✓ يقلل من التوتر والقلق</li>
            <li>✓ يحسن النوم</li>
            <li>✓ يحافظ على الكتلة العضلية</li>
          </ul>
        </div>

        <h3>🎯 التوصيات العامة</h3>
        <div style="background:#fff3e0; padding:15px; border-radius:8px; margin:10px 0;">
          <p><strong>الهدف الأسبوعي:</strong></p>
          <ul>
            <li>150 دقيقة من النشاط المعتدل أو</li>
            <li>75 دقيقة من النشاط المكثف</li>
            <li>+ تمارين التقوية 2-3 مرات/أسبوع</li>
          </ul>
        </div>

        <h3>🏋️ التمارين المكيفة</h3>

        <h4>1. تمارين القلب الخفيفة</h4>
        <ul>
          <li>🚶 المشي (20-30 دقيقة/يوم)</li>
          <li>🚴 الدراجة الثابتة</li>
          <li>🏊 السباحة أو التمارين المائية</li>
          <li>💃 الرقص الخفيف</li>
        </ul>

        <h3>🌟 صور تحفيزية</h3>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin:20px 0;">
          <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop"
               alt="التحفيز" style="width:100%; border-radius:8px;">
          <img src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop"
               alt="القوة" style="width:100%; border-radius:8px;">
        </div>

        <div style="background:#e8f5e9; padding:20px; border-radius:10px; margin:20px 0; text-align:center;">
          <h3>💚 اقتباسات محفزة</h3>
          <p style="font-size:18px; font-style:italic;">"كل خطوة مهمة، كل حركة انتصار"</p>
          <p style="font-size:18px; font-style:italic;">"القوة لا تأتي من الجسم، بل من الإرادة"</p>
          <p style="font-size:18px; font-style:italic;">"أنت أقوى مما تعتقد"</p>
        </div>
      </div>
    `
  },
  {
    id: 'psychology',
    icon: '🧘',
    title: 'Soutien psychologique',
    description: 'Ressources pour le bien-être mental et la gestion du stress',
    contentFr: `
      <div style="max-height: 600px; overflow-y: auto; padding: 20px;">
        <h2>🧘 Soutien Psychologique</h2>

        <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=400&fit=crop"
             alt="Méditation" style="width:100%; border-radius:10px; margin:20px 0;">

        <h3>🌟 Techniques de Gestion du Stress</h3>

        <h4>1. Méditation (10-20 min/jour)</h4>
        <ul>
          <li>Méditation guidée</li>
          <li>Pleine conscience (mindfulness)</li>
          <li>Visualisation positive</li>
        </ul>

        <h4>2. Respiration Profonde</h4>
        <p><strong>Technique 4-7-8 :</strong></p>
        <ul>
          <li>Inspirez par le nez pendant 4 secondes</li>
          <li>Retenez votre souffle pendant 7 secondes</li>
          <li>Expirez par la bouche pendant 8 secondes</li>
          <li>Répétez 4 fois</li>
        </ul>

        <h4>3. Yoga Doux</h4>
        <ul>
          <li>Postures adaptées</li>
          <li>Étirements doux</li>
          <li>Relaxation profonde</li>
        </ul>

        <h4>4. Journal Intime</h4>
        <p>Écrire ses émotions aide à :</p>
        <ul>
          <li>Clarifier ses pensées</li>
          <li>Réduire l'anxiété</li>
          <li>Suivre son évolution</li>
        </ul>

        <h3>📹 Méditations Guidées</h3>
        <div style="margin: 20px 0;">
          <iframe width="100%" height="315" src="https://www.youtube.com/embed/mgmVOuLgFB0"
                  title="Méditation" frameborder="0" allowfullscreen></iframe>
          <p><em>Méditation pour patients atteints de cancer</em></p>
        </div>

        <h3>📞 Ressources Disponibles</h3>
        <ul>
          <li>👨‍⚕️ Consultations avec psychologue oncologique</li>
          <li>👥 Groupes de parole hebdomadaires</li>
          <li>📞 Ligne d'écoute 24/7 : 0800 XXX XXX</li>
          <li>📱 Applications : Calm, Headspace, Petit Bambou</li>
        </ul>

        <h3>💚 Conseils Pratiques</h3>
        <div style="background:#f0fff4; padding:15px; border-radius:8px;">
          <p>✓ Acceptez vos émotions</p>
          <p>✓ Parlez de vos peurs</p>
          <p>✓ Restez connecté avec vos proches</p>
          <p>✓ Maintenez une routine</p>
          <p>✓ Célébrez les petites victoires</p>
        </div>
      </div>
    `,
    contentAr: `
      <div style="max-height: 600px; overflow-y: auto; padding: 20px; direction:rtl;">
        <h2>🧘 الدعم النفسي</h2>

        <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=400&fit=crop"
             alt="التأمل" style="width:100%; border-radius:10px; margin:20px 0;">

        <h3>🌟 تقنيات إدارة الإجهاد</h3>

        <h4>1. التأمل (10-20 دقيقة/يوم)</h4>
        <ul>
          <li>التأمل الموجه</li>
          <li>اليقظة الذهنية</li>
          <li>التصور الإيجابي</li>
        </ul>

        <h4>2. التنفس العميق</h4>
        <p><strong>تقنية 4-7-8:</strong></p>
        <ul>
          <li>استنشق من الأنف لمدة 4 ثوان</li>
          <li>احبس أنفاسك لمدة 7 ثوان</li>
          <li>ازفر من الفم لمدة 8 ثوان</li>
          <li>كرر 4 مرات</li>
        </ul>

        <h3>💚 نصائح عملية</h3>
        <div style="background:#f0fff4; padding:15px; border-radius:8px;">
          <p>✓ تقبل مشاعرك</p>
          <p>✓ تحدث عن مخاوفك</p>
          <p>✓ ابق على اتصال مع أحبائك</p>
          <p>✓ حافظ على روتين</p>
          <p>✓ احتفل بالانتصارات الصغيرة</p>
        </div>
      </div>
    `
  },
  {
    id: 'support-groups',
    icon: '👥',
    title: 'Groupes de soutien',
    description: 'Rejoignez des communautés de patients et partagez vos expériences',
    contentFr: `
      <div style="max-height: 600px; overflow-y: auto; padding: 20px;">
        <h2>👥 Groupes de Soutien</h2>
        <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=400&fit=crop"
             alt="Groupe de soutien" style="width:100%; border-radius:10px; margin:20px 0;">
        <h3>💚 Pourquoi rejoindre un groupe ?</h3>
        <ul>
          <li>Partager votre expérience avec d'autres patients</li>
          <li>Recevoir du soutien émotionnel</li>
          <li>Échanger des conseils pratiques</li>
          <li>Réduire le sentiment d'isolement</li>
        </ul>
        <h3>📍 Groupes Disponibles</h3>
        <div style="background:#f0f9ff; padding:15px; border-radius:8px; margin:10px 0;">
          <h4>Groupe Cancer du Sein</h4>
          <p>📅 Tous les mardis à 18h00</p>
          <p>📍 Salle de conférence - Hôpital</p>
        </div>
        <div style="background:#f0f9ff; padding:15px; border-radius:8px; margin:10px 0;">
          <h4>Groupe Cancer Colorectal</h4>
          <p>📅 Tous les jeudis à 17h00</p>
          <p>📍 En ligne (Zoom)</p>
        </div>
      </div>
    `,
    contentAr: `
      <div style="max-height: 600px; overflow-y: auto; padding: 20px; direction:rtl;">
        <h2>👥 مجموعات الدعم</h2>
        <h3>💚 لماذا الانضمام إلى مجموعة؟</h3>
        <ul>
          <li>مشاركة تجربتك مع مرضى آخرين</li>
          <li>تلقي الدعم العاطفي</li>
          <li>تبادل النصائح العملية</li>
          <li>تقليل الشعور بالعزلة</li>
        </ul>
      </div>
    `
  },
  {
    id: 'library',
    icon: '📚',
    title: 'Bibliothèque médicale',
    description: 'Accédez à des documents et guides médicaux complets',
    contentFr: `
      <div style="max-height: 600px; overflow-y: auto; padding: 20px;">
        <h2>📚 Bibliothèque Médicale</h2>
        <img src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=400&fit=crop"
             alt="Bibliothèque" style="width:100%; border-radius:10px; margin:20px 0;">
        <h3>📖 Documents Disponibles</h3>
        <div style="background:#fef3c7; padding:15px; border-radius:8px; margin:10px 0;">
          <h4>Guide du Patient - Cancer du Sein</h4>
          <p>📄 PDF - 45 pages</p>
          <button style="background:#3b82f6; color:white; padding:8px 16px; border:none; border-radius:6px; cursor:pointer;">Télécharger</button>
        </div>
        <div style="background:#fef3c7; padding:15px; border-radius:8px; margin:10px 0;">
          <h4>Comprendre la Chimiothérapie</h4>
          <p>📄 PDF - 32 pages</p>
          <button style="background:#3b82f6; color:white; padding:8px 16px; border:none; border-radius:6px; cursor:pointer;">Télécharger</button>
        </div>
        <div style="background:#fef3c7; padding:15px; border-radius:8px; margin:10px 0;">
          <h4>Effets Secondaires et Gestion</h4>
          <p>📄 PDF - 28 pages</p>
          <button style="background:#3b82f6; color:white; padding:8px 16px; border:none; border-radius:6px; cursor:pointer;">Télécharger</button>
        </div>
      </div>
    `,
    contentAr: `
      <div style="max-height: 600px; overflow-y: auto; padding: 20px; direction:rtl;">
        <h2>📚 المكتبة الطبية</h2>
        <h3>📖 المستندات المتاحة</h3>
        <p>الوصول إلى أدلة ومستندات طبية شاملة</p>
      </div>
    `
  }
];

  constructor(
    private patientService: PatientService,
    private router: Router,
    private route: ActivatedRoute,
    public translate: TranslationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadData();

    this.route.data.subscribe(data => {
      if (data['section']) {
        this.activeSection = data['section'];
      }
    });

    window.addEventListener('languageChanged', () => {
      this.user = { ...this.user };
    });
  }

  loadData() {
    console.log('🔄 Chargement des données patient...');

    this.patientService.getProfile().subscribe({
      next: (data: any) => {
        this.user = data.data || {};
        console.log('👤 Profil:', this.user);
      },
      error: (err) => console.error('❌ Erreur profil:', err)
    });

    this.patientService.getAppointments().subscribe({
      next: (data: any) => {
        this.appointments = data.data || [];
        console.log('📅 Rendez-vous:', this.appointments.length);
      },
      error: (err) => console.error('❌ Erreur RDV:', err)
    });

    this.patientService.getMedicalRecords().subscribe({
      next: (data: any) => {
        this.medicalRecords = data.data || [];
        console.log('📋 Dossiers médicaux:', this.medicalRecords.length, this.medicalRecords);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('❌ Erreur dossiers:', err)
    });

    this.patientService.getPrescriptions().subscribe({
      next: (data: any) => {
        this.prescriptions = data.data || [];
        console.log('💊 Prescriptions:', this.prescriptions.length, this.prescriptions);
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('❌ Erreur prescriptions:', err)
    });

    this.patientService.getMessages().subscribe({
      next: (data: any) => {
        this.messages = data.data || [];
        console.log('💬 Messages:', this.messages.length, this.messages);
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('❌ Erreur messages:', err)
    });
  }

  showSection(section: string) {
    this.activeSection = section;
  }

  navigateToChatbot() {
    this.router.navigate(['/patient/chatbot']);
  }

  viewProfile() {
    this.router.navigate(['/patient/profile']);
  }

  saveProfile() {
    alert('Profil enregistré avec succès!');
    this.editMode = false;
  }

  downloadPDF() {
    // Télécharger tous les dossiers médicaux en un seul PDF
    if (this.medicalRecords.length === 0) {
      alert('Aucun dossier médical à télécharger');
      return;
    }
    // Télécharger le premier dossier comme représentation du dossier complet
    if (this.medicalRecords.length > 0) {
      this.downloadRecordPDF(this.medicalRecords[0]._id);
    }
  }

  downloadRecordPDF(id: string) {
    this.patientService.downloadMedicalRecord(id).subscribe({
      next: (blob: Blob) => {
        console.log('📥 Blob reçu:', blob.size, 'bytes, type:', blob.type);

        // Vérifier que le blob n'est pas vide
        if (blob.size === 0) {
          console.error('❌ Blob vide');
          alert('Erreur: fichier vide reçu');
          return;
        }

        try {
          // Créer une URL blob
          const url = window.URL.createObjectURL(blob);
          console.log('✓ URL blob créée:', url);

          // Créer un élément <a> avec les bonnes propriétés
          const link = document.createElement('a');
          link.href = url;
          link.download = `dossier-medical-${id}.pdf`;
          link.style.display = 'none';

          // Ajouter au DOM
          document.body.appendChild(link);
          console.log('✓ Lien ajouté au DOM');

          // Ajouter un petit délai avant de cliquer (important pour certains navigateurs)
          setTimeout(() => {
            link.click();
            console.log('✓ Clic déclenché');

            // Nettoyer après le clic
            setTimeout(() => {
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
              console.log('✓ Nettoyage effectué');
            }, 100);
          }, 100);
        } catch (error) {
          console.error('❌ Erreur lors du téléchargement:', error);
          alert('Erreur lors du téléchargement du dossier médical');
        }
      },
      error: (err) => {
        console.error('❌ Erreur téléchargement:', err);
        alert('Erreur lors du téléchargement du dossier médical');
      }
    });
  }

  downloadPrescriptionPDF(id: string) {
    this.patientService.downloadPrescription(id).subscribe({
      next: (blob: Blob) => {
        console.log('📥 Blob reçu:', blob.size, 'bytes, type:', blob.type);

        // Vérifier que le blob n'est pas vide
        if (blob.size === 0) {
          console.error('❌ Blob vide');
          alert('Erreur: fichier vide reçu');
          return;
        }

        try {
          // Créer une URL blob
          const url = window.URL.createObjectURL(blob);
          console.log('✓ URL blob créée:', url);

          // Créer un élément <a> avec les bonnes propriétés
          const link = document.createElement('a');
          link.href = url;
          link.download = `prescription-${id}.pdf`;
          link.style.display = 'none';

          // Ajouter au DOM
          document.body.appendChild(link);
          console.log('✓ Lien ajouté au DOM');

          // Ajouter un petit délai avant de cliquer (important pour certains navigateurs)
          setTimeout(() => {
            link.click();
            console.log('✓ Clic déclenché');

            // Nettoyer après le clic
            setTimeout(() => {
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
              console.log('✓ Nettoyage effectué');
            }, 100);
          }, 100);
        } catch (error) {
          console.error('❌ Erreur lors du téléchargement:', error);
          alert('Erreur lors du téléchargement de la prescription');
        }
      },
      error: (err) => {
        console.error('❌ Erreur téléchargement:', err);
        alert('Erreur lors du téléchargement de la prescription');
      }
    });
  }

  newAppointment() {
    alert('Création d\'un nouveau rendez-vous...');
  }

  cancelAppointment(id: string) {
    if (confirm('Voulez-vous annuler ce rendez-vous ?')) {
      alert('Rendez-vous annulé');
      this.loadData();
    }
  }

  toggleReminder(med: any) {
    med.reminderActive = !med.reminderActive;
    if (med.reminderActive) {
      alert('Rappel activé pour ' + med.name);
    } else {
      alert('Rappel désactivé pour ' + med.name);
    }
  }

  sendMessage() {
    // Valider le message
    if (!this.newMessage || !this.newMessage.trim()) {
      alert('Veuillez saisir un message');
      return;
    }

    if (!this.doctorEmail || !this.doctorEmail.trim()) {
      alert('Veuillez entrer l\'email du médecin');
      return;
    }

    console.log('📤 Envoi du message à:', this.doctorEmail);

    this.patientService.sendMessage(this.newMessage, this.doctorEmail).subscribe({
      next: (response: any) => {
        console.log('✅ Message envoyé avec succès:', response);
        alert('Message envoyé au médecin');
        this.newMessage = '';
        this.doctorEmail = '';
        // Recharger les messages
        this.loadData();
      },
      error: (err) => {
        console.error('❌ Erreur lors de l\'envoi du message:', err);
        const errorMsg = err?.error?.message || 'Erreur lors de l\'envoi du message';
        alert(errorMsg);
      }
    });
  }

  logout() {
    localStorage.clear();
    window.location.href = '/login';
  }

  openResource(resourceId: string) {
    const resource = this.resources.find(r => r.id === resourceId);
    if (resource) {
      const lang = localStorage.getItem('language') || 'fr';
      this.selectedResource = {
        ...resource,
        content: lang === 'ar' ? resource.contentAr : resource.contentFr
      };
      this.showResourceModal = true;
    }
  }

  closeResourceModal() {
    this.showResourceModal = false;
    this.selectedResource = null;
  }

  viewRecordDetails(record: any) {
    this.selectedRecord = record;
    this.showRecordModal = true;
  }

  closeRecordModal() {
    this.showRecordModal = false;
    this.selectedRecord = null;
  }

  viewPrescriptionDetails(prescription: any) {
    this.selectedPrescription = prescription;
    this.showPrescriptionModal = true;
  }

  closePrescriptionModal() {
    this.showPrescriptionModal = false;
    this.selectedPrescription = null;
  }
}
