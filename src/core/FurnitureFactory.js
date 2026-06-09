import * as THREE from 'three';

export const FurnitureCatalog = [
  { id: 'bed-girl', name: '公主床', icon: '🛏️', category: 'bed', create: createGirlBed },
  { id: 'bed-boy', name: '海盗床', icon: '⚓', category: 'bed', create: createBoyBed },
  { id: 'bed-bunk', name: '上下铺', icon: '🏠', category: 'bed', create: createBunkBed },
  { id: 'desk-study', name: '学习桌', icon: '📚', category: 'desk', create: createStudyDesk },
  { id: 'chair-kids', name: '儿童椅', icon: '🪑', category: 'chair', create: createKidsChair },
  { id: 'bookshelf', name: '书柜', icon: '📖', category: 'storage', create: createBookshelf },
  { id: 'wardrobe', name: '衣柜', icon: '👕', category: 'storage', create: createWardrobe },
  { id: 'toy-box', name: '玩具箱', icon: '🧸', category: 'storage', create: createToyBox },
  { id: 'nightstand', name: '床头柜', icon: '🗄️', category: 'storage', create: createNightstand },
  { id: 'rug-play', name: '游戏地毯', icon: '🎨', category: 'decor', create: createPlayRug },
  { id: 'lamp-desk', name: '台灯', icon: '💡', category: 'light', create: createDeskLamp },
  { id: 'lamp-floor', name: '落地灯', icon: '🌙', category: 'light', create: createFloorLamp },
  { id: 'lamp-ceiling', name: '吸顶灯', icon: '⭐', category: 'light', create: createCeilingLamp },
  { id: 'stuffed-bear', name: '玩具熊', icon: '🐻', category: 'toy', create: createStuffedBear },
  { id: 'building-blocks', name: '积木', icon: '🧱', category: 'toy', create: createBuildingBlocks },
  { id: 'dresser', name: '收纳柜', icon: '🗃️', category: 'storage', create: createDresser },
  { id: 'cartoon-painting', name: '卡通挂画', icon: '🖼️', category: 'decor', create: createCartoonPainting },
  { id: 'growth-chart', name: '身高尺', icon: '📏', category: 'decor', create: createGrowthChart },
];

function createGroup(name) {
  const group = new THREE.Group();
  group.userData.furnitureName = name;
  group.userData.baseY = 0;
  return group;
}

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.7,
    metalness: opts.metalness ?? 0.05,
    ...opts
  });
}

function addBox(group, w, h, d, color, x, y, z, opts) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, opts));
  mesh.position.set(x, y, z);
  group.add(mesh);
  return mesh;
}

function addCyl(group, rt, rb, h, seg, color, x, y, z, opts) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat(color, opts));
  mesh.position.set(x, y, z);
  group.add(mesh);
  return mesh;
}

function addSphere(group, r, seg, color, x, y, z, opts) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, seg, seg), mat(color, opts));
  mesh.position.set(x, y, z);
  group.add(mesh);
  return mesh;
}

export function createGirlBed() {
  const g = createGroup('公主床');
  const pink = 0xFFB6C1, white = 0xFFFFFF, rose = 0xFF69B4, cream = 0xFFFAF0;

  addBox(g, 1.2, 0.25, 2.1, cream, 0, 0.2, 0);
  addBox(g, 0.08, 0.18, 2.1, rose, -0.56, 0.09, 0);
  addBox(g, 0.08, 0.18, 2.1, rose, 0.56, 0.09, 0);
  addBox(g, 1.2, 0.18, 0.08, rose, 0, 0.09, -1.01);
  addBox(g, 1.2, 0.18, 0.08, rose, 0, 0.09, 1.01);

  addBox(g, 1.12, 0.12, 2.0, 0xFFC0CB, 0, 0.4, 0);
  addBox(g, 0.95, 0.1, 1.85, white, 0, 0.51, 0);

  addBox(g, 1.15, 0.9, 0.12, pink, 0, 0.85, -1.04);
  addCyl(g, 0.04, 0.04, 0.9, 16, rose, -0.5, 0.85, -1.04);
  addCyl(g, 0.04, 0.04, 0.9, 16, rose, 0.5, 0.85, -1.04);

  addSphere(g, 0.07, 16, rose, -0.5, 1.32, -1.04);
  addSphere(g, 0.07, 16, rose, 0.5, 1.32, -1.04);

  for (let i = 0; i < 3; i++) {
    addSphere(g, 0.05, 12, rose, -0.25 + i * 0.25, 1.28, -1.05);
  }

  addBox(g, 0.5, 0.25, 1.85, 0xE6E6FA, -0.25, 0.72, 0.3);
  addBox(g, 0.08, 0.3, 0.08, rose, -0.5, 0.6, 1.0);
  addBox(g, 0.08, 0.3, 0.08, rose, 0.5, 0.6, 1.0);
  addBox(g, 1.08, 0.04, 0.04, rose, 0, 0.74, 1.0);

  addBox(g, 0.3, 0.22, 0.18, 0xFFE4E1, 0.1, 0.65, -0.2);
  addSphere(g, 0.1, 16, 0xFFB6C1, 0.1, 0.75, -0.2);
  addSphere(g, 0.025, 8, 0x333333, 0.06, 0.76, -0.1);
  addSphere(g, 0.025, 8, 0x333333, 0.14, 0.76, -0.1);

  g.userData.baseY = 0;
  return g;
}

