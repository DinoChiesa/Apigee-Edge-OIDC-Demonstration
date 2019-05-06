// localUserDb.js
// ------------------------------------------------------------------
//
// This is a mock user validation database. This hash stores usernames
// and passwords, as well as other data for the users, like roles and
// motto. You would never do this in a real system. It's a mock.
// The user credentials grant access only to the assets in this demonstration.
//

var userDb = {

      "dino@apigee.com" : {
        password: 'IloveAPIs',
        uuid: 'EA1BA8EB-0A83-46BE-8B05-4C2E827F25B3',
        motto: 'If this isn\'t nice, I don\'t know what is.',
        given_name: "Dino",
        family_name: "Chiesa",
        roles: [ 'reader', 'editor', 'manager' ]
      },

      "darcy@exxorian.com" : {
        password : 'IloveAPIs',
        uuid : 'EB1F64DB-FE98-45AF-99F4-60C9A69C15EC',
        motto : 'Way to shop!',
        given_name : 'Darcy',
        family_name : 'Lander',
        roles : [ 'manager' ]
      },

      "jamie@initech.com" : {
        password : 'IloveAPIs',
        uuid : '2181CC18-51D0-4C04-B0B0-58454E23FD2C',
        motto : 'Like no other store in the world!',
        given_name : 'Jamie',
        family_name : 'Allendra',
        roles : [ 'executive' ]
      },

      "mistryr@google.com" : {
        password : 'IloveAPIs',
        uuid : '087471E3-2A0B-43CC-B507-8886E745232B',
        motto : 'Whatever it takes!',
        given_name : 'Raj',
        family_name : 'Mistry',
        roles : [ 'apigeek', 'wizard', 'clerk' ]
      },

      "carlos@thecircle.com" : {
        password: 'IloveAPIs',
        uuid: '0B1A8BFF-5000-4868-817E-3C157510C1D9',
        given_name: "Carlos",
        family_name: "Eberhardt",
        motto: 'There\'s no problem that Regular Expressions cannot exacerbate.',
        roles: ['reader']
      },

      "vidya@apigee.com": {
        password : 'IloveAPIs',
        uuid: '11F795B4-F5FD-4A05-8B8C-BADD30098ABA',
        motto: 'This is the good part.',
        given_name: "Vidya",
        family_name: "Ravindran",
        roles: ['reader']
      },

      "sudhee@apigee.com" : {
        password: 'IloveAPIs',
        uuid: '12B1854A-BD79-4857-83C1-29457B3972B8',
        motto: 'Imagine it, Believe it, Make it Real.',
        given_name: "Sudhee",
        family_name: "Sreedhara",
        roles : ['reader', 'apigeek']
      },

      "nandan@apigee.com" : {
        password: 'IloveAPIs',
        uuid: '5F944A2F-4758-476E-9008-262D6C3728C8',
        motto: 'Seek first to understand, and then to be understood.',
        given_name: "Nandan",
        family_name: "Sridhar",
        roles: ['reader', 'clerk']
      },

      "cass@apigee.com" : {
        password: 'IloveAPIs',
        uuid: '71FCF1E6-8391-4C04-B94B-6742EF0A6B61',
        motto: 'The trouble with me having an open mind is that people will try to put things in it.',
        given_name: "Cass",
        family_name: "Obregon",
        roles: ['reader']
      },

      "kevinford@google.com" : {
        password: 'IloveAPIs',
        uuid: '4F942D97-C22F-4845-855D-0B5108E440EE',
        motto: 'Keep calm, I\'m an architect.',
        given_name: "Kevin",
        family_name: "Ford",
        roles: ['reader', 'creator', 'architect']
      }

      // Obviously, you can add more records here.
      //
      // Also, you can add other properties to each record. For example, beyond
      // roles, you could add 'defaultProvider' or whatever else makes sense in
      // your desired system. If you DO add other data items, then you would also
      // need to modify the Edge policy to accept those properties and store them when
      // generating the user token.
      //
    };

module.exports = userDb;
