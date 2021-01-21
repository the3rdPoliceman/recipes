import "mocha";
let chaiAssertions = require('chai').assert;
let expect = require('chai').expect;
import * as assert from "assert";
import {RecipeThing} from '../dist/recipe';
import parseMethodStep = RecipeThing.parseMethodStep;
import parseMethodSubList = RecipeThing.parseMethodSubList;
import MethodStep = RecipeThing.MethodStep;
import MethodSubListItemType = RecipeThing.MethodSubListItemType;
import MethodSubList = RecipeThing.MethodSubList;
import parseIngredient = RecipeThing.parseIngredient;
import Ingredient = RecipeThing.Ingredient;
import IngredientListItemType = RecipeThing.IngredientListItemType;
import parseIngredientSubList = RecipeThing.parseIngredientSubList;
import IngredientSubList = RecipeThing.IngredientSubList;
import AlternativeIngredient = RecipeThing.AlternativeIngredient;

describe('Tests for parseMethodStep', function () {
    it('parseMethodStep into empty recipe', function () {
        let recipe:RecipeThing.Recipe = new RecipeThing.Recipe();
        let firstMethodStep = parseMethodStep("-first method step", recipe);

        chaiAssertions.lengthOf(recipe.method, 1, "1 method step created in the recipe");
        let methodStep = recipe.method[0] as MethodStep;
        expect(methodStep.text).to.be.equal( "first method step");
        expect(methodStep.type).to.be.equal(MethodSubListItemType.METHOD_STEP);
    });
    it('parseMethodStep into recipe with existing method step', function () {
        let recipe:RecipeThing.Recipe = new RecipeThing.Recipe();
        let firstMethodStep = parseMethodStep("-first method step", recipe);
        let secondMethodStep = parseMethodStep("-second method step", recipe);

        chaiAssertions.lengthOf(recipe.method, 2, "2 method steps created in the recipe");

        let methodStep1 = recipe.method[0] as MethodStep;
        expect(methodStep1.text).to.be.equal( "first method step");
        expect(methodStep1.type).to.be.equal(MethodSubListItemType.METHOD_STEP);

        let methodStep2 = recipe.method[1] as MethodStep;
        expect(methodStep2.text).to.be.equal( "second method step");
        expect(methodStep2.type).to.be.equal(MethodSubListItemType.METHOD_STEP);
    });
    it('parseMethodStep into recipe with existing method sub list', function () {
        let recipe:RecipeThing.Recipe = new RecipeThing.Recipe();
        let subList = parseMethodSubList("--Sublist", recipe);
        let firstMethodStep = parseMethodStep("-New method step...should be in sublist", recipe);
        let secondMethodStep = parseMethodStep("-Second method step...should also be in sublist", recipe);

        chaiAssertions.lengthOf(recipe.method, 1, "1 method steps created in the recipe");

        let methodSubList = recipe.method[0] as MethodSubList;
        expect(methodSubList.text).to.be.equal( "Sublist");
        expect(methodSubList.type).to.be.equal(MethodSubListItemType.METHOD_SUB_LIST);
        chaiAssertions.lengthOf(methodSubList.method_steps, 2, "2 method steps created in the sublist");

        let methodStep1 = methodSubList.method_steps[0] as MethodStep;
        expect(methodStep1.text).to.be.equal( "New method step...should be in sublist");
        expect(methodStep1.type).to.be.equal(MethodSubListItemType.METHOD_STEP);

        let methodStep2 = methodSubList.method_steps[1] as MethodStep;
        expect(methodStep2.text).to.be.equal( "Second method step...should also be in sublist");
        expect(methodStep2.type).to.be.equal(MethodSubListItemType.METHOD_STEP);

    });
    it('parseMethodStep with quantity', function () {
        let recipe:RecipeThing.Recipe = new RecipeThing.Recipe();
        let firstMethodStep = parseMethodStep("-Make {{Q: 4 }} holes in the spinach", recipe);

        chaiAssertions.lengthOf(recipe.method, 1, "1 method step created in the recipe");
        let methodStep = recipe.method[0] as MethodStep;
        expect(methodStep.text).to.be.equal( "Make <span class=\"quantity\">4</span> holes in the spinach");
        expect(methodStep.type).to.be.equal(MethodSubListItemType.METHOD_STEP);
    });
});

