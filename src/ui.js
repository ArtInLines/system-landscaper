window.onload((e) => {
	const SystemLandscape = require('./Graphs/SystemLandscape.js');
	const Renderer = require('./renderer.js');
	const View = require('./Views/View.js');
	const SingleLayerView = require('./Views/SingleLayerView.js');
	const SingleLayerTreeMapView = require('./Views/SingleLayerTreeMapView');

	const graphContainer = document.getElementById('graph-root');
	const newNodeBtn = document.getElementById('btn-new');
	const viewSelect = document.getElementById('select-view');
	const sideBar = document.getElementById('sidebar');

	let currentViewValue = viewSelect.value;

	const sl = new SystemLandscape();

	sl.addSystem('Server 1', { type: 'hardware' });
	sl.addSystem('Server 2', { type: 'hardware' });
	sl.addSystem('VM 1', { type: 'vm' }, 'Server 1');
	sl.addSystem('VM 2', { type: 'vm' }, 'Server 1');
	sl.addSystem('VM 3', { type: 'vm' }, 'Server 1');
	sl.addSystem('VM 4', { type: 'vm' }, 'Server 2');
	sl.addSystem('VM 5', { type: 'vm' }, 'Server 2');
	sl.addSystem('DB 1', { type: 'db' }, 'VM 1');
	sl.addSystem('DB 2', { type: 'db' }, 'VM 1');
	sl.addSystem('Software 1', { type: 'software' }, 'VM 2');
	sl.addSystem('Software 2', { type: 'software' }, 'VM 2');
	sl.addSystem('Software 3', { type: 'software' }, 'VM 2');
	sl.addSystem('Software 4', { type: 'software' }, 'VM 3');
	sl.addSystem('Software 5', { type: 'software' }, 'VM 4');
	sl.addSystem('Software 6', { type: 'software' }, 'VM 4');
	sl.addSystem('Software 7', { type: 'software' }, 'VM 4');
	sl.addSystem('DB 3', { type: 'db' }, 'VM 5');
	sl.addSystem('Software', { type: 'software' }, 'VM 5');

	sl.linkSystems('DB 1', 'Software 1');

	newNodeBtn.addEventListener('click', (_) => addNewNode());
	viewSelect.addEventListener('click', (_) => updateViewOptions());
	viewSelect.addEventListener('change', (_) => changeView());

	function getDefaultNodeData(node = null) {
		return {
			name: node?.name || '',
			parent: node?.parent?.name || null,
			wikiLink: node?.data?.wikiLink || '',
			description: node?.data?.description || '',
			type: node?.data?.type || '',
			color: node?.data?.color || '',
		};
	}

	function getInputField(label = 'Label', value = null, placeholder = 'Placeholder', onChange = () => {}) {
		const container = document.createElement('div');
		container.className = 'input-container';
		const labelEl = document.createElement('label');
		labelEl.textContent = label;
		labelEl.className = 'input-label';
		const input = document.createElement('input');
		input.type = 'text';
		if (value) input.value = value;
		else input.placeholder = placeholder;
		input.className = 'input-field';
		input.addEventListener('change', (e) => onChange(input.value));

		container.appendChild(labelEl);
		container.appendChild(input);
		return container;
	}

	function getSelectField(label, values, isSelected, onChange) {
		const container = document.createElement('div');
		container.className = 'select-container';
		const labelEl = document.createElement('label');
		labelEl.textContent = label;
		labelEl.className = 'select-label';
		const select = document.createElement('select');
		select.className = 'select-field';
		values.forEach((v) => {
			let text, value;
			if (Array.isArray(v)) {
				text = v[0];
				value = v[1];
			} else {
				text = v;
				value = v;
			}
			const option = document.createElement('option');
			option.value = value;
			option.textContent = text;
			if (typeof isSelected === 'function' && isSelected(option)) option.selected = true;
			select.appendChild(option);
		});
		select.addEventListener('change', (e) => onChange(select.value));
		container.appendChild(labelEl);
		container.appendChild(select);
		return container;
	}

	function getDataListField(label, val, values, onChange) {
		let idCounter = getDataListField?.idCounter || 0;
		const dataListId = `${idCounter}-data-list`;
		idCounter++;
		getDataListField.idCounter = idCounter;

		const container = document.createElement('div');
		container.className = 'data-list-container';
		const labelEl = document.createElement('label');
		labelEl.textContent = label;
		labelEl.className = 'data-list-label';
		const inputEl = document.createElement('input');
		inputEl.type = 'text';
		if (val) inputEl.value = val;
		inputEl.setAttribute('list', dataListId);
		inputEl.className = 'data-list-input';
		const dataList = document.createElement('datalist');
		dataList.id = dataListId;
		values.forEach((v) => {
			let text, value;
			if (Array.isArray(v)) {
				text = v[0];
				value = v[1];
			} else {
				text = v;
				value = v;
			}
			const option = document.createElement('option');
			option.value = text;
			option.textContent = text;
			option.setAttribute('real-value', value);
			dataList.appendChild(option);
		});
		inputEl.addEventListener('change', (e) => {
			let option = dataList.querySelector(`option[value="${inputEl.value}"]`);
			if (option) {
				onChange(option.getAttribute('real-value'));
			} else {
				onChange(null);
			}
		});
		container.appendChild(labelEl);
		container.appendChild(inputEl);
		container.appendChild(dataList);
		return container;
	}

	function getNodeEditorHTML(submit = null, node = null) {
		const data = getDefaultNodeData(node);
		const nodeEditor = document.createElement('div');
		nodeEditor.className = 'node-editor';

		const nameField = getInputField('Name', data.name || null, 'Name des Systems', (name) => {
			data.name = name;
		});
		nameField.classList.add('sub-container');
		nodeEditor.appendChild(nameField);

		let parentValues = sl.getSystems(0, Infinity, true).map((n) => [n.name, n.name]);
		const parentField = getDataListField('"Vater"-System', data?.parent || null, parentValues, (parent) => {
			data.parent = parent;
		});
		parentField.classList.add('sub-container');
		nodeEditor.appendChild(parentField);

		const wikiLinkField = getInputField('Wiki Link', data?.wikiLink || null, 'Link zur Wiki-Seite des Systems', (wikiLink) => {
			data.wikiLink = wikiLink;
		});
		wikiLinkField.classList.add('sub-container');
		nodeEditor.appendChild(wikiLinkField);

		const descriptionField = getInputField('Beschreibung', data?.description || null, 'Beschreibung des Systems', (description) => {
			data.description = description;
		});
		descriptionField.classList.add('sub-container');
		nodeEditor.appendChild(descriptionField);

		const typeField = getSelectField(
			'Typ',
			[
				['Typ des Systems', ''],
				['Hardware', 'hardware'],
				['Virtuelle Machine', 'vm'],
				['Software System', 'software'],
				['Datenbank', 'db'],
			],
			(opt) => opt.value === data.type,
			(type) => {
				data.type = type;
			}
		);
		typeField.classList.add('sub-container');
		nodeEditor.appendChild(typeField);

		const colorField = getSelectField(
			'Farbe',
			[
				['Farbe des Systems', ''],
				['Rot', 'red'],
				['Gelb', 'yellow'],
				['Grün', 'green'],
				['Blau', 'blue'],
				['Violett', 'violet'],
				['Weiß', 'white'],
				['Schwarz', 'black'],
			],
			(opt) => opt.value === data.color,
			(color) => {
				data.color = color;
			}
		);
		colorField.classList.add('sub-container');
		nodeEditor.appendChild(colorField);

		const btnContainer = document.createElement('div');
		btnContainer.classList.add('sub-container', 'btn-container');
		const cancelBtn = document.createElement('button');
		cancelBtn.textContent = 'Abbrechen';
		cancelBtn.className = 'btn-cancel';
		cancelBtn.addEventListener('click', (e) => clearSideBar());

		const submitBtn = document.createElement('button');
		submitBtn.textContent = 'Bestätigen';
		submitBtn.className = 'btn-submit';
		submitBtn.addEventListener('click', (e) => submit(data, node));

		btnContainer.appendChild(cancelBtn);
		btnContainer.appendChild(submitBtn);
		nodeEditor.appendChild(btnContainer);

		return nodeEditor;
	}

	function addNewNode() {
		clearSideBar();
		sideBar.appendChild(getNodeEditorHTML(submitNewNode, null));
	}

	function updateNodeHTML(node) {
		clearSideBar();
		sideBar.appendChild(getNodeEditorHTML(updateNode, node));
	}

	function clearSideBar(data) {
		sideBar.childNodes.forEach((c) => c.remove());
	}

	function submitNewNode(data, node) {
		let name = data.name || null;
		delete data.name;
		let parent = data.parent || null;
		delete data.parent;
		sl.addSystem(name, data, parent);
		clearSideBar();
	}

	function updateNode(data, node) {
		sl.updateSystem(node.id, data);
		clearSideBar();
	}

	const views = {};

	function addOption(selectEl, text, value, isSelected) {
		const opt = document.createElement('option');
		opt.text = text;
		opt.value = value;
		if (isSelected(opt)) opt.selected = true;
		selectEl.appendChild(opt);
		return opt;
	}

	function updateViewOptions() {
		let selectedOptIds = Array.from(viewSelect.selectedOptions).map((o) => o.value);
		const isSelected = (opt) => selectedOptIds.includes(opt.value);
		viewSelect.innerHTML = '';

		const maxHeight = sl.getMaxHeight();
		let i = 0;
		do {
			let opt = addOption(viewSelect, `Layer ${i}`, `single-layer-${i}`, isSelected);
			views[opt.value] = new SingleLayerView(i);
			i++;
		} while (i <= maxHeight);

		i = 0;
		do {
			let opt = addOption(viewSelect, `TreeMap Layer ${i}`, `treemap-layer-${i}`, isSelected);
			views[opt.value] = new SingleLayerTreeMapView(i);
			i++;
		} while (i <= maxHeight);

		let opt = addOption(viewSelect, `Total View`, `total-view`, isSelected);
		views[opt.value] = new View();
	}

	updateViewOptions();
	const renderer = new Renderer(sl, { view: views[viewSelect.value], container: graphContainer });

	function changeView() {
		if (currentViewValue === viewSelect.value) return;

		currentViewValue = viewSelect.value;
		renderer.changeView(views[viewSelect.value]);
	}

	renderer.run();

	renderer.on('selected-nodes', (nodes) => {
		let n = nodes[0];
		updateNodeHTML(n);
	});
	renderer.on('deselected-nodes', () => {
		clearSideBar();
	});
	renderer.on('selected-edges', (edges) => {});
});
