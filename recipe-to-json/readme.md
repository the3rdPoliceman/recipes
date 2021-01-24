# recipe-to-json

A simple project to help enter recipes as easily as possible. This module takes recipes entered in a readable format(see example below) and converts them into JSON, which is later used in conjunction with doT.js to generate HTML pages for each recipe, as part of the build process.

# Usage from gulpfile.js
~~~~
const recipesToJson = require('./recipe-to-json/dist');

function compileMarkdownRecipesToJSON() {
   return src('./RecipeScratchpad/**/*.recipe')
     .pipe(recipesToJson())
     .pipe(dest('./json/Recipes'));
}
~~~~
# Sample recipe format

~~~~
TITLE:Spinach Shakshuka
CAT:Vegetarian
SERVE:2
** Ingredient Sublist 1
*  Ingredient 1 
*  Ingredient 2 {{ALT:{{Q:400}} grams of Alternative Ingredient}}
** Ingredient Sublist 2
*  Ingredient 3  {{N: Note about ingredient 3 }}
O* Optional Ingredient
-- Method Sub List 
-  Method Step 1
-  Method Step 2
-- Method Sub List 2
-  Take {{Q: 4 }} of ingredint 1 and do something with it
SS: Serving Suggestion 1
SS: Serving Suggestion 2
VAR:  Variation 1
VAR:  Variation 2
SRC: Source Name {{HREF:https://www.recipesource.com}}
~~~~