describe('Tests for parseIngredient', function () {
    it('parseIngredient add ingredient to empty recipe', function () {
        let recipe: RecipeThing.Recipe = new RecipeThing.Recipe();
        parseIngredient("*My Ingredient", recipe);

        chaiAssertions.lengthOf(recipe.ingredient_list, 1, "1 ingredient in list");
        let ingredient = recipe.ingredient_list[0] as Ingredient;
        expect(ingredient.text).to.be.equal( "My Ingredient");
        expect(ingredient.optional).to.be.equal(false);
        expect(ingredient.alternative_ingredients.length).to.be.equal(0);
        expect(ingredient.note).to.be.equal(undefined);
        expect(ingredient.type).to.be.equal(IngredientListItemType.INGREDIENT);
    });

    it('parseIngredient add two ingredients to empty recipe', function () {
        let recipe: RecipeThing.Recipe = new RecipeThing.Recipe();
        parseIngredient("*My Ingredient 1", recipe);
        parseIngredient("*My Ingredient 2", recipe);

        chaiAssertions.lengthOf(recipe.ingredient_list, 2, "2 ingredients in list");
        let ingredient1 = recipe.ingredient_list[0] as Ingredient;
        let ingredient2 = recipe.ingredient_list[1] as Ingredient;

        expect(ingredient1.text).to.be.equal( "My Ingredient 1");
        expect(ingredient1.optional).to.be.equal(false);
        expect(ingredient1.alternative_ingredients.length).to.be.equal(0);
        expect(ingredient1.note).to.be.equal(undefined);
        expect(ingredient1.type).to.be.equal(IngredientListItemType.INGREDIENT);

        expect(ingredient2.text).to.be.equal( "My Ingredient 2");
        expect(ingredient2.optional).to.be.equal(false);
        expect(ingredient2.alternative_ingredients.length).to.be.equal(0);
        expect(ingredient2.note).to.be.equal(undefined);
        expect(ingredient2.type).to.be.equal(IngredientListItemType.INGREDIENT);
    });


    it('parseIngredient into recipe with sublist', function () {
        let recipe: RecipeThing.Recipe = new RecipeThing.Recipe();
        parseIngredientSubList("**Ingredient Sublist", recipe);
        parseIngredient("*My Ingredient", recipe);

        chaiAssertions.lengthOf(recipe.ingredient_list, 1, "1 item in ingredient list");
        let ingredientSubList = recipe.ingredient_list[0] as IngredientSubList;
        expect(ingredientSubList.name).to.be.equal( "Ingredient Sublist");
        expect(ingredientSubList.type).to.be.equal(IngredientListItemType.INGREDIENT_SUB_LIST);

        chaiAssertions.lengthOf(ingredientSubList.ingredient_list, 1, "1 ingredient in sub list");
        let ingredient1 = ingredientSubList.ingredient_list[0] as Ingredient;

        expect(ingredient1.text).to.be.equal( "My Ingredient");
        expect(ingredient1.optional).to.be.equal(false);
        expect(ingredient1.alternative_ingredients.length).to.be.equal(0);
        expect(ingredient1.note).to.be.equal(undefined);
        expect(ingredient1.type).to.be.equal(IngredientListItemType.INGREDIENT);
    });


    it('use parseIngredient to add 2 ingredients into recipe with sublist', function () {
        let recipe: RecipeThing.Recipe = new RecipeThing.Recipe();
        parseIngredientSubList("**Ingredient Sublist", recipe);
        parseIngredient("*My Ingredient 1", recipe);
        parseIngredient("*My Ingredient 2", recipe);

        chaiAssertions.lengthOf(recipe.ingredient_list, 1, "1 item in ingredient list");
        let ingredientSubList = recipe.ingredient_list[0] as IngredientSubList;
        expect(ingredientSubList.name).to.be.equal( "Ingredient Sublist");
        expect(ingredientSubList.type).to.be.equal(IngredientListItemType.INGREDIENT_SUB_LIST);

        chaiAssertions.lengthOf(ingredientSubList.ingredient_list, 2, "2 ingredients in sub list");
        let ingredient1 = ingredientSubList.ingredient_list[0] as Ingredient;
        let ingredient2 = ingredientSubList.ingredient_list[1] as Ingredient;

        expect(ingredient1.text).to.be.equal( "My Ingredient 1");
        expect(ingredient1.optional).to.be.equal(false);
        expect(ingredient1.alternative_ingredients.length).to.be.equal(0);
        expect(ingredient1.note).to.be.equal(undefined);
        expect(ingredient1.type).to.be.equal(IngredientListItemType.INGREDIENT);

        expect(ingredient2.text).to.be.equal( "My Ingredient 2");
        expect(ingredient2.optional).to.be.equal(false);
        expect(ingredient2.alternative_ingredients.length).to.be.equal(0);
        expect(ingredient2.note).to.be.equal(undefined);
        expect(ingredient2.type).to.be.equal(IngredientListItemType.INGREDIENT);
    });

    it('Use parseIngredient to add ingredient with note to empty recipe', function () {
        let recipe: RecipeThing.Recipe = new RecipeThing.Recipe();
        parseIngredient("*400g Spinach {{N: frozen is fine }}", recipe);

        chaiAssertions.lengthOf(recipe.ingredient_list, 1, "1 ingredient in list");
        let ingredient = recipe.ingredient_list[0] as Ingredient;

        expect(ingredient.text).to.be.equal( "400g Spinach");
        expect(ingredient.optional).to.be.equal(false);
        expect(ingredient.alternative_ingredients.length).to.be.equal(0);
        expect(ingredient.note.text).to.be.equal("frozen is fine");
        expect(ingredient.type).to.be.equal(IngredientListItemType.INGREDIENT);
    });


    it('Use parseIngredient to add ingredient with alternative ingredient', function () {
        let recipe: RecipeThing.Recipe = new RecipeThing.Recipe();
        parseIngredient("*400g Spinach {{ALT: Chard }}", recipe);

        chaiAssertions.lengthOf(recipe.ingredient_list, 1, "1 ingredient in list");
        let ingredient = recipe.ingredient_list[0] as Ingredient;
        expect(ingredient.text).to.be.equal( "400g Spinach");
        expect(ingredient.optional).to.be.equal(false);
        expect(ingredient.note).to.be.equal(undefined);
        expect(ingredient.type).to.be.equal(IngredientListItemType.INGREDIENT);

        chaiAssertions.lengthOf(ingredient.alternative_ingredients, 1, "1 alternative ingredient present");
        let alternativeIngredient = ingredient.alternative_ingredients[0] as AlternativeIngredient;
        expect(alternativeIngredient.text).to.be.equal("Chard");
    });

    it('Use parseIngredient to add ingredient with 2 alternative ingredients', function () {
        let recipe: RecipeThing.Recipe = new RecipeThing.Recipe();
        parseIngredient("*400g Spinach {{ALT: Chard }} {{ALT: Kale }}", recipe);

        chaiAssertions.lengthOf(recipe.ingredient_list, 1, "1 ingredient in list");
        let ingredient = recipe.ingredient_list[0] as Ingredient;
        expect(ingredient.text).to.be.equal( "400g Spinach");
        expect(ingredient.optional).to.be.equal(false);
        expect(ingredient.note).to.be.equal(undefined);
        expect(ingredient.type).to.be.equal(IngredientListItemType.INGREDIENT);

        chaiAssertions.lengthOf(ingredient.alternative_ingredients, 2, "2 alternative ingredient present");
        let alternativeIngredient1 = ingredient.alternative_ingredients[0] as AlternativeIngredient;
        let alternativeIngredient2 = ingredient.alternative_ingredients[1] as AlternativeIngredient;

        expect(alternativeIngredient1.text).to.be.equal("Chard");
        expect(alternativeIngredient2.text).to.be.equal("Kale");
    });


    it('Use parseIngredient to add ingredient with 2 alternative ingredients', function () {
        let recipe: RecipeThing.Recipe = new RecipeThing.Recipe();
        parseIngredient("*400g Spinach {{ALT: Chard }} {{ALT: Kale }}", recipe);

        chaiAssertions.lengthOf(recipe.ingredient_list, 1, "1 ingredient in list");
        let ingredient = recipe.ingredient_list[0] as Ingredient;
        expect(ingredient.text).to.be.equal( "400g Spinach");
        expect(ingredient.optional).to.be.equal(false);
        expect(ingredient.note).to.be.equal(undefined);
        expect(ingredient.type).to.be.equal(IngredientListItemType.INGREDIENT);

        chaiAssertions.lengthOf(ingredient.alternative_ingredients, 2, "2 alternative ingredient present");
        let alternativeIngredient1 = ingredient.alternative_ingredients[0] as AlternativeIngredient;
        let alternativeIngredient2 = ingredient.alternative_ingredients[1] as AlternativeIngredient;

        expect(alternativeIngredient1.text).to.be.equal("Chard");
        expect(alternativeIngredient2.text).to.be.equal("Kale");
    }); 

    it('Use parseIngredient to add ingredient with 2 alternative ingredients and 1 note', function () {
        let recipe: RecipeThing.Recipe = new RecipeThing.Recipe();
        parseIngredient("*400g Spinach {{ALT: Chard }} {{ALT: Kale }} {{N:frozen is fine}}", recipe);

        chaiAssertions.lengthOf(recipe.ingredient_list, 1, "1 ingredient in list");
        let ingredient = recipe.ingredient_list[0] as Ingredient;
        expect(ingredient.text).to.be.equal( "400g Spinach");
        expect(ingredient.optional).to.be.equal(false);
        expect(ingredient.note.text).to.be.equal("frozen is fine");
        expect(ingredient.type).to.be.equal(IngredientListItemType.INGREDIENT);

        chaiAssertions.lengthOf(ingredient.alternative_ingredients, 2, "2 alternative ingredient present");
        let alternativeIngredient1 = ingredient.alternative_ingredients[0] as AlternativeIngredient;
        let alternativeIngredient2 = ingredient.alternative_ingredients[1] as AlternativeIngredient;

        expect(alternativeIngredient1.text).to.be.equal("Chard");
        expect(alternativeIngredient2.text).to.be.equal("Kale");
    });

    it('Use parseIngredient to add ingredient with alternative ingredient containing quantity', function () {
        let recipe: RecipeThing.Recipe = new RecipeThing.Recipe();
        parseIngredient("*400g Spinach {{ALT: {{Q:400}}g Chard }}", recipe);

        chaiAssertions.lengthOf(recipe.ingredient_list, 1, "1 ingredient in list");
        let ingredient = recipe.ingredient_list[0] as Ingredient;
        expect(ingredient.text).to.be.equal( "400g Spinach");
        expect(ingredient.optional).to.be.equal(false);
        expect(ingredient.note).to.be.equal(undefined);
        expect(ingredient.type).to.be.equal(IngredientListItemType.INGREDIENT);

        chaiAssertions.lengthOf(ingredient.alternative_ingredients, 1, "1 alternative ingredient present");
        let alternativeIngredient = ingredient.alternative_ingredients[0] as AlternativeIngredient;
        expect(alternativeIngredient.text).to.be.equal('<span class="quantity">400</span>g Chard');
    });
});