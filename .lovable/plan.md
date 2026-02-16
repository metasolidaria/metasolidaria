

## Remover 5 instituições de teste

Serão removidas as seguintes instituições do banco de dados:

1. Lar dos Idosos Esperança (São Paulo)
2. Casa da Criança Feliz (Campinas)
3. Centro Comunitário União (Ribeirão Preto)
4. Abrigo Vida Nova (Santos)
5. ONG Mãos que Ajudam (Sorocaba)

As 3 instituições reais permanecerão intactas:
- Educandario (Ouro Fino, MG)
- Santa Casa de Ouro Fino MG (Ouro Fino, MG)
- Alimento para todos (Campinas, SP)

### Detalhes técnicos

Executar um DELETE na tabela `entities` filtrando pelos IDs das 5 instituições de teste (IDs que começam com `e1111111`, `e2222222`, `e3333333`, `e4444444`, `e5555555`). A view `entities_public` será atualizada automaticamente.

