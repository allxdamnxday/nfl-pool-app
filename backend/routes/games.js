const express = require('express');
const { getGames, getGame, fetchGames, getGamesByTeam } = require('../controllers/games');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/v1/games:
 *   get:
 *     summary: Get all games
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all games
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Game'
 */
router.route('/').get(protect, getGames);

/**
 * @swagger
 * /api/v1/games/{id}:
 *   get:
 *     summary: Get a single game
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Details of a single game
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Game'
 *       404:
 *         description: Game not found
 */
router.route('/:id').get(protect, getGame);

/**
 * @swagger
 * /api/v1/games/team/{teamId}:
 *   get:
 *     summary: Get games for a specific team
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: List of games for a specific team
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Game'
 */
router.route('/team/:teamId').get(protect, getGamesByTeam);

/**
 * @swagger
 * /api/v1/games/fetch:
 *   post:
 *     summary: Fetch games from external API and store in database
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2020-09-20"
 *     responses:
 *       200:
 *         description: Games fetched and stored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid input
 */
router.route('/fetch').post(protect, fetchGames);

/**
 * @swagger
 * components:
 *   schemas:
 *     Game:
 *       type: object
 *       properties:
 *         event_id:
 *           type: string
 *         event_uuid:
 *           type: string
 *         sport_id:
 *           type: number
 *         event_date:
 *           type: string
 *           format: date-time
 *         rotation_number_away:
 *           type: number
 *         rotation_number_home:
 *           type: number
 *         score:
 *           type: object
 *           properties:
 *             event_status:
 *               type: string
 *             winner_away:
 *               type: number
 *             winner_home:
 *               type: number
 *             score_away:
 *               type: number
 *             score_home:
 *               type: number
 *         teams_normalized:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               team_id:
 *                 type: number
 *               name:
 *                 type: string
 *               mascot:
 *                 type: string
 *               abbreviation:
 *                 type: string
 *               is_away:
 *                 type: boolean
 *               is_home:
 *                 type: boolean
 *         schedule:
 *           type: object
 *           properties:
 *             league_name:
 *               type: string
 *             season_year:
 *               type: number
 *             week:
 *               type: number
 */

module.exports = router;
