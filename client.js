const prompt = require('prompt');
const util = require('util');
const axios = require('axios');
const { ChatManager, TokenProvider } = require('@pusher/chatkit');
const { JSDOM } = require('jsdom');
const readline = require('readline');


const makeChatktiNodeComptabile = () => {
   const { window } = new JSDOM();
   global.window = window;
   global.navigator = {};
}

const createUser = async username => {
   try {
      await axios.post('http://localhost:3001/users', {username});
   } catch (error) {
      console.log(error);
   }
}

const main = async () => {
   makeChatktiNodeComptabile();
   try {
      prompt.start();
      prompt.message = '';
   
      const get = util.promisify(prompt.get);
   
      const usernameSchema = [
         {
            description: 'Enter your username',
            name: 'username',
            require: true
         }
      ];
   
      const { username } = await get(usernameSchema);
      createUser(username);

      const chatManager = new ChatManager({
         instanceLocator: 'v1:us1:e2bfbf0b-aa0b-4ee7-905a-49c5c746cf34',
         userId: username,
         tokenProvider: new TokenProvider({
            url: 'http://localhost:3001/authenticate'
         })
      });

      const currentUser = await chatManager.connect();
      const joinableRooms = await currentUser.getJoinableRooms();
      const availableRooms = [...currentUser.rooms, ... joinableRooms];

      availableRooms.forEach((room, index) => {
         console.log(`${index} - ${room.name}`);
      });

      const roomSchema = [
         {
            description: 'Select a room',
            name: 'chosenRoom',
            required: true
         }
      ];

      const { chosenRoom } = await get(roomSchema);
      const room = availableRooms[chosenRoom];

      await currentUser.subscribeToRoom({
         roomId: room.id,
         hooks: {
            onNewMessage: message => {
               if (message.senderId !== username) {
                  console.log(`${message.senderId} - ${message.text}`);
               }
            }
         },
         messageLimit: 0
      });

      const input = readline.createInterface({
         input: process.stdin
      });

      input.on('line', async text => {
         await currentUser.sendMessage({
            roomId: room.id,
            text
         });
      })
   } catch (error) {
      console.log(error);
      process.exit(1);
   }
}

main()