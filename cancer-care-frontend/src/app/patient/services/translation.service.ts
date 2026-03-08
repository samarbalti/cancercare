import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLang: string = 'fr';
  
  private translations: any = {
    fr: {
      // Navigation
      home: 'Accueil',
      dashboard: 'Dashboard',
      appointments: 'Rendez-vous',
      medical: 'Dossier Médical',
      prescriptions: 'Prescriptions',
      messages: 'Messages',
      resources: 'Ressources',
      profile: 'Profil',
      logout: 'Déconnexion',
      
      // Hero
      welcome: 'Bienvenue',
      heroSubtitle: 'Ensemble, nous sommes plus forts. Votre courage inspire.',
      accessDashboard: 'Accéder au Dashboard',
      
      // Sections
      hopeMessage: 'Message d\'Espoir',
      ourServices: 'Nos Services',
      testimonials: 'Témoignages Inspirants',
      
      // Videos
      video1Title: 'Message de motivation',
      video2Title: 'Témoignage inspirant',
      video3Title: 'Conseils de spécialistes',
      
      // Services
      appointmentsTitle: 'Rendez-vous',
      appointmentsDesc: 'Planifiez vos consultations facilement',
      medicalTitle: 'Dossier Médical',
      medicalDesc: 'Accédez à vos documents en ligne',
      prescriptionsTitle: 'Prescriptions',
      prescriptionsDesc: 'Gérez vos ordonnances',
      messagesTitle: 'Messages',
      messagesDesc: 'Communiquez avec votre médecin',
      
      // Footer
      quickLinks: 'Liens Rapides',
      myProfile: 'Mon Profil',
      faq: 'FAQ',
      contact: 'Contact',
      emergency: 'Urgence 24/7',
      emergencyLine: 'Ligne d\'assistance disponible',
      copyright: 'Tous droits réservés',
      madeWith: 'Fait avec ❤️ pour nos patients',
      healthPriority: 'Votre santé, notre priorité. Ensemble vers la guérison.',
      
      // Quote
      motivationQuote: '"La force ne vient pas de ce que vous pouvez faire. Elle vient de surmonter les choses que vous pensiez ne pas pouvoir faire."',
      
      // Dashboard
      hello: 'Bonjour',
      overview: 'Aperçu',
      scheduled: 'Programmés',
      active: 'Actives',
      documents: 'Documents',
      unread: 'Non lus',
      nextAppointments: 'Prochains rendez-vous',
      activePrescriptions: 'Prescriptions actives',
      viewAll: 'Voir tout',
      noAppointments: 'Aucun rendez-vous',
      noPrescriptions: 'Aucune prescription',
      takeAppointment: 'Prendre rendez-vous',
      noAppointmentYet: 'Vous n\'avez pas encore de rendez-vous programmé',
      myAppointments: 'Mes rendez-vous',
      
      // Medical Records
      downloadPDF: 'Télécharger PDF',
      viewDetails: 'Voir détails',
      noRecords: 'Aucun dossier',
      noRecordsDesc: 'Votre dossier médical est vide',
      
      // Prescriptions
      duration: 'Durée',
      noPrescriptionsDesc: 'Vous n\'avez pas de prescription active',
      
      // Messages
      noMessages: 'Aucun message',
      educationalResources: 'Ressources Éducatives',
      understandCancer: 'Comprendre le cancer',
      understandCancerDesc: 'Articles et vidéos sur les différents types de cancer',
      nutrition: 'Nutrition et cancer',
      nutritionDesc: 'Conseils alimentaires et recettes adaptées',
      psychSupport: 'Soutien psychologique',
      psychSupportDesc: 'Ressources pour le bien-être mental',
      physicalActivity: 'Activité physique',
      physicalActivityDesc: 'Exercices adaptés et recommandations',
      supportGroups: 'Groupes de soutien',
      supportGroupsDesc: 'Rejoignez des communautés de patients',
      medicalLibrary: 'Bibliothèque médicale',
      medicalLibraryDesc: 'Accédez à des documents médicaux',
      consult: 'Consulter',
      help: 'Aide',
      privacy: 'Confidentialité',
      terms: 'Conditions',
      allRightsReserved: 'Tous droits réservés',
      cancel: 'Annuler',
      save: 'Enregistrer',
      close: 'Fermer'
    },
    en: {
      // Navigation
      home: 'Home',
      dashboard: 'Dashboard',
      appointments: 'Appointments',
      medical: 'Medical Records',
      prescriptions: 'Prescriptions',
      messages: 'Messages',
      resources: 'Resources',
      profile: 'Profile',
      logout: 'Logout',
      
      // Hero
      welcome: 'Welcome',
      heroSubtitle: 'Together, we are stronger. Your courage inspires.',
      accessDashboard: 'Access Dashboard',
      
      // Sections
      hopeMessage: 'Message of Hope',
      ourServices: 'Our Services',
      testimonials: 'Inspiring Testimonials',
      
      // Videos
      video1Title: 'Motivational Message',
      video2Title: 'Inspiring Testimony',
      video3Title: 'Expert Advice',
      
      // Services
      appointmentsTitle: 'Appointments',
      appointmentsDesc: 'Schedule your consultations easily',
      medicalTitle: 'Medical Records',
      medicalDesc: 'Access your documents online',
      prescriptionsTitle: 'Prescriptions',
      prescriptionsDesc: 'Manage your prescriptions',
      messagesTitle: 'Messages',
      messagesDesc: 'Communicate with your doctor',
      
      // Footer
      quickLinks: 'Quick Links',
      myProfile: 'My Profile',
      faq: 'FAQ',
      contact: 'Contact',
      emergency: 'Emergency 24/7',
      emergencyLine: 'Helpline available',
      copyright: 'All rights reserved',
      madeWith: 'Made with ❤️ for our patients',
      healthPriority: 'Your health, our priority. Together towards healing.',
      
      // Quote
      motivationQuote: '"Strength doesn\'t come from what you can do. It comes from overcoming the things you once thought you couldn\'t."',
      
      // Dashboard
      hello: 'Hello',
      overview: 'Overview',
      scheduled: 'Scheduled',
      active: 'Active',
      documents: 'Documents',
      unread: 'Unread',
      nextAppointments: 'Next Appointments',
      activePrescriptions: 'Active Prescriptions',
      viewAll: 'View All',
      noAppointments: 'No Appointments',
      noPrescriptions: 'No Prescriptions',
      takeAppointment: 'Book Appointment',
      noAppointmentYet: 'You don\'t have any scheduled appointments yet',
      myAppointments: 'My Appointments',
      
      // Medical Records
      downloadPDF: 'Download PDF',
      viewDetails: 'View Details',
      noRecords: 'No Records',
      noRecordsDesc: 'Your medical record is empty',
      
      // Prescriptions
      duration: 'Duration',
      noPrescriptionsDesc: 'You don\'t have any active prescriptions',
      
      // Messages
      noMessages: 'No messages',
      educationalResources: 'Educational Resources',
      understandCancer: 'Understanding Cancer',
      understandCancerDesc: 'Articles and videos about cancer types',
      nutrition: 'Nutrition and Cancer',
      nutritionDesc: 'Dietary advice and adapted recipes',
      psychSupport: 'Psychological Support',
      psychSupportDesc: 'Resources for mental well-being',
      physicalActivity: 'Physical Activity',
      physicalActivityDesc: 'Adapted exercises and recommendations',
      supportGroups: 'Support Groups',
      supportGroupsDesc: 'Join patient communities',
      medicalLibrary: 'Medical Library',
      medicalLibraryDesc: 'Access medical documents',
      consult: 'Consult',
      help: 'Help',
      privacy: 'Privacy',
      terms: 'Terms',
      allRightsReserved: 'All rights reserved',
      cancel: 'Cancel',
      save: 'Save',
      close: 'Close'
    },
    ar: {
      // Navigation
      home: 'الرئيسية',
      dashboard: 'لوحة التحكم',
      appointments: 'المواعيد',
      medical: 'السجل الطبي',
      prescriptions: 'الوصفات',
      messages: 'الرسائل',
      resources: 'الموارد',
      profile: 'الملف الشخصي',
      logout: 'تسجيل الخروج',
      
      // Hero
      welcome: 'مرحبا',
      heroSubtitle: 'معًا نحن أقوى. شجاعتك تلهمنا.',
      accessDashboard: 'الوصول إلى لوحة التحكم',
      
      // Sections
      hopeMessage: 'رسالة أمل',
      ourServices: 'خدماتنا',
      testimonials: 'شهادات ملهمة',
      
      // Videos
      video1Title: 'رسالة تحفيزية',
      video2Title: 'شهادة ملهمة',
      video3Title: 'نصائح المتخصصين',
      
      // Services
      appointmentsTitle: 'المواعيد',
      appointmentsDesc: 'حدد مواعيدك بسهولة',
      medicalTitle: 'السجل الطبي',
      medicalDesc: 'الوصول إلى مستنداتك عبر الإنترنت',
      prescriptionsTitle: 'الوصفات الطبية',
      prescriptionsDesc: 'إدارة وصفاتك الطبية',
      messagesTitle: 'الرسائل',
      messagesDesc: 'تواصل مع طبيبك',
      
      // Footer
      quickLinks: 'روابط سريعة',
      myProfile: 'ملفي الشخصي',
      faq: 'الأسئلة الشائعة',
      contact: 'اتصل بنا',
      emergency: 'طوارئ 24/7',
      emergencyLine: 'خط المساعدة متاح',
      copyright: 'جميع الحقوق محفوظة',
      madeWith: 'صنع بـ ❤️ لمرضانا',
      healthPriority: 'صحتك أولويتنا. معًا نحو الشفاء.',
      
      // Quote
      motivationQuote: '"القوة لا تأتي مما يمكنك فعله. إنها تأتي من التغلب على الأشياء التي كنت تعتقد أنك لا تستطيع فعلها."',
      
      // Dashboard
      hello: 'مرحبا',
      overview: 'نظرة عامة',
      scheduled: 'مجدول',
      active: 'نشط',
      documents: 'مستندات',
      unread: 'غير مقروء',
      nextAppointments: 'المواعيد القادمة',
      activePrescriptions: 'الوصفات النشطة',
      viewAll: 'عرض الكل',
      noAppointments: 'لا توجد مواعيد',
      noPrescriptions: 'لا توجد وصفات',
      takeAppointment: 'حجز موعد',
      noAppointmentYet: 'ليس لديك موعد مجدول بعد',
      
      // Resources
      educationalResources: 'الموارد التعليمية',
      understandCancer: 'فهم السرطان',
      understandCancerDesc: 'مقالات وفيديوهات حول أنواع السرطان وعلاجاته',
      nutrition: 'التغذية والسرطان',
      nutritionDesc: 'نصائح غذائية ووصفات مناسبة',
      psychSupport: 'الدعم النفسي',
      psychSupportDesc: 'موارد للرفاهية النفسية',
      physicalActivity: 'النشاط البدني',
      physicalActivityDesc: 'تمارين مناسبة وتوصيات',
      supportGroups: 'مجموعات الدعم',
      supportGroupsDesc: 'انضم إلى مجتمعات المرضى',
      medicalLibrary: 'المكتبة الطبية',
      medicalLibraryDesc: 'الوصول إلى المستندات الطبية',
      consult: 'استشر',
      
      // Footer Dashboard
      help: 'مساعدة',
      privacy: 'الخصوصية',
      terms: 'الشروط',
      allRightsReserved: 'جميع الحقوق محفوظة',
      
      // Appointments
      myAppointments: 'مواعيدي',
      
      // Medical Records
      downloadPDF: 'تحميل PDF',
      viewDetails: 'عرض التفاصيل',
      noRecords: 'لا توجد سجلات',
      noRecordsDesc: 'سجلك الطبي فارغ',
      
      // Prescriptions
      duration: 'المدة',
      noPrescriptionsDesc: 'ليس لديك وصفات نشطة',
      
      // Messages
      noMessages: 'لا توجد رسائل',
      
      // Common
      cancel: 'إلغاء',
      save: 'حفظ',
      close: 'إغلاق'
    }
  };

  constructor() {
    this.currentLang = localStorage.getItem('language') || 'fr';
  }

  setLanguage(lang: string) {
    this.currentLang = lang;
    localStorage.setItem('language', lang);
  }

  getLanguage(): string {
    return this.currentLang;
  }

  translate(key: string): string {
    return this.translations[this.currentLang][key] || key;
  }

  isRTL(): boolean {
    return this.currentLang === 'ar';
  }
}
