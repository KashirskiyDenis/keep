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
	
	
	let dragStart = (event) => {
		return false;
		
		event.dataTransfer.setData('text/plain', event.target.id);
		event.target.style.position = 'absolute';
		// console.log('width ' + event.target.clientWidth);
		// console.log('height ' + event.target.clientHeight);
	};
	
	let dragOver = (event) => {
		
	};
	
	let mouseDown = (event) => {
		event.stopPropagation();
		
		let note = event.currentTarget.cloneNode(true);
		// let note = event.currentTarget;
		
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
		
		// console.log(note.style.left);
		// console.log(note.style.top);
		// console.log('event.pageX ' + event.pageX);
		// console.log('event.pageY ' + event.pageY);
		// console.log('shiftX ' + shiftX);
		// console.log('shiftY ' + shiftY);
		
		event.currentTarget.parentNode.replaceChild(hole, event.currentTarget);
		note.addEventListener('mousedown', mouseDown, true);
		document.body.appendChild(note);
		
		let mouseMove = (ev) => {
			note.style.left = ev.pageX - shiftX + 'px';
			note.style.top = ev.pageY - shiftY + 'px';
		};
		
		document.addEventListener('mousemove', mouseMove);
		
		function mouseUp() {
			document.removeEventListener('mousemove', mouseMove);
			this.removeEventListener('mouseup', mouseUp);
			this.classList.remove('note-drag');
			this.addEventListener('mouseover', () => {
				this.classList.add('note-hover');
			});
			this.addEventListener('mouseleave', () => {
				this.classList.remove('note-hover');
			});			
		}
		
		note.addEventListener('mouseup', mouseUp);
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
		noteList[i].addEventListener('mousedown', mouseDown, true);
		noteList[i].addEventListener('mouseover', () => {
			noteList[i].classList.add('note-hover');
		});
		noteList[i].addEventListener('mouseleave', () => {
			noteList[i].classList.remove('note-hover');
		});
		noteList[i].addEventListener('dragover', () => {
			console.log('fuck');
		});
	}
});