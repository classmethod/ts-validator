/**
 * UUIDv4 regex.
 */
export const UUIDv4RegExp = new RegExp(
    '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}',
);

/**
 * AWS CloudFormation stack name regex.
 */
export const CfnStackNameRegExp = new RegExp('^[A-Za-z][A-Za-z0-9-]*$');

/**
 * number regex.
 */
export const NumberRegExp = new RegExp('^[0-9]+$');

/**
 * alphanumeric regex.
 */
export const AlphanumericReqExp = new RegExp('^[a-zA-Z0-9]*$');

/**
 * not control character nor half-width kana.
 */
export const Utf8ZenkakuAndReturnRegExp = new RegExp('^[^ -~｡-ﾟ]+$');

/**
 * lower alpha.
 */
export const AlphanumericLowerReqExp = new RegExp('^[0-9a-z]*$');

/**
 * Ascii
 */
export const AsciiRegExp = new RegExp('^[\\u0020-\\u007E]+$');
