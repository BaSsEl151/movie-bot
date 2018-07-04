var Discord = require('discord.io');
var axios = require('axios');
var YouTube = require('youtube-node');

// Create bot
var bot = new Discord.Client({
  token: 'NDU2MjMwMDQzMjg3NTUyMDAz.DgHg2w.7aMU-vJXqBo9Cu2XOBo9nb00LhM',
  autorun: true
});

// Event handler for when the bot is launched
bot.on('ready', function (evt) {
  console.log('Bot is running...');
});

// Event handler for any message sent on the server
bot.on('message', function (user, userID, channelID, message, evt) {

  //Help command
  if (message.substring(0, 5) == '!help') {
    bot.sendMessage({
      to: channelID,
      message:
        'Hi I am movie-bot! \nHere are the commands I respond to: \n\n' +
        '**!movie [movie title]** : Searches for a movie and displays information about it.\n\n' +
        '**!actor [actor name]**: Searches for an actor and displays information about him/her.\n\n' +
        '**!trailer [movie title]**: Searches for the movie trailer on youtube.\n\n' +
        '\nContribute here! https://github.com/FrankSauve/movie-bot'
    });
  }

  // Searches for movies and shows info + poster
  if (message.substring(0, 6) == '!movie') {
    var searchText = message.substring(7);
    // Request the movie api with the search text
    axios
      .get('httuisp://www.omdbapi.com/?apikey=4ce155b0&s=' + searchText)
      .then(response => {
        // Get the first result
        let result = response.data.Search[0];
        // Search by movie title only using the title from the previous search
        axios
          .get('http://www.omdbapi.com/?apikey=4ce155b0&t=' + result.Title)
          .then(response2 => {
            let movie = response2.data;
            bot.sendMessage({
              to: channelID,
              message:
                '**' +
                movie.Title +
                '**' +
                '(' +
                movie.Year +
                ')' +
                '\n' +
                '**Starring:** ' +
                movie.Actors +
                '\n' +
                '**Directed by:** ' +
                movie.Director +
                '\n' +
                '**IMDB Rating:** ' +
                movie.imdbRating +
                '\n' +
                '**Box Office:** ' +
                movie.BoxOffice +
                '\n' +
                '**Plot:** ```' +
                movie.Plot +
                '```' +
                movie.Poster
            });
          });
      })
      // If the api returns an error
      .catch(err => {
        bot.sendMessage({ to: channelID, message: 'Movie **' + searchText + '** was not found.' });
      });
  }

  // Searches for an actor and shows info + poster
  if (message.substring(0, 6) == '!actor') {
    var searchText = message.substring(7);
    // Request to movie api to fetch actors
    axios
      .get('https://api.themoviedb.org/3/search/person?api_key=ca9c5a2b63d0b172a3f9a20ac0ad2079&query=' + searchText)
      .then(response => {
        let actor = response.data.results[0];
        let actorPoster = 'http://image.tmdb.org/t/p/w185' + actor.profile_path;
        // List of movies the actor is known for
        let knownFor = '';
        for (let i = 0; i < actor.known_for.length; i++) {
          // Don't need to put a comma before the first movie
          if (i == 0) {
            knownFor += actor.known_for[i].title;
          } else {
            knownFor += ', ' + actor.known_for[i].title;
          }
        }
        bot.sendMessage({
          to: channelID,
          message:
            '**Name: **' + actor.name +
            '\n**Known for: **' + knownFor +
            '\n' + actorPoster
        });
      })
      // If the api returns an error
      .catch(err => {
        bot.sendMessage({ to: channelID, message: 'Actor **' + searchText + '** was not found.' });
      });
  }

  // Searches youtube for a trailer of the movie
  if (message.substring(0, 8) == "!trailer") {
    // Append trailer to the end of the message
    let searchText = message.substring(9) + ' trailer';
    // Set up youtube dependency
    var youTube = new YouTube();
    youTube.setKey('AIzaSyB1OOSpTREs85WUMvIgJvLTZKye4BVsoFU');
    youTube.search(searchText, 1, function (error, result) {
      if (error) {
        console.log(error);
      }
      // If the youtube api returns nothing, display error message
      if (result.items.length == 0) {
        bot.sendMessage({ to: channelID, message: '**' + searchText + '** was not found.' });
      }
      else {
        // Send the url of the trailer
        let url = 'https://www.youtube.com/watch?v=' + result.items[0].id.videoId;
        bot.sendMessage({
          to: channelID,
          message: url
        });
      }
    });
  }
});
