

## Melhorar experiencia de requisitos de senha

Mostrar os requisitos de senha de forma visivel antes do usuario comecar a digitar, para que ele ja saiba o que precisa.

### Mudancas

**`src/components/PasswordStrengthIndicator.tsx`**
- Remover o `if (!password) return null;` para que o componente sempre renderize quando presente
- Quando a senha estiver vazia, mostrar os requisitos em estado neutro (cor cinza/muted) sem a barra de forca
- Quando o usuario comecar a digitar, mostrar a barra de forca e os icones de check/X como ja funciona hoje

### Detalhes tecnicos

- Estado vazio: todos os requisitos aparecem com icone de circulo/ponto neutro em `text-muted-foreground`, sem barra de forca
- Estado com digitacao: comportamento atual mantido (barra de forca + checks verdes / X vermelhos)
- Nenhuma nova dependencia necessaria

