/* eslint-disable */ module.exports = {
  languageData: {
    plurals: function(n, ord) {
      var s = String(n).split('.'),
        v0 = !s[1],
        t0 = Number(s[0]) == n,
        n10 = t0 && s[0].slice(-1),
        n100 = t0 && s[0].slice(-2);
      if (ord)
        return n10 == 1 && n100 != 11
          ? 'one'
          : n10 == 2 && n100 != 12
          ? 'two'
          : n10 == 3 && n100 != 13
          ? 'few'
          : 'other';
      return n == 1 && v0 ? 'one' : 'other';
    },
  },
  messages: {
    '<0>newdle</0> is a collective meeting scheduling application.':
      '<0>newdle</0> is a collective meeting scheduling application.',
    'Choose your participants': 'Choose your participants',
    'Get started': 'Get started',
    'How does it work?': 'How does it work?',
    'Made at <0>CERN</0>, the place where the web was born.':
      'Made at <0>CERN</0>, the place where the web was born.',
    'Set the time slots based on their availability':
      'Set the time slots based on their availability',
    'Welcome to newdle!': 'Welcome to newdle!',
    'You can use it to find out the best dates/times for your meetings.':
      'You can use it to find out the best dates/times for your meetings.',
    'is a collective meeting scheduling application.':
      'is a collective meeting scheduling application.',
    'newdle is Open Source Software': 'newdle is Open Source Software',
    'will collect the answers!': 'will collect the answers!',
  },
};
