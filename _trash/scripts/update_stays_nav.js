const fs = require('fs');

const files = [
  'stays.html', 'stays-search.html', 'flights.html', 'car-rental.html', 'attractions.html', 'airport-taxis.html',
  'travel/stays.html', 'travel/stays-search.html', 'travel/flights.html', 'travel/car-rental.html', 'travel/attractions.html', 'travel/airport-taxis.html', 'travel/index.html',
  'js/core/layout.js', 'shared/js/core/layout.js'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/<span>Stays<\/span>/g, '<span>AMEZA Hotels</span>');
    content = content.replace(/Stays &bull; Flights &bull; Cars &bull; Taxis/g, 'AMEZA Hotels &bull; Flights &bull; Cars &bull; Taxis');
    content = content.replace(/Stays • Flights • Cars • Taxis/g, 'AMEZA Hotels • Flights • Cars • Taxis');
    fs.writeFileSync(f, content, 'utf8');
    console.log('Updated', f);
  }
});