export function createBoyBed() {
  const g = createGroup('海盗床');
  const navy = 0x1E3A5F, wood = 0x8B4513, white = 0xFFFAF0, blue = 0x4682B4, red = 0xCD5C5C;

  addBox(g, 1.25, 0.25, 2.2, wood, 0, 0.2, 0);
  addBox(g, 0.08, 0.2, 2.2, navy, -0.58, 0.1, 0);
  addBox(g, 0.08, 0.2, 2.2, navy, 0.58, 0.1, 0);
  addBox(g, 1.25, 0.2, 0.08, navy, 0, 0.1, -1.06);
  addBox(g, 1.25, 0.2, 0.08, navy, 0, 0.1, 1.06);

  addBox(g, 1.17, 0.12, 2.1, blue, 0, 0.4, 0);
  addBox(g, 1.0, 0.1, 1.9, white, 0, 0.51, 0);

  addBox(g, 1.2, 0.85, 0.12, wood, 0, 0.82, -1.1);
  addBox(g, 1.2, 0.05, 0.18, navy, 0, 1.24, -1.1);

  addBox(g, 0.06, 0.4, 0.06, navy, -0.45, 1.47, -1.07);
  addBox(g, 0.06, 0.4, 0.06, navy, 0.45, 1.47, -1.07);
  addCyl(g, 0.03, 0.03, 1.0, 8, 0x8B7355, 0, 1.7, -1.07);

  const flagGeo = new THREE.PlaneGeometry(0.4, 0.3);
  const flagMat = mat(red, { side: THREE.DoubleSide });
  const flag = new THREE.Mesh(flagGeo, flagMat);
  flag.position.set(0.18, 1.85, -1.07);
  g.add(flag);

  addBox(g, 0.9, 0.25, 1.9, 0x708090, -0.15, 0.7, 0.3);
  addBox(g, 0.4, 0.15, 0.15, white, 0.2, 0.62, -0.3);
  addBox(g, 0.12, 0.02, 0.08, 0x333333, 0.26, 0.7, -0.26);

  addSphere(g, 0.06, 12, white, -0.55, 0.33, 0.9);
  addSphere(g, 0.06, 12, white, 0.55, 0.33, 0.9);
  addSphere(g, 0.06, 12, white, -0.55, 0.33, -0.9);
  addSphere(g, 0.06, 12, white, 0.55, 0.33, -0.9);

  g.userData.baseY = 0;
  return g;
}

export function createBunkBed() {
  const g = createGroup('上下铺');
  const pine = 0xC4A35A, cream = 0xFFFACD, white = 0xFAFAFA, blue = 0x87CEEB, pink = 0xFFB6C1;

  addBox(g, 0.12, 1.8, 0.12, pine, -0.5, 0.9, -1.0);
  addBox(g, 0.12, 1.8, 0.12, pine, 0.5, 0.9, -1.0);
  addBox(g, 0.12, 1.8, 0.12, pine, -0.5, 0.9, 1.0);
  addBox(g, 0.12, 1.8, 0.12, pine, 0.5, 0.9, 1.0);

  addBox(g, 1.12, 0.15, 2.1, pine, 0, 0.15, 0);
  addBox(g, 1.04, 0.1, 2.0, cream, 0, 0.28, 0);
  addBox(g, 0.95, 0.08, 1.9, white, 0, 0.37, 0);

  addBox(g, 0.12, 0.35, 0.12, pine, -0.5, 0.42, -1.0);
  addBox(g, 0.12, 0.35, 0.12, pine, 0.5, 0.42, -1.0);
  addBox(g, 0.12, 0.35, 0.12, pine, -0.5, 0.42, 1.0);
  addBox(g, 0.12, 0.35, 0.12, pine, 0.5, 0.42, 1.0);

  addBox(g, 1.12, 0.15, 2.1, pine, 0, 1.08, 0);
  addBox(g, 1.04, 0.1, 2.0, 0xE6E6FA, 0, 1.21, 0);
  addBox(g, 0.95, 0.08, 1.9, white, 0, 1.3, 0);

  addBox(g, 1.12, 0.4, 0.08, pine, 0, 1.35, -1.04);
  addBox(g, 1.12, 0.3, 0.08, pine, 0, 1.28, 1.04);

  for (let i = 0; i < 4; i++) {
    addBox(g, 0.04, 0.03, 0.4, pine, 0.54, 0.3 + i * 0.3, 0);
  }

  addBox(g, 0.85, 0.18, 1.75, blue, -0.1, 0.55, 0.2);
  addBox(g, 0.85, 0.18, 1.75, pink, -0.1, 1.5, 0.2);

  g.userData.baseY = 0;
  return g;
}

