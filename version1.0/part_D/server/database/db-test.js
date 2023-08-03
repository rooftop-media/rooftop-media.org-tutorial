const DataBase = require('./database.js');


console.log('===== Test 1: Adding a new user')

let new_user = DataBase.table('users').insert({
  username: "database_test_user",
  display_name: "Just testing the user database",
  email: "database_test@user.com",
  phone: "555-010-1100",
});

if (new_user.error) {
  console.log(`Test 1 resulted in an error: ${new_user.msg}`);
} else {
  console.log(`Test 1 created a user with this id: ${new_user.id}`);
}

console.log('===== Test 2: Finding the user with username database_test_user')

let found_user = DataBase.table('users').find({
  username: "database_test_user"
});

if (found_user.length == 0) {
  console.log(`Test 2 didn't find any matching users.`);
} else if (found_user.length > 1 || !found_user) {
  console.log(`Test 2 returned more than one user, or an undefined result:`);
  console.log(found_user);
} else {
  console.log(`Test 2 found a user with this data: `);
  console.log(found_user);
}

console.log(`===== Test 3: Updating the user with the id ${new_user.id}`)

let update_msg = DataBase.table('users').update(new_user.id, {
  display_name: 'Updated display name!',
  email: 'updated@email.com'
});

console.log(update_msg);

console.log('===== Test 4: Finding the user with username database_test_user again')

let found_user1 = DataBase.table('users').find({
  username: "database_test_user"
});

if (found_user1.length == 0) {
  console.log(`Test 4 didn't find any matching users.`);
} else if (found_user1.length > 1 || !found_user1) {
  console.log(`Test 4 returned more than one user, or an undefined result:`);
  console.log(found_user1);
} else {
  console.log(`Test 4 found a user with this data: `);
  console.log(found_user1);
}

console.log(`===== Test 5: Deleting the newly created user, with the id ${new_user.id}`)

let msg = DataBase.table('users').delete(new_user.id);

console.log(msg);

console.log('===== Test 6: Trying to find the user with username database_test_user again')

let found_user2 = DataBase.table('users').find({
  username: "database_test_user"
});

if (found_user2.length == 0) {
  console.log(`Test 6 didn't find any matching users.`);
} else if (found_user2.length > 1 || !found_user2) {
  console.log(`Test 6 returned more than one user, or an undefined result:`);
  console.log(found_user2);
} else {
  console.log(`Test 6 found a user with this data: `);
  console.log(found_user2);
}



const readline = require('node:readline');
const { stdin: input, stdout: output } = require('node:process');

const rl = readline.createInterface({ input, output });

rl.question('Want to run a test that results in an error? (y/n)', (answer) => {
  if (answer.toLowerCase() == 'y') {
    //  Invalid test
    DataBase.table('not-a-table').insert({
      row1: 'value-1',
      row2: false
    })
  } else {
    console.log("Ok, goodbye!");
  }
  rl.close();
});





