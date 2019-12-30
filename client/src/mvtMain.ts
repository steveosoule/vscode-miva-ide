import {
	ExtensionContext,
	languages,
	IndentAction,
	CompletionContext,
	TextDocument,
	CompletionItem,
	ProviderResult,
	CompletionList,
	Range,
	Position,
	commands,
	TextEditor,
	TextEditorEdit
} from 'vscode';
import {
	ServerOptions,
	TransportKind,
	LanguageClientOptions,
	ProvideCompletionItemsSignature,
	CancellationToken,
	LanguageClient
} from 'vscode-languageclient';
import { EMPTY_ELEMENTS } from './mvtEmptyTagsShared';
import * as path from 'path';
import { readJSONFile } from './util/functions';
import patterns from './util/patterns';

export function activate( context: ExtensionContext ) {

	// path to server module
	// let serverModule = context.asAbsolutePath( path.join( 'server', 'out', 'mvtServerMain.js' ) );
	let serverMain = readJSONFile( context.asAbsolutePath( './server/package.json' ) ).main;
	let serverModule = context.asAbsolutePath( path.join( 'server', serverMain ) );

	// The debug options for the server
	let debugOptions = { execArgv: [ '--nolazy', '--inspect=6045' ] };

	// If the extension is launch in debug mode the debug server options are use
	// Otherwise the run options are used
	let serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
	};

	// Options to control the language client
	let documentSelector = [ 'mvt' ];
	let embeddedLanguages = { html: true };
	let clientOptions: LanguageClientOptions = {
		documentSelector,
		synchronize: {
			configurationSection: [ 'html' ]
		},
		initializationOptions: {
			embeddedLanguages
		},
		/* middleware: {
			// testing the replace / insert mode
			provideCompletionItem( document: TextDocument, position: Position, context: CompletionContext, token: CancellationToken, next: ProvideCompletionItemsSignature) : ProviderResult<CompletionItem[] | CompletionList> {
				function updateRanges( item: CompletionItem ) {
					const range = item.range;
					if ( range && range.end.isAfter( position ) && range.start.isBeforeOrEqual( position ) ) {
						item.range2 = { inserting: new Range( range.start, position ), replacing: range };
						item.range = undefined;
					}
				}
				function updateProposals(r: CompletionItem[] | CompletionList | null | undefined): CompletionItem[] | CompletionList | null | undefined {
					if (r) {
						(Array.isArray(r) ? r : r.items).forEach(updateRanges);
					}
					return r;
				}
				const isThenable = <T>(obj: ProviderResult<T>): obj is Thenable<T> => obj && (<any>obj)['then'];

				const r = next(document, position, context, token);
				if (isThenable<CompletionItem[] | CompletionList | null | undefined>(r)) {
					return r.then(updateProposals);
				}
				return updateProposals(r);
			}
		} */
	};

	// Create the language client and start the client.
	let client = new LanguageClient( 'mvt', 'MVT Language Server', serverOptions, clientOptions );
	client.registerProposedFeatures();
	let clientDisposable = client.start();

	// push client to context 
	context.subscriptions.push( clientDisposable );

	// set advanced language configurations
	languages.setLanguageConfiguration('mvt', {
		indentationRules: {
			increaseIndentPattern: /<(?!\?|(?:area|base|br|col|frame|hr|html|img|input|link|meta|param|mvt:else)\b|[^>]*\/>)([-_\.A-Za-z0-9]+)(?=\s|>)\b[^>]*>(?!.*<\/\1>)|<!--(?!.*-->)|\{[^}"']*$/,
			decreaseIndentPattern: /^\s*(<\/(?!html)[-_\.A-Za-z0-9]+\b[^>]*>|-->|\})/
		},
		wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g,
		onEnterRules: [
			{
				beforeText: new RegExp(`<(?!(?:${EMPTY_ELEMENTS.join('|')}))([_:\\w][_:\\w-.\\d]*)([^/>]*(?!/)>)[^<]*$`, 'i'),
				afterText: /^<\/([_:\w][_:\w-.\d]*)\s*>/i,
				action: { indentAction: IndentAction.IndentOutdent }
			},
			{
				beforeText: new RegExp(`<(?!(?:${EMPTY_ELEMENTS.join('|')}))(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$`, 'i'),
				action: { indentAction: IndentAction.Indent }
			}
		],
	});

	const boundryAmount = 200;
	const insertFileNameCommand = commands.registerTextEditorCommand( 'mivaIde.MVT.insertFileName', ( textEditor: TextEditor, edit: TextEditorEdit, payload ) => {

		const cursorPositionOffset = textEditor.document.offsetAt( textEditor.selection.active );
		const leftOffset = cursorPositionOffset - boundryAmount;
		const leftRange = new Range(
			textEditor.document.positionAt( leftOffset ),
			textEditor.selection.active
		);
		const left = textEditor.document.getText( leftRange ) || '';
		const leftMatch = patterns.MVTDO_LEFT_FILE_ATTR.exec( left );
	
		if ( leftMatch ) {
			
			edit.insert(
				textEditor.document.positionAt( cursorPositionOffset - leftMatch[0].length ),
				payload.fileName
			);
	
		}
		else {
	
			const rightOffset = cursorPositionOffset + boundryAmount;
			const rightRange = new Range(
				textEditor.selection.active,
				textEditor.document.positionAt( rightOffset )
			);
			const right = textEditor.document.getText( rightRange ) || '';
			const rightMatch = patterns.MVTDO_RIGHT_FILE_ATTR.exec( right );
	
			if ( rightMatch ) {
	
				edit.insert(
					textEditor.document.positionAt( cursorPositionOffset + rightMatch[0].length ),
					payload.fileName
				);
	
			}
	
		}
	
	});
	context.subscriptions.push( insertFileNameCommand );

}

export function deactivate(): Thenable<void> | undefined {

	return;

}