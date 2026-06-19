# FutureKawa — Back-end (suivi des stocks & conditions de stockage IoT)

Projet MSPR — Bloc 4 (RNCP 35584). Solution de suivi multi-pays des lots de café vert et des
conditions de stockage (température / humidité) remontées par capteurs IoT via MQTT, avec
consolidation au siège.

> État : **Phase 0 — Initialisation & infrastructure locale**. Le code métier (entités, services,
> API) sera ajouté à partir de la Phase 1.

## Arborescence du dépôt

```
futurekawa/
├── README.md
├── .gitignore
├── docs/                  # documentation technique & utilisateur
├── scripts/               # scripts utilitaires (seed, démo…)
├── infra/                 # infrastructure locale (Docker)
│   ├── docker-compose.yml # PostgreSQL + Mosquitto (MQTT) + Mailpit (faux SMTP)
│   ├── .env.example       # variables d'environnement (à copier en .env)
│   └── mosquitto/
│       └── mosquitto.conf
├── backend-pays/          # back-end "pays" (Spring Boot) — application principale
│   ├── pom.xml
│   └── src/main/...
├── backend-central/       # back-end "siège" (Spring Boot) — Phase 6 (vide pour l'instant)
└── simulateur/            # simulateur de capteurs MQTT — Phase 3 (vide pour l'instant)
```

## Prérequis

- **JDK 21** (LTS)
- **Maven 3.9+**
- **Docker** + **Docker Compose**

## Démarrer en local (ordre important)

1) **Lancer l'infrastructure** (base + broker + mail) :

```bash
cd infra
cp .env.example .env        # puis adapter le mot de passe si besoin
docker compose up -d
```

| Service    | Hôte:Port            | Usage                                   |
|------------|----------------------|-----------------------------------------|
| PostgreSQL | localhost:5432       | Base de données                         |
| Mosquitto  | localhost:1883       | Broker MQTT                             |
| Mailpit    | localhost:1025 (SMTP)| Réception des emails d'alerte           |
| Mailpit UI | http://localhost:8025| Visualiser les emails capturés          |

2) **Lancer le back-end pays** (depuis l'IDE ou en ligne de commande) :

```bash
cd backend-pays
./mvnw spring-boot:run        # profil "dev" par défaut (pointe sur localhost)
```

3) **Vérifier** :
- Santé : http://localhost:8080/actuator/health
- Documentation API (Swagger) : http://localhost:8080/swagger-ui.html

## Profils Spring

- `dev` (défaut) : services accessibles via `localhost` (app lancée hors conteneur).
- `docker` : services accessibles par leur nom de service (`postgres`, `mosquitto`, `mailpit`) —
  utilisé quand le back-end sera lui aussi conteneurisé (Phase 5).

## Conventions Git

- `main` : version stable et démontrable.
- Branches de fonctionnalité : `feat/<sujet>`, `fix/<sujet>`.
- Commits clairs et atomiques (ex. `feat(lot): endpoint enregistrement de lot`).
- **Aucun secret** dans le dépôt : tout mot de passe / hôte passe par variables d'environnement
  (`.env`, non versionné ; voir `.env.example`).
