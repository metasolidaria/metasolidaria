

## Tornar o botao de copiar chave PIX mais visivel nas sugestoes de instituicao

O componente `EntityInfoBox.tsx` ja possui um `CopyButton` ao lado da chave PIX, mas ele e apenas um icone muito pequeno (3.5x3.5 = 14px) que pode passar despercebido.

### O que sera feito

**Arquivo: `src/components/EntityInfoBox.tsx`**

Substituir o botao de copia discreto por um botao mais visivel com texto "Copiar" ao lado do icone, usando o componente `Button` com variante `outline` e tamanho `sm`. O botao tera feedback visual ("Copiado!") ao clicar.

Mudanca no componente `CopyButton`:
- De: icone pequeno inline ao lado do texto
- Para: botao com texto "Copiar PIX" abaixo da chave, mais facil de identificar e clicar

### Detalhes tecnicos

No componente `CopyButton`, trocar de um `<button>` inline com icone pequeno para um `<Button variant="outline" size="sm">` com texto visivel:

```
Antes:  [icone 14px clicavel]
Depois: [Botao "Copiar PIX" com icone + texto, e feedback "Copiado!" por 2s]
```

O botao aparecera tanto na secao de instituicao selecionada quanto nas sugestoes, sempre que houver chave PIX cadastrada.

