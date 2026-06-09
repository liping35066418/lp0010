import { SceneManager } from './core/SceneManager.js';
import * as FurnitureFactory from './core/FurnitureFactory.js';
import { RoomStyles, applyStyle } from './core/RoomStyles.js';

class App {
  constructor() {
    this.sceneManager = null;
    this.currentStyle = 'pinkPrincess';

    this.undoStack = [];
    this.undoMax = 50;
    this.undoPerforming = false;

    this.schemes = [];
    this.currentSchemeId = null;
    this.schemesStorageKey = 'kids-room-layout-schemes-v1';

    this.init();
  }

  init() {
    const container = document.getElementById('canvas-container');
    this.sceneManager = new SceneManager(container);

    this.loadSchemesFromStorage();
    this.setupUI();
    this.applyDefaultStyle();

    this.sceneManager.onSelectionChange = (obj) => {
      this.updateSelectedInfo(obj);
    };

    this.sceneManager.onAction = (action) => {
      this.pushUndo(action);
    };

    this.renderSchemeList();
  }

  setupUI() {
    this.setupRoomControls();
    this.setupColorControls();
    this.setupStyleButtons();
    this.setupFurnitureGrid();
    this.setupActionButtons();
    this.setupSelectedActions();
    this.setupSchemePanel();
    this.setupKeyboardShortcuts();
  }

  setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        this.undo();
      }
    });
  }

  pushUndo(action) {
    if (this.undoPerforming) return;
    this.undoStack.push(action);
    if (this.undoStack.length > this.undoMax) {
      this.undoStack.shift();
    }
  }

  undo() {
    if (this.undoStack.length === 0) {
      this.showToast('没有可撤销的操作了');
      return;
    }
    const action = this.undoStack.pop();
    this.undoPerforming = true;
    try {
      this.performUndo(action);
      this.showToast('已撤销：' + this.actionLabel(action));
    } finally {
      this.undoPerforming = false;
    }
  }

  actionLabel(action) {
    const names = { add: '添加家具', remove: '删除家具', move: '移动家具', rotate: '旋转家具' };
    return names[action.type] || action.type;
  }

  performUndo(action) {
    const sm = this.sceneManager;
    switch (action.type) {
      case 'add': {
        if (sm.furniture.includes(action.mesh)) {
          sm.deselectObject();
          sm.removeFurniture(action.mesh, true);
        }
        break;
      }
      case 'remove': {
        if (!sm.furniture.includes(action.mesh)) {
          const mesh = FurnitureFactory.getFurnitureById(action.state.furnitureId);
          if (mesh) {
            mesh.userData.furnitureId = action.state.furnitureId;
            sm._restoreFurnitureState(mesh, action.state);
            sm.addFurniture(mesh, null, true);
          }
        }
        break;
      }
      case 'move': {
        if (sm.furniture.includes(action.mesh)) {
          action.mesh.position.copy(action.from.position);
          sm.constrainPosition(action.mesh);
        }
        break;
      }
      case 'rotate': {
        if (sm.furniture.includes(action.mesh)) {
          action.mesh.rotation.y = action.from.rotation;
          sm.constrainPosition(action.mesh);
        }
        break;
      }
    }
  }

  setupRoomControls() {
    const lengthSlider = document.getElementById('room-length');
    const widthSlider = document.getElementById('room-width');
    const heightSlider = document.getElementById('room-height');

    const lengthValue = document.getElementById('room-length-value');
    const widthValue = document.getElementById('room-width-value');
    const heightValue = document.getElementById('room-height-value');

    const updateRoom = () => {
      const l = parseFloat(lengthSlider.value);
      const w = parseFloat(widthSlider.value);
      const h = parseFloat(heightSlider.value);
      lengthValue.textContent = l.toFixed(1);
      widthValue.textContent = w.toFixed(1);
      heightValue.textContent = h.toFixed(1);
      this.sceneManager.updateRoomSize(l, w, h);
    };

    lengthSlider.addEventListener('input', updateRoom);
    widthSlider.addEventListener('input', updateRoom);
    heightSlider.addEventListener('input', updateRoom);
  }

  setupColorControls() {
    const wallInput = document.getElementById('wall-color');
    const floorInput = document.getElementById('floor-color');
    const ceilingInput = document.getElementById('ceiling-color');

    wallInput.addEventListener('input', (e) => {
      this.sceneManager.updateWallColor(e.target.value);
      this.clearStyleActive();
    });

    floorInput.addEventListener('input', (e) => {
      this.sceneManager.updateFloorColor(e.target.value);
      this.clearStyleActive();
    });

    ceilingInput.addEventListener('input', (e) => {
      this.sceneManager.updateCeilingColor(e.target.value);
      this.clearStyleActive();
    });
  }

  setupStyleButtons() {
    const styleBtns = document.querySelectorAll('.style-btn');
    styleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const style = btn.dataset.style;
        this.currentStyle = style;
        this.setStyleActive(style);
        this.updateColorInputs(style);
        this.suppressUndo(() => {
          applyStyle(this.sceneManager, style, FurnitureFactory);
        });
        this.undoStack = [];
        this.currentSchemeId = null;
        this.renderSchemeList();
      });
    });
  }

  suppressUndo(fn) {
    const prev = this.sceneManager._undoRedoEnabled;
    this.sceneManager._undoRedoEnabled = false;
    try { fn(); } finally { this.sceneManager._undoRedoEnabled = prev; }
  }

  setStyleActive(styleKey) {
    document.querySelectorAll('.style-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.style === styleKey);
    });
  }

  clearStyleActive() {
    document.querySelectorAll('.style-btn').forEach(btn => {
      btn.classList.remove('active');
    });
  }

  updateColorInputs(styleKey) {
    const style = RoomStyles[styleKey];
    if (!style) return;
    document.getElementById('wall-color').value = style.wallColor;
    document.getElementById('floor-color').value = style.floorColor;
    document.getElementById('ceiling-color').value = style.ceilingColor;
  }

  applyDefaultStyle() {
    this.updateColorInputs(this.currentStyle);
    this.suppressUndo(() => {
      applyStyle(this.sceneManager, this.currentStyle, FurnitureFactory);
    });
  }

  setupFurnitureGrid() {
    const grid = document.getElementById('furniture-grid');
    FurnitureFactory.FurnitureCatalog.forEach(item => {
      const card = document.createElement('div');
      card.className = 'furniture-card';
      card.innerHTML = `
        <div class="furniture-icon">${item.icon}</div>
        <div class="furniture-name">${item.name}</div>
      `;
      card.addEventListener('click', () => {
        this.addFurniture(item.id);
      });
      grid.appendChild(card);
    });
  }

  addFurniture(id) {
    const mesh = FurnitureFactory.getFurnitureById(id);
    if (!mesh) return;

    mesh.userData.furnitureId = id;

    const L = this.sceneManager.roomLength;
    const W = this.sceneManager.roomWidth;

    const x = (Math.random() - 0.5) * (L - 2);
    const z = (Math.random() - 0.5) * (W - 2);

    if (mesh.userData.isWallMounted) {
      mesh.position.set(0, mesh.userData.baseY || 1.2, -W / 2 + 0.05);
      mesh.userData.baseY = mesh.position.y;
    } else {
      mesh.position.set(x, mesh.userData.baseY || 0, z);
    }

    const added = this.sceneManager.addFurniture(mesh);
    this.sceneManager.selectObject(added);
  }

  setupActionButtons() {
    document.getElementById('reset-btn').addEventListener('click', () => {
      if (confirm('确定要重置场景吗？所有家具将被清除，撤销历史也会清空。')) {
        this.applyDefaultStyle();
        this.setStyleActive(this.currentStyle);
        this.sceneManager.resetCamera();
        this.undoStack = [];
        this.currentSchemeId = null;
        this.renderSchemeList();
      }
    });

    document.getElementById('export-btn').addEventListener('click', () => {
      this.exportImage();
    });
  }

  setupSelectedActions() {
    document.getElementById('rotate-left-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      this.sceneManager.rotateSelected(Math.PI / 6);
    });

    document.getElementById('rotate-right-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      this.sceneManager.rotateSelected(-Math.PI / 6);
    });

    document.getElementById('delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm('确定要删除选中的家具吗？')) {
        this.sceneManager.deleteSelected();
      }
    });
  }

  setupSchemePanel() {
    document.getElementById('save-scheme-btn').addEventListener('click', () => {
      this.saveCurrentScheme();
    });
    document.getElementById('scheme-name-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.saveCurrentScheme();
    });
  }

  captureSchemeData(name) {
    const sm = this.sceneManager;
    const furniture = sm.furniture.map(m => ({
      id: m.userData.furnitureId,
      position: { x: m.position.x, y: m.position.y, z: m.position.z },
      rotation: m.rotation.y,
      scale: { x: m.scale.x, y: m.scale.y, z: m.scale.z },
      baseY: m.userData.baseY,
      isWallMounted: !!m.userData.isWallMounted
    }));
    const toHex = (n) => '#' + n.toString(16).padStart(6, '0').toUpperCase();
    return {
      id: 'scheme-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      name: name,
      createdAt: Date.now(),
      room: {
        length: sm.roomLength,
        width: sm.roomWidth,
        height: sm.roomHeight
      },
      colors: {
        wall: toHex(sm.wallColor),
        floor: toHex(sm.floorColor),
        ceiling: toHex(sm.ceilingColor)
      },
      furniture
    };
  }

  saveCurrentScheme() {
    const input = document.getElementById('scheme-name-input');
    const name = (input.value || '').trim();
    if (!name) {
      this.showToast('请输入方案名称');
      input.focus();
      return;
    }
    const data = this.captureSchemeData(name);

    const existIdx = this.currentSchemeId
      ? this.schemes.findIndex(s => s.id === this.currentSchemeId)
      : -1;

    if (existIdx >= 0 && confirm(`"${this.schemes[existIdx].name}" 已存在，是否覆盖？`)) {
      data.id = this.schemes[existIdx].id;
      data.createdAt = this.schemes[existIdx].createdAt;
      this.schemes[existIdx] = data;
    } else {
      this.schemes.push(data);
    }

    this.currentSchemeId = data.id;
    this.saveSchemesToStorage();
    this.renderSchemeList();
    input.value = '';
    this.showToast(`方案「${data.name}」已保存`);
  }

  applyScheme(schemeId) {
    const scheme = this.schemes.find(s => s.id === schemeId);
    if (!scheme) return;

    const sm = this.sceneManager;

    this.suppressUndo(() => {
      sm.deselectObject();
      sm.clearAllFurniture();

      sm.roomLength = scheme.room.length;
      sm.roomWidth = scheme.room.width;
      sm.roomHeight = scheme.room.height;
      sm.createRoom();
      sm.createGrid();

      document.getElementById('room-length').value = scheme.room.length;
      document.getElementById('room-width').value = scheme.room.width;
      document.getElementById('room-height').value = scheme.room.height;
      document.getElementById('room-length-value').textContent = scheme.room.length.toFixed(1);
      document.getElementById('room-width-value').textContent = scheme.room.width.toFixed(1);
      document.getElementById('room-height-value').textContent = scheme.room.height.toFixed(1);

      sm.updateWallColor(scheme.colors.wall);
      sm.updateFloorColor(scheme.colors.floor);
      sm.updateCeilingColor(scheme.colors.ceiling);
      document.getElementById('wall-color').value = scheme.colors.wall;
      document.getElementById('floor-color').value = scheme.colors.floor;
      document.getElementById('ceiling-color').value = scheme.colors.ceiling;

      this.clearStyleActive();

      scheme.furniture.forEach(fs => {
        const mesh = FurnitureFactory.getFurnitureById(fs.id);
        if (!mesh) return;
        mesh.userData.furnitureId = fs.id;
        mesh.position.set(fs.position.x, fs.position.y, fs.position.z);
        mesh.rotation.y = fs.rotation;
        mesh.scale.set(fs.scale.x, fs.scale.y, fs.scale.z);
        if (fs.baseY !== undefined) mesh.userData.baseY = fs.baseY;
        if (fs.isWallMounted !== undefined) mesh.userData.isWallMounted = fs.isWallMounted;
        sm.addFurniture(mesh, null, true);
      });

      sm.furniture.forEach(f => {
        if (!f.userData.baseHalfSizeX) sm.computeFurnitureSize(f);
        sm.constrainPosition(f);
      });
    });

    this.currentSchemeId = schemeId;
    this.undoStack = [];
    this.renderSchemeList();
    this.showToast(`已切换到方案「${scheme.name}」`);
  }

  deleteScheme(schemeId, ev) {
    if (ev) ev.stopPropagation();
    const scheme = this.schemes.find(s => s.id === schemeId);
    if (!scheme) return;
    if (!confirm(`确定删除方案「${scheme.name}」吗？`)) return;
    this.schemes = this.schemes.filter(s => s.id !== schemeId);
    if (this.currentSchemeId === schemeId) this.currentSchemeId = null;
    this.saveSchemesToStorage();
    this.renderSchemeList();
    this.showToast(`方案「${scheme.name}」已删除`);
  }

  renderSchemeList() {
    const list = document.getElementById('scheme-list');
    if (!this.schemes.length) {
      list.innerHTML = '<div class="scheme-empty">暂无保存的方案</div>';
      return;
    }
    const sorted = [...this.schemes].sort((a, b) => b.createdAt - a.createdAt);
    list.innerHTML = '';
    sorted.forEach(s => {
      const item = document.createElement('div');
      item.className = 'scheme-item' + (s.id === this.currentSchemeId ? ' active' : '');
      const d = new Date(s.createdAt);
      const time = `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      item.innerHTML = `
        <div class="scheme-info">
          <div class="scheme-name">${this.escapeHtml(s.name)}</div>
          <div class="scheme-meta">${s.furniture.length} 件家具 · ${s.room.length}×${s.room.width}m · ${time}</div>
        </div>
        <div class="scheme-actions">
          <button class="scheme-btn apply" title="应用方案">✔</button>
          <button class="scheme-btn delete" title="删除方案">🗑️</button>
        </div>
      `;
      item.querySelector('.apply').addEventListener('click', (e) => {
        e.stopPropagation();
        this.applyScheme(s.id);
      });
      item.querySelector('.delete').addEventListener('click', (e) => {
        this.deleteScheme(s.id, e);
      });
      item.addEventListener('click', () => {
        this.applyScheme(s.id);
      });
      list.appendChild(item);
    });
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  saveSchemesToStorage() {
    try {
      localStorage.setItem(this.schemesStorageKey, JSON.stringify(this.schemes));
    } catch (e) {
      console.warn('保存方案到 localStorage 失败', e);
    }
  }

  loadSchemesFromStorage() {
    try {
      const raw = localStorage.getItem(this.schemesStorageKey);
      if (raw) {
        this.schemes = JSON.parse(raw) || [];
      }
    } catch (e) {
      console.warn('读取方案失败', e);
      this.schemes = [];
    }
  }

  updateSelectedInfo(obj) {
    const infoBar = document.getElementById('selected-info');
    const nameEl = document.getElementById('selected-name');

    if (obj) {
      let name = obj.userData.furnitureName;
      if (obj.userData.furnitureId) {
        name = FurnitureFactory.getFurnitureName(obj.userData.furnitureId) || name;
      }
      nameEl.textContent = `已选中: ${name}`;
      infoBar.classList.remove('hidden');
    } else {
      infoBar.classList.add('hidden');
    }
  }

  exportImage() {
    const prevBg = this.sceneManager.scene.background;
    this.sceneManager.scene.background = null;

    setTimeout(() => {
      const dataUrl = this.sceneManager.exportImage();

      const link = document.createElement('a');
      const now = new Date();
      const timestamp = `${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}_${now.getHours().toString().padStart(2,'0')}${now.getMinutes().toString().padStart(2,'0')}`;
      link.download = `儿童房设计_${timestamp}.png`;
      link.href = dataUrl;
      link.click();

      this.sceneManager.scene.background = prevBg;

      this.showToast('图片已保存！');
    }, 100);
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 30px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #66BB6A, #43A047);
      color: white;
      padding: 12px 28px;
      border-radius: 25px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      animation: toastIn 0.3s ease, toastOut 0.3s ease 1.7s forwards;
      pointer-events: none;
    `;
    toast.textContent = message;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes toastIn {
        from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
      }
      @keyframes toastOut {
        from { opacity: 1; transform: translateX(-50%) translateY(0); }
        to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
      style.remove();
    }, 2200);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new App();
});
