export function getDateString(date: Date) {
  return `${date.getDate().toString().padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}.${date.getFullYear()}`;
}

export function isValidEmail(email: string) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function isValidUsername(username: string) {
  return /^[a-zA-Z0-9_-]+$/.test(username);
}

export function doesIncludeDigits(password: string) {
  return /^.*[0-9].*$/.test(password);
}

export function doesIncludeUppercaseLetter(password: string) {
  return /^.*[A-Z].*$/.test(password);
}

export function doesIncludeLowercaseLetter(password: string) {
  return /^.*[a-z].*$/.test(password);
}

export function doesIncludeProhibitedChars(password: string) {
  return /^.*[^a-zA-Z0-9].*$/.test(password);
}

export function formNewPostMessage(count: number) {
  if (
    11 <= count % 100 && count % 100 <= 19 ||
    5 <= count % 10 && count % 10 <= 9 ||
    count % 10 == 0
  ) {
    return count + " новых постов";
  }
  if (2 <= count % 10 && count % 10 <= 4) {
    return count + " новых поста";
  }
  return count + " новый пост";
}
