Gerenciador de Tarefas - Quadro Kanban
Sistema de gerenciamento de projetos e tarefas com interface Kanban, desenvolvido com Laravel 12.xe Vue 3, totalmente containerizado com Docker.

Pilha Pilha Pilha Pilha

Funcionalidades
Gerenciamento de Projetos
Quadro Kanban com 3 colunas (Pendente, Em Andamento, Concluído)
Arraste e solte entre colunas
CRUD completo de tarefas
API RESTful
Validações robustas
Interface responsiva com Tailwind CSS
Bônus: Sistema de status sonoro via API
Stack Tecnológica
Backend
Laravel 12.x (dev-master - última versão assustadora)
MySQL 8.0
PHP 8.3
Arquitetura da Camada de Serviço (separação de responsabilidades)
ORM eloquente
Formulário de Solicitação para Validação
API RESTful
Injeção de Dependência
Front-end
Vue 3.5 (API de composição)
Vite 6.0 (última versão)
Pinia (gerenciamento de estado)
Roteador Vue
Axios (cliente HTTP)
Tailwind CSS (estilização)
vuedraggable (arrastar e soltar)
DevOps
Docker e Docker Compose
Containers isolados para backend, frontend e MySQL
Recarga rápida em desenvolvimento
Healthchecks configurados
Instalação
Pré-requisitos
Docker
Docker Compose
Git
Passo a Passo
Clone ou repositório
git clone <url-do-repositorio>
cd task-lavaravel-vue
Início dos contêineres Docker
docker-compose up -d
Isso irá:

Criar e iniciar o contêiner MySQL
Instalar dependências do Laravel (composer install)
Gerar uma chave de aplicação
Rodar como migrações
Popular o banco com status padrão
Instalar dependências do Vue (npm install)
Iniciar o servidor de desenvolvimento
Aguarde os containers iniciarem
Você pode acompanhar os logs:

docker-compose logs -f
Aguarde até ver mensagens subterrâneas que:

MySQL está pronto (saudável)
Backend Laravel está operando na porta 8000
Frontend Vite está operando na porta 5173
Acesse o aplicativo
Front-end: http://localhost:5173
API de back-end: http://localhost:8000/api/projects
Uso
Criar um Projeto
Clique no botão "+ Novo" na barra lateral
Digite o nome do projeto
Clique em "Criar Projeto"
Criar uma Tarefa
Selecione um projeto na barra lateral
Clique em "+ Nova Tarefa"
Preencha título e descrição (opcional)
Clique em "Criar Tarefa"
A tarefa será criada na coluna "Pendente"
Tarefas de mudança
Opção 1 - Arrastar e Soltar:

Arraste a tarefa e solte na coluna desejada
Opção 2 - Botões de Status:

Clique em um dos botões de status dentro do cartão da tarefa
Excluir Tarefa
Clique no ícone da lixeira no canto superior direito do cartão
Estrutura do Projeto
task-lavaravel-vue/
├── backend/              # Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/    # Thin Controllers (HTTP layer)
│   │   │   └── Requests/       # Form Validations
│   │   ├── Services/           # Business Logic Layer 🆕
│   │   │   ├── ProjectService.php
│   │   │   ├── TaskService.php
│   │   │   └── StatusService.php
│   │   └── Models/             # Eloquent ORM
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/
├── frontend/            # Vue 3 SPA
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   ├── stores/            # Pinia State Management
│   │   ├── services/          # API Client Layer
│   │   └── router/
│   └── public/
├── docker-compose.yml
├── AGENTS.md                     # Guia para múltiplos agentes
├── ARQUITETURA-SERVICE-LAYER.md  # Documentação da arquitetura 🆕
└── README.md
Comandos Úteis
Backend (Laravel)
# Rodar migrations
docker-compose exec backend php artisan migrate

# Reset do banco com seed
docker-compose exec backend php artisan migrate:fresh --seed

# Criar novo controller
docker-compose exec backend php artisan make:controller NomeController

# Limpar cache
docker-compose exec backend php artisan cache:clear
Front-end (Vue)
# Instalar nova dependência
docker-compose exec frontend npm install pacote-nome

# Build para produção
docker-compose exec frontend npm run build
Docker
# Ver logs em tempo real
docker-compose logs -f

# Parar containers
docker-compose down

# Parar e remover volumes
docker-compose down -v

