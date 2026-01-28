
# Plano: Corrigir Sobreposição no Header em Telas Tablet

## Problema Identificado

Na visualização tablet (834px), o nome do usuário está sobrepondo os botões de navegação (Parceiros, Impacto). Isso ocorre porque:

1. O menu de navegação está centralizado com posição absoluta
2. O nome de usuário pode ser muito longo (ex: "dbmetasolidaria")
3. Não há limite de largura ou truncamento no nome do usuário
4. Os elementos colidem quando o espaço horizontal é limitado

## Solução Proposta

### 1. Limitar a largura máxima do nome de usuário

Adicionar `max-w-[120px]` e `truncate` no botão do nome do usuário para que nomes longos sejam cortados com "..." e não invadam o menu central.

### 2. Adicionar z-index ao menu de autenticação

Garantir que os botões de auth tenham `z-10` igual ao logo para manter hierarquia visual consistente.

### 3. Reduzir gap do menu de navegação em tablets

Mudar o `gap-8` para `gap-4 lg:gap-8` para dar mais espaço em telas menores.

## Alterações Técnicas

**Arquivo: `src/components/Header.tsx`**

```tsx
// Antes (linha 62)
<nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">

// Depois
<nav className="hidden md:flex items-center gap-4 lg:gap-8 absolute left-1/2 -translate-x-1/2">
```

```tsx
// Antes (linha 79)
<div className="hidden md:flex items-center gap-3">

// Depois
<div className="hidden md:flex items-center gap-3 z-10">
```

```tsx
// Antes (linhas 82-90)
<Button
  variant="ghost"
  size="sm"
  onClick={() => navigate("/perfil")}
  className={isScrolled ? "text-foreground" : "text-primary-foreground hover:text-primary-foreground/80"}
>
  <Settings className="w-4 h-4 mr-1" />
  {user.user_metadata?.full_name || user.email?.split("@")[0]}
</Button>

// Depois
<Button
  variant="ghost"
  size="sm"
  onClick={() => navigate("/perfil")}
  className={`max-w-[140px] ${isScrolled ? "text-foreground" : "text-primary-foreground hover:text-primary-foreground/80"}`}
>
  <Settings className="w-4 h-4 mr-1 shrink-0" />
  <span className="truncate">
    {user.user_metadata?.full_name || user.email?.split("@")[0]}
  </span>
</Button>
```

## Resultado Esperado

- Nome de usuário limitado a ~140px com truncamento (ex: "dbmetasoli...")
- Menu de navegação com espaçamento menor em tablets (gap-4) e maior em desktop (gap-8)
- Sem sobreposição entre elementos do header
- Layout consistente em todas as dimensões de tela

## Arquivo a Modificar

- `src/components/Header.tsx`
