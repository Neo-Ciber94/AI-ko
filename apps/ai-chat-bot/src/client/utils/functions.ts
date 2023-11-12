export function setCookie(cookieName: string, value: string, maxAge?: number) {
  let cookie = `${cookieName}=${value};path=/`;

  if (maxAge) {
    cookie += `;max-age=${maxAge}`;
  }

  document.cookie = cookie;
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

export function removeCookie(cookieName: string) {
  setCookie(cookieName, "", -1);
}
