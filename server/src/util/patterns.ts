export default {
	MVT: {

		LEFT_IN_MVTDO_TAG: /(?=<mvt:do)[^>]*?$/i,
	
		LEFT_AFTER_AMP: /&$/

	},
	MV: {

		LEFT_IN_MVDO_TAG: /(?=<MvDO)[^>]*?$/i,
		LEFT_AFTER_BRACKET_DOT: /\[\s*\]\.$/i

	},
	SHARED: {

		LEFT_IN_VALUE_ATTR: /value\s*=\s*"\s*(\{)?(.){1}$/i,
		
		RIGHT_IN_TAG: /^[^<]*?(?=>)/,
		RIGHT_IN_ATTR: /^\s*?(\})?"/,
		
		LEFT_VARIABLE_S: /s\.$/

	}
};