# Reiniciar um serviço específico
docker-compose restart backend
Pontos de extremidade da API
Projetos
GET /api/projects- Lista todos os projetos
POST /api/projects- Cria um novo projeto
Corpo:{ "name": "Nome do Projeto" }
DELETE /api/projects/{id}- Deletar um projeto
Tarefas
GET /api/projects/{projectId}/tasks- Lista tarefas de um projeto
POST /api/tasks- Cria uma nova tarefa
Corpo:{ "titulo": "...", "descricao": "...", "project_id": 1 }
PUT /api/tasks/{id}- Atualiza uma tarefa
Corpo:{ "status": "in_progress" }
DELETE /api/tasks/{id}- Deleta uma tarefa
Status (recurso bônus)
GET /api/statuses- Lista todos os status disponíveis
Validações
Projeto
name: obrigatório, único, máximo 255 caracteres
Tarefa
titulo: obrigatório, máximo 255 caracteres
descricao: opcional, texto
project_id: obrigatório, deve existir na tabela de projetos
status: opcional, valores válidos: pendente, in_progress, concluído
Respostas de Reflexão
Pergunta 1: Qual foi a maior dificuldade que você encontrou neste desafio e como você resolveu?
A maior dificuldade foi configurar o projeto para rodar completamente com Docker, garantindo especialmente que as últimas versões instáveis ​​do Laravel 12.xe Vue 3 funcionassem corretamente dentro dos containers.

Solução: Crie Dockerfiles personalizados para cada serviço (backend e frontend), configure healthchecks para o MySQL para garantir que o backend só seja iniciado após o banco estar pronto, e utilize volumes para permitir hot reload durante o desenvolvimento. Também é possível ajustar as versões do Node nos containers para suportar o Vite 6.0.

Pergunta 2: Se você tivesse mais 4 horas para trabalhar neste projeto, o que você melhoraria ou adicionaria?
Autenticação com Laravel Sanctum - Sistema de login/registro de usuários
Testes Automatizados - Unit tests no backend (PHPUnit) e component tests no frontend (Vitest)
Filtros e Busca - Permitir filtrar tarefas por status, buscar por título/descrição
Datas de Entrega - Adicionar datas de vencimento nas tarefas com indicadores visuais de atraso
Melhorias de UX - Animações mais suaves, feedback visual melhor, estados de carregamento
CI/CD Pipeline - GitHub Actions para rodar testes e fazer deploy automático
Logs e Monitoramento - Implementar registro estruturado e monitoramento de erros
Pergunta 3: Qual abordagem você usou para gerenciar o estado no Vue (ex: qual projeto foi selecionado no momento) e por que você escolheu essa abordagem?
Utilizei Pinia (loja oficial do Vue 3) com API de composição. A loja taskStore.jscentraliza todo o estado da aplicação:

Estados gerenciados:

projects- array de todos os projetos
selectedProjectId- ID do projeto atualmente selecionado
tasks- matriz de tarefas do projeto selecionado
statuses- array de status disponíveis
Por que Pinia:

Reatividade nativa - Usa refs e computados do Vue 3
Type-safety - Melhor suporte a TypeScript (preparado para melhorias futuras)
DevTools - Excelente integração com Vue DevTools para depuração
Simplicidade - API mais limpa que Vuex, sem mutações
Composition API - Alinha perfeitamente com o padrão usado nos componentes
Propriedades computadas:

selectedProject- Retorno do objeto do projeto selecionado
tasksByStatus- Agrupa tarefas por status (essencial para o Kanban)
Esta abordagem mantém a separação de responsabilidades: componentes focam em UI, a loja gerencia estado e lógica de negócio, e a camada de serviço ( api.js) abstrai as chamadas HTTP.

Bônus de Recurso Implementado
✅ Sistema de Status Dinâmico

Em vez de hardcoded os status no frontend, implementei:

Tabela statusesno banco de dados
Migração e seeder para status popular padrão
Endpoint GET /api/statusespara buscar dinamicamente
Frontend que carrega status da API e renderiza colunas dinamicamente
Isso permite adicionar/remover status facilmente sem alterar o código.

Solução de problemas
Erro ao conectar no MySQL
Aguarde alguns segundos após docker-compose up(healthcheck leva ~10s)
Verifique: docker-compose ps- MySQL deve estar "saudável"
Frontend não carrega
Verifique se a porta 5173 está livre
Cavalgou:docker-compose logs frontend
Mudanças no código não aparecem
Frontend tem hot reload automático
Reinício necessário do backend:docker-compose restart backend
Licença
MIT

Autor
Desenvolvido como desafio técnico para demonstrar habilidades em Laravel, Vue 3 e Docker.

Para mais detalhes técnicos e instruções para múltiplos agentes, consulte AGENTS.md
