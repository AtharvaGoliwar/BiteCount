// import React, { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import LogModal from "../components/LogModal"; // Import the modal component
// import "../components/Modal.css"; // Import modal styles
// import { toast } from "react-toastify"; // Import toast

// const LogFood = ({ apiUrl }) => {
//   // ... (useState for query, allFoods, loading, etc. remain the same)
//   const [query, setQuery] = useState("");
//   const [allFoods, setAllFoods] = useState([]);
//   const [filteredResults, setFilteredResults] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   // State to manage the modal
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedFood, setSelectedFood] = useState(null);

//   // Fetching logic remains the same
//   useEffect(() => {
//     const fetchAllFoods = async () => {
//       try {
//         const response = await fetch(`${apiUrl}/foods?q=`);
//         const data = await response.json();
//         setAllFoods(data);
//       } catch (error) {
//         console.error("Failed to fetch food list:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchAllFoods();
//   }, [apiUrl]);

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

//   // --- NEW MODAL HANDLING LOGIC ---

//   // Function to open the modal with the selected food
//   const handleOpenModal = (food) => {
//     setSelectedFood(food);
//     setIsModalOpen(true);
//   };

//   // Function to close the modal
//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setSelectedFood(null);
//   };

//   // This function is passed to the modal and is called when the user confirms
//   const handleLogFood = async (food, servings) => {
//     if (!food || !servings || servings <= 0) return;

//     const promise = fetch(`${apiUrl}/log/food`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ food_id: food._id.$oid, servings: servings }),
//     });

//     // Use toast.promise for a great UX (pending -> success/error)
//     toast
//       .promise(promise, {
//         pending: "Logging your food...",
//         success: `${food.name} logged successfully! 👌`,
//         error: "Could not log food. Please try again. 🤯",
//       })
//       .then((response) => {
//         if (response.ok) {
//           handleCloseModal();
//           navigate("/");
//         }
//       })
//       .catch((err) => console.error("Logging error:", err));
//   };

//   if (loading) {
//     return <p style={{ textAlign: "center" }}>Loading food database...</p>;
//   }

//   return (
//     <div>
//       {/* The Modal is rendered conditionally at the top level */}
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
//                   {/* This button now opens the modal instead of calling the API directly */}
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
import { Link, useNavigate } from "react-router-dom";
import LogModal from "../components/LogModal";
import "../components/Modal.css";
import { toast } from "react-toastify";
import apiFetch from "../apiService"; // <-- STEP 1: Import the API helper

// STEP 2: Remove the apiUrl prop
const LogFood = () => {
  const [query, setQuery] = useState("");
  const [allFoods, setAllFoods] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);

  useEffect(() => {
    const fetchAllFoods = async () => {
      try {
        // STEP 3: Use apiFetch with the correct "/api" endpoint
        const data = await apiFetch("/foods?q=");
        setAllFoods(data);
      } catch (error) {
        console.error("Failed to fetch food list:", error);
        toast.error("Could not load your food database.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllFoods();
  }, []); // STEP 4: Remove apiUrl from the dependency array

  // Filtering logic remains the same
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
      // STEP 5: Use apiFetch within toast.promise for a better UX
      await toast.promise(
        apiFetch("/log/food", "POST", {
          food_id: food._id.$oid,
          servings: servings,
        }),
        {
          pending: "Logging your food...",
          success: `${food.name} logged successfully! 👌`,
          error: "Could not log food. Please try again. 🤯",
        }
      );
      // If the promise above succeeds, this code will run
      handleCloseModal();
      navigate("/dashboard");
    } catch (err) {
      // The toast.promise automatically shows the error toast.
      // We can just log the error here for debugging.
      console.error("Logging error:", err);
    }
  };

  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading food database...</p>;
  }

  // The JSX part of the component remains the same
  return (
    <div>
      {isModalOpen && selectedFood && (
        <LogModal
          food={selectedFood}
          onClose={handleCloseModal}
          onLog={handleLogFood}
        />
      )}

      <h1 className="page-title">Log Food</h1>
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
