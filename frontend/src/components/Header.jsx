// // import React from "react";
// // import { NavLink } from "react-router-dom";

// // const Header = () => {
// //   // In react-router-dom v6, activeClassName is replaced by a function in the className prop
// //   const getNavLinkClass = ({ isActive }) =>
// //     isActive ? "nav-link active" : "nav-link";

// //   return (
// //     <header className="header">
// //       <nav className="nav">
// //         <NavLink to="/" className={getNavLinkClass} end>
// //           Dashboard
// //         </NavLink>
// //         <NavLink to="/log-food" className={getNavLinkClass}>
// //           Log Food
// //         </NavLink>
// //         <NavLink to="/log-weight" className={getNavLinkClass}>
// //           Log Weight
// //         </NavLink>
// //         <NavLink to="/progress" className={getNavLinkClass}>
// //           Progress
// //         </NavLink>
// //       </nav>
// //     </header>
// //   );
// // };

// // export default Header;

// import React from "react";
// import { NavLink, Link } from "react-router-dom";
// import { useAuth } from "../AuthContext"; // Make sure this path is correct
// // import "./Header.css"; // We will create this CSS file next
// import "./Header1.css"; // We will create this CSS file next

// const Header = () => {
//   const { user, logout } = useAuth(); // Get user state and logout function

//   // In react-router-dom v6, activeClassName is replaced by a function in the className prop
//   const getNavLinkClass = ({ isActive }) =>
//     isActive ? "nav-link active" : "nav-link";

//   return (
//     <header className="header">
//       {/* Main navigation remains the same */}
//       <nav className="nav">
//         {user && ( // Only show main nav links if the user is logged in
//           <>
//             <NavLink to="/dashboard" className={getNavLinkClass} end>
//               Dashboard
//             </NavLink>
//             <NavLink to="/log-food" className={getNavLinkClass}>
//               Log Food
//             </NavLink>
//             <NavLink to="/log-weight" className={getNavLinkClass}>
//               Log Weight
//             </NavLink>
//             <NavLink to="/progress" className={getNavLinkClass}>
//               Progress
//             </NavLink>
//           </>
//         )}
//       </nav>

//       {/* User authentication section on the right */}
//       <div className="user-actions">
//         {user ? (
//           // If user is logged in, show profile dropdown
//           <div className="profile-dropdown">
//             <img
//               src="/profile-icon.png" // IMPORTANT: Add an icon to your /public folder
//               alt="Profile"
//               className="profile-icon"
//             />
//             <div className="dropdown-content">
//               <Link to="/profile">Profile</Link>
//               <button onClick={logout} className="logout-button">
//                 Logout
//               </button>
//             </div>
//           </div>
//         ) : (
//           // If user is logged out, show Login and Register links
//           <div className="auth-links">
//             <NavLink to="/" className={getNavLinkClass}>
//               Login
//             </NavLink>
//             <NavLink to="/register" className={getNavLinkClass}>
//               Register
//             </NavLink>
//           </div>
//         )}
//       </div>
//     </header>
//   );
// };

// export default Header;

import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "./Header1.css"; // Make sure it points to the CSS above

const Header = () => {
  const { user, logout } = useAuth();
  const [isNavOpen, setIsNavOpen] = useState(false);

  const getNavLinkClass = ({ isActive }) =>
    isActive ? "nav-link active" : "nav-link";

  const toggleNav = () => setIsNavOpen(!isNavOpen);
  const closeNav = () => setIsNavOpen(false);
  const handleLogout = () => {
    logout();
    closeNav();
  };

  return (
    <>
      {isNavOpen && <div className="nav-overlay" onClick={closeNav}></div>}

      <header className={`header ${isNavOpen ? "nav-open" : ""}`}>
        <Link
          to={user ? "/dashboard" : "/"}
          className="header-logo"
          onClick={closeNav}
        >
          <img
            src="../public/cookie_x192.png"
            alt="icon"
            className="logo-icon"
          />
          <span>BiteCount</span>
        </Link>

        <nav className="nav">
          {user && (
            <>
              <NavLink
                to="/dashboard"
                className={getNavLinkClass}
                onClick={closeNav}
                end
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/log-food"
                className={getNavLinkClass}
                onClick={closeNav}
              >
                Log Food
              </NavLink>
              <NavLink
                to="/log-weight"
                className={getNavLinkClass}
                onClick={closeNav}
              >
                Log Weight
              </NavLink>
              <NavLink
                to="/progress"
                className={getNavLinkClass}
                onClick={closeNav}
              >
                Progress
              </NavLink>
            </>
          )}

          <div className="auth-links-mobile">
            {user ? (
              <>
                <NavLink
                  to="/profile"
                  className={getNavLinkClass}
                  onClick={closeNav}
                >
                  My Profile
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="logout-button nav-link"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/" className={getNavLinkClass} onClick={closeNav}>
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className={getNavLinkClass}
                  onClick={closeNav}
                >
                  Register
                </NavLink>
              </>
            )}
          </div>
        </nav>

        <div className="user-actions">
          {user ? (
            <div className="profile-dropdown">
              <img
                src="../public/profile-icon.png"
                alt="Profile"
                className="profile-icon"
              />
              <div className="dropdown-content">
                <Link to="/profile">Profile</Link>
                <button onClick={logout} className="logout-button">
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-links-desktop">
              <NavLink to="/" className={getNavLinkClass}>
                Login
              </NavLink>
              <NavLink to="/register" className={getNavLinkClass}>
                Register
              </NavLink>
            </div>
          )}

          <button
            className="menu-toggle"
            onClick={toggleNav}
            aria-label="Toggle navigation"
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
        </div>
      </header>
    </>
  );
};

export default Header;
