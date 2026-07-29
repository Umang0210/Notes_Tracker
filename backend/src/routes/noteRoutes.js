const express = require('express');
const router = express.Router();
const {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  togglePin,
  toggleArchive,
  toggleFavourite,
  restoreNote
} = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');

// Protect all note routes
router.use(protect);

router.route('/')
  .get(getNotes)
  .post(createNote);

router.route('/:id')
  .get(getNote)
  .put(updateNote)
  .delete(deleteNote);

router.put('/:id/pin', togglePin);
router.put('/:id/archive', toggleArchive);
router.put('/:id/favourite', toggleFavourite);
router.put('/:id/restore', restoreNote);

module.exports = router;
