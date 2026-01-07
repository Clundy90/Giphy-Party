// GIPHY API configuration
const apiKey = "MhAodEJIJxQMxW9XqxKjyXfNYdLoOIym";
const BASE_URL = "https://api.giphy.com/v1/gifs";

// Select all necessary elements from the HTML (DOM)
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const randomBtn = document.querySelector("#random-btn");
const removeBtn = document.querySelector("#remove-btn");
const gifArea = document.querySelector("#gif-area");
const partyModeCheck = document.querySelector("#party-mode");
const partyMusic = document.querySelector("#party-music");
const volumeControl = document.querySelector("#volume-control");

// A Set stores unique values; we use it to track GIF IDs so we don't show the same GIF twice
const currentGifIds = new Set();

// party mode toggle logic
partyModeCheck.addEventListener("change", function () {
  // 1. Toggle the visual class
  document.body.classList.toggle("party-active");

  // 2. Play or Pause the music
  if (partyModeCheck.checked) {
    partyMusic.volume = volumeControl.value;
    // We use .catch because browsers often block audio until the user clicks the page
    partyMusic.play().catch(() => {
      console.warn("Autoplay blocked. User interaction required.");
      partyModeCheck.checked = false;
      document.body.classList.remove("party-active");
    });
  } else {
    partyMusic.pause();
    partyMusic.currentTime = 0;
  }
});

// volume slider logic
volumeControl.addEventListener("input", function () {
  partyMusic.volume = volumeControl.value;
});

// RANDOM GIF: Fetches one random GIF from Giphy
randomBtn.addEventListener("click", async function () {
  try {
    // Request a random GIF from the API using Axios
    const res = await axios.get(`${BASE_URL}/random`, {
      params: { api_key: apiKey }, // No rating parameter here anymore
    });
    const gif = res.data.data;

    // Check our Set to see if we've already displayed this specific GIF ID
    if (!currentGifIds.has(gif.id)) {
      currentGifIds.add(gif.id);
      addGifToParty(gif.images.original.url, gif.id);
    }
  } catch (err) {
    console.error("Random Fetch Failed:", err);
  }
});

// SEARCH: Handles the form submission
searchForm.addEventListener("submit", async function (e) {
  e.preventDefault(); // Prevent the page from refreshing on submit
  const term = searchInput.value;
  if (!term) return; // Exit if the user searched for nothing

  try {
    // Fetch 10 results for the search term
    const res = await axios.get(`${BASE_URL}/search`, {
      params: { api_key: apiKey, q: term, limit: 10 },
    });
    const results = res.data.data;

    if (results.length > 0) {
      // Find the first GIF in the results that isn't already on the screen
      const unique = results.find((g) => !currentGifIds.has(g.id));
      if (unique) {
        currentGifIds.add(unique.id);
        addGifToParty(unique.images.original.url, unique.id);
      } else {
        alert("You're already seeing the best matches for that!");
      }
    } else {
      alert("No GIFs found for that term.");
    }
  } catch (err) {
    alert("Search failed.");
  }
  searchInput.value = ""; // Clear the input box
});

// Creates the HTML elements to show the GIF and its individual delete button
function addGifToParty(url, id) {
  // Create a container div for the GIF and the "X" button
  const container = document.createElement("div");
  container.className = "gif-container";

  // Create the image element
  const img = document.createElement("img");
  img.src = url;
  img.className = "gif-style";

  // Create the individual "X" button
  const deleteBtn = document.createElement("button");
  deleteBtn.innerHTML = "&times;";
  deleteBtn.className = "delete-btn";

  // When clicking "X", remove the GIF from the screen AND the tracking Set
  deleteBtn.onclick = () => {
    currentGifIds.delete(id);
    container.remove();
  };

  // Put image and button in container, then put container in the party area
  container.append(img, deleteBtn);
  gifArea.append(container);
}

// REMOVE ALL: Wipes the entire screen and resets the tracking Set
removeBtn.addEventListener("click", () => {
  gifArea.innerHTML = "";
  currentGifIds.clear();
});
