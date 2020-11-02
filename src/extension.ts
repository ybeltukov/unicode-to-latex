// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {latexSymbols} from './latex';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('unicode-to-latex.replace-selected', () => {

		let editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}

		let selections = editor.selections;
		let document = editor.document;

		editor.edit(editBuilder => {
			selections.forEach( selection => {
				let changed = false;
				let text = document.getText(selection);
				Object.entries(config.map).forEach(([key, val]) => { 
					if ((val !== undefined)&&(val !== null)&&(text.indexOf(key) > -1)) {
						text = text.split(key).join(val as string);
						changed = true;
					}
				});
				if (changed) {
					editBuilder.replace(selection, text);
				}				
			});
		});
	});

	context.subscriptions.push(disposable);

	let config = readConfiguration();

	vscode.workspace.onDidChangeConfiguration(
		(event) => {
			config = readConfiguration();
		});	

	function readConfiguration() {
		let config = vscode.workspace.getConfiguration().get('unicode-to-latex') as any;
		if (config.useDefaultList) {
			config["map"] = Object.assign(latexSymbols, config.customList);
		} else {
			config["map"] = config.customList;
		}
		return config;
	}	

    vscode.workspace.onDidChangeTextDocument(changeEvent => {
		if (config.languages.indexOf(changeEvent.document.languageId) === -1 ) {
			return;
		}
	
		let editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}

		editor.edit(editBuilder => {
			let delta: number[] = [0];
			changeEvent.contentChanges.slice().reverse().forEach( (change, i) => {
				delta[i + 1] = delta[i] + change.text.length - change.rangeLength;
			});

			changeEvent.contentChanges.slice().reverse().forEach( (change, i) => {
				let start = changeEvent.document.positionAt(change.rangeOffset + delta[i]);
				let end = changeEvent.document.positionAt(change.rangeOffset + change.text.length + delta[i]);
				let newRange = new vscode.Range(start, end);
				// console.log(change.range);
				// console.log(change.rangeLength);
				// console.log(change.rangeOffset);
				// console.log(change.text);
				// console.log(change.text.indexOf('a'));
				if (change.text in config.map) {
					let newText = config.map[change.text];
					if ((newText !== undefined) && (newText !== null)) {
						editBuilder.delete(newRange);
						editBuilder.insert(newRange.start, newText);
					}
				}
			});
		},
		{
			undoStopAfter: false,
			undoStopBefore: false,
		});
   });	
}

// this method is called when your extension is deactivated
export function deactivate() {}
