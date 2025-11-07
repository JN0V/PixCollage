# Nouvelles fonctionnalités à implémenter

## 1. Optimisation Performance Filtres ⚡

**Problème**: L'application des filtres est très lente lors du déplacement des sliders

**Solution**:
- Débounce des changements de filtres (150ms)
- État temporaire pour affichage instantané de la valeur
- Application réelle des filtres avec délai
- Alternative: Appliquer seulement au relâchement du slider

**Fichiers à modifier**:
- `src/components/PixCollage.tsx`: Ajouter hook useDebounce et état temporaire

---

## 2. Sélecteur de Taille Canvas 📐

**Besoin**: Pouvoir changer la taille du canvas (carré, portrait, paysage, etc.)

**Tailles proposées**:
- Carré: 800×800
- Instagram Post: 1080×1080
- Instagram Story: 1080×1920
- Paysage: 1200×800
- Portrait: 800×1200
- Personnalisé: Champs largeur/hauteur

**UI**:
- Desktop: Dropdown ou boutons dans sidebar
- Mobile: Modal avec sélection

**Fichiers à modifier**:
- `src/components/PixCollage.tsx`: Ajouter sélecteur et fonction changeCanvasSize
- `src/i18n/locales/en.json` + `fr.json`: Traductions

---

## 3. Mode Grilles Prédéfinies 📋

**Besoin**: Mode template avec grilles prédéfinies pour placer les images

**Fonctionnalités**:
- **Mode Libre** (actuel): Placement libre des images sur canvas
- **Mode Grilles**: Templates avec zones prédéfinies

**Templates à créer**:
1. **Grille 2×2**: 4 cellules égales
2. **Grille 3×3**: 9 cellules égales
3. **Diagonale**: 2 zones séparées par diagonale
4. **Mosaïque**: 1 grande + 3 petites
5. **Comics**: Bordures type BD avec séparations
6. **Pinterest**: Grille verticale asymétrique

**Système**:
```typescript
interface GridTemplate {
  id: string;
  name: string;
  zones: GridZone[];
}

interface GridZone {
  id: string;
  x: number; // position en %
  y: number; // position en %
  width: number; // largeur en %
  height: number; // hauteur en %
  borderStyle?: 'solid' | 'dashed' | 'comic';
}
```

**Workflow**:
1. Utilisateur switch en mode grilles
2. Sélectionne un template
3. Clique sur une zone pour assigner une image
4. L'image s'adapte automatiquement à la zone
5. Peut ajouter texte/emojis par-dessus

**UI**:
- Toggle "Mode Libre" / "Mode Grilles"
- Galerie de templates avec preview
- Zones cliquables pour assigner images
- Indicateur visuel des zones vides

**Fichiers à créer**:
- `src/types/grids.ts`: Types pour templates
- `src/utils/gridTemplates.ts`: Définitions des templates
- `src/components/GridTemplate.tsx`: Composant d'affichage grille

**Fichiers à modifier**:
- `src/components/PixCollage.tsx`: Ajouter mode grilles
- `src/i18n/locales/*.json`: Traductions

---

## Ordre d'implémentation

1. ✅ Nettoyage références photocollage
2. ⚡ Optimisation filtres (performance critique)
3. 📐 Sélecteur taille canvas (rapide à implémenter)
4. 📋 Mode grilles (fonctionnalité majeure)

---

## Notes techniques

- Toutes les modifications doivent être testées sur mobile
- Maintenir compatibilité i18n EN/FR
- Performance: éviter re-renders inutiles
- UX: Transitions fluides entre modes
