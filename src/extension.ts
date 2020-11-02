// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

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
				Object.entries(config.map as Record<string, string>).forEach(([key, val]) => { 
					if (text.indexOf(key) > -1) {
						text = text.split(key).join(val);
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
		return  vscode.workspace.getConfiguration().get('unicode-to-latex') as any;
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
				let newText = change.text;
				if (change.text in config.map) {
					editBuilder.delete(newRange); 
					editBuilder.insert(newRange.start, config.map[change.text]);
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
