
//Dependencies
require("dotenv").config();
require("jquery");

const inqr = require("inquirer");
const Twtr = require("twitter");
const Spfy = require("node-spotify-api");
const rqst = require("request");
const opn = require("opn");
const fs = require("fs");

const keys = require("./keys.js");

var spotify = new Spfy(keys.spotify);
var client = new Twtr(keys.twitter);


//Functions

//  Tweet Command
tweets = function() {
    console.log("Tweets");
    client.get("statuses/user_timeline", function(error, tweets, response) {
        if (error) throw error;
        let recentTweets = [];
        let tweetObject = {};
        if (tweets.length > 20) {
            tweetLimit = 20;
        }
        else {
            tweetLimit = tweets.length;
        }
        for (i = 0; i < tweetLimit; i++){
            // recentTweets.push(tweets[i].text);
            recentTweets.push({text: tweets[i].text, createdAt: tweets[i].created_at});
        }
        recentTweets.forEach(function(element) {
            console.log("-----------------------------------")
            console.log(`Text: ${element.text}`);
            console.log(`Created At: ${element.createdAt}`);
        })
    }) 
};

//  Spotify Command
spotifySearch = function() {
    console.log("Spotify");
    inqr.prompt([
        {
            type: "input",
            name: "trackTitle",
            message: "Which track would you like to look up?"
        }
    ]).then(function(track) {
        let spotifyQuery = track.trackTitle;
        if (spotifyQuery === "") {
            spotifyQuery = "Never Gonna Give You Up";
            opn("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
        }
        console.log(`Searching Spotify API for ${spotifyQuery}...`);
        spotify.search({type: "track", query: spotifyQuery}, function(err, data) {
            if (err) {
                return console.log(`Error occurred: ${err}`);
            }
            let trackData = {
                artists: data.tracks.items[0].artists[0].name,
                title: data.tracks.items[0].name,
                previewLink: data.tracks.items[0].uri,
                album: data.tracks.items[0].album.name,
            }
            console.log("====================================");
            console.log(`Artists: ${trackData.artists}`);
            console.log(`Title: ${trackData.title}`);
            console.log(`Preview Link: ${trackData.previewLink}`);
            console.log(`Album: ${trackData.album}`);
            console.log("====================================");
        });
    });
};

//  OMDB Command
omdbSearch = function() {
    console.log("OMDB");
    inqr.prompt([
        {
            type: "input",
            name: "movieTitle",
            message: "Which movie would you like to look up?"
        }
    ]).then(function(movie) {
        console.log(`Searching OMDB API for ${movie.movieTitle}...`);
        let titleArray = movie.movieTitle.split(" ");
        let movieName = "";
        if (titleArray.length === 1 && titleArray[0] === "") {
            movieName = "Black+Dynamite";
        }
        else {
            for (i = 0; i < titleArray.length; i++) {
                if (i > 0 && i < titleArray.length) {
                    movieName += `+${titleArray[i]}`;
                }
                else {
                    movieName += titleArray[i];
                }
            };
        };
        let queryUrl = `http://www.omdbapi.com/?t="${movieName}"&y=&plot=short&apikey=cefe11fd`;
        //console.log(queryUrl);
        rqst(queryUrl, function(err, res, body) {
            if (!err && res.statusCode === 200) {
                let movieData = {
                    title: JSON.parse(body).Title,
                    year: JSON.parse(body).Year,
                    imdbRating: JSON.parse(body).imdbRating,
                    rottenTomatoes: JSON.parse(body).Ratings[1].Value,
                    country: JSON.parse(body).Country,
                    language: JSON.parse(body). Language,
                    plot: JSON.parse(body).Plot,
                    actors: JSON.parse(body).Actors
                };
                console.log(`====================================`);
                console.log(`Title: ${movieData.title}`);
                console.log(`Year: ${movieData.year}`);
                console.log(`IMDB Rating: ${movieData.imdbRating}`);
                console.log(`Rotten Tomatoes: ${movieData.rottenTomatoes}`);
                console.log(`Country: ${movieData.country}`);
                console.log(`Language: ${movieData.language}`);
                console.log(`Plot: ${movieData.plot}`);
                console.log(`Actors: ${movieData.actors}`);
                console.log(`====================================`);
            }
        });
    });
};

//  Machine Spirit Command
machineSpirit = function() {
    console.log("Choosing a task...");
    fs.readFile("random.txt", "utf8", function(err, data) {
        if (err) throw err;
        let randArray = data.split(",");
        let spotifyQuery = randArray[0];
        let musicVideo = randArray[1];
        console.log(`Searching Spotify API for ${spotifyQuery}...`);
        spotify.search({type: "track", query: spotifyQuery}, function(err, data) {
            if (err) {
                return console.log(`Error occurred: ${err}`);
            }
            let trackData = {
                artists: data.tracks.items[0].artists[0].name,
                title: data.tracks.items[0].name,
                previewLink: data.tracks.items[0].uri,
                album: data.tracks.items[0].album.name,
            }
            console.log("====================================");
            console.log(`Artists: ${trackData.artists}`);
            console.log(`Title: ${trackData.title}`);
            console.log(`Preview Link: ${trackData.previewLink}`);
            console.log(`Album: ${trackData.album}`);
            console.log("====================================");
            opn(musicVideo);
        });
    });
}


//Inquirer Start Menu
inqr.prompt([
    {
        type: "list",
        message: "Welcome to Alex's LIRI Project. Please select a command:",
        choices: [
            "See SkitariiRanger's Tweets",
            "Search Spotify for a Song",
            "Search OMDB for a Movie",
            "Do Whatever the Machine Spirit Wants"],
        name: "commands",
    }
])
.then(function(options) {
    switch(options.commands) {
        case "See SkitariiRanger's Tweets":
            tweets();
            break;
        case "Search Spotify for a Song":
            spotifySearch();
            break;
        case "Search OMDB for a Movie":
            omdbSearch();
            break;
        case "Do Whatever the Machine Spirit Wants":
            machineSpirit();
            break;
    }
});