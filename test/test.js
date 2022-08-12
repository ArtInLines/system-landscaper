const graphContainer = document.getElementById('graph-root');
const newNodeBtn = document.getElementById('btn-new');
const viewSelect = document.getElementById('select-view');
const sideBar = document.getElementById('sidebar');

const SystemLandscape = SystemMapper.Graph.SystemLandscape;
const Node = SystemMapper.Graph.SystemNode;
const Renderer = SystemMapper.Renderer;
const SingleLayerView = SystemMapper.views.SingleLayerView;

const sl = new SystemLandscape();

sl.addSystem('Server 1', { type: 'hardware' });
sl.addSystem('Server 2', { type: 'hardware' });
// sl.addSystem('Server 3', { type: 'hardware' });
sl.addSystem('VM 1', { type: 'vm' }, 'Server 1');
sl.addSystem('VM 2', { type: 'vm' }, 'Server 1');
sl.addSystem('VM 3', { type: 'vm' }, 'Server 1');
sl.addSystem('VM 4', { type: 'vm' }, 'Server 2');
sl.addSystem('VM 5', { type: 'vm' }, 'Server 2');
// sl.addSystem('VM 6', { type: 'vm' }, 'Server 3');
// sl.addSystem('VM 7', { type: 'vm' }, 'Server 3');
// sl.addSystem('VM 8', { type: 'vm' }, 'Server 3');
// sl.addSystem('VM 9', { type: 'vm' }, 'Server 3');
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

newNodeBtn.addEventListener('click', (e) => addNewNode(e));
viewSelect.addEventListener('click', (e) => updateViewOptions(e));
viewSelect.addEventListener('change', (e) => changeView(e));

function getDefaultNodeData() {
	return {
		name: '',
		parent: null,
		wikiLink: '',
		description: '',
		type: '',
		color: '',
	};
}

function getInputField(label = 'Label', placeholder = 'Placeholder', onChange = () => {}) {
	const container = document.createElement('div');
	container.className = 'input-container';
	const labelEl = document.createElement('label');
	labelEl.textContent = label;
	labelEl.className = 'input-label';
	const input = document.createElement('input');
	input.type = 'text';
	input.placeholder = placeholder;
	input.className = 'input-field';
	input.addEventListener('change', (e) => onChange(input.value));

	container.appendChild(labelEl);
	container.appendChild(input);
	return container;
}

function getSelectField(label, values, onChange) {
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
		select.appendChild(option);
	});
	select.addEventListener('change', (e) => onChange(select.value));
	container.appendChild(labelEl);
	container.appendChild(select);
	return container;
}

function getDataListField(label, values, onChange) {
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

function getNewNodeEditorHTML() {
	const data = getDefaultNodeData();
	const newNodeEditor = document.createElement('div');
	newNodeEditor.className = 'new-node-editor';

	const nameField = getInputField('Name', 'Name des Systems', (name) => {
		data.name = name;
	});
	nameField.classList.add('sub-container');
	newNodeEditor.appendChild(nameField);

	let parentValues = sl.getSystems(0, Infinity, true).map((n) => [n.name, n.name]);
	const parentField = getDataListField('"Vater"-System', parentValues, (parent) => {
		data.parent = parent;
	});
	parentField.classList.add('sub-container');
	newNodeEditor.appendChild(parentField);

	const wikiLinkField = getInputField('Wiki Link', 'Link zur Wiki-Seite des Systems', (wikiLink) => {
		data.wikiLink = wikiLink;
	});
	wikiLinkField.classList.add('sub-container');
	newNodeEditor.appendChild(wikiLinkField);

	const descriptionField = getInputField('Beschreibung', 'Beschreibung des Systems', (description) => {
		data.description = description;
	});
	descriptionField.classList.add('sub-container');
	newNodeEditor.appendChild(descriptionField);

	const typeField = getSelectField(
		'Typ',
		[
			['Typ des Systems', ''],
			['Hardware', 'hardware'],
			['Virtuelle Machine', 'vm'],
			['Software System', 'software'],
			['Datenbank', 'db'],
		],
		(type) => {
			data.type = type;
		}
	);
	typeField.classList.add('sub-container');
	newNodeEditor.appendChild(typeField);

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
		(color) => {
			data.color = color;
		}
	);
	colorField.classList.add('sub-container');
	newNodeEditor.appendChild(colorField);

	const btnContainer = document.createElement('div');
	btnContainer.classList.add('sub-container', 'btn-container');
	const cancelBtn = document.createElement('button');
	cancelBtn.textContent = 'Abbrechen';
	cancelBtn.className = 'btn-cancel';
	cancelBtn.addEventListener('click', (e) => clearSideBar());

	const submitBtn = document.createElement('button');
	submitBtn.textContent = 'Hinzufügen';
	submitBtn.className = 'btn-submit';
	submitBtn.addEventListener('click', (e) => submitNewNode(data));

	btnContainer.appendChild(cancelBtn);
	btnContainer.appendChild(submitBtn);
	newNodeEditor.appendChild(btnContainer);

	return newNodeEditor;
}

function addNewNode() {
	clearSideBar();
	sideBar.appendChild(getNewNodeEditorHTML());
}

function clearSideBar(data) {
	sideBar.childNodes.forEach((c) => c.remove());
}

function submitNewNode(data) {
	let name = data.name || null;
	delete data.name;
	let parent = data.parent || null;
	delete data.parent;
	sl.addSystem(name, data, parent);
	clearSideBar();
}

const views = {};

function updateViewOptions() {
	let selectedOptIds = Array.from(viewSelect.selectedOptions).map((o) => o.value);
	viewSelect.innerHTML = '';
	const maxHeight = sl.getMaxHeight();
	let i = 0;
	do {
		const opt = document.createElement('option');
		opt.value = `single-layer-${i}`;
		opt.text = `Layer ${i}`;
		views[opt.value] = new SingleLayerView(i);
		if (selectedOptIds.includes(opt.value)) opt.selected = true;
		viewSelect.appendChild(opt);
		i++;
	} while (i <= maxHeight);
}

updateViewOptions();
const renderer = new Renderer(sl, { view: views[viewSelect.value], container: graphContainer });

function changeView() {
	const view = views[viewSelect.value];
	renderer.changeView(view);
}

renderer.run();