export function createStudyDesk() {
  const g = createGroup('学习桌');
  const wood = 0xDEB887, white = 0xFFFAF0, blue = 0x6495ED, pink = 0xFFB6C1, green = 0x90EE90;

  addBox(g, 1.2, 0.05, 0.65, wood, 0, 0.75, 0);
  addBox(g, 1.25, 0.04, 0.7, white, 0, 0.78, 0);

  addBox(g, 0.05, 0.7, 0.6, wood, -0.55, 0.375, 0);
  addBox(g, 0.05, 0.7, 0.6, wood, 0.55, 0.375, 0);

  addBox(g, 1.05, 0.04, 0.04, wood, 0, 0.1, 0);

  addBox(g, 0.35, 0.12, 0.55, blue, -0.35, 0.38, 0);
  addBox(g, 0.35, 0.12, 0.55, pink, -0.35, 0.54, 0);
  addBox(g, 0.35, 0.12, 0.55, green, -0.35, 0.68, 0);

  const knob1 = addSphere(g, 0.02, 8, 0xCCC, -0.18, 0.38, 0.28);
  addSphere(g, 0.02, 8, 0xCCC, -0.18, 0.54, 0.28);
  addSphere(g, 0.02, 8, 0xCCC, -0.18, 0.68, 0.28);

  addBox(g, 0.25, 0.08, 0.04, 0x8B7355, 0.2, 0.84, -0.1);
  addBox(g, 0.04, 0.2, 0.04, 0x8B7355, 0.3, 0.96, -0.1);
  addBox(g, 0.2, 0.2, 0.01, white, 0.22, 1.0, -0.07);

  const cup = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.04, 0.12, 16),
    mat(0xFF7F7F)
  );
  cup.position.set(0.35, 0.88, 0.1);
  g.add(cup);

  for (let i = 0; i < 6; i++) {
    const book = addBox(g, 0.18, 0.03, 0.25,
      [0x87CEEB, 0xFFB6C1, 0x98FB98, 0xDDA0DD, 0xF0E68C, 0xFFA07A][i],
      0.4, 0.815 + i * 0.03, 0.1
    );
    book.rotation.y = 0.1;
  }

  g.userData.baseY = 0;
  return g;
}

export function createKidsChair() {
  const g = createGroup('儿童椅');
  const yellow = 0xFFD700, blue = 0x4169E1, white = 0xFAFAFA, red = 0xFF6347;

  addBox(g, 0.4, 0.05, 0.4, yellow, 0, 0.38, 0);
  addBox(g, 0.38, 0.04, 0.38, white, 0, 0.41, 0);

  addCyl(g, 0.025, 0.025, 0.35, 12, blue, -0.15, 0.19, -0.15);
  addCyl(g, 0.025, 0.025, 0.35, 12, blue, 0.15, 0.19, -0.15);
  addCyl(g, 0.025, 0.025, 0.35, 12, blue, -0.15, 0.19, 0.15);
  addCyl(g, 0.025, 0.025, 0.35, 12, blue, 0.15, 0.19, 0.15);

  addBox(g, 0.4, 0.5, 0.06, yellow, 0, 0.65, -0.17);
  addBox(g, 0.38, 0.48, 0.04, white, 0, 0.65, -0.15);

  addBox(g, 0.06, 0.18, 0.06, blue, -0.15, 0.52, 0);
  addBox(g, 0.06, 0.18, 0.06, blue, 0.15, 0.52, 0);

  addSphere(g, 0.04, 12, red, 0, 0.88, -0.13);
  addSphere(g, 0.02, 8, 0x333, -0.07, 0.89, -0.12);
  addSphere(g, 0.02, 8, 0x333, 0.07, 0.89, -0.12);

  g.userData.baseY = 0;
  return g;
}

