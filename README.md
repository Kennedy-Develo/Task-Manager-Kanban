# 🚀 Guia Completo: Task Manager Kanban - Do Zero ao Deploy

> **Para quem é este guia?**
> Desenvolvedor júnior que precisa construir um sistema de gerenciamento de tarefas do zero, com Laravel, Vue e Docker. Este guia te ensina não apenas o "como fazer", mas o "por que fazer".

## 📋 Índice

1. [Entendendo o Projeto](#entendendo-o-projeto)
2. [Preparação do Ambiente](#preparação-do-ambiente)
3. [Fase 1: Setup Inicial](#fase-1-setup-inicial)
4. [Fase 2: Backend Laravel](#fase-2-backend-laravel)
5. [Fase 3: Frontend Vue](#fase-3-frontend-vue)
6. [Fase 4: Integração e Testes](#fase-4-integração-e-testes)
7. [Fase 5: Refatorações e Melhorias](#fase-5-refatorações-e-melhorias)
8. [Commits Semânticos](#commits-semânticos)
9. [Dicas para Entrevista](#dicas-para-entrevista)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Entendendo o Projeto

### O que vamos construir?

Um **Task Manager estilo Kanban** onde você pode:
- Criar projetos
- Adicionar tarefas aos projetos
- Mover tarefas entre colunas (Pendente → Em Andamento → Concluído)
- Deletar projetos e tarefas
- Ver estatísticas em tempo real

### Stack Tecnológica

**Backend:**
- **Laravel 12.x** (versão dev-master) - Por quê? Para usar as features mais recentes
- **MySQL 8.0** - Banco de dados relacional robusto
- **Service Layer Pattern** - Separação de responsabilidades

**Frontend:**
- **Vue 3.5.14** (versão mais recente) - Framework progressivo
- **Vite 6.0** - Build tool super rápido
- **Pinia** - State management moderno
- **Tailwind CSS** - Estilização rápida e responsiva
- **vuedraggable** - Drag and drop

**DevOps:**
- **Docker Compose** - Orquestração de containers
- **phpMyAdmin** - Gerenciar banco via interface web

### Arquitetura

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Frontend      │      │    Backend      │      │    Database     │
│   Vue 3 + Vite  │ ───▶ │  Laravel API    │ ───▶ │     MySQL       │
│   Port: 5173    │      │  Port: 8000     │      │   Port: 3306    │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

---

## 🛠 Preparação do Ambiente

### Ferramentas Necessárias

```bash
# Verificar instalações
docker --version          # Docker 20+
docker-compose --version  # Docker Compose 2+
git --version            # Git 2+
node --version           # Node 18+ ou 20+
```

### Se não tiver instalado:

**macOS:**
```bash
brew install docker docker-compose git node
```

**Linux:**
```bash
sudo apt update
sudo apt install docker.io docker-compose git nodejs npm
```

**Windows:**
- Instalar Docker Desktop
- Instalar Git for Windows
- Instalar Node.js LTS

---

## 📁 Fase 1: Setup Inicial

### Passo 1.1: Criar Estrutura de Pastas

```bash
# Criar diretório do projeto
mkdir task-manager
cd task-manager

# Inicializar Git
git init
git branch -m main
```

**💡 Conceito:** Sempre use `main` como branch principal (convenção moderna).

**Commit:**
```bash
git commit --allow-empty -m "chore: inicializar repositório"
```

### Passo 1.2: Criar .gitignore

Crie o arquivo `.gitignore` na raiz:

```gitignore
# Laravel
/backend/vendor/
/backend/node_modules/
/backend/.env
/backend/storage/*.key
/backend/storage/logs/*
!/backend/storage/logs/.gitkeep
/backend/bootstrap/cache/*
!/backend/bootstrap/cache/.gitkeep

# Vue
/frontend/node_modules/
/frontend/dist/
/frontend/.env.local
/frontend/.env.*.local

# Docker
mysql_data/

# IDE
.idea/
.vscode/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db
```

**💡 Por quê?** Arquivos ignorados: dependências (podem ser reinstaladas), credenciais (segurança), caches, e arquivos de IDE/OS.

**Commit:**
```bash
git add .gitignore
git commit -m "chore: adicionar .gitignore para Laravel, Vue e Docker"
```

### Passo 1.3: Criar docker-compose.yml

Crie o arquivo `docker-compose.yml` na raiz:

```yaml
version: '3.8'

services:
  # MySQL Database
  mysql:
    image: mysql:8.0
    container_name: task_manager_mysql
    restart: unless-stopped
    environment:
      MYSQL_DATABASE: task_manager
      MYSQL_ROOT_PASSWORD: root
      MYSQL_USER: laravel
      MYSQL_PASSWORD: laravel
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - task_manager_network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Laravel Backend
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: task_manager_backend
    restart: unless-stopped
    working_dir: /var/www
    volumes:
      - ./backend:/var/www
      - ./backend/vendor:/var/www/vendor
    ports:
      - "8000:8000"
    environment:
      DB_HOST: mysql
      DB_PORT: 3306
      DB_DATABASE: task_manager
      DB_USERNAME: laravel
      DB_PASSWORD: laravel
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - task_manager_network
    command: >
      sh -c "composer install &&
             php artisan key:generate &&
             php artisan migrate --force &&
             php artisan db:seed --force &&
             php artisan serve --host=0.0.0.0 --port=8000"

  # Vue Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: task_manager_frontend
    restart: unless-stopped
    working_dir: /app
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://localhost:8000
    depends_on:
      - backend
    networks:
      - task_manager_network
    command: npm run dev -- --host

  # phpMyAdmin - Database Admin Interface
  phpmyadmin:
    image: phpmyadmin:latest
    container_name: task_manager_phpmyadmin
    restart: unless-stopped
    ports:
      - "8080:80"
    environment:
      PMA_HOST: mysql
      PMA_PORT: 3306
      PMA_USER: laravel
      PMA_PASSWORD: laravel
      MYSQL_ROOT_PASSWORD: root
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - task_manager_network

volumes:
  mysql_data:
    driver: local

networks:
  task_manager_network:
    driver: bridge
```

**💡 Conceitos Importantes:**

1. **healthcheck no MySQL**: Garante que o backend só inicie quando o banco estiver pronto
2. **volumes**: Persiste dados do MySQL e sincroniza código em tempo real
3. **networks**: Containers se comunicam pelo nome (ex: `mysql`, `backend`)
4. **command no backend**: Automatiza setup inicial (install, migrate, seed, serve)

**Commit:**
```bash
git add docker-compose.yml
git commit -m "feat: configurar docker-compose com MySQL, Laravel, Vue e phpMyAdmin"
```

---

## 🔧 Fase 2: Backend Laravel

### Passo 2.1: Criar Estrutura do Backend

```bash
# Criar pasta backend
mkdir backend
cd backend
```

### Passo 2.2: Instalar Laravel (versão dev-master)

**Opção 1: Via Composer (se tiver instalado localmente):**
```bash
composer create-project laravel/laravel:dev-master . --no-interaction
```

**Opção 2: Via Docker (se não tiver Composer):**
```bash
docker run --rm -v $(pwd):/app composer create-project laravel/laravel:dev-master . --no-interaction
```

**💡 Por que dev-master?** Para usar as features mais recentes do Laravel 12.

### Passo 2.3: Criar Dockerfile do Backend

Crie `backend/Dockerfile`:

```dockerfile
FROM php:8.3-fpm

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip

# Instalar extensões PHP
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configurar working directory
WORKDIR /var/www

# Copiar arquivos
COPY . /var/www

# Dar permissões
RUN chown -R www-data:www-data /var/www

# Expor porta
EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
```

**💡 O que cada parte faz:**
- **FROM**: Imagem base (PHP 8.3 com FPM)
- **RUN apt-get**: Instala dependências do sistema
- **docker-php-ext-install**: Extensões PHP necessárias para Laravel
- **COPY --from composer**: Pega o Composer de outra imagem
- **chown**: Dá permissões corretas aos arquivos

### Passo 2.4: Configurar .env do Backend

Edite `backend/.env`:

```env
APP_NAME="Task Manager"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=task_manager
DB_USERNAME=laravel
DB_PASSWORD=laravel

# CORS para aceitar requisições do frontend
SANCTUM_STATEFUL_DOMAINS=localhost:5173
SESSION_DRIVER=file
SESSION_DOMAIN=localhost
```

**💡 Importante:** `DB_HOST=mysql` porque é o nome do service no docker-compose!

**Commit:**
```bash
git add backend/
git commit -m "feat(backend): configurar Laravel 12.x com Docker e MySQL"
```

### Passo 2.5: Criar Models e Migrations

**Model Project:**
```bash
cd backend
php artisan make:model Project -m
```

Edite `backend/app/Models/Project.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasFactory;

    protected $fillable = ['name'];

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }
}
```

Edite `backend/database/migrations/xxxx_create_projects_table.php`:

```php
public function up(): void
{
    Schema::create('projects', function (Blueprint $table) {
        $table->id();
        $table->string('name')->unique();
        $table->timestamps();
    });
}
```

**💡 Conceito:** `unique()` garante que não teremos dois projetos com o mesmo nome.

**Model Status:**
```bash
php artisan make:model Status -m
```

Edite `backend/app/Models/Status.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Status extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'color',
        'order',
    ];

    protected $casts = [
        'order' => 'integer',
    ];
}
```

Edite a migration:

```php
public function up(): void
{
    Schema::create('statuses', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('slug')->unique();
        $table->string('color')->default('bg-gray-400');
        $table->integer('order')->default(0);
        $table->timestamps();
    });
}
```

**💡 Por que ter tabela de Status?** Flexibilidade! Podemos adicionar novos status sem alterar código.

**Model Task:**
```bash
php artisan make:model Task -m
```

Edite `backend/app/Models/Task.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'titulo',
        'descricao',
        'status',
        'project_id',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
```

Edite a migration:

```php
public function up(): void
{
    Schema::create('tasks', function (Blueprint $table) {
        $table->id();
        $table->string('titulo');
        $table->text('descricao')->nullable();
        $table->string('status')->default('pending');
        $table->foreignId('project_id')->constrained()->onDelete('cascade');
        $table->timestamps();
    });
}
```

**💡 Conceito:** `onDelete('cascade')` significa que quando deletar um projeto, todas as tarefas dele serão deletadas automaticamente.

**Commit:**
```bash
git add app/Models/ database/migrations/
git commit -m "feat(backend): criar models Project, Task e Status com relacionamentos"
```

### Passo 2.6: Criar Seeders

```bash
php artisan make:seeder StatusSeeder
```

Edite `backend/database/seeders/StatusSeeder.php`:

```php
<?php

namespace Database\Seeders;

use App\Models\Status;
use Illuminate\Database\Seeder;

class StatusSeeder extends Seeder
{
    public function run(): void
    {
        $statuses = [
            ['name' => 'Pendente', 'slug' => 'pending', 'color' => 'bg-yellow-400', 'order' => 1],
            ['name' => 'Em Andamento', 'slug' => 'in_progress', 'color' => 'bg-blue-400', 'order' => 2],
            ['name' => 'Concluído', 'slug' => 'completed', 'color' => 'bg-green-400', 'order' => 3],
        ];

        foreach ($statuses as $status) {
            Status::updateOrCreate(
                ['slug' => $status['slug']],
                $status
            );
        }
    }
}
```

Edite `backend/database/seeders/DatabaseSeeder.php`:

```php
public function run(): void
{
    $this->call([
        StatusSeeder::class,
    ]);
}
```

**💡 Por que cores no banco?** Para o frontend ser dinâmico! Podemos mudar cores sem alterar código Vue.

**Commit:**
```bash
git add database/seeders/
git commit -m "feat(backend): criar seeder para popular status iniciais"
```

### Passo 2.7: Service Layer (Arquitetura Limpa)

**Por que Service Layer?**
Controllers devem apenas receber requisições e retornar respostas. A lógica de negócio fica nos Services.

```bash
mkdir app/Services
```

**ProjectService:**

Crie `backend/app/Services/ProjectService.php`:

```php
<?php

namespace App\Services;

use App\Models\Project;
use Illuminate\Database\Eloquent\Collection;

class ProjectService
{
    public function getAllProjects(): Collection
    {
        return Project::withCount('tasks')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function createProject(array $data): Project
    {
        return Project::create($data);
    }

    public function deleteProject(Project $project): bool
    {
        return $project->delete();
    }

    public function findProject(int $id): ?Project
    {
        return Project::find($id);
    }
}
```

**TaskService:**

Crie `backend/app/Services/TaskService.php`:

```php
<?php

namespace App\Services;

use App\Models\Task;
use App\Models\Project;
use App\Models\Status;
use Illuminate\Database\Eloquent\Collection;

class TaskService
{
    public function getTasksByProject(Project $project): Collection
    {
        return $project->tasks()
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function createTask(array $data): Task
    {
        // Define status padrão se não fornecido (busca o primeiro status da tabela)
        if (!isset($data['status'])) {
            $firstStatus = Status::orderBy('order')->first();
            $data['status'] = $firstStatus ? $firstStatus->slug : 'pending';
        }

        return Task::create($data);
    }

    public function updateTask(Task $task, array $data): Task
    {
        $task->update($data);
        return $task->fresh();
    }

    public function deleteTask(Task $task): bool
    {
        return $task->delete();
    }
}
```

**StatusService:**

Crie `backend/app/Services/StatusService.php`:

```php
<?php

namespace App\Services;

use App\Models\Status;
use Illuminate\Database\Eloquent\Collection;

class StatusService
{
    public function getAllStatuses(): Collection
    {
        return Status::orderBy('order')->get();
    }
}
```

**💡 Benefícios do Service Layer:**
1. **Testável**: Fácil de testar isoladamente
2. **Reutilizável**: Mesma lógica pode ser usada em diferentes controllers
3. **Manutenível**: Lógica de negócio em um só lugar
4. **SOLID**: Segue o princípio da Responsabilidade Única

**Commit:**
```bash
git add app/Services/
git commit -m "feat(backend): implementar Service Layer para separação de responsabilidades"
```

### Passo 2.8: Form Requests (Validação)

```bash
php artisan make:request StoreProjectRequest
php artisan make:request StoreTaskRequest
php artisan make:request UpdateTaskRequest
```

**StoreProjectRequest:**

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:projects,name',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'O nome do projeto é obrigatório.',
            'name.unique' => 'Já existe um projeto com este nome.',
            'name.max' => 'O nome deve ter no máximo 255 caracteres.',
        ];
    }
}
```

**StoreTaskRequest:**

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'status' => 'nullable|string|in:pending,in_progress,completed',
            'project_id' => 'required|exists:projects,id',
        ];
    }

    public function messages(): array
    {
        return [
            'titulo.required' => 'O título é obrigatório.',
            'project_id.required' => 'O projeto é obrigatório.',
            'project_id.exists' => 'O projeto informado não existe.',
        ];
    }
}
```

**UpdateTaskRequest:**

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo' => 'sometimes|string|max:255',
            'descricao' => 'sometimes|nullable|string',
            'status' => 'sometimes|string|in:pending,in_progress,completed',
            'project_id' => 'sometimes|exists:projects,id',
        ];
    }
}
```

**💡 Por que Form Requests?**
- **Validação centralizada**: Regras em um só lugar
- **Mensagens customizadas**: Erros amigáveis
- **Clean Controller**: Controller fica limpo

**Commit:**
```bash
git add app/Http/Requests/
git commit -m "feat(backend): adicionar Form Requests para validação de dados"
```

### Passo 2.9: Controllers

```bash
php artisan make:controller ProjectController --api
php artisan make:controller TaskController --api
php artisan make:controller StatusController --api
```

**ProjectController:**

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectRequest;
use App\Models\Project;
use App\Services\ProjectService;
use Illuminate\Http\JsonResponse;

class ProjectController extends Controller
{
    public function __construct(
        private ProjectService $projectService
    ) {}

    public function index(): JsonResponse
    {
        $projects = $this->projectService->getAllProjects();
        return response()->json($projects);
    }

    public function store(StoreProjectRequest $request): JsonResponse
    {
        $project = $this->projectService->createProject($request->validated());
        return response()->json($project, 201);
    }

    public function destroy(Project $project): JsonResponse
    {
        $this->projectService->deleteProject($project);
        return response()->json(['message' => 'Projeto deletado com sucesso.'], 200);
    }
}
```

**TaskController:**

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Models\Project;
use App\Models\Task;
use App\Services\TaskService;
use Illuminate\Http\JsonResponse;

class TaskController extends Controller
{
    public function __construct(
        private TaskService $taskService
    ) {}

    public function index(Project $project): JsonResponse
    {
        $tasks = $this->taskService->getTasksByProject($project);
        return response()->json($tasks);
    }

    public function store(StoreTaskRequest $request): JsonResponse
    {
        $task = $this->taskService->createTask($request->validated());
        return response()->json($task, 201);
    }

    public function update(UpdateTaskRequest $request, Task $task): JsonResponse
    {
        $task = $this->taskService->updateTask($task, $request->validated());
        return response()->json($task);
    }

    public function destroy(Task $task): JsonResponse
    {
        $this->taskService->deleteTask($task);
        return response()->json(['message' => 'Tarefa deletada com sucesso.'], 200);
    }
}
```

**StatusController:**

```php
<?php

namespace App\Http\Controllers;

use App\Services\StatusService;
use Illuminate\Http\JsonResponse;

class StatusController extends Controller
{
    public function __construct(
        private StatusService $statusService
    ) {}

    public function index(): JsonResponse
    {
        $statuses = $this->statusService->getAllStatuses();
        return response()->json($statuses);
    }
}
```

**💡 Dependency Injection:** Laravel automaticamente injeta os Services nos constructors!

**Commit:**
```bash
git add app/Http/Controllers/
git commit -m "feat(backend): criar controllers com injeção de dependência"
```

### Passo 2.10: Rotas da API

Edite `backend/routes/web.php`:

```php
<?php

use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\StatusController;
use Illuminate\Support\Facades\Route;

Route::prefix('api')->group(function () {
    // Projects
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy']);

    // Tasks
    Route::get('/projects/{project}/tasks', [TaskController::class, 'index']);
    Route::post('/tasks', [TaskController::class, 'store']);
    Route::put('/tasks/{task}', [TaskController::class, 'update']);
    Route::delete('/tasks/{task}', [TaskController::class, 'destroy']);

    // Statuses
    Route::get('/statuses', [StatusController::class, 'index']);
});
```

**💡 Route Model Binding:** Laravel automaticamente busca o model pela ID na URL!

### Passo 2.11: Configurar CORS

Edite `backend/config/cors.php`:

```php
return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:5173'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
```

### Passo 2.12: Desabilitar CSRF para API

Edite `backend/bootstrap/app.php`:

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->validateCsrfTokens(except: [
        'api/*',
    ]);
})
```

**💡 Por quê?** APIs RESTful geralmente usam tokens (JWT, Bearer) em vez de CSRF tokens.

**Commit:**
```bash
git add routes/ config/ bootstrap/
git commit -m "feat(backend): configurar rotas API, CORS e desabilitar CSRF"
```

**🎉 BACKEND COMPLETO!**

---

## 🎨 Fase 3: Frontend Vue

### Passo 3.1: Criar Estrutura do Frontend

```bash
cd ..  # Voltar para raiz
mkdir frontend
cd frontend
```

### Passo 3.2: Criar package.json

Crie `frontend/package.json`:

```json
{
  "name": "task-manager-frontend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.5.14",
    "vue-router": "^4.5.0",
    "pinia": "^2.3.0",
    "axios": "^1.7.9",
    "vuedraggable": "^4.1.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.2.1",
    "vite": "^6.0.11",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17"
  }
}
```

**💡 Dependências:**
- **vue-router**: Navegação entre páginas
- **pinia**: State management (substituto do Vuex)
- **axios**: Cliente HTTP
- **vuedraggable**: Drag and drop
- **tailwindcss**: CSS utilitário

### Passo 3.3: Criar Dockerfile do Frontend

Crie `frontend/Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
```

### Passo 3.4: Instalar Dependências

```bash
npm install
```

**Commit:**
```bash
cd ..  # Voltar para raiz
git add frontend/package.json frontend/Dockerfile
git commit -m "feat(frontend): configurar Vue 3 com Vite e dependências"
```

### Passo 3.5: Configurar Vite

Crie `frontend/vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true
    }
  }
})
```

**💡 Conceitos:**
- **alias @**: Permite importar com `@/components` em vez de `../../components`
- **usePolling**: Necessário para hot reload funcionar no Docker

### Passo 3.6: Configurar Tailwind CSS

Crie `frontend/tailwind.config.js`:

```javascript
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  safelist: [
    // Cores de status (vindas dinamicamente do banco de dados)
    'bg-yellow-400',
    'bg-blue-400',
    'bg-green-400',
    'bg-red-400',
    'bg-purple-400',
    'bg-pink-400',
    'bg-indigo-400',
    'bg-orange-400',
    'bg-teal-400',
    'bg-cyan-400',
    'bg-gray-400',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**💡 Safelist:** Garante que classes dinâmicas (vindas do banco) sejam incluídas no CSS compilado.

Crie `frontend/postcss.config.js`:

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### Passo 3.7: Criar index.html

Crie `frontend/index.html`:

```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <link rel="icon" href="/favicon.ico">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Task Manager - Kanban Board</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

**Commit:**
```bash
git add frontend/vite.config.js frontend/tailwind.config.js frontend/postcss.config.js frontend/index.html
git commit -m "feat(frontend): configurar Vite, Tailwind CSS e PostCSS"
```

### Passo 3.8: Estrutura de Pastas do Frontend

```bash
cd frontend
mkdir -p src/{components,views,stores,services,router,assets}
```

### Passo 3.9: Criar main.js (Entry Point)

Crie `frontend/src/main.js`:

```javascript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
```

### Passo 3.10: Criar CSS Global

Crie `frontend/src/assets/main.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background-color: #f5f5f5;
}

#app {
  height: 100vh;
  overflow: hidden;
}
```

### Passo 3.11: Service de API (axios)

Crie `frontend/src/services/api.js`:

```javascript
import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Projects API
export const projectsAPI = {
  getAll: () => apiClient.get('/api/projects'),
  create: (data) => apiClient.post('/api/projects', data),
  delete: (id) => apiClient.delete(`/api/projects/${id}`),
}

// Tasks API
export const tasksAPI = {
  getByProject: (projectId) => apiClient.get(`/api/projects/${projectId}/tasks`),
  create: (data) => apiClient.post('/api/tasks', data),
  update: (id, data) => apiClient.put(`/api/tasks/${id}`, data),
  delete: (id) => apiClient.delete(`/api/tasks/${id}`),
}

// Statuses API
export const statusesAPI = {
  getAll: () => apiClient.get('/api/statuses'),
}

export default apiClient
```

**💡 Por que separar?** Organização! Todas as chamadas de API em um só lugar.

**Commit:**
```bash
cd ..  # Voltar para raiz
git add frontend/src/
git commit -m "feat(frontend): configurar estrutura base e service de API"
```

### Passo 3.12: Pinia Store (State Management)

Crie `frontend/src/stores/taskStore.js`:

```javascript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { projectsAPI, tasksAPI, statusesAPI } from '@/services/api'

export const useTaskStore = defineStore('task', () => {
  // State
  const projects = ref([])
  const selectedProjectId = ref(null)
  const tasks = ref([])
  const statuses = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Computed
  const selectedProject = computed(() =>
    projects.value.find(p => p.id === selectedProjectId.value)
  )

  const tasksByStatus = computed(() => {
    const grouped = {}
    statuses.value.forEach(status => {
      grouped[status.slug] = tasks.value.filter(task => task.status === status.slug)
    })
    return grouped
  })

  // Actions
  async function loadProjects() {
    try {
      loading.value = true
      error.value = null
      const response = await projectsAPI.getAll()
      projects.value = response.data
    } catch (err) {
      error.value = 'Erro ao carregar projetos'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createProject(name) {
    try {
      loading.value = true
      error.value = null
      const response = await projectsAPI.create({ name })
      const projectWithCount = { ...response.data, tasks_count: 0 }
      projects.value.push(projectWithCount)
      return projectWithCount
    } catch (err) {
      error.value = 'Erro ao criar projeto'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteProject(projectId) {
    try {
      loading.value = true
      error.value = null
      await projectsAPI.delete(projectId)
      projects.value = projects.value.filter(p => p.id !== projectId)

      if (selectedProjectId.value === projectId) {
        selectedProjectId.value = null
        tasks.value = []
      }
    } catch (err) {
      error.value = 'Erro ao deletar projeto'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function loadTasks(projectId) {
    try {
      loading.value = true
      error.value = null
      selectedProjectId.value = projectId
      const response = await tasksAPI.getByProject(projectId)
      tasks.value = response.data

      // Atualizar contador do projeto
      const project = projects.value.find(p => p.id === projectId)
      if (project) {
        project.tasks_count = response.data.length
      }
    } catch (err) {
      error.value = 'Erro ao carregar tarefas'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createTask(taskData) {
    try {
      loading.value = true
      error.value = null

      const defaultStatus = statuses.value.length > 0 ? statuses.value[0].slug : undefined

      const response = await tasksAPI.create({
        ...taskData,
        project_id: selectedProjectId.value,
        status: taskData.status || defaultStatus
      })
      tasks.value.push(response.data)

      // Atualizar contador do projeto
      const project = projects.value.find(p => p.id === selectedProjectId.value)
      if (project) {
        project.tasks_count = (project.tasks_count || 0) + 1
      }

      return response.data
    } catch (err) {
      error.value = 'Erro ao criar tarefa'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateTask(taskId, updates) {
    try {
      loading.value = true
      error.value = null
      const response = await tasksAPI.update(taskId, updates)
      const index = tasks.value.findIndex(t => t.id === taskId)
      if (index !== -1) {
        tasks.value[index] = response.data
      }
      return response.data
    } catch (err) {
      error.value = 'Erro ao atualizar tarefa'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteTask(taskId) {
    try {
      loading.value = true
      error.value = null
      await tasksAPI.delete(taskId)
      tasks.value = tasks.value.filter(t => t.id !== taskId)

      // Atualizar contador do projeto
      const project = projects.value.find(p => p.id === selectedProjectId.value)
      if (project && project.tasks_count > 0) {
        project.tasks_count -= 1
      }
    } catch (err) {
      error.value = 'Erro ao deletar tarefa'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function loadStatuses() {
    try {
      loading.value = true
      error.value = null
      const response = await statusesAPI.getAll()
      statuses.value = response.data
    } catch (err) {
      error.value = 'Erro ao carregar statuses'
      console.error('Failed to load statuses from API:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    projects,
    selectedProjectId,
    selectedProject,
    tasks,
    statuses,
    tasksByStatus,
    loading,
    error,
    // Actions
    loadProjects,
    createProject,
    deleteProject,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    loadStatuses
  }
})
```

**💡 Pinia Store:**
- **State**: Dados reativos
- **Computed**: Valores derivados (calculados automaticamente)
- **Actions**: Funções que modificam o state

**Commit:**
```bash
git add frontend/src/stores/
git commit -m "feat(frontend): implementar Pinia store com gerenciamento de estado"
```

### Passo 3.13: Router (Vue Router)

Crie `frontend/src/router/index.js`:

```javascript
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    }
  ]
})

export default router
```

### Passo 3.14: Componentes Vue

**App.vue (Componente Raiz):**

Crie `frontend/src/App.vue`:

```vue
<template>
  <div id="app">
    <header class="bg-blue-600 text-white shadow-lg">
      <div class="container mx-auto px-4 py-4">
        <h1 class="text-2xl font-bold">Task Manager - Kanban Board</h1>
      </div>
    </header>
    <RouterView />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
</script>

<style scoped>
header {
  position: sticky;
  top: 0;
  z-index: 100;
}
</style>
```

**HomeView.vue (View Principal):**

Crie `frontend/src/views/HomeView.vue`:

```vue
<template>
  <div class="home-view flex h-screen pt-16">
    <!-- Sidebar com projetos -->
    <aside class="w-80 bg-white border-r border-gray-200 overflow-y-auto">
      <ProjectList />
    </aside>

    <!-- Main content - Kanban Board -->
    <main class="flex-1 overflow-auto">
      <TaskBoard v-if="store.selectedProjectId" />
      <div v-else class="flex items-center justify-center h-full text-gray-400">
        <div class="text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Selecione um projeto</h3>
          <p class="mt-1 text-sm text-gray-500">Escolha um projeto na barra lateral ou crie um novo.</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import ProjectList from '@/components/ProjectList.vue'
import TaskBoard from '@/components/TaskBoard.vue'

const store = useTaskStore()

onMounted(async () => {
  await store.loadProjects()
  await store.loadStatuses()
})
</script>
```

**ProjectList.vue:**

Crie `frontend/src/components/ProjectList.vue`:

```vue
<template>
  <div class="project-list p-4">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-gray-800">Projetos</h2>
      <button
        @click="showModal = true"
        class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
      >
        + Novo
      </button>
    </div>

    <ul class="space-y-2">
      <li
        v-for="project in store.projects"
        :key="project.id"
        :class="[
          'p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition relative',
          store.selectedProjectId === project.id ? 'bg-blue-50 border-l-4 border-blue-600' : 'bg-white'
        ]"
      >
        <div @click="selectProject(project.id)">
          <div class="font-medium pr-8">{{ project.name }}</div>
          <div class="text-xs text-gray-500 mt-1">
            {{ project.tasks_count || 0 }} tarefas
          </div>
        </div>
        <button
          @click.stop="confirmDeleteProject(project)"
          class="absolute top-3 right-3 text-red-500 hover:text-red-700"
          title="Deletar projeto"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </li>
    </ul>

    <CreateProjectModal
      v-if="showModal"
      @close="showModal = false"
      @created="handleProjectCreated"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import CreateProjectModal from './CreateProjectModal.vue'

const store = useTaskStore()
const showModal = ref(false)

function selectProject(projectId) {
  store.loadTasks(projectId)
}

function handleProjectCreated() {
  showModal.value = false
}

function confirmDeleteProject(project) {
  if (confirm(`Tem certeza que deseja deletar o projeto "${project.name}"? Todas as tarefas serão perdidas.`)) {
    store.deleteProject(project.id)
  }
}
</script>
```

**CreateProjectModal.vue:**

Crie `frontend/src/components/CreateProjectModal.vue`:

```vue
<template>
  <div class="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="$emit('close')">
    <div class="modal-content bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <h3 class="text-xl font-bold text-gray-800 mb-4">Novo Projeto</h3>

      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Nome do Projeto <span class="text-red-500">*</span>
          </label>
          <input
            v-model="projectName"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Website Institucional"
          />
        </div>

        <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {{ error }}
        </div>

        <div class="flex gap-3 justify-end">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {{ loading ? 'Criando...' : 'Criar Projeto' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTaskStore } from '@/stores/taskStore'

const emit = defineEmits(['close', 'created'])
const store = useTaskStore()

const projectName = ref('')
const loading = ref(false)
const error = ref(null)

async function handleSubmit() {
  try {
    loading.value = true
    error.value = null
    await store.createProject(projectName.value)
    emit('created')
  } catch (err) {
    error.value = 'Erro ao criar projeto. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>
```

**TaskBoard.vue (Kanban):**

Crie `frontend/src/components/TaskBoard.vue`:

```vue
<template>
  <div class="task-board p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">{{ store.selectedProject?.name }}</h2>
        <p class="text-sm text-gray-500 mt-1">{{ store.tasks.length }} tarefas no total</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
      >
        + Nova Tarefa
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        v-for="status in store.statuses"
        :key="status.slug"
        class="kanban-column bg-gray-50 rounded-lg p-4"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-700 flex items-center">
            <span
              :class="[
                'w-3 h-3 rounded-full mr-2',
                status.color || 'bg-gray-400'
              ]"
            ></span>
            {{ status.name }}
          </h3>
          <span class="text-sm text-gray-500 bg-white px-2 py-1 rounded">
            {{ store.tasksByStatus[status.slug]?.length || 0 }}
          </span>
        </div>

        <Draggable
          :list="store.tasksByStatus[status.slug] || []"
          :group="{ name: 'tasks' }"
          item-key="id"
          class="space-y-3 min-h-[200px]"
          @change="handleDragChange($event, status.slug)"
        >
          <template #item="{ element }">
            <TaskCard :task="element" />
          </template>
        </Draggable>
      </div>
    </div>

    <!-- Modal de criar tarefa -->
    <CreateTaskModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @created="handleTaskCreated"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import Draggable from 'vuedraggable'
import TaskCard from './TaskCard.vue'
import CreateTaskModal from './CreateTaskModal.vue'

const store = useTaskStore()
const showCreateModal = ref(false)

async function handleDragChange(event, newStatus) {
  if (event.added) {
    const task = event.added.element
    await store.updateTask(task.id, { status: newStatus })
  }
}

function handleTaskCreated() {
  showCreateModal.value = false
}
</script>

<style scoped>
.kanban-column {
  min-height: 500px;
}
</style>
```

**TaskCard.vue:**

Crie `frontend/src/components/TaskCard.vue`:

```vue
<template>
  <div class="task-card bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition cursor-move">
    <div class="flex items-start justify-between">
      <h4 class="font-medium text-gray-800">{{ task.titulo }}</h4>
      <button
        @click="handleDelete"
        class="text-red-500 hover:text-red-700 ml-2"
        title="Deletar tarefa"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    <p v-if="task.descricao" class="text-sm text-gray-600 mt-2">
      {{ task.descricao }}
    </p>
  </div>
</template>

<script setup>
import { useTaskStore } from '@/stores/taskStore'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

const store = useTaskStore()

function handleDelete() {
  if (confirm('Tem certeza que deseja deletar esta tarefa?')) {
    store.deleteTask(props.task.id)
  }
}
</script>
```

**CreateTaskModal.vue:**

Crie `frontend/src/components/CreateTaskModal.vue`:

```vue
<template>
  <div class="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="$emit('close')">
    <div class="modal-content bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <h3 class="text-xl font-bold text-gray-800 mb-4">Nova Tarefa</h3>

      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Título <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.titulo"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Digite o título da tarefa"
          />
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Descrição (opcional)
          </label>
          <textarea
            v-model="formData.descricao"
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Digite a descrição da tarefa"
          ></textarea>
        </div>

        <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {{ error }}
        </div>

        <div class="flex gap-3 justify-end">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {{ loading ? 'Criando...' : 'Criar Tarefa' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTaskStore } from '@/stores/taskStore'

const emit = defineEmits(['close', 'created'])
const store = useTaskStore()

const formData = ref({
  titulo: '',
  descricao: ''
})

const loading = ref(false)
const error = ref(null)

async function handleSubmit() {
  try {
    loading.value = true
    error.value = null
    await store.createTask(formData.value)
    emit('created')
  } catch (err) {
    error.value = 'Erro ao criar tarefa. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>
```

**Commit:**
```bash
git add frontend/src/
git commit -m "feat(frontend): criar componentes Vue para Kanban Board"
```

**🎉 FRONTEND COMPLETO!**

---

## 🔗 Fase 4: Integração e Testes

### Passo 4.1: Criar .env do Frontend

Crie `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
```

### Passo 4.2: Subir os Containers

```bash
# Na raiz do projeto
docker-compose up -d
```

**Aguarde alguns minutos para:**
1. MySQL inicializar
2. Laravel instalar dependências
3. Migrations rodarem
4. Seeders popularem o banco
5. Frontend instalar node_modules

### Passo 4.3: Ver Logs

```bash
# Ver logs de todos os containers
docker-compose logs -f

# Ou específicos
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mysql
```

### Passo 4.4: Testar a API

```bash
# Listar projetos
curl http://localhost:8000/api/projects

# Listar statuses
curl http://localhost:8000/api/statuses

# Criar projeto
curl -X POST http://localhost:8000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"Projeto Teste"}'
```

### Passo 4.5: Testar o Frontend

Abra no navegador:
- **Frontend**: http://localhost:5173
- **phpMyAdmin**: http://localhost:8080 (user: laravel, pass: laravel)

**Commit:**
```bash
git add frontend/.env
git commit -m "feat: configurar variáveis de ambiente e integração frontend-backend"
```

---

## 🚀 Fase 5: Refatorações e Melhorias

### Passo 5.1: Criar README.md Completo

Crie `README.md` na raiz:

```markdown
# 🎯 Task Manager - Kanban Board

Sistema completo de gerenciamento de tarefas no estilo Kanban, construído com Laravel 12, Vue 3 e Docker.

## 🚀 Features

- ✅ CRUD completo de projetos
- ✅ CRUD completo de tarefas
- ✅ Kanban Board com drag-and-drop
- ✅ 3 colunas: Pendente, Em Andamento, Concluído
- ✅ Sistema de status dinâmico
- ✅ Cores personalizáveis por status
- ✅ Contador de tarefas por projeto
- ✅ Cascade delete (deletar projeto remove tarefas)
- ✅ Interface responsiva com Tailwind CSS

## 🛠 Stack Tecnológica

**Backend:**
- Laravel 12.x (dev-master)
- MySQL 8.0
- Service Layer Architecture
- RESTful API

**Frontend:**
- Vue 3.5.14 (Composition API)
- Vite 6.0
- Pinia (State Management)
- Tailwind CSS
- vuedraggable

**DevOps:**
- Docker & Docker Compose
- phpMyAdmin

## 📦 Instalação

### Pré-requisitos

- Docker 20+
- Docker Compose 2+
- Git

### Passos

1. **Clone o repositório:**
```bash
git clone https://github.com/seu-usuario/task-manager.git
cd task-manager
```

2. **Suba os containers:**
```bash
docker-compose up -d
```

3. **Aguarde a inicialização** (~2-3 minutos)

4. **Acesse:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api
- phpMyAdmin: http://localhost:8080

## 🎯 Como Usar

1. Clique em **"+ Novo"** para criar um projeto
2. Selecione o projeto na barra lateral
3. Clique em **"+ Nova Tarefa"** para adicionar tarefas
4. Arraste tarefas entre as colunas para mudar o status
5. Clique no **X** para deletar tarefas ou projetos

## 📁 Estrutura do Projeto

```
task-manager/
├── backend/              # Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   ├── Requests/
│   │   │   └── Middleware/
│   │   ├── Models/
│   │   └── Services/     # Lógica de negócio
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/
├── frontend/             # Vue SPA
│   ├── src/
│   │   ├── components/   # Componentes reutilizáveis
│   │   ├── views/        # Pages
│   │   ├── stores/       # Pinia stores
│   │   ├── services/     # API client
│   │   └── router/
│   └── public/
└── docker-compose.yml    # Orquestração
```

## 🏗 Arquitetura

### Backend (Service Layer Pattern)

```
Controller → Service → Model → Database
```

**Por quê?**
- ✅ Separação de responsabilidades
- ✅ Testabilidade
- ✅ Reutilização de código
- ✅ Manutenibilidade

### Frontend (Composition API + Pinia)

```
Component → Store → API Service → Backend
```

**Por quê?**
- ✅ State management centralizado
- ✅ Reatividade automática
- ✅ Código limpo e organizado

## 🔧 Comandos Úteis

### Docker

```bash
# Subir containers
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar containers
docker-compose down

# Rebuild
docker-compose up -d --build

# Resetar tudo (CUIDADO: apaga dados!)
docker-compose down -v
docker-compose up -d
```

### Backend (Laravel)

```bash
# Entrar no container
docker-compose exec backend bash

# Rodar migrations
php artisan migrate

# Rodar seeders
php artisan db:seed

# Criar migration
php artisan make:migration create_x_table

# Criar model
php artisan make:model X -m

# Criar controller
php artisan make:controller XController
```

### Frontend (Vue)

```bash
# Entrar no container
docker-compose exec frontend sh

# Instalar nova dependência
npm install pacote-xyz

# Build para produção
npm run build
```

## 🧪 Testes

### Testar API

```bash
# Listar projetos
curl http://localhost:8000/api/projects

# Criar projeto
curl -X POST http://localhost:8000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste"}'

# Listar statuses
curl http://localhost:8000/api/statuses
```

## 📝 API Endpoints

### Projects
- `GET /api/projects` - Listar projetos
- `POST /api/projects` - Criar projeto
- `DELETE /api/projects/{id}` - Deletar projeto

### Tasks
- `GET /api/projects/{id}/tasks` - Listar tarefas de um projeto
- `POST /api/tasks` - Criar tarefa
- `PUT /api/tasks/{id}` - Atualizar tarefa
- `DELETE /api/tasks/{id}` - Deletar tarefa

### Statuses
- `GET /api/statuses` - Listar status disponíveis

## 🐛 Troubleshooting

### Container backend não inicia

```bash
# Ver logs
docker-compose logs backend

# Rebuild
docker-compose up -d --build backend
```

### Frontend não conecta no backend

1. Verificar se backend está rodando: `curl http://localhost:8000/api/projects`
2. Verificar `.env` do frontend: `VITE_API_URL=http://localhost:8000`
3. Limpar cache do navegador

### Erro de permissão no Laravel

```bash
docker-compose exec backend chmod -R 777 storage bootstrap/cache
```

## 🎓 Conceitos Aprendidos

- ✅ Docker e containerização
- ✅ RESTful API design
- ✅ Service Layer Pattern
- ✅ Dependency Injection
- ✅ Eloquent ORM e relacionamentos
- ✅ Vue Composition API
- ✅ State Management com Pinia
- ✅ Drag and Drop
- ✅ Tailwind CSS
- ✅ Git e commits semânticos

## 📄 Licença

MIT

## 👨‍💻 Autor

Seu Nome - [GitHub](https://github.com/seu-usuario)
```

**Commit:**
```bash
git add README.md
git commit -m "docs: adicionar README completo com instruções de instalação"
```

---

## 📝 Commits Semânticos

### Padrão Conventional Commits

```
<tipo>(<escopo>): <descrição>

[corpo opcional]

[rodapé opcional]
```

### Tipos Principais

- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Documentação
- **style**: Formatação (não muda código)
- **refactor**: Refatoração
- **test**: Testes
- **chore**: Manutenção (config, build, etc)

### Exemplos do Projeto

```bash
# Features
git commit -m "feat(backend): adicionar CRUD de projetos"
git commit -m "feat(frontend): implementar drag-and-drop no Kanban"
git commit -m "feat: configurar docker-compose com 4 serviços"

# Fixes
git commit -m "fix(backend): corrigir CSRF em rotas da API"
git commit -m "fix(frontend): corrigir contador de tarefas ao deletar"

# Refactor
git commit -m "refactor(backend): implementar Service Layer"
git commit -m "refactor(frontend): migrar de Options API para Composition API"

# Docs
git commit -m "docs: adicionar guia de instalação ao README"
git commit -m "docs(api): documentar endpoints RESTful"

# Chore
git commit -m "chore: adicionar .gitignore para Laravel e Vue"
git commit -m "chore(deps): atualizar dependências do frontend"

# Style
git commit -m "style: aplicar Tailwind CSS no layout"
git commit -m "style: adicionar cores personalizadas aos status"
```

### Quando Commitar?

**Boa prática:** Commit por funcionalidade completa

```bash
# ❌ RUIM (muito genérico)
git commit -m "mudanças"
git commit -m "atualizações"

# ✅ BOM (específico e descritivo)
git commit -m "feat(backend): criar migration de projetos com timestamps"
git commit -m "feat(frontend): adicionar modal de criar projeto com validação"
git commit -m "fix: corrigir CORS para aceitar requisições do frontend"
```

### Mensagens em Inglês vs Português?

**Mercado:** Inglês é mais comum, mas português é aceito.

Para este teste, use **português** se estiver mais confortável. O importante é ser **claro e descritivo**.

---

## 🎤 Dicas para Entrevista

### 1. Falando Sobre Arquitetura

**Pergunta:** "Por que você escolheu usar Service Layer?"

**Resposta Boa:**
> "Optei por usar o Service Layer para separar a lógica de negócio dos controllers. Isso traz vários benefícios: os controllers ficam mais limpos, focados apenas em receber requisições e retornar respostas; a lógica fica reutilizável, posso usar o mesmo service em diferentes controllers ou até em comandos Artisan; e fica muito mais fácil de testar, porque posso testar a lógica isoladamente sem precisar simular requisições HTTP. Seguindo o princípio da Responsabilidade Única do SOLID, cada classe tem uma responsabilidade bem definida."

### 2. Falando Sobre Decisões Técnicas

**Pergunta:** "Por que Vue 3 com Composition API?"

**Resposta Boa:**
> "Escolhi Vue 3 com Composition API porque ela oferece melhor organização de código e reusabilidade. Com a Composition API, posso agrupar lógica relacionada ao invés de separar por opções (data, methods, computed). Por exemplo, toda lógica de projetos fica junta, toda lógica de tarefas fica junta. Isso facilita manutenção em componentes grandes. Além disso, a Composition API tem melhor suporte a TypeScript e performance otimizada em relação ao Vue 2."

### 3. Falando Sobre Docker

**Pergunta:** "Quais as vantagens de usar Docker neste projeto?"

**Resposta Boa:**
> "Docker traz várias vantagens. Primeiro, **consistência de ambiente**: garante que o projeto rode igual em qualquer máquina, seja local, staging ou produção - elimina o problema de 'na minha máquina funciona'. Segundo, **isolamento**: cada serviço (MySQL, Laravel, Vue) roda em seu próprio container sem conflitos. Terceiro, **facilidade de setup**: com um único comando `docker-compose up` todo o ambiente está pronto, sem precisar instalar PHP, MySQL, Node separadamente. E quarto, **escalabilidade**: no futuro, se precisar de mais instâncias do backend, é só ajustar o docker-compose."

### 4. Falando Sobre Desafios

**Pergunta:** "Qual foi o maior desafio e como você resolveu?"

**Resposta Boa:**
> "Um desafio que enfrentei foi o problema do Tailwind não aplicar as cores dinamicamente. O Tailwind usa tree-shaking, então ele só inclui no CSS final as classes que detecta no código. Como as cores vinham dinamicamente do banco de dados via API, o Tailwind não conseguia detectar. Pesquisei a documentação e descobri o conceito de 'safelist'. Adicionei as classes de cores que poderiam ser usadas na safelist do tailwind.config.js, garantindo que elas sejam sempre incluídas no CSS compilado. Isso me ensinou a importância de entender como as ferramentas funcionam por baixo dos panos, não apenas usar superficialmente."

### 5. Falando Sobre Performance

**Pergunta:** "Como você otimizaria este projeto?"

**Resposta Boa:**
> "Existem várias otimizações possíveis. No **backend**, implementaria cache para a lista de status (já que raramente muda) usando Redis, e adicionaria eager loading para evitar o problema N+1 ao carregar projetos com tarefas. No **frontend**, implementaria lazy loading dos componentes de modal (só carrega quando abre), e debounce em qualquer campo de busca que adicionar no futuro. Na **infraestrutura**, configuraria um load balancer se precisar escalar horizontalmente, e usaria CDN para assets estáticos. Mas sempre com medição: implementaria monitoramento com Laravel Telescope no backend e Vue DevTools no frontend para identificar gargalos reais antes de otimizar prematuramente."

### 6. Falando Sobre Testes (mesmo sem ter implementado)

**Pergunta:** "Como você testaria este projeto?"

**Resposta Boa:**
> "Implementaria uma estratégia de testes em três níveis. **Testes unitários** para os Services, testando cada método isoladamente - por exemplo, se o ProjectService.createProject realmente cria um projeto no banco. **Testes de integração** para os controllers, simulando requisições HTTP e verificando se retornam os status codes e dados corretos. E **testes E2E** no frontend com Cypress ou Playwright, simulando jornadas completas do usuário: criar projeto → adicionar tarefa → arrastar para outra coluna → deletar. Priorizaria testar os fluxos críticos primeiro, seguindo a pirâmide de testes: muitos testes unitários, alguns de integração, poucos E2E."

### 7. Falando Sobre Aprendizado

**Pergunta:** "O que você aprendeu construindo este projeto?"

**Resposta Boa:**
> "Aprendi muito sobre arquitetura limpa e separação de responsabilidades. Antes, eu colocava toda lógica direto no controller. Com o Service Layer, entendi a importância de separar as camadas. Aprendi também sobre state management moderno com Pinia - é muito mais intuitivo que o Vuex antigo. Docker foi outro aprendizado grande: entender como orquestrar múltiplos serviços, volumes, networks e healthchecks. E uma lição importante foi sobre debugging: quando algo não funcionava, aprendi a ver logs, testar a API isoladamente com curl antes de culpar o frontend, e usar o console do navegador efetivamente. Cada erro me ensinou algo novo."

### 8. Sobre Tempo de Desenvolvimento

**Pergunta:** "Quanto tempo levou para desenvolver?"

**Resposta HONESTA (mas estratégica):**
> "O desenvolvimento completo levou cerca de [2-3 dias / 1 semana - seja honesto]. Mas não foi linear - passei tempo pesquisando melhores práticas, testando diferentes abordagens, e refatorando quando encontrava soluções melhores. Por exemplo, inicialmente não tinha Service Layer, depois refatorei para implementar. Documentei todo o processo para referência futura e para facilitar onboarding de outros desenvolvedores. Prefiro dedicar tempo fazendo certo do que entregar rápido mas com débito técnico."

### 9. Sobre Próximos Passos

**Pergunta:** "O que você adicionaria se tivesse mais tempo?"

**Resposta Boa:**
> "Várias features interessantes: **Autenticação**, com Laravel Sanctum para criar usuários e cada um ter seus projetos. **Filtros e busca**, para encontrar tarefas rapidamente. **Priorização de tarefas**, com drag-and-drop vertical também. **Deadline e notificações**, para lembrar de tarefas próximas do prazo. **Tags ou categorias** nas tarefas. **Dashboard com métricas**, mostrando tarefas concluídas por período, tempo médio em cada status. **Testes automatizados** completos. E **CI/CD**, configurando GitHub Actions para rodar testes e fazer deploy automático. Mas implementaria com MVPs: primeiro autenticação básica, depois features incrementais baseado em feedback de usuários."

### 10. Pontos Fortes para Destacar

**Sobre o projeto:**
- ✅ "Implementei boas práticas de arquitetura"
- ✅ "Separei responsabilidades claramente"
- ✅ "Usei commits semânticos"
- ✅ "Documentei bem o código e o processo"
- ✅ "Pensei em escalabilidade desde o início"
- ✅ "Segui princípios SOLID"

**Sobre você:**
- ✅ "Sou autodidata, pesquisei documentação oficial"
- ✅ "Quando encontrei problemas, debuguei sistematicamente"
- ✅ "Refatorei quando vi que tinha abordagem melhor"
- ✅ "Penso no próximo dev que vai mexer no código"

---

## 🐛 Troubleshooting Comum

### Problema 1: "Port 3306 already in use"

**Causa:** MySQL já rodando na máquina.

**Solução:**
```bash
# macOS/Linux
sudo service mysql stop

# Ou mude a porta no docker-compose.yml
ports:
  - "3307:3306"  # Usa 3307 externamente
```

### Problema 2: "CORS error" no navegador

**Causa:** Backend não aceita requisições do frontend.

**Solução:**
1. Verificar `backend/config/cors.php`
2. Verificar se `'allowed_origins' => ['http://localhost:5173']` está correto
3. Reiniciar backend: `docker-compose restart backend`

### Problema 3: "Cannot find module '@/components'"

**Causa:** Alias @ não configurado ou node_modules não instalado.

**Solução:**
```bash
# Rebuild do frontend
docker-compose down
docker-compose up -d --build frontend
```

### Problema 4: "Integrity constraint violation"

**Causa:** Tentando criar tarefa com project_id que não existe.

**Solução:**
1. Verificar se o projeto existe: `curl http://localhost:8000/api/projects`
2. Se não, criar um projeto primeiro
3. Ou rodar seed: `docker-compose exec backend php artisan db:seed`

### Problema 5: Cores não aparecem no Kanban

**Causa:** Tailwind safelist não configurado.

**Solução:**
Verificar `frontend/tailwind.config.js` tem o safelist com as classes de cores.

### Problema 6: Hot reload não funciona

**Causa:** Docker no Windows ou usePolling desabilitado.

**Solução:**
Editar `frontend/vite.config.js`:
```javascript
server: {
  watch: {
    usePolling: true  // ← Adicionar isso
  }
}
```

---

## ✅ Checklist Final

Antes de entregar o teste, verifique:

### Funcionalidades
- [ ] Criar projeto funciona
- [ ] Listar projetos funciona
- [ ] Deletar projeto funciona
- [ ] Criar tarefa funciona
- [ ] Arrastar tarefa entre colunas funciona
- [ ] Deletar tarefa funciona
- [ ] Contador de tarefas atualiza corretamente
- [ ] Cores dos status aparecem

### Código
- [ ] Backend sem código desnecessário
- [ ] Frontend sem console.log desnecessários
- [ ] Código formatado e indentado
- [ ] Nomes de variáveis/funções claros
- [ ] Comentários apenas onde necessário

### Git
- [ ] Commits semânticos
- [ ] Mensagens de commit descritivas
- [ ] Histórico limpo (sem commits "teste", "aaa", etc)
- [ ] .gitignore configurado (vendor/, node_modules/ ignorados)

### Documentação
- [ ] README.md completo
- [ ] Instruções de instalação claras
- [ ] Comandos úteis documentados
- [ ] API endpoints listados

### Docker
- [ ] `docker-compose up -d` funciona
- [ ] Containers sobem sem erro
- [ ] Healthcheck do MySQL funciona
- [ ] Portas corretas expostas

### Testes Manuais
- [ ] Frontend acessível em http://localhost:5173
- [ ] Backend acessível em http://localhost:8000
- [ ] phpMyAdmin acessível em http://localhost:8080
- [ ] API retorna JSON corretamente
- [ ] Interface responsiva (testar em mobile)

---

## 🎯 Resumo do Fluxo de Desenvolvimento

### Ordem Recomendada

1. ✅ **Setup Inicial** (30min)
   - Git init
   - docker-compose.yml
   - .gitignore

2. ✅ **Backend Estrutura** (1h)
   - Instalar Laravel
   - Criar Models e Migrations
   - Criar Seeders

3. ✅ **Backend Lógica** (2h)
   - Service Layer
   - Controllers
   - Form Requests
   - Rotas
   - CORS

4. ✅ **Frontend Estrutura** (1h)
   - Instalar Vue
   - Configurar Vite, Tailwind, Router
   - API Service

5. ✅ **Frontend Lógica** (3h)
   - Pinia Store
   - Componentes
   - Views

6. ✅ **Integração** (1h)
   - Testar API
   - Testar Frontend
   - Ajustar bugs

7. ✅ **Refinamento** (1h)
   - Documentação
   - Commits organizados
   - README

**Total:** ~9-10 horas de desenvolvimento focado

---

## 💡 Dicas Finais

### 1. Não Copie e Cole Tudo de Uma Vez

- Entenda cada arquivo antes de criar
- Teste incrementalmente
- Commit após cada funcionalidade

### 2. Use o Google/ChatGPT

É normal pesquisar! Mas:
- Entenda o que está copiando
- Adapte para seu contexto
- Não cole código que não entende

### 3. Documente Enquanto Desenvolve

- Anote problemas que enfrentou
- Documente soluções que funcionaram
- Será útil na entrevista

### 4. Teste, Teste, Teste

- Teste cada endpoint após criar
- Use curl ou Postman
- Teste cenários de erro também

### 5. Seja Honesto na Entrevista

- Se usou tutorial/ChatGPT, diga
- Explique o que aprendeu
- Demonstre que entende o código

### 6. Mostre Evolução

- Histórico do Git mostra sua jornada
- Refatorações mostram que você melhora código
- Documentação mostra que pensa nos outros

---

## 🎓 Recursos para Aprender Mais

### Documentação Oficial
- Laravel: https://laravel.com/docs
- Vue: https://vuejs.org/guide
- Vite: https://vitejs.dev/guide
- Tailwind: https://tailwindcss.com/docs
- Pinia: https://pinia.vuejs.org

### Conceitos Importantes
- RESTful API design
- SOLID principles
- Clean Architecture
- Docker basics
- Git workflow

### Prática
- Implemente features extras
- Refatore código existente
- Adicione testes
- Melhore a UI/UX

---

**Boa sorte no teste! 🚀**

Lembre-se: o objetivo não é entregar código perfeito, mas mostrar que você:
- ✅ Sabe estruturar um projeto
- ✅ Entende conceitos fundamentais
- ✅ Pesquisa e resolve problemas
- ✅ Escreve código limpo e organizado
- ✅ Documenta seu trabalho
- ✅ Aprende com o processo

**Você consegue!** 💪