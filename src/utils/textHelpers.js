// textHelpers.js

/**
 * Capitalizes the first letter of a given string.
 * @param {string} text - The text to capitalize.
 * @returns {string} - The text with the first letter capitalized.
 */
export const capitalizeFirstLetter = (text) => {
    if (typeof text !== 'string' || text.length === 0) {
        return text;
    }
    return text.charAt(0).toUpperCase() + text.slice(1);
};
