

## Simplificar exigencia de senha: minimo 6 caracteres + sem sequencias

### O que muda

A senha passa a exigir apenas:
1. **Minimo 6 caracteres**
2. **Sem sequencias** (ex: "123456", "abcdef", "654321")

Todos os outros requisitos (maiuscula, minuscula, numero, caractere especial) serao **removidos**.

### Arquivos afetados

**1. `src/components/PasswordStrengthIndicator.tsx`**
- Alterar os requisitos para apenas 2: minimo 6 caracteres e sem sequencias
- Atualizar a logica de forca: 0 = vazia, 1 = fraca (1 requisito), 2 = forte (2 requisitos)
- Simplificar a barra de forca para 2 niveis
- Adicionar funcao `hasSequentialChars` que detecta 3+ caracteres consecutivos em sequencia (abc, 123, cba, 321)
- Atualizar `validatePasswordStrength` para validar apenas minimo 6 e sem sequencias

**2. `src/lib/validations.ts`**
- Atualizar `signupSchema` para `password: z.string().min(6, "...")`

**3. `src/components/PasswordInput.tsx`**
- Alterar `minLength` default de 6 (ja esta 6, sem mudanca necessaria)

### Detalhes tecnicos

**Deteccao de sequencias** - funcao que verifica se a senha contem 3 ou mais caracteres consecutivos em ordem crescente ou decrescente (ex: "abc", "123", "zyx", "987"):

```typescript
function hasSequentialChars(password: string, length = 3): boolean {
  for (let i = 0; i <= password.length - length; i++) {
    let ascending = true;
    let descending = true;
    for (let j = 1; j < length; j++) {
      if (password.charCodeAt(i + j) !== password.charCodeAt(i + j - 1) + 1) ascending = false;
      if (password.charCodeAt(i + j) !== password.charCodeAt(i + j - 1) - 1) descending = false;
    }
    if (ascending || descending) return true;
  }
  return false;
}
```

**Requisitos atualizados:**
- "Minimo 6 caracteres" - `password.length >= 6`
- "Sem sequencias (abc, 123...)" - `!hasSequentialChars(password)`

**Barra de forca simplificada:**
- 0 requisitos: vazia
- 1 requisito: fraca (vermelho)
- 2 requisitos: forte (verde)

