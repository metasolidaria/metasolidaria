

# Plano de Configuracao de Cache Eficiente

## Diagnostico do Problema

O PageSpeed identificou que **todos os assets estaticos** estao sendo servidos **sem headers de cache (TTL: None)**, resultando em:

| Metrica | Valor |
|---------|-------|
| Economia Potencial | 1.896 KiB |
| Hero Image | 1.461 KiB sem cache |
| JS Bundle | 155 KiB sem cache |
| Logos | 95 KiB sem cache |

---

## Causa Raiz

A hospedagem do Lovable nao esta configurando headers `Cache-Control` automaticamente para os assets estaticos. Diferente de CDNs como Vercel/Netlify que detectam arquivos com hash (ex: `index-C-ik6uaT.js`) e aplicam cache imutavel, a infraestrutura atual nao faz isso.

---

## Solucao Proposta

### Fase 1: Criar arquivo `_headers` (Netlify-style)

Criar arquivo `public/_headers` com regras de cache agressivo:

```text
# Cache imutavel para assets com hash (1 ano)
/assets/*
  Cache-Control: public, max-age=31536000, immutable

# Cache longo para imagens estaticas (1 ano)
/*.webp
  Cache-Control: public, max-age=31536000, immutable

/*.jpg
  Cache-Control: public, max-age=31536000, immutable

/*.png
  Cache-Control: public, max-age=31536000, immutable

# Cache medio para favicon e icons (1 semana)
/favicon.*
  Cache-Control: public, max-age=604800

/icon-*.png
  Cache-Control: public, max-age=604800

# Sem cache para service worker (sempre atualizado)
/sw.js
  Cache-Control: no-cache, no-store, must-revalidate

# Sem cache para manifest (pode mudar)
/manifest.webmanifest
  Cache-Control: no-cache
```

**Nota:** Este arquivo funciona em Netlify e algumas outras hospedagens. Se a hospedagem do Lovable nao suportar, a Fase 2 sera a solucao principal.

### Fase 2: Expandir Service Worker Cache

Atualizar `vite.config.ts` para incluir todos os assets estaticos no cache do Service Worker:

**Mudancas:**

1. Adicionar todas as imagens ao `includeAssets`
2. Adicionar regra de `runtimeCaching` para assets locais com estrategia `CacheFirst`
3. Incluir pattern para imagens `.webp` e `.jpg`

```typescript
// vite.config.ts - VitePWA config
includeAssets: [
  "favicon.jpg", 
  "robots.txt",
  "logo.jpg",
  "naturuai-logo.jpg",
  "hero-donation.webp",
  "hero-donation-mobile.webp",
  "hero-donation-tablet.webp",
  "og-image.png",
  "icon-192x192.png",
  "icon-512x512.png"
],

workbox: {
  globPatterns: ["**/*.{js,css,html,ico,png,jpg,webp,svg,woff,woff2}"],
  runtimeCaching: [
    // Cache local para imagens estaticas
    {
      urlPattern: /\.(webp|jpg|jpeg|png|svg)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "static-images-cache",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 ano
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // Cache para chunks JS com hash
    {
      urlPattern: /\/assets\/.*\.js$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "js-cache",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 ano
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // Cache para CSS
    {
      urlPattern: /\/assets\/.*\.css$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "css-cache",
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 ano
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // Manter cache de Google Fonts existente
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: "CacheFirst",
      options: { ... }
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: "CacheFirst",
      options: { ... }
    },
  ],
}
```

### Fase 3: Restaurar Imagem Hero

Agora que o cache estara configurado, restaurar a imagem hero com `srcSet` responsivo:

```tsx
// src/components/Hero.tsx
<img
  src="/hero-donation.webp"
  srcSet="/hero-donation-mobile.webp 640w, /hero-donation-tablet.webp 1024w, /hero-donation.webp 1920w"
  sizes="100vw"
  alt="Comunidade unida"
  className="w-full h-full object-cover"
  fetchPriority="high"
  decoding="async"
/>
```

---

## Arquivos a Criar/Modificar

### Criar:
1. `public/_headers` - Regras de cache HTTP

### Modificar:
2. `vite.config.ts` - Expandir PWA config
3. `src/components/Hero.tsx` - Restaurar imagem

---

## Impacto Esperado

| Metrica | Antes | Depois |
|---------|-------|--------|
| Cache TTL | None | 1 ano (assets) |
| Visitas Repetidas | Re-download 1.9MB | Cache hit 95%+ |
| FCP (repeat visit) | Lento | Instantaneo |

---

## Secao Tecnica

### Por que Cache-Control e importante?

O header `Cache-Control` diz ao browser por quanto tempo manter um arquivo em cache:

```text
Cache-Control: public, max-age=31536000, immutable
```

- `public`: Pode ser cacheado por proxies/CDNs
- `max-age=31536000`: Valido por 1 ano (em segundos)
- `immutable`: Nunca revalidar - o arquivo nao vai mudar

### Por que arquivos com hash podem ser imutaveis?

O Vite gera arquivos como `index-C-ik6uaT.js`. O hash `C-ik6uaT` e derivado do conteudo. Se o codigo mudar, o hash muda e o browser busca o novo arquivo. Por isso e seguro cachear por 1 ano.

### Service Worker como fallback

Se a hospedagem nao suportar o arquivo `_headers`, o Service Worker do PWA funcionara como cache secundario. Quando o usuario visitar pela primeira vez, o SW cacheara todos os assets. Nas visitas seguintes, servira do cache local.

### Limitacoes

- **Primeiro load**: O usuario ainda precisa baixar 1.9MB na primeira visita
- **Suporte _headers**: Depende da hospedagem do Lovable suportar este formato
- **Service Worker**: So funciona apos registro (3s apos load inicial)

