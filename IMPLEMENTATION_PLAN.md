# Plan d'implémentation PixCollage v1.1

## Résumé

Implémentation de 3 fonctionnalités majeures demandées:
1. **Performance filtres**: Optimisation critique (debounce)
2. **Taille canvas**: Sélecteur de formats prédéfinis
3. **Mode grilles**: Templates de collage avec zones prédéfinies

---

## 1. Optimisation Performance Filtres (CRITIQUE) ⚡

### Problème actuel
- Chaque mouvement de slider déclenche `updateFilter()`
- Mise à jour immédiate de l'état → re-render → `node.cache()` → LENT
- Sur mobile, c'est "horrible" selon l'utilisateur

### Solution technique

**Approche 1: Debounce (RECOMMANDÉE)**
```typescript
// État temporaire pour affichage instantané
const [tempFilters, setTempFilters] = useState(selectedImage?.filters);
const debouncedFilters = useDebounce(tempFilters, 150);

// Effet pour appliquer les vrais filtres
useEffect(() => {
  if (debouncedFilters) {
    updateFilter(debouncedFilters);
  }
}, [debouncedFilters]);
```

**Avantages**:
- Affichage instantané de la valeur
- Application du filtre après 150ms d'inactivité
- Réduit drastiquement les appels à `node.cache()`

**Fichiers modifiés**:
- ✅ `src/hooks/useDebounce.ts` (créé)
- ⏳ `src/components/PixCollage.tsx` (à modifier)

---

## 2. Sélecteur de Taille Canvas 📐

### Formats prédéfinis

```typescript
const CANVAS_SIZES = {
  square: { width: 800, height: 800, label: 'Carré' },
  instagram_post: { width: 1080, height: 1080, label: 'Instagram Post' },
  instagram_story: { width: 1080, height: 1920, label: 'Instagram Story' },
  landscape: { width: 1200, height: 800, label: 'Paysage' },
  portrait: { width: 800, height: 1200, label: 'Portrait' },
  custom: { width: null, height: null, label: 'Personnalisé' },
};
```

### UI proposée

**Desktop (Sidebar)**:
```tsx
<select onChange={handleCanvasSizeChange}>
  <option value="square">Carré (800×800)</option>
  <option value="instagram_post">Instagram Post (1080×1080)</option>
  ...
</select>
```

**Mobile (Modal)**:
- Bouton dans toolbar "Taille"
- Modal avec liste de formats
- Si "Personnalisé": champs width/height

### Logique

```typescript
const changeCanvasSize = (preset: string) => {
  const size = CANVAS_SIZES[preset];
  setCanvasSize({ width: size.width, height: size.height });
  
  // Optionnel: Recentrer les éléments existants
  // ou les redimensionner proportionnellement
};
```

**Traductions nécessaires**:
```json
{
  "canvas": {
    "size": "Taille du canvas",
    "square": "Carré",
    "custom": "Personnalisé",
    ...
  }
}
```

---

## 3. Mode Grilles Prédéfinies 📋

### Architecture

**Types** (`src/types/grids.ts`):
```typescript
export interface GridZone {
  id: string;
  x: number;        // % de la largeur canvas
  y: number;        // % de la hauteur canvas
  width: number;    // % de la largeur canvas
  height: number;   // % de la hauteur canvas
  imageId?: string; // ID de l'image assignée
  borderWidth?: number;
  borderColor?: string;
}

export interface GridTemplate {
  id: string;
  name: string;
  nameKey: string;  // Clé i18n
  preview: string;  // SVG ou base64
  zones: GridZone[];
}
```

