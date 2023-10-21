export function setCookie(cookieName: string, value: string) {
  document.cookie = `${cookieName}=${value};path=/`;
}

export function getCookie(cookieName: string): string | null {
  const cookies = document.cookie.split("; ");

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].split("=");
    const name = decodeURIComponent(cookie[0]);

    if (name === cookieName) {
      return decodeURIComponent(cookie[1]);
    }
  }

  return null;
}
