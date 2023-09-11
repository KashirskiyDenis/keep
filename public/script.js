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
	
	let formatMoney = (str) => {
		str = str.split('').reverse().join('');
		let arr = str.split(/(\d{1,3})/).reverse();
		
		for (let i = 0; i < arr.length; i++) {
			arr[i] = arr[i].split('').reverse().join('');
		}
		
		return arr.join(' ').trim();
	};	
	
	addKeep.addEventListener('click', () => {
		currentDialog.showModal();
		hiddenEntityAdd(currentMenu.id);
		resetForm();
	});
	
});