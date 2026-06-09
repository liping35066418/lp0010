import { SceneManager } from './core/SceneManager.js';
import * as FurnitureFactory from './core/FurnitureFactory.js';
import { RoomStyles, applyStyle } from './core/RoomStyles.js';

const SCHEME_STORAGE_KEY = 'kids-room-schemes-v1';

class App {
  constructor() {
    this.sceneManager = null;
    this.currentStyle = 'pinkPrincess';
    this.schemes = [];
    this.currentSchemeId = null;
    this.init();
  }

  init() {
    const container = document.getElementById('canvas-container');
    this.sceneManager = new SceneManager(container);

    this.setupUI();
    this.applyDefaultStyle();
    this.loadSchemes();
    this.renderSchemeList();

    this.sceneManager.onSelectionChange = (obj) => {
      this.updateSelectedInfo(obj);
    };

    this.sceneManager.onUndoChange = (count) => {
      document.getElementById('undo-count').textContent = count;
    };

    this.sceneManager.onRequestUndo = () => {
      this.handleUndo();
    };
  }

  setupUI() {
    this.setupRoomControls();
    this.setupColorControls();
    this.setupStyleButtons();
    this.setupFurnitureGrid();
    this.setupActionButtons();
    this.setupSelectedActions();
    this.setupSchemeUI();
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
        this.sceneManager.clearUndoStack();
        applyStyle(this.sceneManager, style, FurnitureFactory);
      });
    });
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
    applyStyle(this.sceneManager, this.currentStyle, FurnitureFactory);
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

    this.sceneManager.pushUndo();

    const added = this.sceneManager.addFurniture(mesh);
    this.sceneManager.selectObject(added);

    added.userData.furnitureId = id;
  }

  setupActionButtons() {
    document.getElementById('reset-btn').addEventListener('click', () => {
      if (confirm('确定要重置场景吗？所有家具将被清除。')) {
        this.sceneManager.clearUndoStack();
        this.applyDefaultStyle();
        this.setStyleActive(this.currentStyle);
        this.sceneManager.resetCamera();
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

  setupSchemeUI() {
    document.getElementById('save-scheme-btn').addEventListener('click', () => {
      this.saveCurrentScheme();
    });

    document.getElementById('scheme-name').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.saveCurrentScheme();
      }
    });
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

  handleUndo() {
    const ok = this.sceneManager.undo(FurnitureFactory);
    if (ok) {
      this.showToast('↩️ 已撤销');
    } else {
      this.showToast('没有可撤销的操作');
    }
  }

  loadSchemes() {
    try {
      const raw = localStorage.getItem(SCHEME_STORAGE_KEY);
      this.schemes = raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Failed to load schemes:', e);
      this.schemes = [];
    }
  }

  persistSchemes() {
    try {
      localStorage.setItem(SCHEME_STORAGE_KEY, JSON.stringify(this.schemes));
    } catch (e) {
      console.error('Failed to save schemes:', e);
      this.showToast('保存失败，存储空间不足');
    }
  }

  captureCurrentScene() {
    const sm = this.sceneManager;
    const furnitureList = sm.furniture.map(f => ({
      furnitureId: f.userData.furnitureId,
      position: { x: f.position.x, y: f.position.y, z: f.position.z },
      rotation: { x: f.rotation.x, y: f.rotation.y, z: f.rotation.z },
      scale: { x: f.scale.x, y: f.scale.y, z: f.scale.z },
      baseY: f.userData.baseY,
      isWallMounted: f.userData.isWallMounted
    }));

    return {
      room: {
        length: sm.roomLength,
        width: sm.roomWidth,
        height: sm.roomHeight
      },
      colors: {
        wall: '#' + sm.wallColor.toString(16).padStart(6, '0'),
        floor: '#' + sm.floorColor.toString(16).padStart(6, '0'),
        ceiling: '#' + sm.ceilingColor.toString(16).padStart(6, '0')
      },
      furniture: furnitureList
    };
  }

  saveCurrentScheme() {
    const nameInput = document.getElementById('scheme-name');
    const name = nameInput.value.trim();
    if (!name) {
      this.showToast('请输入方案名称');
      nameInput.focus();
      return;
    }

    const data = this.captureCurrentScene();
    const scheme = {
      id: 'scheme_' + Date.now(),
      name: name,
      createdAt: Date.now(),
      ...data
    };

    const existingIdx = this.schemes.findIndex(s => s.name === name);
    if (existingIdx > -1) {
      if (confirm(`方案「${name}」已存在，是否覆盖？`)) {
        scheme.id = this.schemes[existingIdx].id;
        scheme.createdAt = this.schemes[existingIdx].createdAt;
        scheme.updatedAt = Date.now();
        this.schemes[existingIdx] = scheme;
      } else {
        return;
      }
    } else {
      this.schemes.unshift(scheme);
    }

    this.currentSchemeId = scheme.id;
    this.persistSchemes();
    this.renderSchemeList();
    nameInput.value = '';
    this.showToast(`✅ 方案「${name}」已保存`);
  }

  applyScheme(schemeId) {
    const scheme = this.schemes.find(s => s.id === schemeId);
    if (!scheme) return;

    const sm = this.sceneManager;

    document.getElementById('room-length').value = scheme.room.length;
    document.getElementById('room-width').value = scheme.room.width;
    document.getElementById('room-height').value = scheme.room.height;
    document.getElementById('room-length-value').textContent = scheme.room.length.toFixed(1);
    document.getElementById('room-width-value').textContent = scheme.room.width.toFixed(1);
    document.getElementById('room-height-value').textContent = scheme.room.height.toFixed(1);

    sm.updateRoomSize(scheme.room.length, scheme.room.width, scheme.room.height);

    sm.updateWallColor(scheme.colors.wall);
    sm.updateFloorColor(scheme.colors.floor);
    sm.updateCeilingColor(scheme.colors.ceiling);

    document.getElementById('wall-color').value = scheme.colors.wall;
    document.getElementById('floor-color').value = scheme.colors.floor;
    document.getElementById('ceiling-color').value = scheme.colors.ceiling;
    this.clearStyleActive();

    sm.clearAllFurniture();

    scheme.furniture.forEach(item => {
      const mesh = FurnitureFactory.getFurnitureById(item.furnitureId);
      if (!mesh) return;

      mesh.position.set(item.position.x, item.position.y, item.position.z);
      mesh.rotation.set(item.rotation.x, item.rotation.y, item.rotation.z);
      mesh.scale.set(item.scale.x, item.scale.y, item.scale.z);

      if (item.baseY !== undefined) {
        mesh.userData.baseY = item.baseY;
        mesh.position.y = item.baseY;
      }

      if (item.isWallMounted !== undefined) {
        mesh.userData.isWallMounted = item.isWallMounted;
      }

      mesh.userData.furnitureId = item.furnitureId;
      sm.addFurniture(mesh);
    });

    sm.clearUndoStack();
    this.currentSchemeId = schemeId;
    this.renderSchemeList();
    this.showToast(`🎯 已切换到「${scheme.name}」`);
  }

  deleteScheme(schemeId, event) {
    if (event) {
      event.stopPropagation();
    }
    const scheme = this.schemes.find(s => s.id === schemeId);
    if (!scheme) return;

    if (!confirm(`确定要删除方案「${scheme.name}」吗？`)) return;

    this.schemes = this.schemes.filter(s => s.id !== schemeId);
    if (this.currentSchemeId === schemeId) {
      this.currentSchemeId = null;
    }
    this.persistSchemes();
    this.renderSchemeList();
    this.showToast(`已删除「${scheme.name}」`);
  }

  renderSchemeList() {
    const list = document.getElementById('scheme-list');
    const empty = document.getElementById('scheme-empty');

    if (!this.schemes || this.schemes.length === 0) {
      list.innerHTML = '';
      const p = document.createElement('p');
      p.className = 'empty-tip';
      p.id = 'scheme-empty';
      p.textContent = '暂无保存的方案';
      list.appendChild(p);
      return;
    }

    list.innerHTML = '';

    this.schemes.forEach(scheme => {
      const item = document.createElement('div');
      item.className = 'scheme-item' + (scheme.id === this.currentSchemeId ? ' active' : '');

      const meta = this.formatDate(scheme.updatedAt || scheme.createdAt);
      const count = scheme.furniture ? scheme.furniture.length : 0;

      item.innerHTML = `
        <div class="scheme-item-info">
          <div class="scheme-item-name">${this.escapeHtml(scheme.name)}</div>
          <div class="scheme-item-meta">${count}件家具 · ${meta}</div>
        </div>
        <div class="scheme-item-actions">
          <button class="scheme-btn scheme-btn-load" data-act="load">切换</button>
          <button class="scheme-btn scheme-btn-delete" data-act="del">删除</button>
        </div>
      `;

      item.addEventListener('click', (e) => {
        const act = e.target.dataset.act;
        if (act === 'del') {
          this.deleteScheme(scheme.id, e);
        } else {
          this.applyScheme(scheme.id);
        }
      });

      list.appendChild(item);
    });
  }

  formatDate(ts) {
    const d = new Date(ts);
    const pad = n => String(n).padStart(2, '0');
    const now = new Date();
    const sameDay = d.getFullYear() === now.getFullYear() &&
                    d.getMonth() === now.getMonth() &&
                    d.getDate() === now.getDate();
    if (sameDay) {
      return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
    return `${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
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
  window._debugApp = new App();
});