export function createBookshelf() {
  const g = createGroup('书柜');
  const wood = 0xDEB887, white = 0xFAFAFA, back = 0xF5DEB3;

  addBox(g, 0.9, 1.8, 0.35, wood, 0, 0.9, 0);
  addBox(g, 0.86, 1.76, 0.03, back, 0, 0.9, -0.16);

  for (let i = 0; i < 5; i++) {
    addBox(g, 0.86, 0.03, 0.32, white, 0, 0.18 + i * 0.38, 0);
  }

  const colors = [0x87CEEB, 0xFFB6C1, 0x98FB98, 0xDDA0DD, 0xF0E68C, 0xFFA07A, 0xB0C4DE];
  for (let shelf = 0; shelf < 4; shelf++) {
    const y = 0.05 + shelf * 0.38;
    let x = -0.38;
    for (let i = 0; i < 6; i++) {
      const bw = 0.06 + Math.random() * 0.04;
      const bh = 0.25 + Math.random() * 0.08;
      addBox(g, bw, bh, 0.25, colors[(shelf * 3 + i) % colors.length], x + bw / 2, y + bh / 2, 0);
      x += bw + 0.005;
      if (x > 0.35) break;
    }
  }

  addSphere(g, 0.07, 16, 0xFF7F50, -0.2, 1.55, 0);
  addSphere(g, 0.06, 16, 0x87CEEB, 0.1, 1.57, 0);
  addSphere(g, 0.05, 16, 0x98FB98, 0.28, 1.54, 0);

  g.userData.baseY = 0;
  return g;
}

export function createWardrobe() {
  const g = createGroup('衣柜');
  const wood = 0xC4A35A, white = 0xFFFAF0, pink = 0xFFB6C1, knob = 0xB8860B;

  addBox(g, 1.4, 2.0, 0.55, wood, 0, 1.0, 0);
  addBox(g, 1.38, 1.98, 0.02, white, 0, 1.0, -0.27);

  addBox(g, 0.65, 1.9, 0.04, pink, -0.34, 1.0, -0.25);
  addBox(g, 0.65, 1.9, 0.04, 0x87CEEB, 0.34, 1.0, -0.25);

  addBox(g, 0.6, 1.85, 0.02, 0xFFE4E1, -0.34, 1.0, -0.22);
  addBox(g, 0.6, 1.85, 0.02, 0xE0FFFF, 0.34, 1.0, -0.22);

  addSphere(g, 0.03, 12, knob, -0.05, 1.0, -0.21);
  addSphere(g, 0.03, 12, knob, 0.05, 1.0, -0.21);

  addBox(g, 1.34, 0.05, 0.02, wood, 0, 0.3, -0.25);
  addBox(g, 1.34, 0.05, 0.02, wood, 0, 1.7, -0.25);

  addCyl(g, 0.035, 0.035, 0.04, 16, 0x87CEEB, -0.34, 1.6, -0.22);
  addCyl(g, 0.035, 0.035, 0.04, 16, 0xFFB6C1, 0.34, 1.6, -0.22);
  addCyl(g, 0.035, 0.035, 0.04, 16, 0x98FB98, 0, 1.6, -0.22);

  addBox(g, 1.44, 0.08, 0.59, wood, 0, 0.04, 0);
  addBox(g, 1.44, 0.08, 0.59, wood, 0, 2.0, 0);

  g.userData.baseY = 0;
  return g;
}

export function createToyBox() {
  const g = createGroup('玩具箱');
  const red = 0xCD5C5C, yellow = 0xFFD700, blue = 0x4169E1, white = 0xFAFAFA;

  addBox(g, 0.7, 0.4, 0.5, red, 0, 0.22, 0);
  addBox(g, 0.72, 0.05, 0.52, yellow, 0, 0.445, 0);

  addBox(g, 0.15, 0.1, 0.02, yellow, 0, 0.39, -0.26);

  addBox(g, 0.08, 0.08, 0.6, blue, 0, 0.22, 0);
  addBox(g, 0.6, 0.08, 0.08, blue, 0, 0.22, 0);

  addSphere(g, 0.06, 16, blue, -0.1, 0.5, -0.1);
  addSphere(g, 0.05, 16, yellow, 0.1, 0.5, 0.1);
  addSphere(g, 0.04, 16, white, 0.2, 0.49, -0.05);

  addCyl(g, 0.05, 0.05, 0.15, 16, 0xFF7F50, -0.2, 0.52, 0.1);

  g.userData.baseY = 0;
  return g;
}

