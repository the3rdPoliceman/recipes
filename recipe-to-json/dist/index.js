"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var recipe_1 = require("../dist/recipe");
var parseIntoRecipe = recipe_1.RecipeThing.parseIntoRecipe;
// through2 is a thin wrapper around node transform streams
var through = require('through2');
var PluginError = require('plugin-error');
var PLUGIN_NAME = 'recipe-to-json';
function splitIntoLines(fileContent) {
    var lines = fileContent.split(/\r?\n/);
    return lines;
}
// Plugin level function(dealing with files)
function recipeJSONizer() {
    // Creating a stream through which each file will pass
    return through.obj(function (file, encoding, callback) {
        if (file === null) {
            // return empty file
            return callback(null, file);
        }
        if (file.isBuffer()) {
            console.log("Processing recipe " + file.path.substring(process.cwd().length));
            var fileAsString = String(file.contents);
            var lines = splitIntoLines(fileAsString);
            var recipe = parseIntoRecipe(lines);
            var recipeAsJonString = JSON.stringify(recipe, undefined, 2);
            file.contents = Buffer.from(recipeAsJonString);
            file.path = file.path.replace(".recipe", ".json");
            console.log("");
        }
        if (file.isStream()) {
            throw new PluginError(PLUGIN_NAME, "I'm afraid you haven't implemented a stream solution yet, Dave");
        }
        callback(null, file);
    });
}
// Exporting the plugin main function
module.exports = recipeJSONizer;
//# sourceMappingURL=index.js.map