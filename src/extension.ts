// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "unicode-to-latex" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('unicode-to-latex.helloWorld', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Unicode to LaTeX!');
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
				let changed = false;
				Object.entries(config.map as Record<string, string>).forEach(([key, val]) => { 
					if (change.text.indexOf(key) > -1) {
						newText = newText.split(key).join(val);
						changed = true;
					}
				});
				if (changed) {
					editBuilder.delete(newRange); 
					editBuilder.insert(newRange.start, newText); 
				}
			});
		},
		{
			undoStopAfter: false,
			undoStopBefore: false,
		}).then(status => console.log(status));
   });	
}

// this method is called when your extension is deactivated
export function deactivate() {}
