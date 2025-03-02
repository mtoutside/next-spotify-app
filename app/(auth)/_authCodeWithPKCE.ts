import exp from "constants";

const clientId = env.local;
const redirectUrl = "http://localhost:8080";

const authorizationEndpoint = "https://accounts.spotify.com/authorize";
const tokenEndpoint = "https://accounts.spotify.com/api/token";
const scope = 'user-read-private user-read-email';
localStorage.setItem("verifer", verifer);

const currentToken = {
  get access_token() { return localStorage.getItem("access_token") || null },
  get refresh_token() { return localStorage.getItem("refresh_token") || null },
  get expires_in() { return localStorage.getItem("refresh_in") || null },
  get expires() { return localStorage.getItem("expires") || null },

  save: function (response) {
    const { access_token, refresh_token, expires_in } = response;
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
    localStorage.setItem("expires_in", expires_in);

    const now = new Date();
    const expiry = new Date(now.getTime() + (expires_in * 1000));
    localStorage.setItem(("expires"), expiry);

  }
}

const args = new URLSearchParams(window.location.search);
const code = args.get("code");

if (code) {
  const token = await getToken(code);
  currentToken.save(token);

  const url = new URL(window.location.href);
  url.searchParams.delete("code");

  const updatedUrl = url.search ? url.href : url.href.replace("?", "");
  window.history.replaceState({}, document.title, updateUrl);
}

if (currentToken.access_token) {
  const userDate = await getUserData();
  renderTemplate("main", "logged-in-template", userData);
  renderTemplate("oauth", "oauth-template", currentToken);
}

if (!currentToken.access_token) {
  renderTemplate("main", "login")
}

async function redirectToSpotifyAuthorize(): void {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const randomValues = crypto.getRandomValues(new Uint8Array(64));
  const randomString = randomValues.reduce((acc, x) => acc + possible[x % possible.length], "");

  const code_verifier = randomString;
  const data = new TextEncoder.encode(code_verifier);
  const hashed = await window.crypto.subtle.digest("SHA-256", data);

  const code_challenge_base64 = btoa(String.fromCharCode(...new Uint8Array(hashed)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  window.localStorage.setItem("code_verifier", code_verifier);

  const authUrl = new URL(authorizationEndpoint);
  const params = {
    responce_type: "code",
    client_id: clientId,
    scope: scope,
    code_challenge_method: "S256",
    code_challenge: code_challenge_base64,
    redirect_url: redirectUrl,
  };

  authUrl.search = new URLSearchParams(params).toString();
  window.location.href = authUrl.toString();
}

async function getToken(code: string): Promise<any> {
  const code_verifer = localStorage.getItem("code_verifer");
  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", redirectUrl);
  params.append("code_verifier", code_verifer!);
  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "x-www-form-urlencoded",
    },
    body: new URLSearchParams(params),
  });

  return await response.json();
}

async function refreshToken(): Promise<any> {
  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", currentToken.refresh_token);
  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "x-www-form-urlencoded",
    },
    body: new URLSearchParams(params),
  });

  return await response.json();
}

async function getUserData() {
  const response = await fetch("https://api.spotify.com/v1/me", {
    method: "GET",
    headers: {
      "Authorization": "Bearer " + currentToken.access_token
    }
  });

  return await response.json();
}

async function loginWithSpotifyClick() {
  await redirectToSpotifyAuthorize();
}

async function logoutClick() {
  localStorage.clear();
  window.location.href = redirectUrl;
}

async function refreshTokenClick() {
  const token = await refreshToken();
  currentToken.save(token);
  renderTemplate("oauth", "oauth-template", currentToken);
}

function renderTemplate(targetId, templateId, data = null) {
  const template = document.getElementById(templateId);
  const clone = template?.content.cloneNode(true);

  const elements = clone.querySelectorAll("*");
  elements.forEach(ele => {
    const bindingAttrs = [...ele.attributes].filter(a => a.name.startsWith("data-bind"));

    bindingAttrs.forEach(attr => {
      const target = attr.name.replace(/data-bind-/, "").replace(/data-bind/, "");
      const targetType = target.startsWith("onclick") ? "HANDLER" : "PROPERTY";
      const targetProp = target === "" ? "innerHTML" : target;

      const prefix = targetType === "PROPERTY" ? "data." : "";
      const expresion = prefix + attr.value.replace(/;\n\r\n/g, "");

      try {
        ele[targetProp] = targetType === "PROPERTY" ? eval(expresion) : () => { eval(expresion) };
        ele.removeAttribute(attr.name);
      } catch (ex) {
        console.error(`Error binding ${expresion} to ${targetProp}`, ex)
      }
    });
  });

  const target = document.getElementById(targetId);
  target?.innerHTML = "";
  target?.appendChild(clone);
}
