# Prime Odontologia — tema Pomelli

Tema em blocos (block theme) que replica o site gerado no Google Pomelli
(labs.google.com/pomelli/website/btC3heCMZo1d-x0xaVtkZj) para primeodontologia.blog.

## Estrutura
- `style.css` — CSS original do Pomelli + ajustes para WordPress (admin bar, blog).
- `functions.php` — carrega Google Fonts (Acme, Inter), Font Awesome 6.4 e o CSS.
- `patterns/home.php` — conteúdo da página inicial (bloco HTML).
- `patterns/header.php`, `patterns/footer.php` — cabeçalho e rodapé.
- `templates/` — front-page, index/home/archive (blog), single, page.
- `assets/img/` — 20 imagens em WebP (hero, fundos, 14 tratamentos, 3 de tecnologia).

## Alterações em relação ao Pomelli
- Cards de tratamentos traduzidos para PT-BR.
- Botões de agendamento abrem WhatsApp (31) 99289-3060.
- Link "Blog" no menu; removidos o link "Report legal issue" e os selos de IA.

## Ativação
1. Ativar em Aparência → Temas → "Prime Odontologia (Pomelli)".
2. Páginas: criar "Início" e "Blog".
3. Configurações → Leitura → Página inicial = Início; Página de posts = Blog.

## Pendências antes do lançamento
- Substituir as 2 imagens de fundo geradas por IA e fotos com artefatos por fotos reais.
- Política de privacidade e aviso de cookies (LGPD); considerar hospedar as fontes localmente.
- Revisão clínica dos textos por cirurgião-dentista responsável.
