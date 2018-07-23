import seededShuffle from 'knuth-shuffle-seeded';

class Utils {

  /**
   * Shuffles array of items.
   *
   * @param {Array} items - Array of items.
   * @param {string} seed - Seed used to shuffle array.
   * @returns {Array} - Shuffled array of items.
   */
  shuffle(items, seed) {
    return seededShuffle([...items], seed);
  }


  /**
 * Compares input to a given value using ===.
 *
 * @param {string} propName - The name of the prop to search.
 * {*} searchValue - The value to search for.
 * -> {Object|Array} input - The value to be searched.
 * @returns {Function} - Takes input and tests if has prop with searchValue.
 */
  propEq(propName) {
    return (searchValue) => {
      return (input) => {
        return this.prop(propName)(input) === searchValue;
      };
    };
  }

  /**
 * Returns a function that safely retrieves the given property for an object.
 *
 * @param {string} key - The key to retrieve.
 * -> {Object|Array} obj - The object/array.
 * @returns {Function} - Takes an object and returns the prop value or null.
 */
  prop(key) {
    return (obj) => {
      return obj && Object.prototype.hasOwnProperty.call(obj, key)
        ? obj[key]
        : null;
    };
  }

}

export default new Utils();
