// localUserDb.js
// ------------------------------------------------------------------
//
// This is a mock user validation database. The hash stores usernames
// and passwords, as well as other data for the users, like roles and
// motto.
//
// created: Fri Mar 25 20:01:12 2016
// last saved: <2017-April-04 15:21:50>

var userDb = {
      "dino@apigee.com" : {
        hash: 'IloveAPIs',
        uuid: 'EA1BA8EB-0A83-46BE-8B05-4C2E827F25B3',
        motto: 'If this isn\'t nice, I don\'t know what is.',
        given_name: "Dino",
        family_name: "Chiesa",
        roles: ['read', 'edit', 'delete']
      },
      "carlos@apigee.com" : {
        hash: 'Wizard123',
        uuid: '0B1A8BFF-5000-4868-817E-3C157510C1D9',
        given_name: "Carlos",
        family_name: "Eberhardt",
        motto: 'There\'s no problem that Regular Expressions cannot exacerbate.',
        roles: ['read']
      },
      "vidya@apigee.com": {
        hash : '1Performance',
        uuid: '11F795B4-F5FD-4A05-8B8C-BADD30098ABA',
        motto: 'This is the good part.',
        given_name: "Vidya",
        family_name: "Ravindran",
        roles: ['read']
      },
      "sudhee@apigee.com" : {
        hash: 'Imagine4',
        uuid: '12B1854A-BD79-4857-83C1-29457B3972B8',
        motto: 'Imagine it, Believe it, Make it Real.',
        given_name: "Sudhee",
        family_name: "Sreedhara",
        roles : ['read', 'edit']
      },
      "nandan@apigee.com" : {
        hash: 'ItsAllAboutTheFlow',
        uuid: '5F944A2F-4758-476E-9008-262D6C3728C8',
        motto: 'Seek first to understand, and then to be understood.',
        given_name: "Nandan",
        family_name: "Sridhar",
        roles: ['read', 'edit']
      },
      "cass@apigee.com" : {
        hash: 'OpenIdConnect99',
        uuid: '71FCF1E6-8391-4C04-B94B-6742EF0A6B61',
        motto: 'The trouble with me having an open mind is that people will try to put things in it.',
        given_name: "Cass",
        family_name: "Obregon",
        roles: ['read', 'edit']
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
