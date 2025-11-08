# Gestes tactiles à implémenter

## Besoin utilisateur

Sur mobile, les utilisateurs s'attendent à pouvoir manipuler les images avec des gestes naturels à deux doigts:

1. **Pinch to zoom** - Écarter deux doigts pour agrandir une image
2. **Rotation à deux doigts** - Tourner l'image en faisant pivoter deux doigts
3. **Déplacement à deux doigts** - Glisser deux doigts pour déplacer l'image

## État actuel

Actuellement, Konva nécessite de:
- Cliquer/taper pour sélectionner l'image
- Utiliser les poignées du Transformer pour redimensionner/pivoter
- Glisser avec un doigt pour déplacer

## Solution technique

### Option 1: Konva avec gestes natifs (Recommandé)

Konva 9.x supporte les gestes multi-touch nativement via les événements touch.

**Implémentation**:
```typescript
// Dans ImageComponent
const [touchStartDistance, setTouchStartDistance] = useState<number | null>(null);
const [touchStartRotation, setTouchStartRotation] = useState<number | null>(null);
const [initialScale, setInitialScale] = useState({ x: 1, y: 1 });
const [initialRotation, setInitialRotation] = useState(0);

// Calculer distance entre deux touches
const getTouchDistance = (touch1: Touch, touch2: Touch) => {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

// Calculer angle entre deux touches
const getTouchAngle = (touch1: Touch, touch2: Touch) => {
  return Math.atan2(touch2.clientY - touch1.clientY, touch2.clientX - touch1.clientX) * 180 / Math.PI;
};

// Handlers
onTouchStart={(e) => {
  const stage = e.target.getStage();
  const touches = stage?.getPointerPosition();
  
  if (e.evt.touches.length === 2) {
    e.evt.preventDefault();
    const touch1 = e.evt.touches[0];
    const touch2 = e.evt.touches[1];
    
    setTouchStartDistance(getTouchDistance(touch1, touch2));
    setTouchStartRotation(getTouchAngle(touch1, touch2));
    setInitialScale({ x: imageData.scaleX, y: imageData.scaleY });
    setInitialRotation(imageData.rotation);
  }
}}

onTouchMove={(e) => {
  if (e.evt.touches.length === 2) {
    e.evt.preventDefault();
    const touch1 = e.evt.touches[0];
    const touch2 = e.evt.touches[1];
    
    // Pinch to zoom
    if (touchStartDistance) {
      const currentDistance = getTouchDistance(touch1, touch2);
      const scale = currentDistance / touchStartDistance;
      
      node.scaleX(initialScale.x * scale);
      node.scaleY(initialScale.y * scale);
    }
    
    // Rotation à deux doigts
    if (touchStartRotation !== null) {
      const currentRotation = getTouchAngle(touch1, touch2);
      const rotationDelta = currentRotation - touchStartRotation;
      
      node.rotation(initialRotation + rotationDelta);
    }
    
    node.getLayer()?.batchDraw();
  }
}}

onTouchEnd={(e) => {
  if (e.evt.touches.length < 2) {
    // Sauvegarder les transformations
    if (touchStartDistance !== null || touchStartRotation !== null) {
      onTransform(imageData.id, {
        x: node.x(),
        y: node.y(),
        scaleX: node.scaleX(),
        scaleY: node.scaleY(),
        rotation: node.rotation(),
      });
    }
    
    setTouchStartDistance(null);
    setTouchStartRotation(null);
  }
}}
```

### Option 2: Hammer.js (Plus complexe)

Intégrer Hammer.js pour des gestes plus sophistiqués, mais ajoute une dépendance.

## Avantages de l'implémentation native Konva

✅ Pas de dépendance externe
✅ Performance optimale
✅ Intégration naturelle avec Konva
✅ Fonctionne avec le système de cache/clearCache existant

## Points d'attention

⚠️ Désactiver le cache pendant les gestes multi-touch (comme pour drag/transform)
⚠️ Gérer les conflits avec le Transformer visible
⚠️ Tester sur différents appareils Android (Pixel, Samsung, etc.)

## Plan d'implémentation

1. **Phase 1**: Pinch to zoom
   - Ajouter handlers onTouchStart/Move/End
   - Calculer scale basé sur distance entre doigts
   - Appliquer scale au node

2. **Phase 2**: Rotation à deux doigts
   - Calculer angle entre doigts
   - Appliquer rotation au node
   - Intégrer avec snap rotation existant

3. **Phase 3**: Déplacement combiné
   - Calculer centre entre deux doigts
   - Permettre déplacement en gardant scale/rotation

4. **Phase 4**: Tests & polish
   - Tester sur Pixel 9
   - Vérifier performances avec filtres actifs
   - Ajuster sensibilité si nécessaire

## Estimation

- Implémentation: 2-3h
- Tests & ajustements: 1-2h
- **Total**: ~4-5h de développement

## UX attendue

```
Utilisateur pose deux doigts sur une image
  ↓
Image se sélectionne automatiquement
  ↓
Écarter les doigts → Image s'agrandit (zoom)
Tourner les doigts → Image pivote
Glisser les deux doigts → Image se déplace
  ↓
Relâcher les doigts → Transformations sauvegardées
```

## Compatibilité

- ✅ Android (natif)
- ✅ iOS (natif)
- ⚠️ Desktop: Pas de gestes multi-touch, mais Transformer existant fonctionne