export function createNightstand() {
  const g = createGroup('床头柜');
  const pink = 0xFFB6C1, white = 0xFFFAF0, wood = 0xDEB887, knob = 0xFF69B4;

  addBox(g, 0.45, 0.5, 0.4, pink, 0, 0.25, 0);
  addBox(g, 0.47, 0.04, 0.42, white, 0, 0.51, 0);

  addBox(g, 0.4, 0.12, 0.35, white, 0, 0.16, 0);
  addBox(g, 0.4, 0.12, 0.35, white, 0, 0.33, 0);

  addBox(g, 0.05, 0.1, 0.02, pink, 0, 0.16, -0.185);
  addBox(g, 0.05, 0.1, 0.02, pink, 0, 0.33, -0.185);

  addSphere(g, 0.018, 8, knob, -0.02, 0.16, -0.17);
  addSphere(g, 0.018, 8, knob, 0.02, 0.16, -0.17);
  addSphere(g, 0.018, 8, knob, 0, 0.33, -0.17);

  addSphere(g, 0.07, 16, 0xFF7F50, -0.08, 0.58, 0);
  addCyl(g, 0.03, 0.03, 0.08, 12, 0x8B4513, 0.08, 0.55, 0);
  addSphere(g, 0.035, 12, 0x90EE90, 0.08, 0.6, 0);

  g.userData.baseY = 0;
  return g;
}

export function createPlayRug() {
  const g = createGroup('游戏地毯');
  const colors = [0xFFB6C1, 0x87CEEB, 0x98FB98, 0xDDA0DD, 0xF0E68C];
  const mainColor = 0xFFFACD;

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.02, 1.4),
    mat(mainColor, { roughness: 0.95 })
  );
  base.position.set(0, 0.01, 0);
  g.add(base);

  for (let i = 0; i < 4; i++) {
    const stripe = addBox(g,
      1.8 - i * 0.1, 0.003, 1.4 - i * 0.1,
      colors[i % colors.length],
      0, 0.021 + i * 0.003, 0
    );
  }

  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 3 === 0) {
        addSphere(g, 0.035, 8, colors[(row * col) % colors.length],
          -0.7 + col * 0.2, 0.045, -0.5 + row * 0.2
        );
      }
    }
  }

  const heartShape = new THREE.Shape();
  const x = 0, y = 0;
  heartShape.moveTo(x, y + 0.05);
  heartShape.bezierCurveTo(x, y, x - 0.05, y, x - 0.05, y + 0.05);
  heartShape.bezierCurveTo(x - 0.05, y + 0.1, x, y + 0.13, x, y + 0.18);
  heartShape.bezierCurveTo(x, y + 0.13, x + 0.05, y + 0.1, x + 0.05, y + 0.05);
  heartShape.bezierCurveTo(x + 0.05, y, x, y, x, y + 0.05);

  const heartGeo = new THREE.ExtrudeGeometry(heartShape, { depth: 0.005, bevelEnabled: false });
  const heart = new THREE.Mesh(heartGeo, mat(0xFF69B4));
  heart.rotation.x = -Math.PI / 2;
  heart.position.set(0.3, 0.028, 0.2);
  heart.scale.set(1.5, 1.5, 1.5);
  g.add(heart);

  g.userData.baseY = 0;
  return g;
}

export function createDeskLamp() {
  const g = createGroup('台灯');
  const yellow = 0xFFD700, blue = 0x4169E1, white = 0xFFFAF0, silver = 0xC0C0C0;

  addCyl(g, 0.1, 0.12, 0.03, 24, blue, 0, 0.015, 0);
  addCyl(g, 0.015, 0.015, 0.25, 12, silver, 0, 0.155, 0);

  const arm = addBox(g, 0.02, 0.2, 0.02, silver, 0.06, 0.3, 0);
  arm.rotation.z = -0.35;

  const head = new THREE.Mesh(
    new THREE.ConeGeometry(0.12, 0.18, 24, 1, true),
    mat(yellow, { side: THREE.DoubleSide, roughness: 0.4, metalness: 0.3 })
  );
  head.position.set(0.13, 0.4, 0);
  head.rotation.z = Math.PI;
  g.add(head);

  addSphere(g, 0.04, 16, 0xFFFACD, 0.13, 0.41, 0, { emissive: 0xFFF8DC, emissiveIntensity: 0.5 });

  const pLight = new THREE.PointLight(0xFFF0B5, 0.8, 2.5, 2);
  pLight.position.set(0.13, 0.38, 0);
  g.add(pLight);

  g.userData.baseY = 0;
  return g;
}

