

# Adicionar .env ao .gitignore

## Resumo

Adicionar o arquivo `.env` ao `.gitignore` para que ele nunca mais seja commitado no GitHub, evitando a remoção acidental que causou o erro anterior.

## Detalhes técnicos

Editar o arquivo `.gitignore` para incluir a linha `.env` (e variantes como `.env.local`, `.env*.local`) na lista de arquivos ignorados pelo Git.

Isso garante que:
- O `.env` continuará sendo gerenciado automaticamente pela plataforma Lovable Cloud
- Ele não aparecerá mais nos commits do GitHub
- Não haverá risco de remoção acidental via GitHub

