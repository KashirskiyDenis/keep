'use strict';

import { createServer } from 'node:http';
import { appendFile, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { parse } from 'node:url';
import { config } from './config/index.js';

let notes = new Map();

let orderBy = (note, field) => {
	let compareString = (a, b) => a[field].localeCompare(b[field]);
	
	if (note.length <= 1)
		return note;
		
	return note.sort(compareString);
}

let formateNote = (rawNote) => {
	let note = JSON.parse(rawNote);
	
	note.todo = [];
	note.checked = [];
	
	if (note.listContent.length == 0)
		return note;
	
	note.listContent = orderBy(note.listContent, 'text');
	for (let i = 0; i < note.listContent.length; i++) {
		if (note.listContent[i].isChecked)
			note.checked.push(note.listContent[i]);
		else
			note.todo.push(note.listContent[i]);
	}
	return note;
}

async function readNotesFromGoogleKeep() {
	let noteNames = await readdir('./notes');
	if (noteNames.length != 0) {
		for (let i = 0; i < noteNames.length; i++) {
			try {
				let rawNote = await readFile(`./notes/${noteNames[i]}`);
				if (rawNote.length == 0)
					continue;
				let note = formateNote(rawNote);
				notes.set(note.createdTimestampUsec, note);
			} catch (error) {
				console.log(error.message);
			}
		}
	}
}

await readNotesFromGoogleKeep();

let orderNotes = () => {
	notes = new Map([ ...notes.entries()].sort((a, b) => a[1].order - b[1].order));
}

orderNotes();

let findNote = (id) => {
	return notes.get(id);
}

let createNote = async (rawNote) => {
	let note = formateNote(rawNote);
	note.createdTimestampUsec = +(new Date()) * 1000;
	await appendFile(`./notes/${note.createdTimestampUsec}.json`, rawNote);
	notes.set(note.createdTimestampUsec, note);
	return note;
}

let renderNote = (note) => {
	let noteHTML =`<div id="${note.createdTimestampUsec}" class="note ${note.color}">`;
	noteHTML += `<div class="note-title">${note.title}</div>`;
	noteHTML += `<div class="todo">`;
	for (let i = 0; i < note.todo.length; i++) {
		noteHTML += `<div class="todo-point"><div><input type="checkbox"></div><div>${note.todo[i].text}</div></div>`;
	}
	noteHTML += `</div>`;
	noteHTML += `<div class="checked">`;
	for (let i = 0; i < note.checked.length; i++) {
		noteHTML += `<div class="checked-point"><div><input type="checkbox" checked></div><div>${note.checked[i].text}</div></div>`;
	}
	noteHTML += `</div>`;
	noteHTML += `</div>`;
	
	return noteHTML;
}

let updateNote = async (note) => {
	let noteID = JSON.parse(note).createdTimestampUsec;
	
	if (notes.has(noteID)) {
		await writeFile(`./notes/${noteID}.json`, note);
		note = formateNote(note);
		notes.set(noteID, note);
		return note;
	}
}

let removeNote = async (id) => {
	if (notes.has(id)) {
		notes.delete(id);
		await rm(`./notes/${id}.json`);
		return true;
	}
	return false;
}

let updateNoteOrder = async (data) => {
	data = JSON.parse(data);
	for (let i = 0; i < data.length; i++) {
		let id = +data[i].name;
		let note = notes.get(id);
		note.order = data[i].value.to;
		updateNote(JSON.stringify(note));
	}
	orderNotes();
}

function requestListener(req, res) {
	let path = parse(req.url).pathname;
	let method = req.method;
	
	if (path == '' || path == '/') {
		readFile('./index.html')
		.then(content => {
			let replaceText = '';
			content = content.toString();
			for (let note of notes.values()) {
				replaceText += renderNote(note);
			}
			content = content.replace('input-notes-HTML', replaceText);
			res.writeHead(200);
			res.end(content);
		});
	} else if (path.match(/\/api\/note\/[0-9]+/)) {
		let id = +path.replace('/api/note/', '');
		
		if (method == 'GET') {
			let note = findNote(id);
			
			if (!note) {
				res.writeHead(404);
				res.end('Not found');
			} else {
				res.setHeader('Content-Type', 'application/json');
				res.writeHead(200);
				res.end(JSON.stringify(note));
			}
		} else if (method == 'DELETE') {
			removeNote(id)
			.then(result => {
				if (result) {
					res.writeHead(200);
					res.end('Note was removed');
				} else {
					res.writeHead(404);
					res.end('Note not Found');
				}
			});
		}
	} else if (path.match(/\/api\/note$/)) {
		if (method == 'PUT') {
			let bodyReq = '';
			
			req.on('data', (chankData) => {
				bodyReq += chankData;
			});
			req.on('end', () => {
				try {
					createNote(bodyReq)
					.then(note => {
						let noteHTML = renderNote(note);
						res.setHeader('Content-Type', 'text/html');
						res.writeHead(200);
						res.end(noteHTML);
					});				
				} catch (error) {
					res.writeHead(500);
					res.end(error.message);
				}
			});
		} else if (method == 'POST') {
			let bodyReq = '';
			req.on('data', (chankData) => {
				bodyReq += chankData;
			});
			req.on('end', () => {
				updateNote(bodyReq)
				.then(note => {
					let noteHTML = renderNote(note);
					res.setHeader('Content-Type', 'text/html');
					res.writeHead(200);
					res.end(noteHTML);
				});
			});
		}
	} else if (path.match(/\/api\/note\/order$/)) {
		if (method == 'POST') {
			let bodyReq = '';
			req.on('data', (chankData) => {
				bodyReq += chankData;
			});
			req.on('end', () => {
				updateNoteOrder(bodyReq)
				.then(note => {
				
					res.setHeader('Content-Type', 'text/html');
					res.writeHead(200);
					res.end();
				});
			});		
		}
	} else if (path == '/favicon') {
		readFile('./public' + path + '.png')
		.then(content => {
			res.writeHead(200);
			res.end(content);
		});	
	} else if (path == '/trash') {
		readFile('./public' + path + '.png')
		.then(content => {
			res.writeHead(200);
			res.end(content);
		});
	} else if (path == '/style') {
		readFile('./public' + path + '.css')
		.then(content => {
			res.writeHead(200);
			res.end(content);
		});	
	} else if (path == '/script') {
		readFile('./public' + path + '.js', { encoding: 'utf8' })
		.then(content => {
			res.writeHead(200);
			res.end(content);
		});	
	}
};

let server = createServer(requestListener);

server.listen(config.port, config.host, () => {
	console.log(`Server is running on: ${config.host}:${config.port}`);
});	