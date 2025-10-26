# Correctifs Firefox 🦊

## Problème Identifié
Les images ne s'affichaient pas dans le modal sur Firefox.

## Cause
Firefox gère différemment les images avec `width/height` fixes combinées avec `object-contain` et des contraintes `max-w-full max-h-[70vh]`.

## Solution Appliquée

### Avant (ne fonctionnait pas sur Firefox)
```tsx
<div className="relative max-w-[90vw] max-h-[70vh]">
  <Image
    src={photo.src}
    width={1200}
    height={900}
    className="max-w-full max-h-[70vh] w-auto h-auto object-contain"
    unoptimized
  />
</div>
```

### Après (fonctionne sur tous les navigateurs)
```tsx
<div className="relative w-[90vw] h-[70vh]">
  <Image
    src={photo.src}
    fill
    className="object-contain"
    quality={90}
  />
</div>
```

## Changements Clés

1. **Dimensions fixes sur le conteneur** : `w-[90vw] h-[70vh]` au lieu de `max-w/max-h`
2. **`fill` au lieu de width/height** : Laisse Next.js gérer les dimensions
3. **Suppression de `unoptimized`** : Permet l'optimisation automatique
4. **Classes simplifiées** : `object-contain` seul suffit

## Optimisations CSS Spécifiques Firefox

Dans `globals.css` :
```css
@supports (-moz-appearance: none) {
  img {
    image-rendering: auto;
  }
}
```

## Tests de Validation

- ✅ Chrome 120+ : Fonctionne
- ✅ Firefox 121+ : Fonctionne
- ✅ Safari 17+ : Fonctionne
- ✅ Edge 120+ : Fonctionne

## Autres Améliorations

- Préchargement des images adjacentes (prev/next)
- Meilleure gestion du clavier (useCallback optimisé)
- Animations plus fluides (duration réduite)
