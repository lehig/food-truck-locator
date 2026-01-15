import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { fetchAuthSession } from "../auth/cognito";

function buildUserFromSession(session) {
  const idPayload = session.tokens?.idToken?.payload ?? {};
  const accessPayload = session.tokens?.accessToken?.payload ?? {};

  const userID = idPayload.sub || accessPayload.sub;
  if (!userID) throw new Error("Missing sub claim");

  const groupsClaim = accessPayload["cognito:groups"] ?? idPayload["cognito:groups"];
  const groups = Array.isArray(groupsClaim)
    ? groupsClaim
    : typeof groupsClaim === "string" && groupsClaim.length
      ? groupsClaim.split(",").map((s) => s.trim())
      : [];

  const role = groups[0] || "";
  const email = idPayload.email || accessPayload.email || "";
  const username =
    idPayload["cognito:username"] ||
    accessPayload["cognito:username"] ||
    "";

  return { userID, username, email, role };
}

export default function ProtectedRoute({ redirectTo = "/" }) {
  const location = useLocation();
  const [status, setStatus] = useState("checking"); // checking | authed | unauthed

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      setStatus("checking");

      try {
        const session = await fetchAuthSession();

        const hasTokens =
          !!session?.tokens?.accessToken?.toString?.() ||
          !!session?.tokens?.idToken?.toString?.();

        if (!hasTokens) {
          sessionStorage.removeItem("ftlUser");
          if (!cancelled) setStatus("unauthed");
          return;
        }

        // Optional: keep your cached user data in sync
        const user = buildUserFromSession(session);
        sessionStorage.setItem("ftlUser", JSON.stringify(user));

        if (!cancelled) setStatus("authed");
      } catch (err) {
        sessionStorage.removeItem("ftlUser");
        if (!cancelled) setStatus("unauthed");
      }
    };

    check();
    return () => { cancelled = true; };
  }, []);

  if (status === "checking") {
    // Important: blocks rendering protected pages until auth is confirmed
    return (
      <div style={{ padding: "2rem" }}>
        <h2>Loading…</h2>
        <p>Verifying your session.</p>
      </div>
    );
  }

  if (status === "unauthed") {
    return (
      <Navigate
        to={redirectTo}
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}