export function createFloorLamp() {
  const g = createGroup('落地灯');
  const pink = 0xFFB6C1, white = 0xFFFAF0, silver = 0xA9A9A9;

  addCyl(g, 0.18, 0.2, 0.04, 24, 0x444, 0, 0.02, 0);
  addCyl(g, 0.02, 0.02, 1.2, 12, silver, 0, 0.64, 0);

  const shade = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.28, 0.35, 24, 1, true),
    mat(pink, { side: THREE.DoubleSide, roughness: 0.5, transparent: true, opacity: 0.9 })
  );
  shade.position.set(0, 1.35, 0);
  g.add(shade);

  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    addCyl(g, 0.005, 0.005, 0.35, 6, white,
      Math.cos(angle) * 0.2, 1.35, Math.sin(angle) * 0.2
    );
  }

  addCyl(g, 0.08, 0.08, 0.02, 16, white, 0, 1.19, 0);

  addSphere(g, 0.08, 16, 0xFFF8DC, 0, 1.3, 0, { emissive: 0xFFF0B5, emissiveIntensity: 0.6 });

  const pLight = new THREE.PointLight(0xFFE4B5, 1.0, 4, 2);
  pLight.position.set(0, 1.3, 0);
  g.add(pLight);

  g.userData.baseY = 0;
  return g;
}

export function createCeilingLamp() {
  const g = createGroup('吸顶灯');
  const gold = 0xFFD700, white = 0xFFFAF0, blue = 0x87CEEB, pink = 0xFFB6C1;

  addCyl(g, 0.25, 0.25, 0.05, 24, gold, 0, -0.025, 0);
  addCyl(g, 0.3, 0.3, 0.03, 24, 0xF5F5DC, 0, -0.065, 0);

  addSphere(g, 0.18, 24, white, 0, -0.2, 0, { roughness: 0.3, emissive: 0xFFF8DC, emissiveIntensity: 0.3 });

  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const r = 0.28;
    addSphere(g, 0.04, 12,
      [blue, pink, gold, 0x98FB98, 0xDDA0DD][i],
      Math.cos(angle) * r, -0.18, Math.sin(angle) * r
    );
  }

  const moonGeo = new THREE.TorusGeometry(0.05, 0.01, 8, 16);
  const moon = new THREE.Mesh(moonGeo, mat(gold, { emissive: 0xFFF0B5, emissiveIntensity: 0.3 }));
  moon.position.set(0, -0.35, 0);
  moon.rotation.x = 0.5;
  g.add(moon);

  const starColors = [white, 0x87CEEB, 0xFFB6C1];
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + 0.3;
    const r = 0.35;
    const star = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.025),
      mat(starColors[i % 3], { emissive: 0xFFFFFF, emissiveIntensity: 0.4 })
    );
    star.position.set(Math.cos(angle) * r, -0.32 + Math.random() * 0.05, Math.sin(angle) * r);
    star.rotation.set(Math.random(), Math.random(), Math.random());
    g.add(star);
  }

  const pLight = new THREE.PointLight(0xFFFFF0, 1.5, 8, 1.5);
  pLight.position.set(0, -0.3, 0);
  g.add(pLight);

  g.userData.baseY = 2.8;
  return g;
}

export function createStuffedBear() {
  const g = createGroup('玩具熊');
  const brown = 0xD2691E, cream = 0xFFE4C4, dark = 0x8B4513, pink = 0xFFB6C1;

  addSphere(g, 0.18, 20, brown, 0, 0.18, 0);
  addSphere(g, 0.08, 16, brown, -0.15, 0.43, -0.02);
  addSphere(g, 0.08, 16, brown, 0.15, 0.43, -0.02);
  addSphere(g, 0.045, 12, pink, -0.15, 0.42, 0.04);
  addSphere(g, 0.045, 12, pink, 0.15, 0.42, 0.04);

  addSphere(g, 0.15, 20, brown, 0, 0.48, 0.05);
  addSphere(g, 0.1, 16, cream, 0, 0.44, 0.17);

  addSphere(g, 0.025, 10, 0x222, -0.06, 0.53, 0.18);
  addSphere(g, 0.025, 10, 0x222, 0.06, 0.53, 0.18);
  addSphere(g, 0.015, 8, 0xFFFFFF, -0.055, 0.535, 0.2);
  addSphere(g, 0.015, 8, 0xFFFFFF, 0.065, 0.535, 0.2);

  addSphere(g, 0.022, 10, 0x222, 0, 0.47, 0.22);

  addSphere(g, 0.16, 20, brown, -0.22, 0.18, 0);
  addSphere(g, 0.16, 20, brown, 0.22, 0.18, 0);
  addSphere(g, 0.18, 20, brown, -0.15, 0.03, 0.05);
  addSphere(g, 0.18, 20, brown, 0.15, 0.03, 0.05);

  addSphere(g, 0.1, 16, pink, 0, 0.38, 0.28);

  g.userData.baseY = 0;
  return g;
}

