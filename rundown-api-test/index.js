const http = require('https');

const options = {
	method: 'GET',
	hostname: 'therundown-therundown-v1.p.rapidapi.com',
	port: null,
	path: '/sports/2/schedule?from=2024-09-01&limit=100',
	headers: {
		'x-rapidapi-key': '1701031eb1mshc800e3940304359p1bd6ccjsn44c6f4718739',
		'x-rapidapi-host': 'therundown-therundown-v1.p.rapidapi.com',
		'X-RapidAPI-Mock-Response': '200'
	}
};

const req = http.request(options, function (res) {
	const chunks = [];

	res.on('data', function (chunk) {
		chunks.push(chunk);
	});

	res.on('end', function () {
		const body = Buffer.concat(chunks);
		console.log(body.toString());
	});
});

req.end();