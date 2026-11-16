# Site do Vitrine Estúdio

Site de uma página do Vitrine Estúdio: criação e otimização de sites para pequenas empresas, com a análise grátis do PageSpeed embutida e um painel /admin para editar os textos.

## Como o site é montado

- Os textos ficam em `content/site.json`. O painel /admin edita esse arquivo.
- O molde da página é `src/index.html`.
- `node build.mjs` junta os dois e gera o `index.html`. Não edite o `index.html` à mão.
- Os estilos estão em `css/pagina.css`, e a análise grátis em `js/analise.js`.
- `assets/` é o kit de design; não edite.
- Testes: `node tests/build.test.mjs` e `node tests/analise.test.mjs`.
- Para ver no seu computador: `npx serve .`
- `previas/` guarda as Prévias Vitrine (skill `zanardigital-previa`). Elas ficam fora do Google.

## Pôr no ar (uma vez só)

1. Crie uma conta grátis em github.com e um repositório público chamado `vitrine-estudio`.
2. Em `admin/config.yml`, troque `SEU-USUARIO-GITHUB` pelo seu usuário.
3. Peça ao Claude para enviar o site ao repositório. O primeiro envio abre o navegador para você entrar no GitHub.
4. No repositório, vá em Settings → Pages e, em "Source", escolha **GitHub Actions**. Cada mudança publica o site sozinha em `https://SEU-USUARIO.github.io/vitrine-estudio/`.
5. Para entrar no painel:
   - Abra `.../vitrine-estudio/admin/` e entre com um token do GitHub. Para criar o token: Settings → Developer settings → Fine-grained tokens, só este repositório, permissão "Contents: Read and write".
   - Ao salvar, o site é republicado em 1 a 2 minutos.

## Antes de divulgar

1. **Chave do PageSpeed:**
   - Crie uma chave grátis da PageSpeed Insights API no Google Cloud.
   - Restrinja a chave ao endereço do site.
   - Cole a chave em `API_KEY`, no arquivo `js/analise.js`.
   - Sem a chave, o Google recusa por cota esgotada (erro 429), e a página só oferece o link para fazer a análise no site do Google.
2. **E-mail dos pedidos:** no painel, em Orçamento, ponha o seu e-mail. Se quiser, ponha também o endereço do Formspree, para o pedido chegar sem abrir o app de e-mail.
3. **Domínio próprio (opcional):**
   - Registre o domínio, por exemplo vitrineestudio.com.br no registro.br (cerca de R$40/ano).
   - Ligue o domínio em Settings → Pages.
   - Descomente a linha `canonical` no `<head>` de `src/index.html`.

## Link para usar nos e-mails

`https://SEU-DOMINIO/?url=siteDaEmpresa.com.br#analise` abre a página e já roda a análise do site da empresa.
