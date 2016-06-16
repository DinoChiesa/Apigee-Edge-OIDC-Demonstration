// localUserDb.js
// ------------------------------------------------------------------
//
// This is a mock user validation database. The hash stores usernames and
// the hex-encoded sha256 of the passwords, as well as other data for
// the users, like roles and motto.
//
// To generate additional sha256 passwords on macosx:
//
//   echo -n "password-value" | shasum -a 256
//
// This is a little bit elaborate for a fake user authentication system.
// I just wanted to show what could be possible.
//
// created: Fri Mar 25 20:01:12 2016
// last saved: <2016-June-15 18:54:15>

var userDb = {
      "geir@apigee.com" : { // IloveAPIs
        hash: 'd6da5bb778f9694448755d200b2cb792c39a1b951d3ffcf5d429e74cfc5eb2b3',
        uuid: 'EA1BA8EB-0A83-46BE-8B05-4C2E827F25B3',
        motto: 'Wherever you go, there you are.',
        given_name: "Geir",
        family_name: "Sjurseth",
        roles: ['read', 'edit', 'delete']
      },
      "carlos@apigee.com" : { // Wizard123
        hash: 'df938ee9d2a45b9a45af5109f1fb70087f39f690d6ab4acfd3c61d719b99cbd6',
        uuid: '0B1A8BFF-5000-4868-817E-3C157510C1D9',
        given_name: "Carlos",
        family_name: "Eberhardt",
        motto: 'There\'s no problem that Regular Expressions cannot worsen',
        roles: ['read']
      },
      "vidya@apigee.com": { // 1Performance
        hash : 'c0ef3e52341f3276f3aa2bbdf2e61230b17feae0a494c6ae80b423de35281cd2',
        uuid: '11F795B4-F5FD-4A05-8B8C-BADD30098ABA',
        motto: 'This is the good part.',
        given_name: "Vidya",
        family_name: "Ravindran",
        roles: ['read']
      },
      "sudhee@apigee.com" : { // Imagine4
        hash: '6264e5a29d9857a0632d079b9fbc855ce124d3848dedc7ce7d844a7ac2a332ce',
        uuid: '12B1854A-BD79-4857-83C1-29457B3972B8',
        motto: 'Imagine it, Believe it, Make it Real.',
        given_name: "Sudhee",
        family_name: "Sreedhara",
        roles : ['read', 'edit']
      },
      "nandan@apigee.com" : { // ItsAllAboutTheFlow
        hash: '21d06ae58847cbf5d89cff0a0df9ebb4b36e26f584bf6522cba592be5cded378',
        uuid: '5F944A2F-4758-476E-9008-262D6C3728C8',
        motto: 'Seek first to understand, and then to be understood.',
        given_name: "Nandan",
        family_name: "Sridhar",
        roles: ['read', 'edit']
      },
      "cass@apigee.com" : { // OpenIdConnect99
        hash: '0e172aadedfc48a13d472fe3e5fc52f57db8b543ef460ea574ff2f3ce89f0bbf',
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
