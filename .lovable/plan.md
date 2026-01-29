
# Plano de Otimizacao Mobile - 64% para 80%+

## Diagnostico do Problema

A diferenca significativa entre desktop (93%) e mobile (64%) indica problemas especificos para dispositivos moveis:

| Metrica | Desktop | Mobile | Diferenca |
|---------|---------|--------|-----------|
| Performance | 93% | 64% | -29% |

### Causas Identificadas

1. **Imagem Hero muito grande para mobile**
   - A mesma imagem `hero-donation.webp` e usada em todas as resolucoes
   - Em mobile, uma imagem de 1920px e baixada, mas exibida em ~400px
   - Desperdicio de banda e tempo de download

2. **Falta de lazy loading em imagens abaixo da dobra**
   - Imagens de grupos (Unsplash) carregam imediatamente
   - Imagens de parceiros carregam sem `loading="lazy"`

3. **LCP (Largest Contentful Paint) lento em mobile**
   - A imagem hero e o elemento LCP
   - Mobile tem banda mais lenta que desktop

4. **JavaScript bloqueando renderizacao**
   - Carousel autoplay carrega em multiplos componentes
   - Hooks de animacao executam mesmo antes de ser visivel

---

## Solucao Proposta

### Fase 1: Imagens Responsivas para Hero (Maior Impacto)

Usar o atributo `srcSet` para servir imagens de tamanhos diferentes:

**Hero.tsx - Adicionar srcSet:**
```tsx
<img
  src={heroImage}
  srcSet="/hero-donation-mobile.webp 640w, /hero-donation-tablet.webp 1024w, /hero-donation.webp 1920w"
  sizes="100vw"
  alt="Comunidade unida"
  className="w-full h-full object-cover"
  fetchPriority="high"
  decoding="async"
/>
```

**Criar versoes otimizadas:**
- `hero-donation-mobile.webp` - 640px de largura, ~50-80KB
- `hero-donation-tablet.webp` - 1024px de largura, ~100-150KB  
- `hero-donation.webp` - 1920px (manter atual ou comprimir)

**index.html - Preload responsivo:**
```html
<link rel="preload" as="image" type="image/webp" href="/hero-donation-mobile.webp" media="(max-width: 640px)" fetchpriority="high" />
<link rel="preload" as="image" type="image/webp" href="/hero-donation-tablet.webp" media="(min-width: 641px) and (max-width: 1024px)" fetchpriority="high" />
<link rel="preload" as="image" type="image/webp" href="/hero-donation.webp" media="(min-width: 1025px)" fetchpriority="high" />
```

### Fase 2: Lazy Loading para Imagens Abaixo da Dobra

**GroupsSection.tsx - Adicionar loading lazy:**
```tsx
<img 
  src={group.image_url || placeholderImages[index % placeholderImages.length]} 
  alt={group.name} 
  loading="lazy"
  decoding="async"
  className="w-full h-full object-cover ..." 
/>
```

**PartnersSection.tsx - Adicionar loading lazy em logos:**
```tsx
<img
  src={partnerLogo}
  alt={partner.name}
  loading="lazy"
  decoding="async"
  className="..."
/>
```

### Fase 3: Otimizar Carrosséis e Autoplay

**Problema:** O plugin `embla-carousel-autoplay` e importado em varios componentes e inicia imediatamente.

**Solucao:** Lazy load do plugin apenas quando visivel:

```tsx
// Antes
import Autoplay from "embla-carousel-autoplay";
const autoplayPlugin = useRef(Autoplay({ delay: 3000 }));

// Depois - carrega apenas quando necessario
const [autoplayPlugin, setAutoplayPlugin] = useState<any>(null);

useEffect(() => {
  // Importar dinamicamente apenas quando componente monta
  import("embla-carousel-autoplay").then((module) => {
    setAutoplayPlugin(module.default({ delay: 3000 }));
  });
}, []);
```

### Fase 4: Reduzir CSS Critico

