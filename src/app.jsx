import { useEffect, useState } from "react";
import Cookies from "js-cookie";

// API URL
const apiURL = "http://0.0.0.0";

// Fetcher function
async function fetcher(method, url, data = null) {
  try {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (localStorage.getItem("auth")) {
      headers["Authorization"] = `Bearer ${localStorage.getItem("auth")}`;
    }

    const response = await fetch(`${apiURL}/api/${url}`, {
      method: method,
      headers: headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return {
      status: response.status,
      data: await response.json(),
    };
  } catch (error) {
    return {
      status: error.status || 500,
      data: null,
    };
  }
}

export default function App() {
  const [user, setUser] = useState(null);

  // Launch app
  useEffect(() => {
    // Check CSRF cookie
    if (!Cookies.get("XSRF-TOKEN")) {
      // Get CSRF token (once)
      fetch(`${apiURL}/sanctum/csrf-cookie`).then(response => {
        console.log(response);
      });
    }

    // Check auth token
    if (localStorage.getItem("auth")) {
      fetcher("get", "user").then(response => {
        if (response.status === 200) {
          console.log(response);
          setUser(response.data);
        } else {
          console.error(response);
        }
      });
    }
  }, []);

  // Get products
  // useEffect(() => {
  //   fetcher("get", "products").then(res => console.log(res));
  // }, []);

  // Login
  function handleLogin() {
    fetcher("post", "login", {
      email: "maxime@dysign.fr",
      password: "12345678",
    }).then(response => {
      if (response.status === 200) {
        console.log(response);
        setUser(response.data.user);
        localStorage.setItem("auth", response.data.access_token);
      } else {
        console.error(response);
      }
    });
  }

  // Logout
  function handleLogout() {
    fetcher("post", "logout").then(response => {
      console.log(response);
      setUser(null);
      localStorage.removeItem("auth");
    });
  }

  return (
    <div className="p-10">
      <h1 className="text-red-600 text-3xl mb-6">Crafted By</h1>

      {!user ? (
        <button
          className="block py-2 px-4 bg-emerald-500 text-white rounded"
          onClick={handleLogin}
        >
          Login
        </button>
      ) : (
        <div className="p-4 mt-4 bg-slate-100 rounded">
          <h2 className="text-xl font-bold mb-2">Welcome</h2>
          <p>{user.name}</p>
          <p>{user.email}</p>
          <p>
            <button className="mt-4 text-cyan-500" onClick={handleLogout}>
              Logout
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