**Templates** (`src/utils/gridTemplates.ts`):
```typescript
export const GRID_TEMPLATES: GridTemplate[] = [
  {
    id: 'grid-2x2',
    name: 'Grille 2×2',
    nameKey: 'grids.grid2x2',
    zones: [
      { id: '1', x: 0, y: 0, width: 50, height: 50 },
      { id: '2', x: 50, y: 0, width: 50, height: 50 },
      { id: '3', x: 0, y: 50, width: 50, height: 50 },
      { id: '4', x: 50, y: 50, width: 50, height: 50 },
    ]
  },
  {
    id: 'diagonal',
    name: 'Diagonale',
    nameKey: 'grids.diagonal',
    zones: [
      { id: '1', x: 0, y: 0, width: 100, height: 50 }, // Triangle haut
      { id: '2', x: 0, y: 50, width: 100, height: 50 }, // Triangle bas
    ]
  },
  {
    id: 'mosaic',
    name: 'Mosaïque',
    nameKey: 'grids.mosaic',
    zones: [
      { id: '1', x: 0, y: 0, width: 66, height: 100 },   // Grande gauche
      { id: '2', x: 66, y: 0, width: 34, height: 33 },   // Petite haut
      { id: '3', x: 66, y: 33, width: 34, height: 33 },  // Petite milieu
      { id: '4', x: 66, y: 66, width: 34, height: 34 },  // Petite bas
    ]
  },
  // ... autres templates
];
```

### Composant GridTemplate

**Rendu des zones**:
```typescript
const GridTemplate = ({ template, onZoneClick }) => {
  return (
    <Group>
      {template.zones.map(zone => {
        const x = (zone.x / 100) * canvasWidth;
        const y = (zone.y / 100) * canvasHeight;
        const w = (zone.width / 100) * canvasWidth;
        const h = (zone.height / 100) * canvasHeight;
        
        return (
          <Group key={zone.id}>
            {/* Background si vide */}
            <Rect
              x={x} y={y} width={w} height={h}
              fill={zone.imageId ? 'transparent' : '#f3f4f6'}
              stroke="#d1d5db"
              strokeWidth={2}
            />
            
            {/* Image si assignée */}
            {zone.imageId && (
              <Image
                image={getImageById(zone.imageId)}
                x={x} y={y} width={w} height={h}
                // Crop automatique pour remplir la zone
              />
            )}
            
            {/* Zone cliquable */}
            <Rect
              x={x} y={y} width={w} height={h}
              fill="transparent"
              onClick={() => onZoneClick(zone.id)}
            />
          </Group>
        );
      })}
    </Group>
  );
};
```

### État et logique

```typescript
const [collageMode, setCollageMode] = useState<'free' | 'grid'>('free');
const [selectedTemplate, setSelectedTemplate] = useState<GridTemplate | null>(null);
const [gridZoneAssignments, setGridZoneAssignments] = useState<Map<string, string>>(new Map());

const handleZoneClick = (zoneId: string) => {
  // Ouvrir modal de sélection d'image
  setZoneSelectionOpen(true);
  setCurrentZoneId(zoneId);
};

const assignImageToZone = (zoneId: string, imageId: string) => {
  setGridZoneAssignments(prev => new Map(prev).set(zoneId, imageId));
};
```

### UI Mode Switch

**Desktop**:
```tsx
<div className="flex gap-2 mb-4">
  <button
    onClick={() => setCollageMode('free')}
    className={collageMode === 'free' ? 'active' : ''}
  >
    Mode Libre
  </button>
  <button
    onClick={() => setCollageMode('grid')}
    className={collageMode === 'grid' ? 'active' : ''}
  >
    Mode Grilles
  </button>
</div>

{collageMode === 'grid' && (
  <div className="grid grid-cols-2 gap-2">
    {GRID_TEMPLATES.map(template => (
      <button
        key={template.id}
        onClick={() => setSelectedTemplate(template)}
      >
        <img src={template.preview} />
        <span>{t(template.nameKey)}</span>
      </button>
    ))}
  </div>
)}
```

**Mobile**:
- Bouton toggle "Libre/Grilles" dans toolbar
- Modal pour sélection de template

### Export en mode grilles

