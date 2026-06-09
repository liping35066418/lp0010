export const RoomStyles = {
  pinkPrincess: {
    name: '粉色公主',
    wallColor: '#FFE4E1',
    floorColor: '#F5DEB3',
    ceilingColor: '#FFF0F5',
    accent: '#FF69B4',
    defaults: [
      { id: 'bed-girl', pos: [-1.5, 0, -1.2], rot: 0 },
      { id: 'nightstand', pos: [-0.6, 0, -1.5], rot: 0 },
      { id: 'rug-play', pos: [0.8, 0, 0.5], rot: 0 },
      { id: 'stuffed-bear', pos: [-0.3, 0, 1], rot: 0.3 },
      { id: 'lamp-floor', pos: [1.6, 0, -1.3], rot: 0 },
      { id: 'lamp-ceiling', pos: [0, 2.8, 0], rot: 0 },
      { id: 'cartoon-painting', pos: [0.5, 1.4, -1.97], rot: 0 },
    ]
  },
  blueOcean: {
    name: '蓝色海洋',
    wallColor: '#B0E0E6',
    floorColor: '#DEB887',
    ceilingColor: '#E0FFFF',
    accent: '#1E90FF',
    defaults: [
      { id: 'bed-boy', pos: [-1.5, 0, -1.2], rot: 0 },
      { id: 'nightstand', pos: [-0.6, 0, -1.5], rot: 0 },
      { id: 'bookshelf', pos: [1.8, 0, -1.5], rot: 0 },
      { id: 'desk-study', pos: [1.5, 0, 0.5], rot: -Math.PI / 2 },
      { id: 'chair-kids', pos: [1.5, 0, 1.1], rot: -Math.PI / 2 },
      { id: 'lamp-ceiling', pos: [0, 2.8, 0], rot: 0 },
      { id: 'building-blocks', pos: [-0.5, 0, 0.8], rot: 0 },
    ]
  },
  greenForest: {
    name: '绿色森林',
    wallColor: '#E8F5E9',
    floorColor: '#D2B48C',
    ceilingColor: '#F0FFF0',
    accent: '#66BB6A',
    defaults: [
      { id: 'bed-boy', pos: [-1.5, 0, -1.2], rot: 0 },
      { id: 'bookshelf', pos: [1.8, 0, -1.5], rot: 0 },
      { id: 'wardrobe', pos: [-1.8, 0, 0.5], rot: Math.PI },
      { id: 'desk-study', pos: [1.5, 0, 0.5], rot: -Math.PI / 2 },
      { id: 'chair-kids', pos: [1.5, 0, 1.1], rot: -Math.PI / 2 },
      { id: 'lamp-ceiling', pos: [0, 2.8, 0], rot: 0 },
      { id: 'growth-chart', pos: [-2.47, 0, -0.5], rot: Math.PI / 2 },
      { id: 'rug-play', pos: [0.2, 0, 0.8], rot: 0 },
    ]
  },
  yellowSun: {
    name: '阳光童趣',
    wallColor: '#FFFACD',
    floorColor: '#F4A460',
    ceilingColor: '#FFFAF0',
    accent: '#FFC107',
    defaults: [
      { id: 'bed-girl', pos: [-1.5, 0, -1.2], rot: 0 },
      { id: 'nightstand', pos: [-0.6, 0, -1.5], rot: 0 },
      { id: 'dresser', pos: [1.6, 0, -1.4], rot: 0 },
      { id: 'toy-box', pos: [0.8, 0, 1.2], rot: 0 },
      { id: 'lamp-desk', pos: [1.2, 0, 0.2], rot: 0 },
      { id: 'lamp-ceiling', pos: [0, 2.8, 0], rot: 0 },
      { id: 'cartoon-painting', pos: [0.3, 1.4, -1.97], rot: 0 },
      { id: 'stuffed-bear', pos: [-0.5, 0, 0.6], rot: 0.5 },
    ]
  },
  starryNight: {
    name: '星空梦幻',
    wallColor: '#2C3E50',
    floorColor: '#4A4A4A',
    ceilingColor: '#1a1a2e',
    accent: '#9B59B6',
    defaults: [
      { id: 'bed-bunk', pos: [-1.6, 0, -1], rot: 0 },
      { id: 'dresser', pos: [1.6, 0, -1.4], rot: 0 },
      { id: 'desk-study', pos: [1.5, 0, 0.5], rot: -Math.PI / 2 },
      { id: 'chair-kids', pos: [1.5, 0, 1.1], rot: -Math.PI / 2 },
      { id: 'lamp-floor', pos: [-0.5, 0, 1.5], rot: 0 },
      { id: 'lamp-ceiling', pos: [0, 2.8, 0], rot: 0 },
      { id: 'building-blocks', pos: [0.2, 0, 1], rot: 0 },
    ]
  }
};

export function applyStyle(sceneManager, styleKey, furnitureFactory) {
  const style = RoomStyles[styleKey];
  if (!style) return;

  sceneManager.clearAllFurniture();
  sceneManager.updateWallColor(style.wallColor);
  sceneManager.updateFloorColor(style.floorColor);
  sceneManager.updateCeilingColor(style.ceilingColor);

  style.defaults.forEach(item => {
    const mesh = furnitureFactory.getFurnitureById(item.id);
    if (mesh) {
      mesh.userData.furnitureId = item.id;
      mesh.position.set(...item.pos);
      if (item.rot) mesh.rotation.y = item.rot;
      if (mesh.userData.isWallMounted) {
        if (item.pos[0] < -1.5) {
          mesh.rotation.y = Math.PI / 2;
        } else if (item.pos[0] > 1.5) {
          mesh.rotation.y = -Math.PI / 2;
        } else if (item.pos[2] < -1.5) {
          mesh.rotation.y = 0;
        } else if (item.pos[2] > 1.5) {
          mesh.rotation.y = Math.PI;
        }
      }
      sceneManager.addFurniture(mesh);
    }
  });
}
