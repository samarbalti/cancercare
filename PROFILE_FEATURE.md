# Fonctionnalité "Consulter Profil" - Documentation

## Vue d'ensemble
Ajout de la fonctionnalité permettant aux patients et aux docteurs de consulter et modifier leurs profils.

## Composants créés

### 1. Patient Profile
**Fichiers:**
- `cancer-care-frontend/src/app/patient/profile/profile.component.ts`
- `cancer-care-frontend/src/app/patient/profile/profile.html`
- `cancer-care-frontend/src/app/patient/profile/profile.css`

**Fonctionnalités:**
- Affichage des informations personnelles (nom, prénom, email, téléphone)
- Affichage des informations médicales (date de naissance, genre, groupe sanguin, taille, poids, allergies)
- Affichage du contact d'urgence
- Affichage du médecin traitant assigné
- Mode édition pour modifier les informations
- Sauvegarde des modifications via API

**Route:** `/patient/profile`

### 2. Doctor Profile
**Fichiers:**
- `cancer-care-frontend/src/app/doctor/profile/profile.component.ts`
- `cancer-care-frontend/src/app/doctor/profile/profile.component.html`
- `cancer-care-frontend/src/app/doctor/profile/profile.component.css`

**Fonctionnalités:**
- Affichage des informations personnelles (nom, prénom, email, téléphone)
- Affichage des informations professionnelles (spécialisation, licence, hôpital, département)
- Gestion des disponibilités (jours et horaires)
- Modification de la biographie
- Langues parlées
- Frais de consultation
- Statistiques (nombre de patients, statut vérifié, note moyenne)
- Mode édition pour modifier les informations
- Sauvegarde des modifications via API

**Route:** `/doctor/profile`

## Modifications apportées

### Routes
**patient-routing.module.ts:**
```typescript
{ path: 'dashboard', component: DashboardComponent },
{ path: 'profile', component: ProfileComponent },
{ path: '', redirectTo: 'dashboard', pathMatch: 'full' }
```

**doctor-routing.module.ts:**
```typescript
{ path: 'dashboard', component: DashboardComponent },
{ path: 'profile', component: DoctorProfileComponent },
{ path: '', redirectTo: 'dashboard', pathMatch: 'full' }
```

### Dashboards
**Modifications dans les deux dashboards:**
- Ajout d'un bouton "Mon Profil" dans le header
- Ajout de la méthode `viewProfile()` qui navigue vers la page de profil
- Import du Router pour la navigation

## API Backend (déjà existante)

### Patient
- **GET** `/api/patient/profile` - Récupérer le profil
- **PUT** `/api/patient/profile` - Mettre à jour le profil

### Doctor
- **GET** `/api/doctor/profile` - Récupérer le profil
- **PUT** `/api/doctor/profile` - Mettre à jour le profil

## Utilisation

### Pour les patients:
1. Se connecter en tant que patient
2. Cliquer sur "Mon Profil" dans le header du dashboard
3. Consulter les informations
4. Cliquer sur "Modifier" pour éditer
5. Modifier les champs souhaités
6. Cliquer sur "Enregistrer" pour sauvegarder

### Pour les docteurs:
1. Se connecter en tant que docteur
2. Cliquer sur "Mon Profil" dans le header du dashboard
3. Consulter les informations
4. Cliquer sur "Modifier" pour éditer
5. Modifier les champs souhaités (y compris les disponibilités)
6. Cliquer sur "Enregistrer" pour sauvegarder

## Champs modifiables

### Patient:
- Date de naissance
- Genre
- Groupe sanguin
- Taille
- Poids
- Allergies
- Contact d'urgence (nom, relation, téléphone)

### Docteur:
- Spécialisation
- Hôpital
- Département
- Biographie
- Disponibilités (jours et horaires)
- Durée de consultation
- Langues parlées
- Frais de consultation

## Notes techniques
- Les composants utilisent `standalone: true` (Angular 18)
- Imports nécessaires: `CommonModule`, `FormsModule`, `HttpClient`
- Authentification via token JWT stocké dans localStorage
- Gestion des erreurs avec messages d'alerte
- Design responsive avec CSS Grid
- Les informations personnelles de base (nom, prénom, email) ne sont pas modifiables depuis le profil patient (sécurité)
