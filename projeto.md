 # Projeto: Dashboard de Entregas

## Objetivo

Construir uma dashboard que faça a ingestão de dados de uma planilha do Google Sheets e apresente KPIs organizados de acordo com os dados, permitindo acompanhar o desempenho das entregas de forma rápida e clara.

## Funcionalidades

- Conectar-se à planilha do Google Sheets por meio de sua API ou URL publicada.
- Importar e atualizar os dados manualmente e/ou em intervalos configuráveis.
- Validar, padronizar e tratar valores ausentes ou inconsistentes.
- Exibir KPIs em cartões, com filtros por período, status, região, cliente e responsável.
- Apresentar tabelas e gráficos para detalhamento dos indicadores.
- Informar a data e hora da última atualização dos dados.
- Permitir a exportação dos dados filtrados, quando necessário.

## KPIs sugeridos

- Total de entregas.
- Entregas concluídas.
- Entregas pendentes.
- Entregas atrasadas.
- Percentual de entregas no prazo.
- Tempo médio de entrega.
- Quantidade de entregas por status, região e período.

Os indicadores devem ser ajustados conforme as colunas disponíveis na planilha.

## Estrutura esperada dos dados

A planilha deve conter, sempre que aplicável, colunas como:

| Campo | Descrição |
|---|---|
| ID da entrega | Identificador único |
| Data do pedido | Data de criação do pedido |
| Data prevista | Prazo previsto para entrega |
| Data de entrega | Data efetiva da entrega |
| Status | Situação atual da entrega |
| Cliente | Cliente associado |
| Região | Região de destino |
| Responsável | Pessoa ou equipe responsável |

## Critérios de sucesso

- Dados carregados corretamente da planilha.
- KPIs calculados com base nos filtros selecionados.
- Interface clara, responsiva e de fácil leitura.
- Tratamento de erros de conexão e dados inválidos.
- Atualização dos indicadores sem necessidade de alterar o código.
