const globs = require('globs');
const Plugin = require('./plugins/Plugin');

/**
 * @typedef {import('./Framework')} Framework
 * @typedef {import('./lib/JSONFileItem')} JSONFileItem
 */

/**
 * Represents all of the plugins in the src/ folder.
 */
class Plugins {

  /**
   * @param {Object} options
   * @param {Framework} options.framework
   * @param {function} options.includedFilter
   * @param {string} options.sourcePath
   * @param {function} options.log
   * @param {function} options.warn
   */
  constructor({
    framework = null,
    includedFilter = function() { return true; },
    sourcePath = process.cwd() + '/src/',
    courseDir = 'course',
    log = console.log,
    warn = console.warn
  } = {}) {
    /** @type {Framework} */
    this.framework = framework;
    /** @type {function} */
    this.includedFilter = includedFilter;
    /** @type {string} */
    this.sourcePath = sourcePath;
    /** @type {string} */
    this.courseDir = courseDir;
    /** @type {function} */
    this.log = log;
    /** @type {function} */
    this.warn = warn;
    /** @type {[Plugin]} */
    this.plugins = [];
  }

  /**
   * Returns the locations of all plugins in the src/ folder.
   * @returns {[string]}
   */
  get pluginLocations() {
    return [
      `${this.sourcePath}node_modules/adapt-*`
    ];
  }

  /** @returns {Plugins} */
  load() {
    this.plugins = globs.sync(this.pluginLocations).map(sourcePath => {
      if (!this.includedFilter(sourcePath)) {
        return null;
      }
      const plugin = new Plugin({
        framework: this.framework,
        sourcePath: sourcePath + '/',
        log: this.log,
        warn: this.warn
      });
      plugin.load();
      if (!plugin.isAdaptPlugin) return null;
      return plugin;
    }).filter(Boolean);
    return this;
  }

  sortBy(by = 'type') {
    switch (by) {
      case 'type': {
        const types = { core: 1, component: 2, extension: 3, menu: 4, theme: 5 };
        this.plugins.sort((a, b) => (types[a.type] || 0) - (types[b.type] || 0));
      }
    }
    return this;
  }

  /** @returns {JSONFileItem} */
  getAllPackageJSONFileItems() {
    return this.plugins.reduce((items, plugin) => {
      items.push(...plugin.packageJSONFile.fileItems);
      return items;
    }, []);
  }

}

module.exports = Plugins;
