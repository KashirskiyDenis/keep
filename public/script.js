'use strict';

document.addEventListener('DOMContentLoaded', function () {
	let addKeep = document.getElementById('add-keep');
	
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
	
	function dragStart(event) {
		return false;
		
		event.dataTransfer.setData('text/plain', event.target.id);
		event.target.style.position = 'absolute';
		// console.log('width ' + event.target.clientWidth);
		// console.log('height ' + event.target.clientHeight);
	};
	
	let dragMouseDown = (event) => {
		let note = event.currentTarget.cloneNode(true);
		let hole = document.createElement('div');
		
		hole.style.width = event.currentTarget.offsetWidth + 'px';
		hole.style.height = event.currentTarget.offsetHeight + 'px';
		hole.style.margin = '10px';
		
		note.style.position = 'absolute';
		note.style.left = event.pageX - event.currentTarget.offsetWidth / 2 + 'px';
		note.style.top = event.pageY - event.currentTarget.offsetHeight / 2 + 'px';
		
		event.currentTarget.parentNode.replaceChild(hole, event.currentTarget);
		document.body.appendChild(note);
		
		let mouseMove = (ev) => {
			note.style.left = ev.pageX - ev.currentTarget.offsetWidth / 2 + 'px';
			note.style.top = ev.pageY - ev.currentTarget.offsetHeight / 2 + 'px';
			
		};		
	
		document.addEventListener('mousemove', mouseMove);
	};
	
	
	let dragOver = (event) => {
		event.preventDefault();
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
		noteList[i].addEventListener('dragstart', dragStart);
		noteList[i].addEventListener('mousedown', dragMouseDown);
		noteList[i].addEventListener('mouseup', () => {
			document.removeEventListener('mousemove');
			noteList[i].removeEventListener('mouseup');
		});
	}
	
	let notes = document.querySelector('#notes');
	// notes.addEventListener('drop', drop);
	notes.addEventListener('dragover', dragOver);
	
});