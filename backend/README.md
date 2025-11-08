# 🐍 TuCitaSegura Backend - Python API

Backend API con FastAPI, Machine Learning, Computer Vision, y Analytics avanzados para TuCitaSegura.

## 🚀 Características

### ✨ Features Implementados

- **🤖 Machine Learning**
  - Sistema de recomendaciones inteligente
  - Predicción de compatibilidad
  - Collaborative filtering
  - Random Forest para matching

- **👁️ Computer Vision**
  - Verificación de fotos
  - Detección de rostros
  - Estimación de edad
  - Detección de filtros
  - Moderación de contenido (NSFW)

- **📊 Analytics Avanzados**
  - Predicción de revenue (Prophet)
  - Detección de churn risk
  - Cálculo de LTV (Lifetime Value)
  - Dashboards predictivos

- **🔒 Seguridad**
  - Detección de fraude
  - Análisis de comportamiento sospechoso
  - Rate limiting
  - JWT authentication

- **💬 NLP**
  - Moderación de mensajes
  - Detección de toxicidad
  - Análisis de sentimiento
  - Filtrado de información personal

- **📍 Geolocalización**
  - Sugerencias de lugares de encuentro
  - Verificación de ubicación
  - Cálculo de distancias
  - Integración Google Maps

## 📁 Estructura del Proyecto

```
backend/
├── app/
│   ├── api/              # Endpoints de la API
│   ├── core/             # Configuración y utilidades
│   │   └── config.py     # Settings y variables de entorno
│   ├── models/           # Modelos Pydantic
│   │   └── schemas.py    # Schemas de request/response
│   ├── services/         # Lógica de negocio
│   │   ├── ml/           # Machine Learning
│   │   │   └── recommendation_engine.py
│   │   ├── cv/           # Computer Vision
│   │   │   └── photo_verifier.py
│   │   ├── analytics/    # Business Analytics
│   │   ├── security/     # Fraud Detection
│   │   ├── nlp/          # NLP & Moderation
│   │   └── geo/          # Geolocation
│   └── utils/            # Utilidades compartidas
├── tests/                # Tests unitarios
├── models/               # ML models guardados
├── main.py               # FastAPI app principal
├── requirements.txt      # Dependencias Python
├── Dockerfile            # Docker image
├── docker-compose.yml    # Stack completo
└── .env.example          # Variables de entorno

```

## 🛠️ Instalación

### Opción 1: Docker (Recomendado)

```bash
# 1. Copiar variables de entorno
cp .env.example .env

# 2. Editar .env con tus credenciales
nano .env

# 3. Levantar todo el stack
docker-compose up -d

# 4. Ver logs
docker-compose logs -f api
```

La API estará disponible en: `http://localhost:8000`

Documentación interactiva: `http://localhost:8000/docs`

### Opción 2: Local (Development)

```bash
# 1. Crear entorno virtual
python3 -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Copiar variables de entorno
cp .env.example .env

# 4. Editar .env
nano .env

# 5. Instalar dependencias del sistema (OpenCV, etc.)
# Ubuntu/Debian:
sudo apt-get install python3-opencv

# macOS:
brew install opencv

# 6. Ejecutar la aplicación
uvicorn main:app --reload --port 8000
```

## 🔧 Configuración

### Variables de Entorno Esenciales

Edita `.env` con tus credenciales:

```bash
# Firebase
FIREBASE_PROJECT_ID=tu-proyecto-id
FIREBASE_PRIVATE_KEY_PATH=./serviceAccountKey.json

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/tucitasegura

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Google Maps
GOOGLE_MAPS_API_KEY=tu_api_key

# JWT
SECRET_KEY=genera-una-clave-secreta-segura
```

### Generar Secret Key

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## 📚 Documentación de API

### Endpoints Principales

#### 🤖 Machine Learning

**POST** `/api/v1/recommendations`
```json
{
  "user_id": "user123",
  "limit": 10,
  "filters": {
    "min_age": 25,
    "max_age": 35,
    "city": "Madrid"
  }
}
```

**Response:**
```json
{
  "user_id": "user123",
  "recommendations": [
    {
      "user_id": "candidate456",
      "score": 0.89,
      "reasons": ["Intereses comunes: música, viajes", "Muy cerca de ti"]
    }
  ],
  "algorithm": "RandomForest + Collaborative Filtering",
  "generated_at": "2025-11-08T10:30:00Z"
}
```

#### 👁️ Computer Vision

**POST** `/api/v1/verify-photo`
```json
{
  "image_url": "https://example.com/photo.jpg",
  "user_id": "user123",
  "claimed_age": 28
}
```

