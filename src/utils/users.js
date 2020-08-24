const users = [];

// To track a new user when he joins a room
const addUser = ({ id, username, room }) => {
  //Clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //Validate the data
  if (!username || !room) {
    return {
      error: "Username and room are required!",
    };
  }

  //Check for existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  //Validate username
  if (existingUser) {
    return {
      error: "Username is already in use!",
    };
  }

  //Store user
  const user = { id, username, room };
  users.push(user);
  return {
    user,
  };
};

// To stop tracking a user when he leaves a room
const removeUser = (id) => {
  //To find if user id exists in users
  const index = users.findIndex((user) => user.id === id);

  //To remove the user if found in the list
  if (index != -1) {
    return users.splice(index, 1)[0];
  }
};

// To fetch an existing user's data
const getUser = (id) => {
  return users.find((user) => user.id === id);
};

// To get a list of all users in a room
const getUsersInRoom = (room) => {
  return users.filter(
    (user) => user.room.trim().toLowerCase() === room.trim().toLowerCase()
  );
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
