(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "mocha", "../dist/recipe"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    require("mocha");
    var chaiAssertions = require('chai').assert;
    var expect = require('chai').expect;
    var recipe_1 = require("../dist/recipe");
    var parseMethodStep = recipe_1.RecipeThing.parseMethodStep;
    var parseMethodSubList = recipe_1.RecipeThing.parseMethodSubList;
    var MethodSubListItemType = recipe_1.RecipeThing.MethodSubListItemType;
    var parseIngredient = recipe_1.RecipeThing.parseIngredient;
    var IngredientListItemType = recipe_1.RecipeThing.IngredientListItemType;
    var parseIngredientSubList = recipe_1.RecipeThing.parseIngredientSubList;
    describe('Tests for parseMethodStep', function () {
        it('parseMethodStep into empty recipe', function () {
            var recipe = new recipe_1.RecipeThing.Recipe();
            var firstMethodStep = parseMethodStep("-first method step", recipe);
            chaiAssertions.lengthOf(recipe.method, 1, "1 method step created in the recipe");
            var methodStep = recipe.method[0];
            expect(methodStep.text).to.be.equal("first method step");
            expect(methodStep.type).to.be.equal(MethodSubListItemType.METHOD_STEP);
        });
        it('parseMethodStep into recipe with existing method step', function () {
            var recipe = new recipe_1.RecipeThing.Recipe();
            var firstMethodStep = parseMethodStep("-first method step", recipe);
            var secondMethodStep = parseMethodStep("-second method step", recipe);
            chaiAssertions.lengthOf(recipe.method, 2, "2 method steps created in the recipe");
            var methodStep1 = recipe.method[0];
            expect(methodStep1.text).to.be.equal("first method step");
            expect(methodStep1.type).to.be.equal(MethodSubListItemType.METHOD_STEP);
            var methodStep2 = recipe.method[1];
            expect(methodStep2.text).to.be.equal("second method step");
            expect(methodStep2.type).to.be.equal(MethodSubListItemType.METHOD_STEP);
        });
        it('parseMethodStep into recipe with existing method sub list', function () {
            var recipe = new recipe_1.RecipeThing.Recipe();
            var subList = parseMethodSubList("--Sublist", recipe);
            var firstMethodStep = parseMethodStep("-New method step...should be in sublist", recipe);
            var secondMethodStep = parseMethodStep("-Second method step...should also be in sublist", recipe);
            chaiAssertions.lengthOf(recipe.method, 1, "1 method steps created in the recipe");
            var methodSubList = recipe.method[0];
            expect(methodSubList.text).to.be.equal("Sublist");
            expect(methodSubList.type).to.be.equal(MethodSubListItemType.METHOD_SUB_LIST);
            chaiAssertions.lengthOf(methodSubList.method_steps, 2, "2 method steps created in the sublist");
            var methodStep1 = methodSubList.method_steps[0];
            expect(methodStep1.text).to.be.equal("New method step...should be in sublist");
            expect(methodStep1.type).to.be.equal(MethodSubListItemType.METHOD_STEP);
            var methodStep2 = methodSubList.method_steps[1];
            expect(methodStep2.text).to.be.equal("Second method step...should also be in sublist");
            expect(methodStep2.type).to.be.equal(MethodSubListItemType.METHOD_STEP);
        });
        it('parseMethodStep with quantity', function () {
            var recipe = new recipe_1.RecipeThing.Recipe();
            var firstMethodStep = parseMethodStep("-Make {{Q: 4 }} holes in the spinach", recipe);
            chaiAssertions.lengthOf(recipe.method, 1, "1 method step created in the recipe");
            var methodStep = recipe.method[0];
            expect(methodStep.text).to.be.equal("Make <span class=\"quantity\">4</span> holes in the spinach");
            expect(methodStep.type).to.be.equal(MethodSubListItemType.METHOD_STEP);
        });
    });
    describe('Tests for parseIngredient', function () {
        it('parseIngredient add ingredient to empty recipe', function () {
            var recipe = new recipe_1.RecipeThing.Recipe();
            parseIngredient("*My Ingredient", recipe);
            chaiAssertions.lengthOf(recipe.ingredient_list, 1, "1 ingredient in list");
            var ingredient = recipe.ingredient_list[0];
            expect(ingredient.text).to.be.equal("My Ingredient");
            expect(ingredient.optional).to.be.equal(false);
            expect(ingredient.alternative_ingredients.length).to.be.equal(0);
            expect(ingredient.note).to.be.equal(undefined);
            expect(ingredient.type).to.be.equal(IngredientListItemType.INGREDIENT);
        });
        it('parseIngredient add two ingredients to empty recipe', function () {
            var recipe = new recipe_1.RecipeThing.Recipe();
            parseIngredient("*My Ingredient 1", recipe);
            parseIngredient("*My Ingredient 2", recipe);
            chaiAssertions.lengthOf(recipe.ingredient_list, 2, "2 ingredients in list");
            var ingredient1 = recipe.ingredient_list[0];
            var ingredient2 = recipe.ingredient_list[1];
            expect(ingredient1.text).to.be.equal("My Ingredient 1");
            expect(ingredient1.optional).to.be.equal(false);
            expect(ingredient1.alternative_ingredients.length).to.be.equal(0);
            expect(ingredient1.note).to.be.equal(undefined);
            expect(ingredient1.type).to.be.equal(IngredientListItemType.INGREDIENT);
            expect(ingredient2.text).to.be.equal("My Ingredient 2");
            expect(ingredient2.optional).to.be.equal(false);
            expect(ingredient2.alternative_ingredients.length).to.be.equal(0);
            expect(ingredient2.note).to.be.equal(undefined);
            expect(ingredient2.type).to.be.equal(IngredientListItemType.INGREDIENT);
        });
        it('parseIngredient into recipe with sublist', function () {
            var recipe = new recipe_1.RecipeThing.Recipe();
            parseIngredientSubList("**Ingredient Sublist", recipe);
            parseIngredient("*My Ingredient", recipe);
            chaiAssertions.lengthOf(recipe.ingredient_list, 1, "1 item in ingredient list");
            var ingredientSubList = recipe.ingredient_list[0];
            expect(ingredientSubList.name).to.be.equal("Ingredient Sublist");
            expect(ingredientSubList.type).to.be.equal(IngredientListItemType.INGREDIENT_SUB_LIST);
            chaiAssertions.lengthOf(ingredientSubList.ingredient_list, 1, "1 ingredient in sub list");
            var ingredient1 = ingredientSubList.ingredient_list[0];
            expect(ingredient1.text).to.be.equal("My Ingredient");
            expect(ingredient1.optional).to.be.equal(false);
            expect(ingredient1.alternative_ingredients.length).to.be.equal(0);
            expect(ingredient1.note).to.be.equal(undefined);
            expect(ingredient1.type).to.be.equal(IngredientListItemType.INGREDIENT);
        });
        it('use parseIngredient to add 2 ingredients into recipe with sublist', function () {
            var recipe = new recipe_1.RecipeThing.Recipe();
            parseIngredientSubList("**Ingredient Sublist", recipe);
            parseIngredient("*My Ingredient 1", recipe);
            parseIngredient("*My Ingredient 2", recipe);
            chaiAssertions.lengthOf(recipe.ingredient_list, 1, "1 item in ingredient list");
            var ingredientSubList = recipe.ingredient_list[0];
            expect(ingredientSubList.name).to.be.equal("Ingredient Sublist");
            expect(ingredientSubList.type).to.be.equal(IngredientListItemType.INGREDIENT_SUB_LIST);
            chaiAssertions.lengthOf(ingredientSubList.ingredient_list, 2, "2 ingredients in sub list");
            var ingredient1 = ingredientSubList.ingredient_list[0];
            var ingredient2 = ingredientSubList.ingredient_list[1];
            expect(ingredient1.text).to.be.equal("My Ingredient 1");
            expect(ingredient1.optional).to.be.equal(false);
            expect(ingredient1.alternative_ingredients.length).to.be.equal(0);
            expect(ingredient1.note).to.be.equal(undefined);
            expect(ingredient1.type).to.be.equal(IngredientListItemType.INGREDIENT);
            expect(ingredient2.text).to.be.equal("My Ingredient 2");
            expect(ingredient2.optional).to.be.equal(false);
            expect(ingredient2.alternative_ingredients.length).to.be.equal(0);
            expect(ingredient2.note).to.be.equal(undefined);
            expect(ingredient2.type).to.be.equal(IngredientListItemType.INGREDIENT);
        });
        it('Use parseIngredient to add ingredient with note to empty recipe', function () {
            var recipe = new recipe_1.RecipeThing.Recipe();
            parseIngredient("*400g Spinach {{N: frozen is fine }}", recipe);
            chaiAssertions.lengthOf(recipe.ingredient_list, 1, "1 ingredient in list");
            var ingredient = recipe.ingredient_list[0];
            expect(ingredient.text).to.be.equal("400g Spinach");
            expect(ingredient.optional).to.be.equal(false);
            expect(ingredient.alternative_ingredients.length).to.be.equal(0);
            expect(ingredient.note.text).to.be.equal("frozen is fine");
            expect(ingredient.type).to.be.equal(IngredientListItemType.INGREDIENT);
        });
        it('Use parseIngredient to add ingredient with alternative ingredient', function () {
            var recipe = new recipe_1.RecipeThing.Recipe();
            parseIngredient("*400g Spinach {{ALT: Chard }}", recipe);
            chaiAssertions.lengthOf(recipe.ingredient_list, 1, "1 ingredient in list");
            var ingredient = recipe.ingredient_list[0];
            expect(ingredient.text).to.be.equal("400g Spinach");
            expect(ingredient.optional).to.be.equal(false);
            expect(ingredient.note).to.be.equal(undefined);
            expect(ingredient.type).to.be.equal(IngredientListItemType.INGREDIENT);
            chaiAssertions.lengthOf(ingredient.alternative_ingredients, 1, "1 alternative ingredient present");
            var alternativeIngredient = ingredient.alternative_ingredients[0];
            expect(alternativeIngredient.text).to.be.equal("Chard");
        });
        it('Use parseIngredient to add ingredient with 2 alternative ingredients', function () {
            var recipe = new recipe_1.RecipeThing.Recipe();
            parseIngredient("*400g Spinach {{ALT: Chard }} {{ALT: Kale }}", recipe);
            chaiAssertions.lengthOf(recipe.ingredient_list, 1, "1 ingredient in list");
            var ingredient = recipe.ingredient_list[0];
            expect(ingredient.text).to.be.equal("400g Spinach");
            expect(ingredient.optional).to.be.equal(false);
            expect(ingredient.note).to.be.equal(undefined);
            expect(ingredient.type).to.be.equal(IngredientListItemType.INGREDIENT);
            chaiAssertions.lengthOf(ingredient.alternative_ingredients, 2, "2 alternative ingredient present");
            var alternativeIngredient1 = ingredient.alternative_ingredients[0];
            var alternativeIngredient2 = ingredient.alternative_ingredients[1];
            expect(alternativeIngredient1.text).to.be.equal("Chard");
            expect(alternativeIngredient2.text).to.be.equal("Kale");
        });
        it('Use parseIngredient to add ingredient with 2 alternative ingredients', function () {
            var recipe = new recipe_1.RecipeThing.Recipe();
            parseIngredient("*400g Spinach {{ALT: Chard }} {{ALT: Kale }}", recipe);
            chaiAssertions.lengthOf(recipe.ingredient_list, 1, "1 ingredient in list");
            var ingredient = recipe.ingredient_list[0];
            expect(ingredient.text).to.be.equal("400g Spinach");
            expect(ingredient.optional).to.be.equal(false);
            expect(ingredient.note).to.be.equal(undefined);
            expect(ingredient.type).to.be.equal(IngredientListItemType.INGREDIENT);
            chaiAssertions.lengthOf(ingredient.alternative_ingredients, 2, "2 alternative ingredient present");
            var alternativeIngredient1 = ingredient.alternative_ingredients[0];
            var alternativeIngredient2 = ingredient.alternative_ingredients[1];
            expect(alternativeIngredient1.text).to.be.equal("Chard");
            expect(alternativeIngredient2.text).to.be.equal("Kale");
        });
        it('Use parseIngredient to add ingredient with 2 alternative ingredients and 1 note', function () {
            var recipe = new recipe_1.RecipeThing.Recipe();
            parseIngredient("*400g Spinach {{ALT: Chard }} {{ALT: Kale }} {{N:frozen is fine}}", recipe);
            chaiAssertions.lengthOf(recipe.ingredient_list, 1, "1 ingredient in list");
            var ingredient = recipe.ingredient_list[0];
            expect(ingredient.text).to.be.equal("400g Spinach");
            expect(ingredient.optional).to.be.equal(false);
            expect(ingredient.note.text).to.be.equal("frozen is fine");
            expect(ingredient.type).to.be.equal(IngredientListItemType.INGREDIENT);
            chaiAssertions.lengthOf(ingredient.alternative_ingredients, 2, "2 alternative ingredient present");
            var alternativeIngredient1 = ingredient.alternative_ingredients[0];
            var alternativeIngredient2 = ingredient.alternative_ingredients[1];
            expect(alternativeIngredient1.text).to.be.equal("Chard");
            expect(alternativeIngredient2.text).to.be.equal("Kale");
        });
        it('Use parseIngredient to add ingredient with alternative ingredient containing quantity', function () {
            var recipe = new recipe_1.RecipeThing.Recipe();
            parseIngredient("*400g Spinach {{ALT: {{Q:400}}g Chard }}", recipe);
            chaiAssertions.lengthOf(recipe.ingredient_list, 1, "1 ingredient in list");
            var ingredient = recipe.ingredient_list[0];
            expect(ingredient.text).to.be.equal("400g Spinach");
            expect(ingredient.optional).to.be.equal(false);
            expect(ingredient.note).to.be.equal(undefined);
            expect(ingredient.type).to.be.equal(IngredientListItemType.INGREDIENT);
            chaiAssertions.lengthOf(ingredient.alternative_ingredients, 1, "1 alternative ingredient present");
            var alternativeIngredient = ingredient.alternative_ingredients[0];
            expect(alternativeIngredient.text).to.be.equal('<span class="quantity">400</span>g Chard');
        });
    });
});
//# sourceMappingURL=recipe.js.js.map