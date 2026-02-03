
# Plano: Adicionar Mascote ao Lado do Doadômetro

## Objetivo
Posicionar o mascote do Meta Solidária ao lado da seção do Doadômetro, criando um visual mais amigável e alinhado com a identidade visual do projeto.

## Alterações

### 1. Modificar o layout do ImpactCounter

Atualmente o layout é centralizado verticalmente. Vamos criar um layout com duas colunas em desktop:
- **Coluna esquerda**: Conteúdo do Doadômetro (header, contador, breakdown)
- **Coluna direita**: Mascote

Em mobile, o mascote ficará abaixo do contador principal.

### 2. Novo Layout Visual

```text
Desktop:
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ┌─────────────────────────────┐    ┌─────────────────┐   │
│   │         ❤️ Doadômetro       │    │                 │   │
│   │                             │    │   [Mascote]     │   │
│   │           1.234             │    │   fazendo       │   │
│   │      doações realizadas     │    │   joinha        │   │
│   │                             │    │                 │   │
│   │   [Cards de categorias]     │    │                 │   │
│   └─────────────────────────────┘    └─────────────────┘   │
│                                                             │
│              [Premium Partners]                             │
└─────────────────────────────────────────────────────────────┘

Mobile:
┌─────────────────────────────┐
│       ❤️ Doadômetro         │
│                             │
│           1.234             │
│      doações realizadas     │
│                             │
│       [Mascote]             │
│                             │
│   [Cards de categorias]     │
│                             │
│    [Premium Partners]       │
└─────────────────────────────┘
```

## Arquivo a Modificar

| Arquivo | Ação |
|---------|------|
| `src/components/ImpactCounter.tsx` | Modificar layout para incluir mascote |

## Detalhes Técnicos

```typescript
// Alterar o layout principal de flex-col para grid em desktop
<div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">
  {/* Doadômetro Section */}
  <div className="w-full max-w-5xl" ref={ref}>
    {/* ... conteúdo existente ... */}
  </div>
  
  {/* Mascote - visível em desktop ao lado, em mobile após o header */}
  <div className="hidden lg:flex items-center justify-center">
    <img 
      src="/mascote-meta-solidaria.png" 
      alt="Mascote Meta Solidária" 
      className="w-40 xl:w-52 h-auto drop-shadow-lg"
    />
  </div>
</div>

// Versão mobile do mascote (posicionado após o contador central)
<div className="lg:hidden flex justify-center my-6">
  <img 
    src="/mascote-meta-solidaria.png" 
    alt="Mascote Meta Solidária" 
    className="w-28 h-auto drop-shadow-lg"
  />
</div>
```

### Animação do mascote
O mascote terá animação de entrada junto com os outros elementos, usando as mesmas classes `animate-in fade-in` do projeto.
