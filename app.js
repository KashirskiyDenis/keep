'use strict';

import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { parse } from 'node:url';
import { config } from './config/index.js';

let notes = [];

async function readNotesFromGoogleKeep() {
	try {
		let noteNames = await readdir('./notes');
		if (noteNames.length != 0) {
			for (let i = 0; i < noteNames.length; i++) {
				let rawNote = await readFile(`./notes/${noteNames[i]}`);
				let note = JSON.parse(rawNote);
				note.listContent = orderBy(note.listContent, 'text');
				note.todo = [];
				note.checked = [];
				for (let j = 0; j < note.listContent.length; j++) {
					if (note.listContent[j].isChecked)
						note.checked.push(note.listContent[j]);
					else
						note.todo.push(note.listContent[j]);
				}
				notes.push(note);
			}
		}
	} catch (error) {
		console.log(error.message);
	}
}

function orderBy(note, field) {
	let compareString = (a, b) => a[field].localeCompare(b[field]);
	
	if (note.length <= 1)
		return note;
	
	note.sort(compareString);
	
	return note;
}

await readNotesFromGoogleKeep();

let renderNote = (note) => {
	let noteHTML =`<div id="${note.createdTimestampUsec}" class="note">`;
	noteHTML += `<div class="note-title">${note.title}</div>`;
	noteHTML += `<div class="to-do">`;
	for (let i = 0; i < note.todo.length; i++) {
		noteHTML += `<div class="to-do-point"><input type="checkbox"><p>${note.todo[i].text}</p></div>`;
	}
	noteHTML += `</div>`;
	noteHTML += `<div class="checked">`;
	for (let i = 0; i < note.checked.length; i++) {
		noteHTML += `<div class="checked-point"><input type="checkbox" checked><p>${note.checked[i].text}</p></div>`;
	}
	noteHTML += `</div>`;
	noteHTML += `</div>`;
	
	return noteHTML;
}

let requestListener = function (req, res) {
	let path = parse(req.url).pathname;
	
	if (path == '' || path == '/') {
		readFile('./index.html')
		.then(content => {
			let replaceText = '';
			content = content.toString();
			for (let i = 0; i < notes.length; i++) {
				replaceText += renderNote(notes[i]);
			}
			content = content.replace('input-notes-HTML', replaceText);
			res.writeHead(200);
			res.end(content);
		});	
		} else if (path == '/favicon') {
		readFile('./public' + path + '.png')
		.then(content => {
			res.writeHead(200);
			res.end(content);
		});
		} else if (path == '/style') {
		readFile('./public' + path + '.css', { encoding: 'utf8' })
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