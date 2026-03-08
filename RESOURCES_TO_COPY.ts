// COPIEZ CE CODE ET REMPLACEZ LE TABLEAU resources DANS dashboard.component.ts

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
  }
];
