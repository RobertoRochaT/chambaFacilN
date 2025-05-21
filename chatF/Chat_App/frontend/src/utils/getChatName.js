import GroupLogo from "../assets/group.png";
const getChatName = (chat, authUserId) => {
  // Add safety checks
  if (!chat || !chat.users) return "Unknown Chat";
  
  // Handle different name formats based on user data structure
  if (chat.chatName === "Messenger") {
    // Check if we can use firstName/lastName or fallback to name
    if (authUserId === (chat.users[0]?._id || '')) {
      // Use the second user
      const user = chat.users[1];
      if (!user) return "Unknown User";
      
      // Try both formats - firstName/lastName or name
      if (user.firstName) {
        return `${user.firstName} ${user.lastName || ''}`;
      } else if (user.name) {
        return user.name;
      }
      return "Unknown User";
    } else {
      // Use the first user
      const user = chat.users[0];
      if (!user) return "Unknown User";
      
      // Try both formats - firstName/lastName or name
      if (user.firstName) {
        return `${user.firstName} ${user.lastName || ''}`;
      } else if (user.name) {
        return user.name;
      }
      return "Unknown User";
    }
  } else {
    return chat.chatName || "Unnamed Chat";
  }
};

export const getChatImage = (chat, loggedInUserId) => {
  if (!chat) return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Ccircle cx='24' cy='18' r='10' fill='%23ccc'/%3E%3Ccircle cx='24' cy='58' r='24' fill='%23ccc'/%3E%3C/svg%3E";
  
  if (chat.isGroupChat) {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Ccircle cx='16' cy='16' r='8' fill='%23ccc'/%3E%3Ccircle cx='32' cy='16' r='8' fill='%23ccc'/%3E%3Ccircle cx='24' cy='28' r='8' fill='%23ccc'/%3E%3Ccircle cx='24' cy='58' r='24' fill='%23ccc'/%3E%3C/svg%3E";
  } else {
    // For one-on-one chats, return the other user's image
    const otherUser = chat.users?.find(user => user._id !== loggedInUserId);
    return otherUser?.profileImage || otherUser?.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Ccircle cx='24' cy='18' r='10' fill='%23ccc'/%3E%3Ccircle cx='24' cy='58' r='24' fill='%23ccc'/%3E%3C/svg%3E";
  }
};

export default getChatName;