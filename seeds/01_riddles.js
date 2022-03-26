
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('Riddles').del()
    .then(function () {
      // Inserts seed entries
      return knex('Riddles').insert([
        {id: 1, "slug": "see-saw", "question": "We see it once in a year, twice in a week, but never in a day. What is it?", "answer": "The letter E"},
        {id: 2, "slug": "no-body", "question": "I have a head & no body, but I do have a tail. What am I?", "answer": "A coin"},
      ]);
    });
};
