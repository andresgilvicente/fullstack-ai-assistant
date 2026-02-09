# DAS Monorepo - Sistema de IA con Django y Next.js

Monorepo completo para el proyecto DAS (Django AI System) que incluye frontend, backend y servicios de IA con Ollama.

## 📁 Estructura del Proyecto

```
monorepo/
├── frontend/              # Aplicación Next.js
│   ├── app/              # App router de Next.js
│   ├── components/       # Componentes React
│   ├── Dockerfile        # Docker para frontend
│   └── package.json
├── backend/              # API REST con Django
│   ├── restApi/         # Proyecto Django
│   ├── Dockerfile       # Docker para backend
│   └── pyproject.toml
├── docker-compose.yml   # Orquestación de servicios
└── .env.example         # Variables de entorno

```

## 🚀 Quick Start

### 1. Clonar y configurar

```bash
# Clonar el repositorio
git clone <repo-url>
cd monorepo

# Copiar archivo de variables de entorno
cp .env.example .env

# Editar .env y configurar los modelos que quieres descargar
# Por defecto usa: OLLAMA_MODELS=llama3.2:3b
```

### 2. Levantar todos los servicios

```bash
# Levantar toda la infraestructura
docker-compose up -d

# Ver logs
docker-compose logs -f

# Verificar que todo está corriendo
docker-compose ps
```

### 3. Esperar a que Ollama descargue los modelos

La primera vez, Ollama descargará los modelos especificados en `.env`. Esto puede tardar varios minutos dependiendo del tamaño del modelo.

```bash
# Ver progreso de descarga de modelos
docker-compose logs -f ollama-init
```

### 4. Acceder a los servicios

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/api/docs/
- **Django Admin:** http://localhost:8000/admin
- **Ollama API:** http://localhost:11434

## 🛠️ Servicios

### Frontend (Next.js)
- **Puerto:** 3000
- **Tecnologías:** Next.js 16, React 19, Material-UI, Tailwind CSS
- **Dockerfile:** `frontend/Dockerfile`

### Backend (Django)
- **Puerto:** 8000
- **Tecnologías:** Django 6.0, DRF, JWT Auth, PostgreSQL
- **Dockerfile:** `backend/Dockerfile`

### PostgreSQL
- **Puerto:** 5432
- **Database:** `das_db`
- **Usuario:** `das_user`
- **Password:** `das_password`

### Ollama (IA)
- **Puerto:** 11434
- **Modelos:** Configurables via `OLLAMA_MODELS` en `.env`
- **API:** http://localhost:11434/api

### Ollama Init
- Servicio de inicialización que descarga automáticamente los modelos configurados
- Se ejecuta una sola vez al inicio
- Configurable via variable `OLLAMA_MODELS`

## ⚙️ Configuración de Modelos de IA

Edita el archivo `.env` para configurar qué modelos descargar:

```bash
# Un solo modelo
OLLAMA_MODELS=llama3.2:3b

# Múltiples modelos (separados por comas)
OLLAMA_MODELS=llama3.2:3b,mistral:7b,codellama:7b
```

### Modelos Recomendados

| Modelo | Tamaño | Uso Recomendado |
|--------|--------|-----------------|
| `llama3.2:1b` | ~1GB | Más rápido, ideal para desarrollo |
| `llama3.2:3b` | ~3GB | Balance entre velocidad y capacidad |
| `llama3.2:7b` | ~7GB | Más capaz, requiere más recursos |
| `mistral:7b` | ~7GB | Excelente para tareas generales |
| `codellama:7b` | ~7GB | Optimizado para código |
| `phi3:mini` | ~2GB | Modelo pequeño de Microsoft |

## 🔧 Comandos Útiles

### Gestión de Servicios

```bash
# Levantar servicios específicos
docker-compose up -d frontend backend postgres

# Solo backend y base de datos
docker-compose up -d backend postgres

# Ver logs de un servicio específico
docker-compose logs -f backend

# Reiniciar un servicio
docker-compose restart backend

# Detener todo
docker-compose down

# Detener y eliminar volúmenes (¡cuidado! borra la DB)
docker-compose down -v
```

### Backend (Django)

```bash
# Ejecutar migraciones
docker-compose exec backend python restApi/manage.py migrate

# Crear superusuario
docker-compose exec backend python restApi/manage.py createsuperuser

# Acceder al shell de Django
docker-compose exec backend python restApi/manage.py shell

# Ver logs del backend
docker-compose logs -f backend
```

### PostgreSQL

```bash
# Conectarse a la base de datos
docker-compose exec postgres psql -U das_user -d das_db

# Backup de la base de datos
docker-compose exec postgres pg_dump -U das_user das_db > backup.sql

# Restaurar backup
docker-compose exec -T postgres psql -U das_user -d das_db < backup.sql

# Ver logs de PostgreSQL
docker-compose logs -f postgres
```

### Ollama

```bash
# Listar modelos instalados
docker-compose exec ollama ollama list

# Descargar un modelo manualmente
docker-compose exec ollama ollama pull llama3.2:3b

# Eliminar un modelo
docker-compose exec ollama ollama rm llama3.2:3b

# Probar un modelo
docker-compose exec ollama ollama run llama3.2:3b "Hola, ¿cómo estás?"

# Ver logs de Ollama
docker-compose logs -f ollama
```