**index.html - Inline CSS critico:**
```html
<style>
  /* CSS critico inline para primeiro render */
  body { margin: 0; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
  #root { min-height: 100vh; }
  .hero-skeleton { background: linear-gradient(135deg, #1a7d3c 0%, #2e9e57 100%); min-height: 100vh; }
</style>
```

### Fase 5: Defer Third-Party Scripts

**Garantir que scripts de terceiros nao bloqueiam:**
- Google Fonts ja usa preload com onload
- Verificar se nao ha scripts bloqueantes

---

## Arquivos a Modificar

### Prioridade Alta (Fase 1-2):
1. `src/components/Hero.tsx` - Adicionar srcSet responsivo
2. `index.html` - Preload condicional por media query
3. `src/components/GroupsSection.tsx` - loading="lazy" nas imagens
4. `src/components/PartnersSection.tsx` - loading="lazy" nas imagens

### Prioridade Media (Fase 3):
5. `src/components/HeroPremiumLogos.tsx` - Lazy load do Autoplay
6. `src/components/GoldPartnersCarousel.tsx` - Lazy load do Autoplay
7. `src/components/PremiumLogosCarousel.tsx` - Lazy load do Autoplay

### Prioridade Baixa (Fase 4):
8. `index.html` - CSS critico inline

---

## Imagens a Criar (Manual)

O usuario precisara criar versoes otimizadas da imagem hero:

| Arquivo | Largura | Tamanho Alvo | Uso |
|---------|---------|--------------|-----|
| `hero-donation-mobile.webp` | 640px | 50-80 KB | Smartphones |
| `hero-donation-tablet.webp` | 1024px | 100-150 KB | Tablets |
| `hero-donation.webp` | 1920px | 200-300 KB | Desktop |

**Ferramentas recomendadas:**
- [Squoosh.app](https://squoosh.app/) - Compressao WebP online
- [TinyPNG](https://tinypng.com/) - Compressao automatica

---

## Impacto Esperado

| Metrica | Atual Mobile | Esperado | Melhoria |
|---------|--------------|----------|----------|
| LCP | ~4-5s | ~2-3s | -50% |
| FCP | ~2-3s | ~1.5-2s | -30% |
| Performance Score | 64% | 75-85% | +11-21% |

### Por que essas mudancas funcionam?

1. **Imagens responsivas**: Mobile baixa imagem 5-10x menor
2. **Lazy loading**: Imagens abaixo da dobra nao bloqueiam render inicial
3. **Autoplay lazy**: Reduz JS executado no carregamento inicial
4. **CSS inline**: Primeiro paint mais rapido

---

## Secao Tecnica

### Como srcSet funciona?

O atributo `srcSet` permite ao browser escolher a imagem mais apropriada:

```html
<img 
  src="/hero-desktop.webp"
  srcSet="/hero-mobile.webp 640w, /hero-tablet.webp 1024w, /hero-desktop.webp 1920w"
  sizes="100vw"
/>
```

- `640w` = imagem de 640px de largura
- `sizes="100vw"` = imagem ocupa 100% da viewport
- Browser calcula: `device width * DPR` e escolhe a menor imagem suficiente

### loading="lazy" vs fetchPriority="high"

- `loading="lazy"`: Adia carregamento ate proximo da viewport
- `fetchPriority="high"`: Prioriza download imediato (so para LCP)

**Regra:**
- Hero image: `fetchPriority="high"` (e LCP)
- Tudo abaixo da dobra: `loading="lazy"`

### Por que mobile e mais lento?

1. **Conexao**: 3G/4G mais lenta que cabo/WiFi
2. **CPU**: Dispositivos moveis tem menos poder de processamento
3. **Memoria**: Menos RAM disponivel para parsing de JS
4. **DPR**: Retina displays precisam de imagens maiores

---

## Limitacoes

- **Criacao das imagens**: O usuario precisara criar as versoes otimizadas manualmente
- **Cache CDN**: A configuracao de cache esta no servidor, nao no codigo
- **Conexao 3G**: Mesmo com otimizacoes, conexoes muito lentas terao impacto