export function createBuildingBlocks() {
  const g = createGroup('积木');
  const colors = [0xFF6B6B, 0x4ECDC4, 0xFFE66D, 0x95E1D3, 0xF38181, 0xAA96DA, 0xFCBAD3];

  const blocks = [
    { w: 0.12, h: 0.12, d: 0.12, x: -0.12, y: 0.06, z: -0.06, c: 0 },
    { w: 0.12, h: 0.12, d: 0.12, x: 0, y: 0.06, z: -0.06, c: 1 },
    { w: 0.12, h: 0.12, d: 0.12, x: 0.12, y: 0.06, z: -0.06, c: 2 },
    { w: 0.12, h: 0.12, d: 0.12, x: -0.12, y: 0.06, z: 0.06, c: 3 },
    { w: 0.12, h: 0.12, d: 0.12, x: 0, y: 0.06, z: 0.06, c: 4 },
    { w: 0.12, h: 0.12, d: 0.12, x: 0.12, y: 0.06, z: 0.06, c: 5 },

    { w: 0.12, h: 0.12, d: 0.12, x: -0.06, y: 0.18, z: 0, c: 6 },
    { w: 0.12, h: 0.12, d: 0.12, x: 0.06, y: 0.18, z: 0, c: 0 },
    { w: 0.12, h: 0.12, d: 0.12, x: 0, y: 0.18, z: -0.12, c: 2 },

    { w: 0.3, h: 0.08, d: 0.12, x: 0, y: 0.32, z: 0, c: 4 },
    { w: 0.12, h: 0.12, d: 0.12, x: -0.06, y: 0.42, z: 0.03, c: 5 },
  ];

  blocks.forEach(b => {
    const block = addBox(g, b.w, b.h, b.d, colors[b.c], b.x, b.y, b.z, { roughness: 0.6 });
  });

  addCyl(g, 0.08, 0.08, 0.16, 20, colors[1], -0.25, 0.1, 0.15);
  addCyl(g, 0.08, 0.08, 0.16, 20, colors[3], 0.25, 0.1, -0.15);

  addSphere(g, 0.08, 16, colors[0], -0.25, 0.27, 0.15);
  addSphere(g, 0.08, 16, colors[6], 0.25, 0.27, -0.15);

  g.userData.baseY = 0;
  return g;
}

export function createDresser() {
  const g = createGroup('收纳柜');
  const white = 0xFFFAF0, mint = 0x98FB98, peach = 0xFFDAB9, lavender = 0xE6E6FA, sky = 0x87CEEB, knob = 0x8B7355;

  addBox(g, 1.0, 1.0, 0.45, white, 0, 0.5, 0);
  addBox(g, 1.04, 0.05, 0.49, 0xF5F5DC, 0, 1.02, 0);
  addBox(g, 1.04, 0.05, 0.49, 0xF5F5DC, 0, 0.025, 0);

  const drawers = [
    { y: 0.16, w: 0.9, h: 0.22, d: 0.4, c: mint },
    { y: 0.4, w: 0.9, h: 0.22, d: 0.4, c: peach },
    { y: 0.64, w: 0.9, h: 0.22, d: 0.4, c: lavender },
    { y: 0.88, w: 0.9, h: 0.18, d: 0.4, c: sky },
  ];

  drawers.forEach((d, i) => {
    addBox(g, d.w, d.h, d.d, d.c, 0, d.y, 0.025);
    for (let k = -1; k <= 1; k += 2) {
      addSphere(g, 0.02, 8, knob, k * 0.18, d.y, 0.23);
    }
  });

  addBox(g, 0.18, 0.16, 0.14, sky, -0.3, 1.13, -0.05);
  addBox(g, 0.14, 0.16, 0.14, 0xFFB6C1, 0, 1.13, 0.1);
  addCyl(g, 0.06, 0.06, 0.18, 12, mint, 0.3, 1.11, -0.05);
  addSphere(g, 0.05, 12, 0xFF69B4, 0.3, 1.23, -0.05);

  g.userData.baseY = 0;
  return g;
}

