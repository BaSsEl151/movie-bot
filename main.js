var Discord = require('discord.io');
var axios = require('axios');

var bot = new Discord.Client({
  token: 'NDU2MjMwMDQzMjg3NTUyMDAz.DgHg2w.7aMU-vJXqBo9Cu2XOBo9nb00LhM',
  autorun: true
});

bot.on('ready', function (evt) {
  console.log('Bot is running...');
});

bot.on('message', function (user, userID, channelID, message, evt) {

  //Help command
  if (message.substring(0, 5) == '!help') {
    bot.sendMessage({
      to: channelID,
      message:
        'Hi I am movie-bot! \nHere are the commands I respond to: \n\n' +
        '**!movie [movie title]** : Searches for a movie and displays information about it.\n\n' +
        '**!actor [actor name]**: Searches for an actor and displays information about him/her.'
    });
  }

  // Searches for movies and shows info + poster
  if (message.substring(0, 6) == '!movie') {
    var searchText = message.substring(7);
    axios
      .get('httuisp://www.omdbapi.com/?apikey=4ce155b0&s=' + searchText)
      .then(response => {
        let result = response.data.Search[0];
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
      .catch(err => {
        bot.sendMessage({ to: channelID, message: 'Movie **' + searchText + '** was not found.' });
      });
  }

  // Searches for an actor and shows info + poster
  if (message.substring(0, 6) == '!actor') {
    var searchText = message.substring(7);
    axios
      .get('https://api.themoviedb.org/3/search/person?api_key=ca9c5a2b63d0b172a3f9a20ac0ad2079&query=' + searchText)
      .then(response => {
        let actor = response.data.results[0];
        let knownFor = '';
        let actorPoster = 'http://image.tmdb.org/t/p/w185' + actor.profile_path;
        for (let i = 0; i < actor.known_for.length; i++) {
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
      .catch(err => {
        bot.sendMessage({ to: channelID, message: 'Actor **' + searchText + '** was not found.' });
      });
  }
});
