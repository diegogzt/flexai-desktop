try {
	require('./dist/commands/start.js');
	console.log('Successfully required start.js');
} catch (e) {
	console.error('Failed to require start.js:');
	console.error(e);
}
