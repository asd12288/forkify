import * as modal from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import bookmarksView from './views/bookmarksView.js';
import pageinationView from './views/pageinationView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

// https://forkify-api.herokuapp.com/v2

// Enable hot module replacement if available
if (module.hot) {
  module.hot.accept();
}

///////////////////////////////////////
// Controller for loading and rendering a recipe based on the current hash in the URL
const controllRecipe = async function () {
  try {
    // Get the recipe ID from the URL
    const id = window.location.hash.slice(1);
    if (!id) return; // If no ID, do nothing

    // Show loading spinner while fetching data
    recipeView.renderSpinner();

    // Update results view to mark the selected search result
    resultsView.update(modal.getSearchResultsPage());

    // Load the recipe data
    await modal.loadRecipe(id);
    const { recipe } = modal.state;

    // Render the recipe
    recipeView.render(modal.state.recipe);

    bookmarksView.update(modal.state.bookmarked);
  } catch (err) {
    // Render an error message if something goes wrong
    recipeView.renderError();
  }
};

// Controller for handling search results
const controlSearchResults = async function () {
  try {
    // Get search query from the input field
    const query = searchView.getQuery();
    if (!query) return; // If no query, do nothing

    // Show loading spinner while fetching search results
    resultsView.renderSpinner();

    // Load search results based on query
    await modal.loadSearchResults(query);

    // Render search results
    resultsView.render(modal.getSearchResultsPage());

    // Render initial pagination buttons
    pageinationView.render(modal.state.search);
  } catch (err) {
    console.log(err); // Log any error that occurs
  }
};

// Controller for handling pagination of search results
const controlPagination = function (goToPage) {
  // Render new results for the selected page
  resultsView.render(modal.getSearchResultsPage(goToPage));

  // Render new pagination buttons
  pageinationView.render(modal.state.search);
};

// Controller for updating the number of servings in the recipe
const controlServings = function (newServing) {
  // Update the recipe servings in the state
  modal.updateServings(newServing);

  // Update the recipe view with the new servings (without re-rendering the entire view)
  recipeView.update(modal.state.recipe);
};

// Controller for adding or removing a bookmark
const controlAddBookmark = function () {
  // Add or remove the bookmark for the current recipe
  if (!modal.state.recipe.bookmarked) {
    modal.addBookmark(modal.state.recipe);
  } else {
    modal.deleteBookmark(modal.state.recipe.id);
  }

  // Update the recipe view to reflect bookmark status
  recipeView.update(modal.state.recipe);

  bookmarksView.render(modal.state.bookmarked);
};

const controlBookmarks = function () {
  bookmarksView.render(modal.state.bookmarked);
};


// Initialization function to set up event handlers
const init = function () {
  bookmarksView.addHanderlRender(controlBookmarks);
  recipeView.addHandlerRender(controllRecipe); // Render the recipe when the hash changes
  recipeView.addHandlerUpdateServings(controlServings); // Update servings when user changes them
  recipeView.addHandlerBookmark(controlAddBookmark); // Add or remove a bookmark when user clicks the button
  searchView.addHandlerSearch(controlSearchResults); // Handle search queries
  pageinationView.addHandlerClick(controlPagination);
  // Handle pagination button clicks
  console.log("welcome");
};

init(); // Call the initialization function to set up the app