```typescript
const handleGridExport = () => {
  // Créer un canvas temporaire avec le rendu des zones
  // Appliquer les images dans les zones
  // Ajouter textes/emojis par-dessus
  // Exporter
};
```

---

## Ordre d'implémentation recommandé

### Phase 1: Performance (URGENT)
1. ✅ Créer `useDebounce` hook
2. ⏳ Modifier PixCollage.tsx pour filtres débounced
3. Test sur mobile
4. **Estimation**: 1-2h

### Phase 2: Taille Canvas
1. Ajouter constantes CANVAS_SIZES
2. Ajouter UI sélecteur
3. Fonction changeCanvasSize
4. Traductions
5. **Estimation**: 1h

### Phase 3: Mode Grilles (MAJEUR)
1. Créer types (`src/types/grids.ts`)
2. Créer templates (`src/utils/gridTemplates.ts`)
3. Créer composant GridTemplate
4. Intégrer dans PixCollage
5. UI mode switch
6. Logique assignation images
7. Export en mode grilles
8. Traductions
9. **Estimation**: 4-6h

---

## Traductions requises

**EN** (`en.json`):
```json
{
  "canvas": {
    "size": "Canvas Size",
    "square": "Square",
    "instagramPost": "Instagram Post",
    "instagramStory": "Instagram Story",
    "landscape": "Landscape",
    "portrait": "Portrait",
    "custom": "Custom",
    "width": "Width",
    "height": "Height"
  },
  "mode": {
    "free": "Free Mode",
    "grid": "Grid Mode",
    "selectTemplate": "Select a Template"
  },
  "grids": {
    "grid2x2": "2×2 Grid",
    "grid3x3": "3×3 Grid",
    "diagonal": "Diagonal",
    "mosaic": "Mosaic",
    "comics": "Comics",
    "pinterest": "Pinterest",
    "assignImage": "Assign Image",
    "emptyZone": "Click to add image"
  }
}
```

**FR** (`fr.json`):
```json
{
  "canvas": {
    "size": "Taille du canvas",
    "square": "Carré",
    "instagramPost": "Post Instagram",
    "instagramStory": "Story Instagram",
    "landscape": "Paysage",
    "portrait": "Portrait",
    "custom": "Personnalisé",
    "width": "Largeur",
    "height": "Hauteur"
  },
  "mode": {
    "free": "Mode Libre",
    "grid": "Mode Grilles",
    "selectTemplate": "Sélectionner un modèle"
  },
  "grids": {
    "grid2x2": "Grille 2×2",
    "grid3x3": "Grille 3×3",
    "diagonal": "Diagonale",
    "mosaic": "Mosaïque",
    "comics": "Comics",
    "pinterest": "Pinterest",
    "assignImage": "Assigner une image",
    "emptyZone": "Cliquer pour ajouter image"
  }
}
```

---

## Tests à effectuer

### Performance filtres
- [ ] Slider brightness: réponse fluide
- [ ] Slider contrast: réponse fluide
- [ ] Slider saturation: réponse fluide
- [ ] Slider blur: réponse fluide
- [ ] Test sur mobile (Android)
- [ ] Vérifier pas de lag visible

### Taille canvas
- [ ] Sélection de chaque format
- [ ] Mode personnalisé
- [ ] Elements existants repositionnés correctement
- [ ] Export dans nouvelle taille

### Mode grilles
- [ ] Switch Free ↔ Grid
- [ ] Sélection de templates
- [ ] Assignation d'images dans zones
- [ ] Texte/emoji par-dessus
- [ ] Export final avec grille

---

## Notes importantes

- Ces fonctionnalités sont **majeures** et nécessitent un développement conséquent
- La performance des filtres est **critique** et doit être traitée en priorité
- Le mode grilles est une **refonte partielle** de l'architecture actuelle
- Prévoir des tests approfondis sur mobile

**Prochaine étape**: Implémenter Phase 1 (Performance filtres)