**Response:**
```json
{
  "is_real_person": true,
  "has_excessive_filters": false,
  "is_appropriate": true,
  "estimated_age": 27,
  "confidence": 0.92,
  "faces_detected": 1,
  "warnings": []
}
```

#### 🔒 Fraud Detection

**POST** `/api/v1/fraud-check`
```json
{
  "user_id": "user123",
  "action": "create_account",
  "metadata": {
    "ip": "192.168.1.1",
    "device": "iPhone"
  }
}
```

#### 💬 Message Moderation

**POST** `/api/v1/moderate-message`
```json
{
  "message_text": "Hola, ¿cómo estás?",
  "sender_id": "user123",
  "receiver_id": "user456"
}
```

#### 📍 Geolocation

**POST** `/api/v1/suggest-meeting-spots`
```json
{
  "user1_location": {"lat": 40.4168, "lng": -3.7038},
  "user2_location": {"lat": 40.4200, "lng": -3.7050}
}
```

**POST** `/api/v1/verify-location`
```json
{
  "claimed_location": {"lat": 40.4168, "lng": -3.7038},
  "user_gps": {"lat": 40.4170, "lng": -3.7040},
  "tolerance_meters": 250
}
```

### Documentación Interactiva

Una vez ejecutando, visita:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## 🧪 Testing

```bash
# Ejecutar todos los tests
pytest

# Con cobertura
pytest --cov=app

# Tests específicos
pytest tests/test_recommendations.py

# Modo verbose
pytest -v
```

## 🚢 Deployment

### Railway (Recomendado)

1. Crear cuenta en [Railway.app](https://railway.app)
2. Conectar repositorio GitHub
3. Configurar variables de entorno
4. Deploy automático

```bash
# O con Railway CLI
railway login
railway init
railway up
```

### Render

1. Crear cuenta en [Render.com](https://render.com)
2. New Web Service → Connect repo
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Google Cloud Run

```bash
# 1. Build imagen
gcloud builds submit --tag gcr.io/PROJECT_ID/tucitasegura-api

# 2. Deploy
gcloud run deploy tucitasegura-api \
  --image gcr.io/PROJECT_ID/tucitasegura-api \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated
```

### AWS EC2

```bash
# 1. SSH al servidor
ssh -i key.pem ubuntu@your-ec2-ip

# 2. Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 3. Clonar repo
git clone https://github.com/your-repo/tucitasegura.git
cd tucitasegura/backend

# 4. Ejecutar con Docker Compose
docker-compose up -d
```

## 📊 Monitoreo

### Health Check

```bash
curl http://localhost:8000/health
```

### Logs

```bash
# Docker
docker-compose logs -f api

# Local
tail -f logs/app.log
```

### Métricas

Visita Flower (Celery monitoring):
```
http://localhost:5555
```

## 🔐 Seguridad

### Rate Limiting

```python
# Configurado en .env
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_PER_HOUR=1000
```

### CORS

```python
# Configurado en .env
CORS_ORIGINS=https://tucitasegura.com,https://www.tucitasegura.com
```

### Secrets Management

**NO** commitear:
- `.env`
- `serviceAccountKey.json`
- Claves de API
- Credenciales de base de datos

Usar:
- Railway Secrets
- Google Secret Manager
- AWS Secrets Manager
- HashiCorp Vault

## 🤝 Contribuir

```bash
# 1. Fork el repo
# 2. Crear branch
git checkout -b feature/nueva-funcionalidad

# 3. Commit cambios
git commit -m "feat: agregar nueva funcionalidad"

# 4. Push
git push origin feature/nueva-funcionalidad

# 5. Crear Pull Request
```

## 📝 Roadmap

### ✅ Completado
- [x] API FastAPI base
- [x] Sistema de recomendaciones ML
- [x] Verificación de fotos CV
- [x] Endpoints principales

### 🚧 En Progreso
- [ ] Integración completa con Firebase
- [ ] Entrenamiento de modelos ML
- [ ] Tests completos

### 📋 Planeado
- [ ] WebSockets para real-time
- [ ] GraphQL API
- [ ] Admin dashboard API
- [ ] Webhook handlers
- [ ] Batch processing
- [ ] Data pipeline

## 📄 Licencia

MIT License - Ver `LICENSE` file

## 💬 Soporte

- **Email:** soporte@tucitasegura.com
- **Discord:** https://discord.gg/tucitasegura
- **Issues:** https://github.com/your-repo/issues

---

**Hecho con ❤️ por el equipo de TuCitaSegura**
