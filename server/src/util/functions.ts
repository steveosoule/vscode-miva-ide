import {
	readFileSync
} from 'fs';
import {
	ResponseError,
	CancellationToken,
	ErrorCodes,
	CompletionItem,
	CompletionItemKind,
	InsertTextFormat,
	CompletionList,
	MarkupContent,
	MarkupKind,
	SymbolKind
} from 'vscode-languageserver';
import patterns from './patterns';

export function formatError( message: string,
	err: any ): string {

	if ( err instanceof Error ) {

		let error = <Error>err;
		return `${ message }: ${ error.message }\n${ error.stack }`;

	}
	else if ( typeof err === 'string' ) {

		return `${ message }: ${ err }`;

	}
	else if ( err ) {

		return `${ message }: ${ err.toString() }`;

	}

	return message;
	
}

export function pushAll<T>( to: T[], from: T[] ) {
	if ( from ) {
		for ( const e of from ) {
			to.push( e );
		}
	}
}

export function readJSONFile( location: string ) {
	try {
		return JSON.parse( readFileSync( location ).toString() );
	}
	catch( e ) {
		console.log( `Problems reading ${ location }: ${ e }` );
		return {};
	}
}

export function tokenize( text: string, matches: RegExpExecArray ): string {
	let result = text;
	for ( let i = 0; i < matches.length; i++ ) {
		result = result.replace( new RegExp( `\\$${ i }`, 'g' ), matches[ i ] );
	}
	return result;
}

export function runSafeAsync<T>( func: () => Thenable<T>, errorVal: T, errorMessage: string, token: CancellationToken ): Thenable<T | ResponseError<any>> {
	return new Promise<T | ResponseError<any>>((resolve) => {
		setImmediate(() => {
			if ( token.isCancellationRequested ) {
				resolve( cancelValue() );
			}
			return func().then(result => {
				if ( token.isCancellationRequested ) {
					resolve( cancelValue() );
					return;
				} else {
					resolve( result );
				}
			}, e => {
				console.error( formatError( errorMessage, e ) );
				resolve( errorVal );
			});
		});
	});
}

export function runSafe<T, E>( func: () => T, errorVal: T, errorMessage: string, token: CancellationToken ): Thenable<T | ResponseError<E>> {
	return new Promise<T | ResponseError<E>>(( resolve ) => {
		setImmediate(() => {
			if ( token.isCancellationRequested ) {
				resolve( cancelValue() );
			}
			else {
				try {
					let result = func();
					if ( token.isCancellationRequested ) {
						resolve( cancelValue() );
						return;
					} else {
						resolve( result );
					}

				} catch ( e ) {
					console.error(formatError( errorMessage, e) );
					resolve( errorVal );
				}
			}
		});
	});
}

function cancelValue<E>() {
	return new ResponseError<E>( ErrorCodes.RequestCancelled, 'Request cancelled' );
}

function formatDoValueCompletion( fn: any, file: any ): CompletionItem {

	const parameters = fn.parameters.reduce(( all: string, param: any, index: number, arr: any[] )=> {

		return `${ all }${ ( index == 0 ) ? ' ' : ', ' }\$\{${ index + 1 }:${ param }\}${ ( index == (arr.length - 1) ) ? ' ' : '' }`;

	}, '');
	
	return {
		label: fn.name,
		insertText: `${ fn.name }(${ parameters })`,
		insertTextFormat: InsertTextFormat.Snippet,
		kind: CompletionItemKind.Function,
		detail: file.distro_path,
		command: {
			title: `Inject "${ file.distro_path }" into file attribute.`, 
			command: 'mivaIde.chooseFileName',
			arguments: [
				{
					fileNames: [ file.distro_path ]
				}
			]
		}
	};

}

export function getDoValueCompletions( merchantFunctionFiles ): CompletionList {

	let doValueCompletions: Map<string, CompletionItem> = new Map();

	merchantFunctionFiles.forEach(file =>{
		file.functions.forEach(fn => {

			let key = `${ fn.name }@${ fn.parameters.join( '|' ) }`;
			let completion = doValueCompletions.get( key );

			if ( completion ) {

				// append to the fileNames argument
				completion.command.arguments[0].fileNames.push( file.distro_path );

			}
			else {

				// create the record if it doesn't exist
				doValueCompletions.set( key, formatDoValueCompletion( fn, file ) );

			}

		});
	});

	return CompletionList.create( Array.from( doValueCompletions.values() ) );

}

export function parseCompletion( completion ) {

	completion.kind = CompletionItemKind[ completion.kind ];
	completion.documentation = <MarkupContent>{
		kind: MarkupKind.Markdown,
		value: completion.documentation
	};

	return completion;

}

export function unique( value, index, self ) {
	return self.indexOf( value ) === index;
};

export function parseCompletionFile( completions ) {
	return completions.map(completion => {

		return parseCompletion( completion );

	});
}

export function getWordAtOffset( text: string, offset: number ): string | null {

	const wordPattern = /(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g;
	let match;
	let count = 0;

	while ( match = wordPattern.exec( text ) || count > 1000 ) {

		count++;

		let wordOffset = match.index + match[0].length;

		if ( offset >= match.index && offset <= wordOffset ) {

			return match[0];

		}

	}

	return null;

}

export function variableSymbolsToCompletionMap( symbols, completions ) {

	symbols.forEach(( symbol ) => {

		if ( symbol.kind === SymbolKind.Variable && patterns.SHARED.IS_GLOBAL_VAR.test( symbol.name ) ) {
			
			let label = symbol.name.replace( patterns.SHARED.GLOBAL_VAR_PREFIX, '' );

			completions.set(
				label,
				{
					label: label,
					kind: CompletionItemKind.Variable,
					detail: 'Global Variable'
				}
			);
			
		}

	});

}