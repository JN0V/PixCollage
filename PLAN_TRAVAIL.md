# Plan de travail - PixCollage

## ✅ Phase 1: UX Mobile & Performance (TERMINÉ)

- [x] Boutons mobile agrandis (56px touch targets)
- [x] Sliders optimisés (28px thumb visible)
- [x] Barre mobile redesignée (grille 3x3 équilibrée)
- [x] Filtres restent visibles pendant manipulation
- [x] Debounce 300ms pour feedback instantané
- [x] Tests validés sur Pixel 9

**Commit**: `9393485` - 🎨 Amélioration UX mobile + fix filtres visibles

---

## 🎯 Phase 2: Gestes tactiles multi-touch (EN COURS)

**Priorité**: HAUTE - Amélioration UX mobile

### Objectifs
- Pinch to zoom (écarter 2 doigts → agrandir image)
- Rotation à 2 doigts (pivoter image)
- Déplacement à 2 doigts (glisser image)

### Implémentation
- Utiliser événements natifs Konva touch
- Calculer distance/angle entre 2 touches
- Appliquer transformations en temps réel
- Désactiver pendant que Transformer est actif

### Tests requis
- Pixel 9 (écran tactile natif)
- Vérifier pas de conflit avec drag 1 doigt
- Performance fluide

**Fichier**: `TOUCH_GESTURES_TODO.md` (plan technique détaillé)

**Estimation**: 4-5h développement

---

## 📐 Phase 3: Responsivité portrait/paysage (EN COURS)

**Priorité**: HAUTE - Problème critique UX

### Problèmes identifiés
- ❌ Basculement portrait → paysage fait "n'importe quoi"
- ❌ Canvas ne s'adapte pas à la nouvelle orientation
- ❌ Barre d'outils mobile mal positionnée en paysage
- ❌ Pas testé dans navigateur web depuis longtemps

### Objectifs
- Canvas s'adapte automatiquement à l'orientation
- Barre d'outils repositionnée intelligemment
- Uniformité desktop/tablette/mobile
- Tester et valider dans navigateur web

### Investigation nécessaire
1. Tester dans navigateur web (`npm run dev`)
2. Identifier les problèmes de responsivité
3. Revoir le système de dimensionnement du canvas
4. Gérer l'événement `orientationchange` / `resize`

### Solution envisagée
```typescript
// Écouter changement d'orientation
useEffect(() => {
  const handleResize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    // Recalculer taille canvas
    // Repositionner éléments UI
  };
  
  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', handleResize);
  
  return () => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('orientationchange', handleResize);
  };
}, []);
```

**Estimation**: 2-3h investigation + fix

---

## 📏 Phase 4: Sélecteur taille canvas

**Priorité**: MOYENNE

### Objectifs
- Permettre de choisir dimensions du canvas
- Formats prédéfinis (Instagram Story 9:16, Post 1:1, Facebook 16:9, etc.)
- Mode libre (largeur/hauteur custom)

### UI
- Desktop: Dropdown dans header ou sidebar
- Mobile: Modal avec sélection

**Estimation**: 3-4h

---

## 🎨 Phase 5: Mode grilles prédéfinies

**Priorité**: MOYENNE-BASSE

### Objectifs
- Layouts prédéfinis (2 images, 3 images, 4 images, etc.)
- Glisser-déposer dans les cases
- Redimensionnement automatique
- Templates Instagram/Facebook

**Estimation**: 8-10h (fonctionnalité majeure)

---

## Ordre d'exécution

1. **Tester app dans navigateur** (30 min)
   - `npm run dev`
   - Identifier bugs desktop/tablette
   - Documenter problèmes

2. **Fix responsivité portrait/paysage** (2-3h)
   - Gérer resize/orientationchange
   - Canvas adaptatif
   - Tests multi-device

3. **Gestes tactiles** (4-5h)
   - Implémentation pinch/rotate/pan
   - Tests Pixel 9
   - Documentation

4. **Sélecteur canvas** (3-4h)
   - UI + logique
   - Tests

5. **Mode grilles** (8-10h)
   - Architecture
   - Templates
   - UI/UX

---

## Tests requis avant chaque commit

- ✅ Build réussit (`npm run build`)
- ✅ APK se génère (`npx cap sync android && ./gradlew assembleDebug`)
- ✅ Tests sur Pixel 9 (mobile)
- ✅ Tests dans navigateur (desktop)
- ✅ Validation utilisateur

---

## Notes

- Auteur Git: **JN0V** `<jn0v@users.noreply.github.com>`
- Repository: `git@github.com:JN0V/PixCollage.git`
- Branch: `main`
