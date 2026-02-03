
# Plano: Mascote ao Lado do Contador com Animacao Flutuante

## Objetivo
Reposicionar o mascote para ficar ao lado do numero de "doacoes realizadas" (contador central) e adicionar uma animacao flutuante sutil para torna-lo mais dinamico.

## Alteracoes

### 1. Reorganizar o Layout do Contador Central

Atualmente o contador esta centralizado. Vamos criar um layout flex horizontal que posiciona o numero e texto de doacoes junto com o mascote ao lado:

```text
Desktop:
┌─────────────────────────────────────────────────────────────┐
│                      Doadometro                             │
│              Impacto social gerado ate o momento            │
│                                                             │
│          ┌──────────────────┐   ┌─────────────────┐         │
│          │      1.234       │   │   [Mascote]     │         │
│          │ doacoes realizadas│   │   flutuando     │         │
│          └──────────────────┘   └─────────────────┘         │
│                                                             │
│              [Cards de categorias]                          │
│                                                             │
│              [Premium Partners]                             │
└─────────────────────────────────────────────────────────────┘

Mobile:
┌─────────────────────────────┐
│       Doadometro            │
│                             │
│          1.234              │
│    doacoes realizadas       │
│                             │
│       [Mascote flutuando]   │
│                             │
│   [Cards de categorias]     │
│                             │
│    [Premium Partners]       │
└─────────────────────────────┘
```

### 2. Usar Animacao Flutuante Existente

O projeto ja possui a animacao `animate-float` configurada no tailwind.config.ts:
```typescript
"float": {
  "0%, 100%": { transform: "translateY(0)" },
  "50%": { transform: "translateY(-10px)" },
}
// animation: "float 3s ease-in-out infinite"
```

## Arquivo a Modificar

| Arquivo | Acao |
|---------|------|
| `src/components/ImpactCounter.tsx` | Reorganizar layout e adicionar animacao |

## Detalhes Tecnicos

### Mudancas no ImpactCounter.tsx:

1. **Remover o mascote da posicao atual** (lado direito em grid separado)

2. **Criar novo layout para o contador central com mascote inline**:

```typescript
{/* Central Counter with Mascot */}
<div
  className={`flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-10 mb-6 ${isInView ? 'animate-in fade-in zoom-in-95 duration-500' : 'opacity-0'}`}
  style={{ animationDelay: '200ms' }}
>
  {/* Counter */}
  <div className="text-center">
    <div className="text-6xl md:text-8xl font-bold text-primary-foreground mb-2">
      {isLoading ? (
        <Skeleton className="h-20 md:h-24 w-48 md:w-64 mx-auto bg-primary-foreground/20" />
      ) : isInView ? (
        <AnimatedNumber value={impactData?.totalDonations || 0} suffix="" />
      ) : null}
    </div>
    <p className="text-primary-foreground/70 text-xl">
      doacoes realizadas
    </p>
  </div>
  
  {/* Mascot with floating animation */}
  <img 
    src="/mascote-meta-solidaria.png" 
    alt="Mascote Meta Solidaria" 
    className="w-28 lg:w-40 xl:w-48 h-auto drop-shadow-lg animate-float"
  />
</div>
```

3. **Remover o container do mascote separado** (linhas 139-149 e 194-204)

4. **Ajustar o grid do container principal** para remover a coluna do mascote:
```typescript
// De:
<div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">

// Para:
<div className="w-full max-w-5xl">
```

### Comportamento da Animacao Flutuante:
- Move o mascote 10px para cima e volta suavemente
- Duracao de 3 segundos por ciclo
- Repete infinitamente
- Efeito sutil que da vida ao mascote sem distrair
