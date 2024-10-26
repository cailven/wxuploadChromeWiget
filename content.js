let materials = [];
let isDragging = false;
let dragOffsetX, dragOffsetY;

function createPanel() {
  const panel = document.createElement('div');
  panel.id = 'material-panel';
  panel.innerHTML = `
    <div id="panel-header">
      <h2 id="panel-title">素材列表</h2>
      <div id="panel-controls">
        <button id="minimize-btn">-</button>
        <button id="close-btn">×</button>
      </div>
    </div>
    <div id="panel-content">
      <div id="button-container">
        <div>
          <button id="fetch-btn">抓取素材</button>
          <button id="download-btn">下载JSON</button>
          <button id="clear-btn">清空数据</button>
        </div>
        <div id="data-stats">总计: 0 | 已选: 0</div>
      </div>
      <div id="material-list">
        <table id="material-table">
          <thead>
            <tr>
              <th>选择</th>
              <th>缩略图</th>
              <th>名称</th>
              <th>URL</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  document.getElementById('fetch-btn').addEventListener('click', fetchMaterials);
  document.getElementById('download-btn').addEventListener('click', downloadJSON);
  document.getElementById('clear-btn').addEventListener('click', clearMaterials);
  document.getElementById('minimize-btn').addEventListener('click', toggleMinimize);
  document.getElementById('close-btn').addEventListener('click', closePanel);

  const header = document.getElementById('panel-header');
  header.addEventListener('mousedown', startDragging);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', stopDragging);
}

function startDragging(e) {
  isDragging = true;
  const panel = document.getElementById('material-panel');
  dragOffsetX = e.clientX - panel.offsetLeft;
  dragOffsetY = e.clientY - panel.offsetTop;
}

function drag(e) {
  if (isDragging) {
    const panel = document.getElementById('material-panel');
    panel.style.left = (e.clientX - dragOffsetX) + 'px';
    panel.style.top = (e.clientY - dragOffsetY) + 'px';
  }
}

function stopDragging() {
  isDragging = false;
}

function toggleMinimize() {
  const panel = document.getElementById('material-panel');
  panel.classList.toggle('minimized');
  const minimizeBtn = document.getElementById('minimize-btn');
  minimizeBtn.textContent = panel.classList.contains('minimized') ? '+' : '-';
}

function closePanel() {
  const panel = document.getElementById('material-panel');
  panel.style.display = 'none';
}

function extractMaterialInfo() {
  const newMaterials = [];
  document.querySelectorAll('.weui-desktop-img-picker__list .weui-desktop-img-picker__item').forEach(item => {
    const nameElement = item.querySelector('.weui-desktop-img-picker__img-title');
    const imgElement = item.querySelector('.weui-desktop-img-picker__img-thumb');
    
    if (nameElement && imgElement) {
      const name = nameElement.textContent.trim();
      const style = imgElement.getAttribute('style');
      const urlMatch = style.match(/url\("(.+?)"\)/);
      let url = urlMatch ? urlMatch[1] : '';
      
      // 去掉 URL 中的 ?wx_fmt=png&from=appmsg 部分
      url = url.split('?')[0];
      
      newMaterials.push({
        name: name,
        url: url,
        selected: true // 默认选中
      });
    }
  });
  return newMaterials;
}

function updateMaterialList() {
  const tbody = document.querySelector('#material-table tbody');
  tbody.innerHTML = '';
  materials.forEach((material, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="checkbox" class="select-checkbox" data-index="${index}" ${material.selected ? 'checked' : ''}></td>
      <td><img src="${material.url}" class="thumbnail" alt="${material.name}"></td>
      <td><div class="name-cell">${material.name}</div></td>
      <td class="url-column"><div class="url-cell">${material.url}</div></td>
    `;
    tbody.appendChild(tr);
  });

  // 添加勾选框事件监听
  document.querySelectorAll('.select-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (event) => {
      const index = parseInt(event.target.getAttribute('data-index'));
      materials[index].selected = event.target.checked;
      updateDataStats(); // 更新统计信息
    });
  });

  // 添加缩略图悬停事件
  document.querySelectorAll('.thumbnail').forEach(img => {
    img.addEventListener('mouseover', showPreview);
    img.addEventListener('mouseout', hidePreview);
  });

  updateDataStats(); // 更新统计信息
}

function showPreview(event) {
  const preview = document.createElement('div');
  preview.className = 'preview';
  preview.innerHTML = `<img src="${event.target.src}" alt="预览">`;
  document.body.appendChild(preview);
  
  // 设置预览图位置
  const rect = event.target.getBoundingClientRect();
  preview.style.left = `${rect.right + 10}px`;
  preview.style.top = `${rect.top}px`;
}

function hidePreview() {
  const preview = document.querySelector('.preview');
  if (preview) {
    preview.remove();
  }
}

function updateDataStats() {
  const totalCount = materials.length;
  const selectedCount = materials.filter(m => m.selected).length;
  const dataStats = document.getElementById('data-stats');
  dataStats.textContent = `总计: ${totalCount} | 已选: ${selectedCount}`;
}

function fetchMaterials() {
  const newMaterials = extractMaterialInfo();
  
  // 合并新旧数据并去重
  const combinedMaterials = [...materials, ...newMaterials];
  materials = Array.from(new Set(combinedMaterials.map(JSON.stringify))).map(JSON.parse);
  
  // 根据名称排序
  // materials.sort((a, b) => a.name.localeCompare(b.name));
  
  updateMaterialList();
  updateDataStats(); // 更新统计信息
}

function downloadJSON() {
  const selectedMaterials = materials.filter(m => m.selected);
  const jsonContent = JSON.stringify(selectedMaterials, null, 2);
  const blob = new Blob([jsonContent], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '微信公众号素材信息.json';
  a.click();
  URL.revokeObjectURL(url);
}

function clearMaterials() {
  materials = [];
  updateMaterialList();
  updateDataStats(); // 更新统计信息
}

// 创建面板并初始化
createPanel();
