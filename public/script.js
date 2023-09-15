'use strict';

document.addEventListener('DOMContentLoaded', function () {
	let addKeep = document.getElementById('add-keep');
	let notes = document.getElementById('notes').children;
	
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
	
	addKeep.addEventListener('click', () => {
		currentDialog.showModal();
		hiddenEntityAdd(currentMenu.id);
		resetForm();
	});
	
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
	
	let mouseDownNote = (event) => {
		event.stopPropagation();
		
		let noteIndex = -1;
		
		for (let i = 0; i < notes.length; i++) {
			if (event.currentTarget == notes[i]) {
				noteIndex = i;
				break;
			}
		}

		let note = event.currentTarget.cloneNode(true);
		let shiftX = event.clientX - event.currentTarget.getBoundingClientRect().left + 10;
		let shiftY = event.clientY - event.currentTarget.getBoundingClientRect().top + 10;
		let hole = document.createElement('div');
		
		hole.style.width = event.currentTarget.offsetWidth + 'px';
		hole.style.height = event.currentTarget.offsetHeight + 'px';
		hole.style.margin = '10px';
		
		note.style.position = 'absolute';
		note.style.left = event.pageX - shiftX + 'px';
		note.style.top = event.pageY - shiftY + 'px';
		note.classList.remove('note-hover');
		note.classList.add('note-drag');
		
		event.currentTarget.parentNode.replaceChild(hole, event.currentTarget);
		note.addEventListener('mousedown', mouseDownNote, true);
		document.body.appendChild(note);
		
		let newPositionNote = (ev) => {
			note.style.left = ev.pageX - shiftX + 'px';
			note.style.top = ev.pageY - shiftY + 'px';
		};
		
		let overNote = (ev) => {
			note.hidden = true;
			let noteOver = checkDragOverNote(ev);
			note.hidden = false;
			
			notes = document.getElementById('notes').children;
			
			if (noteOver) {
				for (let i = 0; i < notes.length; i++) {
					if (noteOver == notes[i]) {
						// let noteParent = noteOver.parentNode;
						if (noteIndex < i) {
							for (let j = noteIndex; j <= i; j++) {
								notes[j].replaceWith(notes[j + 1]);
							}
						} else {
						
						}
						break;
					}
				}
			}
		};
		
		document.addEventListener('mousemove', newPositionNote);
		document.addEventListener('mousemove', overNote);
		
		function mouseUpNote() {
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
		}
		
		note.addEventListener('mouseup', mouseUpNote);
	};
	
	let mouseOver = (event) => {
		
	};
	
	let drop = (event) => {
		let id = event.dataTransfer.getData('text/plain');
		let draggableElement = document.getElementById(id);
		draggableElement.style.position = 'relative';
		let dropzone = event.target;
		if (dropzone.id != 'notes')
		return;
		dropzone.appendChild(draggableElement);
		event.dataTransfer.clearData();
	};
	
	let noteList = document.querySelectorAll('.note');
	for (let i = 0; i < noteList.length; i++) {
		noteList[i].addEventListener('mouseenter', () => {
			noteList[i].classList.add('note-hover');
		});
		noteList[i].addEventListener('mousedown', mouseDownNote, true);
		noteList[i].addEventListener('mouseleave', () => {
			noteList[i].classList.remove('note-hover');
		});
	}
});