'use strict';

var path = process.cwd();
var User = require('../models/users');
var Card = require('../models/cards');

module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/');
		}
	}

	app.route('/')
		.get(function (req, res) {
			res.sendFile(path + '/public/index.html');
		});
		
	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/');
		});
		
	app.route("/profile")
		.get(isLoggedIn, function(req,res){
			res.sendFile(path + "/public/profile.html")
		})
	
	app.route("/:user")
		.get(function(req, res) {
		    var user = req.params.user;
		    User.find({"github.username": user}, function(err, docs){
		    	if(docs.length === 0){
		    		res.sendFile(path + "/public/index.html")
		    	} else {
		    		res.sendFile(path + "/public/user.html");
		    	}
		    });
		})
		
	app.route("/api/user")
		.get(function(req, res) {
		    res.send(req.user);
		})
		
	app.route("/api/getuser")
		.get(function(req,res){
			var user = req.query.user;
			console.log(user)
			User.find({"github.username": user}, function(err,docs){
				if(!err){
					res.send(docs);
				}
			})
		})
		
	app.route("/api/profile/new")
		.post(function(req,res){
			var data = req.body;
			data.postedBy = req.user.github.username;
			User.update({"github.id": req.user.github.id}, {$push: {"cards": data}}).exec();
		})
		
	app.route("/api/profile/delete")
		.post(function(req, res) {
			User.update({"github.id": req.user.github.id}, {$pull: {"cards": req.body}}).exec();
		})
			
	app.route("/api/cards")
		.get(function(req,res){
			Card.find({}, function(err,cards){
				res.send(cards)
			})
		})
		.post(function(req,res){
			var card = new Card();
			card.title = req.body.title;
			card.url = req.body.url;
			card.postedBy = req.user.github.username
			card.save();
		})
		
	app.route("/api/cards/delete")
		.post(function(req, res) {
			Card.find(req.body).remove().exec();
		})
	
	app.route('/auth/github')
		.get(passport.authenticate('github'));

	app.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			successRedirect: '/profile',
			failureRedirect: '/'
		}));
};
