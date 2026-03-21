import { v4 as uuidv4 } from 'uuid';

const TOKEN_KEY = 'sparknews_user_token';

export const getOrCreateToken = (): string => {
  let token = localStorage.getItem(TOKEN_KEY);
  
  if (!token) {
    token = uuidv4();
    localStorage.setItem(TOKEN_KEY, token);
  }
  
  return token;
};