import {RecipeThing} from "../dist/recipe";
import parseIntoRecipe = RecipeThing.parseIntoRecipe;

// through2 is a thin wrapper around node transform streams
const through = require('through2');
const PluginError = require('plugin-error');
const PLUGIN_NAME = 'recipe-to-json';


function splitIntoLines(fileContent: String): string[] {
    let lines = fileContent.split(/\r?\n/);

    return lines;
}

// Plugin level function(dealing with files)
function recipeJSONizer() {
    // Creating a stream through which each file will pass
    return through.obj(function (file: any, encoding: any, callback: any) {
        if (file === null) {
            // return empty file
            return callback(null, file);
        }

        if (file.isBuffer()) {
            console.log(`Processing recipe ${file.path.substring(process.cwd().length)}`);

            let fileAsString = String(file.contents);
            let lines = splitIntoLines(fileAsString);
            let recipe = parseIntoRecipe(lines);
            let recipeAsJonString = JSON.stringify(recipe, undefined, 2);

            file.contents = Buffer.from(recipeAsJonString);
            file.path = file.path.replace(".recipe", ".json");

            console.log(``);
        }
        if (file.isStream()) {
            throw new PluginError(PLUGIN_NAME, "I'm afraid you haven't implemented a stream solution yet, Dave");
        }

        callback(null, file);
    });
}

// Exporting the plugin main function
module.exports = recipeJSONizer;
