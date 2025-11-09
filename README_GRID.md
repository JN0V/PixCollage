# Grid System - Guide d'Utilisation

## 📐 Vue d'Ensemble

Le système de grilles permet de créer des collages structurés en plaçant automatiquement les images dans des zones prédéfinies.

## 🎨 Grilles Disponibles (13 templates)

### Bases
- **Libre**: Mode sans grille (par défaut)
- **2 Colonnes**: Division verticale en 2 zones égales
- **2 Lignes**: Division horizontale en 2 zones égales
- **3 Colonnes**: Division verticale en 3 zones égales
- **3 Lignes**: Division horizontale en 3 zones égales
- **Grille 2×2**: 4 zones carrées

### Layouts Héro
- **Héro Gauche**: 1 grande zone gauche + 2 petites droite
- **Héro Droite**: 2 petites gauche + 1 grande zone droite
- **Héro Haut**: 1 grande zone haut + 2 petites bas
- **Héro Bas**: 2 petites haut + 1 grande zone bas

### Layouts Créatifs
- **Asymétrique 1**: 4 zones de tailles variées
- **Asymétrique 2**: 5 zones disposées artistiquement
- **Mosaïque**: 8 zones complexes

## 🔧 Fonctionnalités

### Sélection de Grille
1. Cliquez sur "Sélectionner une grille" dans la sidebar
2. Choisissez un template parmi les 13 disponibles
3. La grille est appliquée au canvas

### Affichage/Masquage
- Bouton "Afficher/Masquer la grille" pour toggler l'overlay
- Overlay: bordures en pointillés indigo sur les zones

### Snap Automatique (À venir)
- Les images se placent automatiquement dans les zones
- Calcul intelligent du scale pour remplir les zones (mode "cover")

### Auto-Fill (À venir)
- Remplissage automatique de toutes les zones avec les images disponibles

## 📁 Architecture

```
src/
├── types/
│   └── grid.ts              # Types et templates de grilles
├── hooks/
│   ├── useGrid.ts           # Hook de gestion des grilles
│   └── useImageHandlers.ts  # Utilitaires pour charger les images
├── components/
│   ├── controls/
│   │   └── GridSelector.tsx # Modal de sélection
│   └── canvas/
│       └── GridOverlay.tsx  # Affichage des zones sur canvas
```

## 🌐 Traductions

**Anglais:**
- `grid.title`: "Grid Layout"
- `grid.selectGrid`: "Select Grid"
- `grid.showGrid`: "Show Grid"
- `grid.hideGrid`: "Hide Grid"

**Français:**
- `grid.title`: "Disposition en grille"
- `grid.selectGrid`: "Sélectionner une grille"
- `grid.showGrid`: "Afficher la grille"
- `grid.hideGrid`: "Masquer la grille"

## 💡 Comment Ça Marche

### Zones Relatives
Les zones utilisent des coordonnées relatives (0-1):
```typescript
{
  x: 0.5,      // 50% de la largeur du canvas
  y: 0,        // Haut du canvas
  width: 0.5,  // 50% de la largeur
  height: 1    // 100% de la hauteur
}
```

Cette approche permet:
- ✅ Adaptation automatique à toute taille de canvas
- ✅ Pas de recalcul lors du resize
- ✅ Facile de créer de nouveaux templates

### Ajout de Nouvelles Grilles

Pour ajouter un template, éditez `src/types/grid.ts`:

```typescript
{
  id: 'mon-template',
  name: 'Mon Template',
  zones: [
    { id: 'zone1', x: 0, y: 0, width: 0.6, height: 0.7 },
    { id: 'zone2', x: 0.6, y: 0, width: 0.4, height: 0.7 },
    { id: 'zone3', x: 0, y: 0.7, width: 1, height: 0.3 },
  ],
}
```

## 🚀 Prochaines Étapes

1. **Drag & Drop entre zones**: Réassigner une image en la glissant
2. **Snap automatique au drop**: Placement intelligent lors de l'ajout d'images
3. **Persistance**: Sauvegarder l'assignment grille/images
4. **Éditeur de grilles**: Créer des grilles personnalisées
5. **Export avec grille**: Option d'exporter avec ou sans bordures

## 📊 Impact Code

- **PixCollage.tsx**: 922 lignes (était 1540 avant refactoring)
- **Total système grilles**: ~800 lignes
- **Templates prédéfinis**: 13
- **Build size impact**: +8KB gzipped
