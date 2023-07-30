const express = require('express');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Favorite = require('../models/favorite');


const favoriteRouter = express.Router();

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.find({ user: req.user._id })
            .populate('user')
            .populate('campsites')
            .then((favorites) => {
                res.setHeader('Content-Type', 'application/json');
                res.status(200).json(favorites);
            })
            .catch((err) => next(err));
    })

    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then((favorite) => {
                if (favorite) {
                    req.body.forEach((campsite) => {
                        if (!favorite.campsites.includes(campsite._id)) {
                            favorite.campsites.push(campsite._id);
                        }
                    });
                    favorite.save()
                        .then((updatedFavorite) => {
                            res.setHeader('Content-Type', 'application/json');
                            res.status(200).json(updatedFavorite);
                        })
                        .catch((err) => next(err));
                } else {
                    Favorite.create({ user: req.user._id, campsites: req.body })
                        .then((newFavorite) => {
                            res.setHeader('Content-Type', 'application/json');
                            res.status(200)
                        })
                        .catch((err) => next(err));
                }
            })
            .catch((err) => next(err));
    })

    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.status(403).send("PUT operation not supported on /favorites");
    })

    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOneAndDelete({ user: req.user._id })
            .then((response) => {
                if (response) {
                    res.setHeader('Content-Type', 'application/json');
                    res.status(200).json(response);
                } else {
                    res.setHeader('Content-Type', 'text/plain');
                    res.end('You do not have any favorites to delete.');
                }
            })
            .catch((err) => next(err));
    });

favoriteRouter.route('/:campsiteId')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res, next) => {
        res.status(403).send("GET operation not supported on /favorites/:campsiteId");
    })

    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then((favorite) => {
                if (favorite) {
                    if (!favorite.campsites.includes(req.params.campsiteId)) {
                        favorite.campsites.push(req.params.campsiteId);
                        favorite.save()
                            .then((updatedFavorite) => {
                                res.setHeader('Content-Type', 'application/json');
                                res.status(200).json(updatedFavorite);
                            })
                            .catch((err) => next(err));
                    } else {
                        res.setHeader('Content-Type', 'text/plain');
                        res.end("That campsite is already in the list of favorites!");
                    }
                } else {
                    Favorite.create({ user: req.user._id, campsites: [req.params.campsiteId] })
                        .then((newFavorite) => {
                            res.setHeader('Content-Type', 'application/json');
                            res.status(200).json(newFavorite);
                        })
                        .catch((err) => next(err));
                }
            })
            .catch((err) => next(err));
    })

    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.status(403).send("PUT operation not supported /favorites/:campsiteId");
    })

    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then((favorite) => {
                if (favorite) {
                    const index = favorite.campsites.indexOf(req.params.campsiteId);
                    if (index !== -1) {
                        favorite.campsites.splice(index, 1);
                        favorite.save()
                            .then((updatedFavorite) => {
                                res.setHeader('Content-Type', 'application/json');
                                res.status(200).json(updatedFavorite);
                            })
                            .catch((err) => next(err));
                    } else {
                        res.setHeader('Content-Type', 'text/plain');
                        res.end('Campsite not found in your favorites.');
                    }
                } else {
                    res.setHeader('Content-Type', 'text/plain');
                    res.end('You do not have any favorites to delete.');
                }
            })
    });


module.exports = favoriteRouter;