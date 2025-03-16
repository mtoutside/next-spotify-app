'use client';
import styles from './Profile.module.css';

interface UserProfile {
  display_name: string;
  images: { url: string }[];
  id: string;
  email: string;
  external_urls: { spotify: string };
  href: string;
  country: string;
}

interface ProfileProps {
  user: UserProfile | null;
}

export default function Profile({ user }: ProfileProps) {
  const logout = () => {
    sessionStorage.clear();
    location.reload();
  };
  return (
    <div className={styles.profile}>
      <h1>Spotify Profile</h1>
      {user ? (
        <>
          <table>
            <tbody>
              <tr>
                <td>Display name</td>
                <td>{user.display_name}</td>
                <td>
                  <img width="150" src={user.images?.[0]?.url} alt={user.display_name} />
                </td>
              </tr>
              <tr>
                <td>Id</td>
                <td>{user.id}</td>
              </tr>
              <tr>
                <td>Email</td>
                <td>{user.email}</td>
              </tr>
              <tr>
                <td>Spotify URI</td>
                <td>
                  <a href={user.external_urls.spotify}>{user.external_urls.spotify}</a>
                </td>
              </tr>
              <tr>
                <td>Country</td>
                <td>{user.country}</td>
              </tr>
            </tbody>
          </table>
          <button onClick={logout}>Log out</button>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
