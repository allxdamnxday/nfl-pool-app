const express = require('express');
const {
  getGames,
  getGame,
  fetchGames,
  getGamesByTeam,
  filterGames,
  updateGameStatus,
  getWeekGames
} = require('../controllers/games');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Games
 *   description: Game management
 */

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
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2024-09-06"
 *               limit:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       200:
 *         description: Games fetched and stored/updated successfully
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
 */
router.route('/fetch').post(protect, fetchGames);

/**
 * @swagger
 * /api/v1/games/filter:
 *   get:
 *     summary: Filter games by season and week
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: season
 *         schema:
 *           type: integer
 *         required: false
 *         description: Season year to filter by
 *       - in: query
 *         name: week
 *         schema:
 *           type: integer
 *         required: false
 *         description: Week number to filter by
 *     responses:
 *       200:
 *         description: List of filtered games
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
router.route('/filter').get(protect, filterGames);

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
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the team
 *     responses:
 *       200:
 *         description: List of games for the team
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
 * /api/v1/games/week/{seasonYear}/{weekNumber}:
 *   get:
 *     summary: Get games by week
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: seasonYear
 *         schema:
 *           type: integer
 *         required: true
 *         description: Season year
 *       - in: path
 *         name: weekNumber
 *         schema:
 *           type: integer
 *         required: true
 *         description: Week number
 *     responses:
 *       200:
 *         description: List of games for the week
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
router.route('/week/:seasonYear/:weekNumber').get(protect, getWeekGames);

/**
 * @swagger
 * /api/v1/games/{id}:
 *   get:
 *     summary: Get single game
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Game ID
 *     responses:
 *       200:
 *         description: Single game details
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
 * /api/v1/games/{id}/status:
 *   put:
 *     summary: Update game status
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Game ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated game status
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
router.route('/:id/status').put(protect, updateGameStatus);

module.exports = router;

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
 *             score_away_by_period:
 *               type: array
 *               items:
 *                 type: number
 *             score_home_by_period:
 *               type: array
 *               items:
 *                 type: number
 *             venue_name:
 *               type: string
 *             venue_location:
 *               type: string
 *             game_clock:
 *               type: number
 *             display_clock:
 *               type: string
 *             game_period:
 *               type: number
 *             broadcast:
 *               type: string
 *             event_status_detail:
 *               type: string
 *             updated_at:
 *               type: string
 *               format: date-time
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
 *             conference_competition:
 *               type: boolean
 *             season_type:
 *               type: string
 *             season_year:
 *               type: number
 *             week:
 *               type: number
 *             week_name:
 *               type: string
 *             week_detail:
 *               type: string
 *             event_name:
 *               type: string
 *             attendance:
 *               type: string
 */

