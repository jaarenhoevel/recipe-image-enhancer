// ==UserScript==
// @name         Recipe Preview Image Enhancer
// @namespace    https://github.com/jaarenhoevel/recipe-image-enhancer/
// @version      0.1
// @homepage     https://github.com/jaarenhoevel/recipe-image-enhancer/
// @downloadURL  https://github.com/jaarenhoevel/recipe-image-enhancer/raw/main/Chefkoch%20Preview%20Image%20Enhancer.user.js
// @description  Finally some appetizing pictures
// @author       János Arenhövel
// @match        https://www.chefkoch.de/rs/*
// @icon         https://www.google.com/s2/favicons?domain=chefkoch.de
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var recipeList = document.getElementsByClassName("recipe-list")[0];

    var recipes = [];

    if (recipeList) {
        Array.from(recipeList.children).forEach(recipeDom => {
            var recipe = {};
            recipe.img = recipeDom.querySelector("img");
            recipe.fullId = recipeDom.dataset.varsTrackingId;

            if (recipe.fullId) recipes.push(recipe);
        });
    }

    recipes.forEach(recipe => {
        recipe.id = recipe.fullId.replace("recipe-", "");
        getBetterImageForRecipe(recipe);
    });

    //console.log(recipes);
})();

function getBetterImageForRecipe(recipe) {
    var imageOverviewUrl = `https://www.chefkoch.de/rezepte/bilderuebersicht/${recipe.id}`;

    //console.log("fetching overview..." + imageOverviewUrl);

    fetch(imageOverviewUrl)
    .then(function(response) {
        // When the page is loaded convert it to text
        return response.text()
    })
    .then(function(html) {
        // Initialize the DOM parser
        var parser = new DOMParser();

        // Parse the text
        var doc = parser.parseFromString(html, "text/html");

        // You can now even select part of that html as you would in the regular DOM
        // Example:
        // var docArticle = doc.querySelector('article').innerHTML;

        var pageNavList = doc.querySelector(".ds-pagination").children;
        var lastPageUrl = pageNavList[pageNavList.length - 2].firstChild.href;

        //console.log(lastPageUrl);

        fetch(lastPageUrl)
        .then(function(response) {
            return response.text();
        })
        .then(function(html) {
            var doc = parser.parseFromString(html, "text/html");

            var newImageSrc = doc.querySelector(".recipe-images").lastElementChild.attributes.src.value;
            var newImageSrcSet = doc.querySelector(".recipe-images").lastElementChild.attributes.srcset.value;

            //console.log(newImageSrc, recipe);

            recipe.img.src = newImageSrc;
            recipe.img.srcset = newImageSrcSet;
        })
        .catch(function(err) {
            console.log("Failed to fetch second page:", err);
        });
    })
    .catch(function(err) {
        console.log('Failed to fetch page: ', err);
    });
}