### Reconstruir Servicios

```bash
# Reconstruir un servicio específico
docker-compose up -d --build backend

# Reconstruir todo
docker-compose up -d --build

# Forzar recreación de contenedores
docker-compose up -d --force-recreate
```

## 🔍 Desarrollo Local (sin Docker)

### Backend

```bash
cd backend

# Instalar dependencias
uv sync

# Activar entorno virtual
source .venv/bin/activate

# Ejecutar migraciones (usa SQLite por defecto)
cd restApi
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Ejecutar servidor
python manage.py runserver
```

### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Build de producción
npm run build
npm start
```

## 🌐 URLs de Desarrollo

### Servicios principales
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Django Admin:** http://localhost:8000/admin
- **API Documentation:** http://localhost:8000/api/docs/
- **API Schema:** http://localhost:8000/api/schema/

### Bases de datos
- **PostgreSQL:** localhost:5432

### IA
- **Ollama API:** http://localhost:11434
- **Ollama Health:** http://localhost:11434/api/tags

## 🔐 Seguridad

### Para Producción

1. **Cambiar credenciales de PostgreSQL:**
   ```bash
   POSTGRES_PASSWORD=<password-seguro>
   ```

2. **Cambiar SECRET_KEY de Django:**
   ```bash
   DJANGO_SECRET_KEY=<clave-segura-generada>
   ```

3. **Deshabilitar DEBUG:**
   ```bash
   DEBUG=False
   ```

4. **Configurar ALLOWED_HOSTS:**
   ```bash
   ALLOWED_HOSTS=tudominio.com,www.tudominio.com
   ```

5. **Usar HTTPS** en producción

6. **Configurar CORS correctamente** en el backend

## 📊 Monitoreo

### Verificar salud de los servicios

```bash
# Ver estado de todos los servicios
docker-compose ps

# Ver uso de recursos
docker stats

# Healthcheck de backend
curl http://localhost:8000/health/

# Healthcheck de Ollama
curl http://localhost:11434/api/tags
```

## 🐛 Troubleshooting

### El modelo no se descarga

```bash
# Ver logs del servicio de inicialización
docker-compose logs ollama-init

# Descargar manualmente
docker-compose exec ollama ollama pull llama3.2:3b
```

### Error de conexión a PostgreSQL

```bash
# Verificar que PostgreSQL está corriendo
docker-compose ps postgres

# Ver logs de PostgreSQL
docker-compose logs postgres

# Verificar healthcheck
docker-compose exec postgres pg_isready -U das_user -d das_db
```

### Backend no puede conectarse a Ollama

```bash
# Verificar que Ollama está corriendo
docker-compose ps ollama

# Probar conexión desde el backend
docker-compose exec backend curl http://ollama:11434/api/tags
```

### Puertos en uso

```bash
# Liberar puerto 3000, 8000, 5432 o 11434
# En Linux/Mac:
sudo lsof -ti:3000 | xargs kill -9

# En Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Reconstruir desde cero

```bash
# Detener todo y eliminar volúmenes
docker-compose down -v

# Eliminar imágenes
docker-compose down --rmi all

# Reconstruir y levantar
docker-compose up -d --build
```

## 📝 Variables de Entorno

Copia `.env.example` a `.env` y ajusta según tus necesidades:

```bash
# Modelos de IA
OLLAMA_MODELS=llama3.2:3b

# Base de datos
POSTGRES_DB=das_db
POSTGRES_USER=das_user
POSTGRES_PASSWORD=das_password

# Django
DJANGO_SECRET_KEY=change-this
DEBUG=True

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🧪 Testing

### Backend

```bash
# Ejecutar tests
docker-compose exec backend python restApi/manage.py test

# Con coverage
docker-compose exec backend coverage run --source='.' restApi/manage.py test
docker-compose exec backend coverage report
```

### Frontend

```bash
# Ejecutar tests (si están configurados)
docker-compose exec frontend npm test

# Lint
docker-compose exec frontend npm run lint
```

## 📚 Documentación Adicional

- [Frontend README](./frontend/README.md)
- [Backend README](./backend/README.md)
- [Ollama Documentation](https://ollama.ai/docs)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Next.js Documentation](https://nextjs.org/docs)

## 🤝 Contribuir

1. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
2. Commit tus cambios: `git commit -am 'Añadir nueva funcionalidad'`
3. Push a la rama: `git push origin feature/nueva-funcionalidad`
4. Crea un Pull Request

## 📄 Licencia

Este proyecto es parte del curso DAS de Comillas.

---

## 🎯 Próximos Pasos

Después de levantar los servicios:

1. ✅ Crear superusuario en Django
2. ✅ Verificar que los modelos de Ollama se descargaron
3. ✅ Probar la API desde http://localhost:8000/api/docs/
4. ✅ Verificar el frontend en http://localhost:3000
5. ✅ Integrar la comunicación frontend-backend
6. ✅ Implementar funcionalidades de chat con IA