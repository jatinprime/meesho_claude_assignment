import { DataHandler } from './dataHandler';

async function main() {
  console.log('Starting service...');
  const handler = new DataHandler();
  
  try {
    const user = await handler.getUser(1);
    if (user) {
      console.log(`Found user: ${user.name}`);
    } else {
      console.log('User not found');
    }
    
    const activeCount = handler.getActiveUsersCount();
    console.log(`Active users: ${activeCount}`);
  } catch (error) {
    console.error('Error in main execution:', error);
  }
}

main();
