# Supabase + GitHub Pages

## 1. Criar o banco

1. Crie um projeto no Supabase.
2. Abra **SQL Editor**.
3. Execute todo o conteúdo de `supabase-schema.sql`.
4. Em **Project Settings > API**, copie o **Project URL** e a chave pública **anon**.

## 2. Configurar o frontend

Edite `supabase-config.js`:

```js
window.SUPABASE_CONFIG = {
  url: "https://SEU-PROJETO.supabase.co",
  anonKey: "SUA-CHAVE-ANON-PUBLICA",
};
```

Use apenas a chave `anon` no GitHub Pages. Nunca publique `service_role`.

## 3. Publicar no GitHub Pages

1. Suba `index.html`, `app.js`, `styles.css`, `supabase-config.js` e `supabase-schema.sql` para o repositório.
2. Em **Settings > Pages**, escolha a branch e a pasta `/ (root)`.
3. Aguarde o endereço do Pages.

O dashboard inicia com dados demo quando a configuração ainda está com os placeholders. Com as credenciais preenchidas, ele carrega os vídeos do Supabase e assina alterações em tempo real.

## 4. O que fica em tempo real

- Criação, edição, exclusão e restauração de vídeos em `content_videos`.
- Entregas e KPIs em `deliveries`.
- Status e validações dos vídeos.
- Histórico de adições em `video_history`.
- Catálogos de `video_statuses` e `validation_options`.

Todos esses registros são carregados ao abrir e recebem eventos realtime enquanto a página está aberta.

O SQL inclui RLS com leitura e escrita públicas porque o projeto atual não tem autenticação. Para produção com dados privados, adicione Supabase Auth e troque as policies por regras baseadas no usuário.
