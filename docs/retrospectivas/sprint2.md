# Retrospectiva - Sprint 2

## Resumo da sprint

Na Sprint 2, o foco foi evoluir o módulo de projetos, permitindo visualização em cards, edição, exclusão com confirmação, criação de projeto com tarefa inicial, seleção de membros e listagem inicial de tarefas. Também foram trabalhados requisitos técnicos de qualidade, como pipeline de CI, SonarCloud, cobertura de testes, Docker e documentação de retrospectivas.

## Start

- Iniciar a sprint validando os critérios técnicos obrigatórios, como pipeline, Docker, SonarCloud e cobertura de testes.
- Criar documentação técnica incremental para cada card entregue, reduzindo retrabalho no fechamento da sprint.
- Planejar melhor a divisão entre funcionalidades de backend, frontend e infraestrutura antes de iniciar os commits.

## Stop

- Evitar deixar requisitos de qualidade e infraestrutura para o final da sprint.
- Evitar implementar fluxos grandes em um único Pull Request, principalmente quando envolvem backend, frontend e banco de dados.
- Evitar seguir para novos cards sem validar localmente build, testes, Docker e integração com a API.

## Continue

- Continuar mantendo a branch `main` protegida com Pull Requests e aprovação de colegas.
- Continuar utilizando commits semânticos, como `feat`, `fix`, `docs`, `test`, `ci` e `chore`.
- Continuar validando as funcionalidades manualmente no navegador e também por endpoints quando necessário.