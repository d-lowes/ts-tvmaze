import axios from 'axios';
import * as $ from 'jquery';

const $showsList = $('#showsList');
const $episodesArea = $('#episodesArea');
const $episodesList = $('#episodesList');

const BASE_API_URL = 'http://api.tvmaze.com';
const DOGE_IMG =
  'https://thedrum-media.imgix.net/thedrum-prod/s3/news/tmp/637022/shiba1.png?w=608&ar=default&fit=crop&crop=faces,edges&auto=format&dpr=1';

interface tvShowInterface {
  id: number;
  name: string;
  summary: string;
  image: { medium: string; };
}

interface episodeInterface {
  id: number;
  name: string;
  season: string;
  number: number;
}

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term: string) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  const tvShowsRequest = await axios.get(`${BASE_API_URL}/search/shows`, {
    params: {
      q: term
    }
  });

  return tvShowsRequest.data.map((showSearchResults: { show: tvShowInterface; }) => {
    const showImg = showSearchResults.show.image
      ? showSearchResults.show.image.medium
      : DOGE_IMG;

    return {
      id: showSearchResults.show.id,
      name: showSearchResults.show.name,
      summary: showSearchResults.show.summary,
      image: showImg
    };
  });
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: Array<tvShowInterface>) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
               <img src="${show.image}" alt="${show.name}"
             class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `
    );

    $showsList.append($show);
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $('#searchForm-term').val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on('submit', async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id: number) {
  const episodes = await axios.get(`${BASE_API_URL}/shows/${id}/episodes`) as
    Array<episodeInterface>;

  return episodes.map((episode) => ({
    id: episode.id,
    name: episode.name,
    season: episode.season,
    number: episode.number
  }));
}

/** Write a clear docstring for this function... */
function populateEpisodes(episodes: Array<episodeInterface>) {
  $episodesList.empty();

  for (const episode of episodes) {
    const $episode = $(
      `<li>
         ${episode.name}
         (season ${episode.season}, episode ${episode.number})
       </li>
      `);

    $episodesList.append($episode);
  }

  $episodesArea.show();
}
