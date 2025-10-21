## Task Manager Kanban

Aplicação SPA simples para gerenciar Projetos e Tarefas (Kanban).

Este repositório contém um backend em Laravel e um frontend em Vue 3 (Vite + Pinia).

---

## O que tem aqui

- Backend: Laravel API com endpoints para Projects, Tasks e Statuses.
- Frontend: SPA em Vue 3 que consome a API e apresenta um quadro Kanban com drag-and-drop.
- Statuss dinâmicos: a aplicação lê `statuses` do backend (tabela `statuses`) e renderiza colunas dinamicamente.

---

## Requisitos

- PHP 8.1+ (ou compatível com o projeto Laravel usado)
- Composer
- Node.js 16+ / npm
- Banco de dados (MySQL, SQLite, etc.) configurado no `.env`

---

## Instalação e execução (Windows PowerShell)

Siga os passos abaixo para rodar localmente (backend e frontend). Execute os comandos a partir do PowerShell.

Backend (Laravel)

```powershell
cd 'c:\Users\kenne\OneDrive\Área de Trabalho\Task Manager Kanban\backend'
composer install
cp .env.example .env
# Edite o .env para configurar DB_CONNECTION, DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD
php artisan key:generate
php artisan migrate --seed
# Inicia o servidor de desenvolvimento do Laravel
php artisan serve --host=0.0.0.0 --port=8000
```

Observação: o seeder `StatusSeeder` já popula os status Pendente / Em Andamento / Concluído.

Frontend (Vue)

```powershell
cd 'c:\Users\kenne\OneDrive\Área de Trabalho\Task Manager Kanban\frontend'
npm install
# Opcional: crie um arquivo .env.local com a variável VITE_API_URL se o backend não estiver na porta padrão
# VITE_API_URL=http://localhost:8000
npm run dev
```

Por padrão o Vite roda na porta 5173 e o backend em 8000. Ajuste `VITE_API_URL` conforme necessário.

---

## Endpoints principais (API)

- GET /api/projects — lista projetos (retorna tasks_count via withCount)
- POST /api/projects — cria projeto (body: { name })
- DELETE /api/projects/{project} — deleta projeto
- GET /api/projects/{project}/tasks — lista tarefas de um projeto
- POST /api/tasks — cria tarefa (body: { titulo, descricao?, project_id, status? })
- PUT /api/tasks/{task} — atualiza tarefa (status, titulo, descricao, project_id)
- DELETE /api/tasks/{task} — deleta tarefa
- GET /api/statuses — lista statuses (usado pelo frontend para renderizar colunas)

Formato importante:
- Tasks usam campos `titulo`, `descricao`, `status` (slug) e `project_id`.

---

## O que está implementado (resumo)

- Backend: Migrations, Models (Project, Task, Status), Controllers, Form Requests para validação e Services que encapsulam lógica.
- Frontend: componentes para listagem de projetos, quadro Kanban, modais de criação e store central (Pinia) que gerencia projetos, tarefas, statuses e o projeto selecionado.
- Drag-and-drop: `vuedraggable` integra a movimentação entre colunas e chama o endpoint de update para mudar status.

---

## Respostas de Reflexão (README obrigatório)

1) Qual foi a maior dificuldade que você encontrou neste desafio e como você a resolveu?

R: A maior dificuldade comum nesse tipo de desafio é alinhar o formato de dados entre frontend e backend (nomes de campos, formatos de status e comportamento padrão). Para resolver isso, usei:
- Validações no backend (Form Requests) para deixar claro os requisitos.
- Um service `TaskService` que define um status padrão lendo a tabela `statuses` quando necessário. Assim o frontend não precisa hardcodar o valor inicial.

2) Se você tivesse mais 4 horas para trabalhar neste projeto, o que você melhoraria ou adicionaria?

R: Prioridades com 4h extras:
- Adicionar testes automatizados (PHPUnit para backend; Vitest/Jest para frontend) cobrindo criação de projeto/tarefa e mudança de status.
- Melhorar o tratamento de erros do frontend para exibir mensagens de validação detalhadas vindas do backend.
- Adicionar CI básico (GitHub Actions) para rodar lint/tests em PR.
- Pequenas melhorias de UX: feedback visual ao arrastar (skeletons/loading states), confirmação undo para exclusão.

3) Qual abordagem você usou para gerenciar o estado no Vue e por que?

R: Usei Pinia com uma store central `taskStore` que mantém: lista de `projects`, `selectedProjectId`, `tasks`, `statuses`, e ações (load/create/update/delete). Essa abordagem facilita compartilhar o estado entre a `ProjectList`, `TaskBoard` e modais, mantendo a lógica de chamadas à API em um único lugar e aproveitando a reatividade do Composition API.

---

## Dicas e troubleshooting

- Se o frontend não conseguir localizar a API, verifique `frontend/.env.local` e a variável `VITE_API_URL`.
- CORS: verifique `backend/config/cors.php` se requests do frontend forem bloqueadas.
- Se a tabela `statuses` não existir/popular, rode `php artisan db:seed --class=StatusSeeder`.

---

## Notas sobre versionamento

- Recomendo commits pequenos e descritivos. Exemplo:
  - feat: add projects and tasks endpoints
  - feat(frontend): add kanban board and draggable tasks
  - fix: align api imports

Para revisar o histórico localmente:

```powershell
cd 'c:\Users\kenne\OneDrive\Área de Trabalho\Task Manager Kanban'
git log --oneline --graph --decorate --all
```

---

Se quiser, eu posso também:

- Criar este README em um commit e abrir um PR localmente;
- Adicionar testes básicos (backend/frontend);
- Melhorar mensagens de erro retornadas pelo backend para facilitar feedback no frontend.

Informe o que prefere que eu faça a seguir.
