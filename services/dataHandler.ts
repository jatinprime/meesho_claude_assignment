export interface User {
  id: number;
  name: string;
  isActive: boolean;
}

export class DataHandler {
  private users: User[] = [
    { id: 1, name: 'Alice', isActive: true },
    { id: 2, name: 'Bob', isActive: false },
  ];

  public async getUser(id: number): Promise<User | undefined> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.users.find(u => u.id === id);
  }

  public getActiveUsersCount(): number {
    let count = 0;
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].isActive === true) {
        count++;
      }
    }
    return count;
  }
}