export function createCartoonPainting() {
  const g = createGroup('卡通挂画');

  const frameW = 0.7, frameH = 0.5, frameT = 0.04;
  const wood = 0xDEB887, skyB = 0x87CEEB, sun = 0xFFD700, grass = 0x90EE90, house = 0xFFB6C1, roof = 0xCD5C5C;

  addBox(g, frameW, frameH, frameT, wood, 0, frameH / 2, 0);

  const canvasMat = new THREE.MeshStandardMaterial({
    color: 0xFFFAF0,
    roughness: 0.9,
    metalness: 0
  });
  const canvas = new THREE.Mesh(
    new THREE.PlaneGeometry(frameW - 0.06, frameH - 0.06),
    canvasMat
  );
  canvas.position.set(0, frameH / 2, frameT / 2 + 0.001);
  g.add(canvas);

  addBox(g, frameW - 0.06, (frameH - 0.06) * 0.55, 0.01, skyB, 0, frameH * 0.63, frameT / 2 + 0.005);
  addBox(g, frameW - 0.06, (frameH - 0.06) * 0.45, 0.01, grass, 0, frameH * 0.18, frameT / 2 + 0.005);

  addSphere(g, 0.04, 16, sun, 0.2, frameH * 0.75, frameT / 2 + 0.01);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    addBox(g, 0.008, 0.02, 0.005, sun,
      0.2 + Math.cos(a) * 0.06, frameH * 0.75 + Math.sin(a) * 0.06, frameT / 2 + 0.01
    );
  }

  addBox(g, 0.15, 0.12, 0.01, house, -0.1, frameH * 0.35, frameT / 2 + 0.01);
  const roofGeo = new THREE.ConeGeometry(0.11, 0.08, 3);
  const roofMesh = new THREE.Mesh(new THREE.CylinderGeometry(0, 0.11, 0.08, 3), mat(roof));
  roofMesh.position.set(-0.1, frameH * 0.46, frameT / 2 + 0.01);
  roofMesh.rotation.y = Math.PI / 6;
  g.add(roofMesh);

  addBox(g, 0.03, 0.05, 0.008, 0x8B4513, -0.1, frameH * 0.28, frameT / 2 + 0.012);
  addBox(g, 0.04, 0.04, 0.008, 0x87CEEB, -0.145, frameH * 0.37, frameT / 2 + 0.012);

  addSphere(g, 0.025, 12, 0xFFFAF0, 0.08, frameH * 0.72, frameT / 2 + 0.01);
  addSphere(g, 0.03, 12, 0xFFFAF0, 0.12, frameH * 0.74, frameT / 2 + 0.01);
  addSphere(g, 0.02, 12, 0xFFFAF0, 0.16, frameH * 0.72, frameT / 2 + 0.01);

  g.userData.baseY = 1.2;
  g.userData.isWallMounted = true;
  return g;
}

export function createGrowthChart() {
  const g = createGroup('身高尺');

  const wood = 0xF5DEB3, pink = 0xFFB6C1, blue = 0x87CEEB, green = 0x90EE90, yellow = 0xFFD700;

  addBox(g, 0.15, 1.5, 0.025, wood, 0, 0.75, 0);
  addBox(g, 0.17, 1.52, 0.01, 0xFAEBD7, 0, 0.75, 0.013);

  for (let i = 0; i <= 15; i++) {
    const y = 0.05 + i * 0.1;
    const w = i % 5 === 0 ? 0.08 : 0.04;
    addBox(g, w, 0.003, 0.005, 0x666, 0.06 - w / 2, y, 0.017);
  }

  addSphere(g, 0.04, 16, pink, 0, 0.12, 0.03);
  addCyl(g, 0.03, 0.03, 0.08, 8, green, 0, 0.18, 0.03);
  addBox(g, 0.01, 0.1, 0.05, green, 0, 0.27, 0.03);
  addSphere(g, 0.035, 12, yellow, 0.03, 0.32, 0.03);
  addSphere(g, 0.03, 12, yellow, -0.03, 0.3, 0.03);

  addSphere(g, 0.025, 10, pink, -0.04, 0.5, 0.03);
  addSphere(g, 0.025, 10, blue, 0.04, 0.7, 0.03);
  addSphere(g, 0.025, 10, yellow, -0.04, 0.9, 0.03);
  addSphere(g, 0.025, 10, green, 0.04, 1.1, 0.03);

  addBox(g, 0.005, 0.25, 0.04, 0xCD5C5C, 0.065, 1.3, 0.025);
  addBox(g, 0.06, 0.04, 0.04, 0xCD5C5C, 0.035, 1.405, 0.025);

  g.userData.baseY = 0;
  g.userData.isWallMounted = true;
  return g;
}

export function getFurnitureById(id) {
  const item = FurnitureCatalog.find(f => f.id === id);
  return item ? item.create() : null;
}

export function getFurnitureName(id) {
  const item = FurnitureCatalog.find(f => f.id === id);
  return item ? item.name : '';
}
