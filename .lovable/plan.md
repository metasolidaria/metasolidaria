

# Plano: Atualizar Popup de Lançamento com Logo e Mascote

## Objetivo
Corrigir a data para 2026 e adicionar o logo do Meta Solidária junto com o mascote no popup de lançamento.

## Alterações

### 1. Salvar imagem do mascote
Copiar a imagem enviada para `public/mascote-meta-solidaria.png`.

### 2. Atualizar LaunchAnnouncementModal.tsx

- Corrigir data de `07/02/2025` para `07/02/2026`
- Substituir o ícone de foguete pelo logo do Meta Solidária (`/logo.jpg`)
- Adicionar o mascote abaixo do texto

### 3. Novo Layout Visual

```text
┌─────────────────────────────────────────────┐
│                                             │
│        [Logo Meta Solidária - circular]     │
│                                             │
│        LANÇAMENTO OFICIAL                   │
│                                             │
│            07/02/2026                       │
│                                             │
│   Estamos chegando! Prepare-se para fazer   │
│   parte da maior rede de solidariedade      │
│   do Brasil.                                │
│                                             │
│        [Mascote fazendo joinha]             │
│                                             │
│             [ Entendi! ]                    │
└─────────────────────────────────────────────┘
```

## Arquivos

| Arquivo | Ação |
|---------|------|
| `public/mascote-meta-solidaria.png` | Criar (copiar imagem enviada) |
| `src/components/LaunchAnnouncementModal.tsx` | Modificar |

## Detalhes Técnicos

```typescript
// Remover import do Rocket
// import { Rocket } from "lucide-react"; // Remover

// Substituir o ícone pelo logo
<img 
  src="/logo.jpg" 
  alt="Meta Solidária" 
  className="w-20 h-20 rounded-full object-cover"
/>

// Corrigir data
<div className="text-4xl font-extrabold text-primary my-4">
  07/02/2026
</div>

// Adicionar mascote
<img 
  src="/mascote-meta-solidaria.png" 
  alt="Mascote Meta Solidária" 
  className="w-28 h-auto mx-auto mt-4"
/>
```

