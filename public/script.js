'use strict';

document.addEventListener('DOMContentLoaded', function () {
	let addNoteButton = document.getElementById('add-note');
	let noteDialog = document.getElementById('dialog-Note');
	let notes = document.getElementById('notes').children;
	
	let clearNoteDialog = () => {
		document.getElementById('dialog-NoteTitle-Placeholder').style.opacity = 1;
		document.getElementById('dialog-NewPoint-Text-Placeholder').style.opacity = 1;
		document.getElementById('dialog-NoteTitle').innerHTML = '';
		document.getElementById('dialog-NewPoint-Text').innerHTML = '';
		document.getElementById('dialog-todo').innerHTML = '';
		document.getElementById('dialog-checked').innerHTML = '';
		document.body.style.overflowY = 'auto';
		flagCloseNoteDialog = false;
	}
	
	document.getElementById('dialog-NoteClose').addEventListener('click', () => {
		choiceSaveOrUpdateOrNothing();	
		noteDialog.close();
		clearNoteDialog();
	});	
	
	document.getElementById('dialog-NoteRemove').addEventListener('click', () => {
		noteDialog.close();
		clearNoteDialog();
		if (note.createdTimestampUsec) {
			removeNote();
		}
	});
	
	let flagCloseNoteDialog = false;
	
	let closeNoteDialog = (event) => {
		if (event.target === noteDialog && flagCloseNoteDialog) {
			if (event.layerX < 0 || event.layerX > event.currentTarget.offsetWidth) {
				choiceSaveOrUpdateOrNothing();
				clearNoteDialog();
				noteDialog.close();
				note = null;
				return;
			}
			if (event.layerY < 0 || event.layerY > event.currentTarget.offsetHeight) {
				choiceSaveOrUpdateOrNothing();
				clearNoteDialog();
				noteDialog.close();
				note = null;
			}
		}
	}
	
	noteDialog.addEventListener('mousedown', (event) => {
		if (event.layerX < 0 || event.layerX > event.currentTarget.offsetWidth) {
			flagCloseNoteDialog = true;
		}
		if (event.layerY < 0 || event.layerY > event.currentTarget.offsetHeight) {
			flagCloseNoteDialog = true;
		}
	});
	
	noteDialog.addEventListener('click', closeNoteDialog);
	noteDialog.addEventListener('cancel', (event) => {
		clearNoteDialog();
		choiceSaveOrUpdateOrNothing();
		note = null;
	});
	
	let ajax = (type, url, data) => {
		let promise = new Promise(function (resolve, reject) {
			let request = new XMLHttpRequest();
			
			request.open(type, url, true);
			
			request.send(data);
			
			request.onload = function () {
				if (this.status === 200) {
					resolve(this.response);
				} else if (this.status === 422) {
					reject(this.responseText);
				} else {
					let error = new Error(this.statusText);
					error.code = this.status;
					reject(error);
				}
			};
			
			request.onerror = function (error) {
				reject(new Error('Network error'));
			};
		});
		
		return promise;
	}
	
	let checkDragOverNote = (event) => {
		let element = document.elementFromPoint(event.clientX, event.clientY);
		while (true) {
			if (element.classList.contains('note'))
				break;
			if (element.tagName == 'BODY')
				return null;
			element = element.parentNode;
		}
		return element
	}
	
	let draggbleNote = null;
	let shiftX = null;
	let shiftY = null;
	let noteIndex = -1;
	let noteMoveFlag = false;
	
	let mouseDownNote = (event) => {		
		for (let i = 0; i < notes.length; i++) {
			if (event.currentTarget == notes[i]) {
				noteIndex = i;
				break;
			}
		}
		
		let hole = document.createElement('div');
		draggbleNote = event.currentTarget;
		shiftX = event.clientX - draggbleNote.getBoundingClientRect().left + 10;
		shiftY = event.clientY - draggbleNote.getBoundingClientRect().top + 10;
		
		hole.id = 'hole';
		hole.style.width = draggbleNote.offsetWidth + 'px';
		hole.style.boxSizing = 'border-box';
		hole.style.margin = '10px';
		
		draggbleNote.style.position = 'absolute';
		draggbleNote.style.left = event.pageX - shiftX + 'px';
		draggbleNote.style.top = event.pageY - shiftY + 'px';
		draggbleNote.classList.remove('note-hover');
		draggbleNote.classList.add('note-drag');
		
		draggbleNote.parentNode.replaceChild(hole, draggbleNote);
		document.body.appendChild(draggbleNote);
		
		document.addEventListener('mousemove', noteMove);
		document.addEventListener('mousemove', newPositionNote);
		document.addEventListener('mousemove', overNote);
		draggbleNote.addEventListener('mouseup', mouseUpNote);
	}
	
	let noteMove = () => {
		noteMoveFlag = true;
	}
	
	let newPositionNote = (event) => {
		draggbleNote.style.left = event.pageX - shiftX + 'px';
		draggbleNote.style.top = event.pageY - shiftY + 'px';
	}
	
	let overNote = (event) => {
		let hole = document.getElementById('hole');
		draggbleNote.hidden = true;
		let noteOver = checkDragOverNote(event);
		draggbleNote.hidden = false;
		
		notes = document.getElementById('notes').children;
		
		if (noteOver) {
			for (let i = 0; i < notes.length; i++) {
				if (noteOver == notes[i]) {
					if (i > noteIndex) {
						notes[i].insertAdjacentElement('afterend', hole);
					} else {
						notes[i].insertAdjacentElement('beforebegin', hole);
					}
					noteIndex = i;
					break;
				}
			}
		}
	}
	
	function mouseUpNote() {
		draggbleNote.removeAttribute('style');
		
		let hole = document.getElementById('hole');
		hole.parentNode.replaceChild(draggbleNote, hole);
		
		document.removeEventListener('mousemove', noteMove);
		document.removeEventListener('mousemove', newPositionNote);
		document.removeEventListener('mousemove', overNote);
		
		this.removeEventListener('mouseup', mouseUpNote);
		this.classList.remove('note-drag');
		this.addEventListener('mouseover', () => {
			this.classList.add('note-hover');
		});
		this.addEventListener('mouseleave', () => {
			this.classList.remove('note-hover');
		});
		
		if (!noteMoveFlag) {
			openNote(draggbleNote.id);
		}
		draggbleNote = null;
		noteIndex = -1;
		noteMoveFlag = false;
	}
	
	let addEventListenerToNote = (note) => {
		note.addEventListener('mouseenter', () => {
			note.classList.add('note-hover');
		});
		note.addEventListener('mousedown', mouseDownNote);
		note.addEventListener('mouseleave', () => {
			note.classList.remove('note-hover');
		});		
	}
	
	let noteList = document.querySelectorAll('.note');
	for (let i = 0; i < noteList.length; i++) {
		addEventListenerToNote(notes[i]);
	}
	
	let renderNoteDialog = (note) => {
		document.getElementById('dialog-NoteTitle').innerHTML = note.title;
		
		if (note.title.length != 0) {
			document.getElementById('dialog-NoteTitle-Placeholder').style.opacity = 0;
		} else {
			document.getElementById('dialog-NoteTitle-Placeholder').style.opacity = 1;
		}
		
		let dialogTodo = document.getElementById('dialog-todo');
		let dialogChecked = document.getElementById('dialog-checked');
		
		let dialogTodoHTML = '';
		for (let i = 0; i < note.todo.length; i++) {
			dialogTodoHTML += `<div class="todo-point"><div><input type="checkbox"></div>
			<div>${note.todo[i].text}</div>
			<div><button class="remove-point">&#215;</button></div>
			</div>`;
		}
		dialogTodo.innerHTML = dialogTodoHTML;
		
		let dialogCheckedHTML = '';
		for (let i = 0; i < note.checked.length; i++) {
			dialogCheckedHTML += `<div class="checked-point"><div><input type="checkbox" checked></div>
			<div>${note.checked[i].text}</div>
			<div><button class="remove-point">&#215;</button></div>
			</div>`;
		}
		dialogChecked.innerHTML = dialogCheckedHTML;
	
		let removeNotePointButton = document.querySelectorAll('.remove-point');
		for (let i = 0; i < removeNotePointButton.length; i++) {
			removeNotePointButton[i].addEventListener('click', removeNotePoint);
		}
		
		let chechPointInputs = document.querySelectorAll('input');
		for (let i = 0; i < chechPointInputs.length; i++) {
			chechPointInputs[i].addEventListener('click', checkUncheckPoint);
		}
		
		noteDialog.showModal();
		document.body.style.overflowY = 'hidden';
	}
	
	let note = null;
	let openNote = (id) => {
		ajax('GET', '/api/note/' + id, null).then(response => {
			note = JSON.parse(response);
			renderNoteDialog(note);
		}).catch(error => {
			alert(error);
		});
	}
	
	addNoteButton.addEventListener('click', () => {
		noteDialog.showModal();
		document.body.style.overflowY = 'hidden';
		newNote();
	});
	
	function showHidePlaceholder() {
		if (this.innerText.length == 0)
			document.getElementById(this.id + '-Placeholder').style.opacity = 1;
		else
			document.getElementById(this.id + '-Placeholder').style.opacity = 0;
	}
	
	let dialogNoteTitle = document.getElementById('dialog-NoteTitle');
	let dialogNewPointText = document.getElementById('dialog-NewPoint-Text');
	
	dialogNoteTitle.addEventListener('input', showHidePlaceholder);
	dialogNewPointText.addEventListener('input', showHidePlaceholder);
	
	dialogNoteTitle.addEventListener('paste', (event) => {
		event.preventDefault();
		let pasteText = event.clipboardData.getData('text');
		let indexPaste = window.getSelection().baseOffset;
		let innerText = dialogNoteTitle.innerText;
		dialogNoteTitle.innerText = innerText.substring(0, indexPaste) + pasteText + innerText.substring(indexPaste);
	});
	
	dialogNoteTitle.addEventListener('blur', () => {
		if (dialogNoteTitle.innerText.length != 0) {
			note.title = dialogNoteTitle.innerText;
		}
	});
	
	dialogNoteTitle.addEventListener('keypress', (event) => {
		if (event.key == 'Enter') {
			event.preventDefault();
			dialogNewPointText.focus();
		}
	});
	
	let addNewTodoPointHTML = (point) => {
		return `<div class="todo-point"><div><input type="checkbox"></div>
			<div>${point}</div>
			<div><button class="remove-point">&#215;</button></div>
			</div>`;
	}
	
	dialogNewPointText.addEventListener('keypress', (event) => {
		if (event.key == 'Enter') {
			event.preventDefault();
			
			let point = dialogNewPointText.innerText;
			let newPoint = addNewTodoPointHTML(point);
			
			note.listContent.push({ isChecked : false, text : point });
			let newPointNode = new DOMParser().parseFromString(newPoint, 'text/html').body.childNodes[0];
			newPointNode.querySelector('.remove-point').addEventListener('click', removeNotePoint);
			newPointNode.querySelector('input').addEventListener('click', checkUncheckPoint);
			document.getElementById('dialog-todo').appendChild(newPointNode);
			dialogNewPointText.innerText = '';
			document.getElementById('dialog-NewPoint-Text-Placeholder').style.opacity = 1;
		}
	});
	
	let newNote = () => {
		note = {};
		note.color = 'DEFAULT';
		note.listContent = [];
		note.title = '';
	}
	
	let choiceSaveOrUpdateOrNothing = () => {
		if ((note.title.length + note.listContent.length) == 0)
			return;
		if (note.createdTimestampUsec)
			updateNote();
		else
			saveNewNote();
	}
	
	let saveNewNote = () => {
		ajax('PUT', '/api/note', JSON.stringify(note))
		.then(response => {
			let note = new DOMParser().parseFromString(response, 'text/html').body.childNodes[0];
			addEventListenerToNote(note);
			document.getElementById('notes').insertBefore(note, notes[0]);
			notes = document.getElementById('notes').children;
		}).catch(error => {
			alert(error);
		});
	}
	
	let updateNote = () => {
		ajax('POST', '/api/note', JSON.stringify(note))
		.then(response => {
			let note = new DOMParser().parseFromString(response, 'text/html').body.childNodes[0];
			for (let i = 0; i < notes.length; i++) {
				if (note.id == notes[i].id) {
					addEventListenerToNote(note);
					notes[i].parentNode.replaceChild(note, notes[i]);
					break;
				}
			}
		}).catch(error => {
			alert(error);
		});		
	}
	
	let removeNote = () => {
		ajax('DELETE', '/api/note/' + note.createdTimestampUsec, null)
		.then(response => {
			for (let i = 0; i < notes.length; i++) {
				if (note.createdTimestampUsec == notes[i].id) {
					notes[i].remove();
					note = null;
					break;
				}
			}
		}).catch(error => {
			alert(error);
		});
	}
	
	let checkUncheckPoint = (event) => {
		let notePoint = event.currentTarget.parentNode.parentNode;
		let isChecked = event.currentTarget.checked;
		let textPoint = notePoint.children[1].firstChild.textContent;
		
		for (let i = 0; i < note.listContent.length; i++) {
			if (note.listContent[i].text == textPoint) {
				note.listContent[i].isChecked = isChecked;
				moveCheckUncheckPoint(notePoint, isChecked);
				break;
			}
		}
	}
	
	let moveCheckUncheckPoint = (point, isChecked) => {
		let todoList = document.getElementById('dialog-todo');
		let checkedList = document.getElementById('dialog-checked');
		if (isChecked) {
			point.classList.remove('todo-point');
			point.classList.add('checked-point');
			checkedList.appendChild(point);
		} else {
			point.classList.add('todo-point');
			point.classList.remove('checked-point');
			todoList.appendChild(point);
		}
	}
	
	let removeNotePoint = (event) => {
		let notePoint = event.currentTarget.parentNode.parentNode;
		let isChecked = notePoint.querySelector('input').checked;
		let textPoint = notePoint.children[1].firstChild.textContent;
		
		notePoint.remove();
		for (let i = 0; i < note.listContent.length; i++) {
			if (note.listContent[i].text == textPoint) {
				note.listContent.splice(i, 1);
				break;
			}
		}
	}
});		