// import React, { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import LogModal from "../components/LogModal";
// import "../components/Modal.css";
// import { toast } from "react-toastify";
// import apiFetch from "../apiService"; // <-- STEP 1: Import the API helper
// import Loader from "../components/Loader";

// // STEP 2: Remove the apiUrl prop
// const LogFood = () => {
//   const [query, setQuery] = useState("");
//   const [allFoods, setAllFoods] = useState([]);
//   const [filteredResults, setFilteredResults] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedFood, setSelectedFood] = useState(null);
//   // const [loading,setLoading] = useState(false);

//   useEffect(() => {
//     const fetchAllFoods = async () => {
//       try {
//         // setLoading(true);
//         // STEP 3: Use apiFetch with the correct "/api" endpoint
//         const data = await apiFetch("/foods?q=");
//         setAllFoods(data);
//       } catch (error) {
//         console.error("Failed to fetch food list:", error);
//         toast.error("Could not load your food database.");
//       }
//     };
//     fetchAllFoods();
//   }, []); // STEP 4: Remove apiUrl from the dependency array

//   // Filtering logic remains the same
//   useEffect(() => {
//     if (query.trim() === "") {
//       setFilteredResults([]);
//       return;
//     }
//     const results = allFoods.filter((food) =>
//       food.name.toLowerCase().includes(query.toLowerCase())
//     );
//     setFilteredResults(results);
//   }, [query, allFoods]);

//   const handleOpenModal = (food) => {
//     setSelectedFood(food);
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setSelectedFood(null);
//   };

//   const handleLogFood = async (food, servings) => {
//     if (!food || !servings || servings <= 0) return;

//     try {
//       // STEP 5: Use apiFetch within toast.promise for a better UX
//       setLoading(true);
//       await toast.promise(
//         apiFetch("/log/food", "POST", {
//           food_id: food._id.$oid,
//           servings: servings,
//         }),
//         {
//           pending: "Logging your food...",
//           success: `${food.name} logged successfully! 👌`,
//           error: "Could not log food. Please try again. 🤯",
//         }
//       );
//       // If the promise above succeeds, this code will run
//       handleCloseModal();
//       navigate("/dashboard");
//     } catch (err) {
//       // The toast.promise automatically shows the error toast.
//       // We can just log the error here for debugging.
//       console.error("Logging error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return <p style={{ textAlign: "center" }}>Loading food database...</p>;
//   }

//   // The JSX part of the component remains the same
//   return (
//     <div>
//       {loading && <Loader />}
//       {isModalOpen && selectedFood && (
//         <LogModal
//           food={selectedFood}
//           onClose={handleCloseModal}
//           onLog={handleLogFood}
//         />
//       )}

//       <h1 className="page-title">Log Food</h1>
//       <div className="card">
//         <div className="form-group">
//           <label htmlFor="search">Search your food database</label>
//           <input
//             type="text"
//             id="search"
//             className="form-control"
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             placeholder="Start typing to search..."
//             autoComplete="off"
//           />
//         </div>
//       </div>

//       {query && (
//         <div className="card">
//           <h3>Search Results</h3>
//           {filteredResults.length > 0 ? (
//             <ul className="list-group">
//               {filteredResults.map((food) => (
//                 <li key={food._id.$oid} className="list-group-item">
//                   <div>
//                     <strong>{food.name}</strong>
//                     <small style={{ display: "block", color: "#666" }}>
//                       {food.calories} kcal per {food.serving_size}
//                     </small>
//                   </div>
//                   <button
//                     onClick={() => handleOpenModal(food)}
//                     className="btn"
//                     style={{ width: "auto", padding: "8px 12px" }}
//                   >
//                     Log
//                   </button>
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <p>No results found for "{query}".</p>
//           )}
//         </div>
//       )}

//       <div style={{ textAlign: "center", marginTop: "20px" }}>
//         <Link to="/add-food" className="btn btn-secondary">
//           Add a New Food
//         </Link>
//       </div>
//     </div>
//   );
// };

// export default LogFood;

import React, { useState, useEffect } from "react";
// STEP 2.1: Import useLocation along with the other hooks
import { Link, useNavigate, useLocation } from "react-router-dom";
import LogModal from "../components/LogModal";
import "../components/Modal.css";
import { toast } from "react-toastify";
import apiFetch from "../apiService";
import Loader from "../components/Loader";

const LogFood = () => {
  const [query, setQuery] = useState("");
  const [allFoods, setAllFoods] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);

  // STEP 2.2: Use the useLocation hook to get the state passed from the Dashboard
  const location = useLocation();
  // Get the date from the state, or default to today's date if not provided.
  // This makes the component robust, working even if navigated to directly.
  const logDate =
    location.state?.date || new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchAllFoods = async () => {
      try {
        const data = await apiFetch("/foods?q=");
        setAllFoods(data);
      } catch (error) {
        console.error("Failed to fetch food list:", error);
        toast.error("Could not load your food database.");
      }
    };
    fetchAllFoods();
  }, []);

  useEffect(() => {
    if (query.trim() === "") {
      setFilteredResults([]);
      return;
    }
    const results = allFoods.filter((food) =>
      food.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredResults(results);
  }, [query, allFoods]);

  const handleOpenModal = (food) => {
    setSelectedFood(food);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFood(null);
  };

  const handleLogFood = async (food, servings) => {
    if (!food || !servings || servings <= 0) return;

    try {
      setLoading(true);
      await toast.promise(
        // STEP 2.3: Add the 'logDate' to the body of the API request
        apiFetch("/log/food", "POST", {
          food_id: food._id.$oid,
          servings: servings,
          date: logDate, // <-- The date from the dashboard is now included
        }),
        {
          pending: "Logging your food...",
          success: `${food.name} logged successfully! 👌`,
          error: "Could not log food. Please try again. 🤯",
        }
      );
      handleCloseModal();
      navigate("/dashboard");
    } catch (err) {
      console.error("Logging error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isModalOpen) {
    // Only show full page loader if modal isn't open
    return <p style={{ textAlign: "center" }}>Loading food database...</p>;
  }

  return (
    <div>
      {loading && <Loader />}
      {isModalOpen && selectedFood && (
        <LogModal
          food={selectedFood}
          onClose={handleCloseModal}
          onLog={handleLogFood}
        />
      )}

      {/* You can optionally display the date you're logging for */}
      <h1 className="page-title">Log Food for {logDate}</h1>
      <div className="card">
        <div className="form-group">
          <label htmlFor="search">Search your food database</label>
          <input
            type="text"
            id="search"
            className="form-control"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Start typing to search..."
            autoComplete="off"
          />
        </div>
      </div>

      {query && (
        <div className="card">
          <h3>Search Results</h3>
          {filteredResults.length > 0 ? (
            <ul className="list-group">
              {filteredResults.map((food) => (
                <li key={food._id.$oid} className="list-group-item">
                  <div>
                    <strong>{food.name}</strong>
                    <small style={{ display: "block", color: "#666" }}>
                      {food.calories} kcal per {food.serving_size}
                    </small>
                  </div>
                  <button
                    onClick={() => handleOpenModal(food)}
                    className="btn"
                    style={{ width: "auto", padding: "8px 12px" }}
                  >
                    Log
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No results found for "{query}".</p>
          )}
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <Link to="/add-food" className="btn btn-secondary">
          Add a New Food
        </Link>
      </div>
    </div>
  );
};

export default LogFood;
