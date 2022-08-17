const { Router } = require('express');
const router = new Router();

// require user and room model
const User = require('../models/User.model');
const Room = require('../models/Room.model');

// require auth middleware
const { isLoggedIn, isLoggedOut } = require('../middleware/route-guard.js');

// GET route ==> for create room form
router.get('/create', isLoggedIn, (req, res) => res.render('room/create'));

// POST route ==> to process create room form data
router.post('/create', isLoggedIn, (req, res, next) => {
    const { name, description, imageUrl } = req.body;

    Room.create({ name, description, imageUrl, owner : req.session.currentUser })
        .then((createdRoom) => {
            console.log("Room created" + createdRoom)
            res.redirect('/room/list')
        })
        .catch(error => next(error));
  });
// GET route ==> for edit room form
router.get('/:id/edit', isLoggedIn, (req, res, next) => {
    const { id } = req.params;
    Room.findById(id)
        // .populate("cast")
        .then((roomDetails) => {
            res.render('room/edit', {roomDetails});
        })    
})

// POST route => to process edit form data
router.post('/:id/edit', isLoggedIn, (req, res, next) => {
    const { id } = req.params;
    const { name, description, imageUrl } = req.body;
    Room.findById(id)
        .populate("owner")
        .then((roomDetails) => {
            const user = req.session.currentUser;
            if(user.email === roomDetails.owner.email) {
                console.log("users same")
                Room.updateOne({ _id: id}, { name, description, imageUrl })
                    .then(res.redirect(`/room/list`))
            } else {
                throw `user ${user.fullName} is not allowed to edit`;
            }
        })
        .catch(error => next(error));
})


// GET route ==> for list all room
router.get('/list', (req, res) => {
    Room.find()
        .populate('owner')
        .then((roomsList) => {
            res.render('room/list', { roomsList })
        })
        .catch((err) => console.error(`Error while listing movies: ${err}`))
})

// POST route ==> delete room
router.post('/:id/delete', isLoggedIn, (req, res, next) => {
    const { id } = req.params;
    Room.findById(id)
        .populate("owner")
        .then((roomDetails) => {
            const user = req.session.currentUser;
            if(user.email === roomDetails.owner.email) {
                console.log("users same")
                Room.findByIdAndDelete({ _id: id})
                    .then(res.redirect(`/room/list`))
            } else {
                throw `user ${user.fullName} is not allowed to delete`;
            }
        })
        .catch(error => next(error));
})

module.exports = router;