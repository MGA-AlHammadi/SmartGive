# 👕 SmartGive: Interaktive Webanwendung zur gezielten Kleiderspenden Verwaltung

SmartGive ist ein im Rahmen der Bachelorarbeit entwickeltes System, das als digitale Schnittstelle zwischen Hilfsorganisationen (NGOs) und privaten Spendern fungiert. Das Ziel ist es, den Spendenprozess bedarfsorientiert, transparent und effizient zu gestalten.

## 🎯 Projektziel
Das Projekt adressiert das Problem der "blinden Spenden". Anstatt Kleidung wahllos abzugeben, ermöglicht SmartGive den NGOs, konkrete Bedarfslisten (z. B. 50 Winterjacken, Größe L) zu veröffentlichen. Spender können gezielt nach diesen Bedarfen suchen und ihre Güter direkt dort anbieten, wo sie aktuell am dringendsten benötigt werden.

---

## 🛠 Technologie-Stack
Die Anwendung basiert auf einer modernen Full-Stack-Architektur:

* Frontend: React.js mit Tailwind CSS für ein responsives und intuitives User Interface.
* Backend: Node.js (Express) zur Bereitstellung der REST-APIs.
* Datenbank: PostgreSQL zur strukturierten Speicherung von Nutzerdaten, Bedarfslisten und Spendenstatus.
* Sprachen: HTML5, CSS3, JavaScript.

---

## 🚀 Hauptfunktionen

### 🏢 Für Hilfsorganisationen (NGOs)
* Bedarfsmanagement: Erstellen, Aktualisieren und Löschen von spezifischen Bedarfen (Kategorie, Geschlecht, Größe, Menge).
* Angebotsverwaltung: Prüfung von Spendenangeboten, um Logistik- und Lagerüberschüsse zu vermeiden.
* Profilverwaltung: Darstellung der Organisation und deren Standort.

### 👤 Für private Spender
* Intelligente Suche & Filter: Suche nach Bedarfen basierend auf Kategorie, Größe oder Postleitzahl.
* Spender-Dashboard: Verfolgung des Spendenstatus (z. B. Ausstehend, Angenommen, Übergeben).
* Profil: Verwaltung der eigenen Spendenhistorie.

---

## 🏗 Projektstruktur
Das Repository ist wie folgt strukturiert:
* `/client`: Frontend-Anwendung (React & Tailwind).
* `/server`: Backend-Logik und API-Routen (Node.js).
* `/database`: Datenbank-Schemata und Migrationen (PostgreSQL).

---

## 🎓 Akademischer Kontext
Diese Arbeit ist Teil des Studiengangs Medieninformatik (B.Sc.)
an der Berliner Hochschule für Technik (BHT).
* Autor: Mohammad Al Hammadi
* Erstgutachter: Prof. Dr. Sven Graupner
* Zweitgutachterin: Prof. Dr. rer. nat. Heike Ripphausen-Lipa
* Bearbeitungszeitraum:** Mai 2026 – August 2026

---

## ⚙️ Installation und Setup
Um das Projekt lokal auszuführen, folge diesen Schritten:

### Voraussetzungen
* Node.js (v16+)
* npm oder yarn
* PostgreSQL (v12+)
* Git

### Schritt 1: Repository klonen
```bash
git clone https://github.com/MGA-AlHammadi/SmartGive.git
cd SmartGive
```

### Schritt 2: Datenbank einrichten
Stelle sicher, dass PostgreSQL läuft. Erstelle eine neue Datenbank:
```bash
createdb smartgive
```

Passe die Datenbankverbindung in einer `.env`-Datei im Backend-Ordner an:
```bash
cd Backend
cp .env.example .env  # Falls vorhanden, sonst manuell erstellen
```

Inhalte der `.env`-Datei:
```
DATABASE_URL=postgresql://username:password@localhost:5432/smartgive
JWT_SECRET=your_secret_key_here
NODE_ENV=development
PORT=5000
```

Starte die Datenbank-Migrationen:
```bash
npm run migrate
```

### Schritt 3: Backend installieren und starten
```bash
cd Backend
npm install
npm run dev
```
Backend läuft auf: `http://localhost:5000`

### Schritt 4: Frontend installieren und starten
In einem neuen Terminal:
```bash
cd Frontend
npm install
npm run dev
```
Frontend läuft auf: `http://localhost:5173`

### Schritt 5: Tests ausführen (optional)
```bash
cd Backend
npm test
```

---

## 📖 Verwendung

### Admin erstellen
Für Admin-Funktionen (NGO-Verifizierung) ein Admin-Konto anlegen:
```bash
cd Backend
npm run create:admin
```

### Verfügbare Scripts

**Backend:**
* `npm run dev` – Startet den Server mit Nodemon
* `npm test` – Führt Unit-Tests durch
* `npm run migrate` – Startet Datenbank-Migrationen
* `npm run create:admin` – Erstellt ein Admin-Konto

**Frontend:**
* `npm run dev` – Startet den Vite-Dev-Server
* `npm run build` – Erstellt einen Production Build
* `npm run preview` – Zeigt den Build lokal an

---

## 🔗 API-Dokumentation

Die wichtigsten Endpoints sind:

### Authentifizierung
* `POST /api/auth/login` – Login
* `POST /api/auth/register` – Registrierung
* `GET /api/auth/me` – Profil des aktuellen Benutzers

### NGO-Management
* `GET /api/admin/ngo/pending` – Ausstehende NGO-Verifizierungen
* `POST /api/admin/ngo/verify/:ngoId` – NGO verifizieren

### Bedarfe (Needs)
* `GET /api/needs` – Alle Bedarfe abrufen
* `POST /api/needs` – Neuen Bedarf erstellen
* `GET /api/needs/:id` – Bedarf Details

### Spenden (Donations)
* `GET /api/donations` – Alle Spenden
* `POST /api/donations` – Neue Spende erstellen

---
