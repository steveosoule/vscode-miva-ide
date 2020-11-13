export default {
	MVT: {
		LEFT_IN_MVTDO_TAG: /(?=<mvt:do)[^>]*?$/i,
		LEFT_AFTER_AMP: /&$/,
		LEFT_AFTER_ENTITY_COLON: /&mvt[a-z]?:([a-z_][a-z0-9_:\[\]]*)?$/i,
		LEFT_IN_MVT_TAG: /(?=<mvt:[a-z]+)[^>]*?$/i,
		ENTITIES_G: /(?<=&mvt[a-z]?:global:)([a-z_][a-z0-9_:\[\]]*?)(?=;)/ig,
		ENTITIES_LSETTINGS: /(?<=&mvt[a-z]?:)(?!global)([a-z_][a-z0-9_:\[\]]*?)(?=;)/ig,
	},
	MV: {
		LEFT_IN_MVDO_TAG: /(?=<MvDO)[^>]*?$/i,
		LEFT_AFTER_BRACKET_DOT: /\[\s*\]\.$/i
	},
	SHARED: {
		LEFT_IN_VALUE_ATTR: /value\s*=\s*"\s*(\{)?(.){1}$/i,
		RIGHT_IN_TAG: /^[^<]*?(?=>)/,
		RIGHT_IN_ATTR: /^\s*?(\})?"/,
		IS_GLOBAL_VAR: /^(g|global)\./i,
		GLOBAL_VAR_PREFIX: /(g|global)\./i,
		LEFT_VARIABLE_S: /s(ystem)?\.(([a-z0-9_]+)([a-z0-9:_\.]*))?$/i,
		LEFT_VARIABLE_G: /g(lobal)?\.(([a-z0-9_]+)([a-z0-9:_\.]*))?$/i,
		LEFT_VARIABLE_L: /l(ocal)?\.(([a-z0-9_]+)([a-z0-9:_\.]*))?$/i,
		LEFT_VARIABLE_LSETTINGS: /l(ocal)?\.settings:(([a-z0-9_]+)([a-z0-9:_\.]*))?$/i,
		VARIABLES_G: /(?<=g(lobal)?\.)([a-z0-9_]+)([a-z0-9:_\.]*)/ig,
		VARIABLES_L: /(?<=l(ocal)?\.)([a-z0-9_]+)([a-z0-9:_\.]*)/ig,
		VARIABLES_LSETTINGS: /(?<=l(ocal)?\.settings:)([a-z0-9_]+)([a-z0-9:_\.]*)/ig
	}
};