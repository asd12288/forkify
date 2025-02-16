import { aysnc } from 'regenerator-runtime';
import { API_URL } from './config';
import { getJSON } from './helpers';

export const state = {
  bookmarked: [],
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: 12,
  },
};

export const loadRecipe = async function (id) {
  try {
    const data = await getJSON(`${API_URL}/${id}`);
    const { recipe } = data.data;

    state.recipe = {
      id: recipe.id,
      title: recipe.title,
      publisher: recipe.publisher,
      sourceUrl: recipe.source_url,
      image: recipe.image_url,
      servings: recipe.servings,
      cookingTime: recipe.cooking_time,
      ingredients: recipe.ingredients,
    };

    if (state.bookmarked.some(b => b.id === id)) state.recipe.bookmarked = true;
  } catch (err) {
    throw err;
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const data = await getJSON(`${API_URL}?search=${query}`);

    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
      };
    });
    state.search.page = 1;
  } catch (err) {
    throw err;
  }
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;
  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;

  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });
  // newQt = oldQt * newServings / oldServings
  state.recipe.servings = newServings;
};

const presistBookmark = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarked));
};

export const addBookmark = function (recipe) {
  // add bookmark
  state.bookmarked.push(recipe);
  // Mark current recipe
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  presistBookmark();
};

export const deleteBookmark = function (id) {
  const index = state.bookmarked.findIndex(el => el.id === id);
  state.bookmarked.splice(index, 1);

  if (id === state.recipe.id) state.recipe.bookmarked = false;

  presistBookmark();
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarked = JSON.parse(storage);
};

// init();

const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};

