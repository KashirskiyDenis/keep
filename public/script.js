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
		event.dataTransfer.setData('text/html', event.target.id);
		// console.log('width ' + event.target.clientWidth);
		// console.log('height ' + event.target.clientHeight);
	};
	
	let dragOver = (event) => {
		event.preventDefault();
	};
	
	let drop = (event) => {
		let id = event.dataTransfer.getData('text/html');
		let draggableElement = document.getElementById(id);
		let dropzone = event.target;
		if (dropzone.id != 'notes')
			return;
		dropzone.appendChild(draggableElement);
		event.dataTransfer.clearData();
	};
	
	let noteList = document.querySelectorAll('.note');
	for (let i = 0; i < noteList.length; i++) {
		noteList[i].addEventListener('dragstart', dragStart);
	}
	
	let notes = document.querySelector('#notes');
	notes.addEventListener('drop', drop);
	notes.addEventListener('dragover', dragOver);
	
	
});