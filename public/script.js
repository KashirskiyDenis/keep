'use strict';

document.addEventListener('DOMContentLoaded', function () {
	let addNoteButton = document.getElementById('add-note');
	let noteDialog = document.getElementById('dialog-Note');
	let notes = document.getElementById('notes').children;
	
	noteDialog.addEventListener('click', (event) => {
		if (event.target === noteDialog)
			noteDialog.close();
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
	};
	
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
	};
	
	let draggbleNote = null;
	let shiftX = null;
	let shiftY = null;
	let noteIndex = -1;
	let timeDown = 0;
	let timesUp = 0;
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
		// draggbleNote = event.currentTarget.cloneNode(true);
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
	};
	
	let noteMove = () => {
		noteMoveFlag = true;
	};
	
	let newPositionNote = (event) => {
		draggbleNote.style.left = event.pageX - shiftX + 'px';
		draggbleNote.style.top = event.pageY - shiftY + 'px';
	};
	
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
	};
	
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
	
	let noteList = document.querySelectorAll('.note');
	for (let i = 0; i < noteList.length; i++) {
		noteList[i].addEventListener('mouseenter', () => {
			noteList[i].classList.add('note-hover');
		});
		noteList[i].addEventListener('mousedown', mouseDownNote);
		noteList[i].addEventListener('mouseleave', () => {
			noteList[i].classList.remove('note-hover');
		});
	}
	
	let renderNoteDialog = (note) => {
		// let dialogNoteTitle = document.getElementById('dialog-NoteTitle');
		document.getElementById('dialog-NoteTitle').innerHTML = note.title;
		
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
		noteDialog.showModal();
	}
	
	let note = null;
	let openNote = (id) => {
		ajax('GET', '/api/note/' + id, null).then(response => {
			note = JSON.parse(response);
			renderNoteDialog(note);
		}).catch(error => {
			alert(error);
		});			
	};
	
	addNoteButton.addEventListener('click', () => {
		noteDialog.showModal();
	});
	
	document.getElementById('dialog-NoteClose').addEventListener('click', () => {
		noteDialog.close();
	});
	
	let dialogNoteTitle = document.getElementById('dialog-NoteTitle');
	dialogNoteTitle.addEventListener('blur', () => {
		console.log('blur');
	});

});