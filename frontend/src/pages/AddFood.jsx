import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiFetch from "../apiService";
import Loader from "../components/Loader";

const AddFood = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    serving_size: "",
    weight: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });
  // REMOVED: The isServing state is no longer needed.
  // const [isServing, setIsServing] = useState(false);
  const navigate = useNavigate();

  // SIMPLIFIED: The handleChange function now only updates the form data.
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // MODIFIED: Perform the validation check directly on the formData state here.
    // This checks if BOTH serving_size AND weight are empty.
    if (!formData.serving_size && !formData.weight) {
      toast.warn("Please enter either a Serving Size or a Weight.");
      return;
    }

    const payload = {
      name: formData.name,
      serving_size: formData.serving_size || 1,
      weight: formData.weight || 100,
      calories: formData.calories,
      macros: {
        protein: formData.protein || 0,
        carbs: formData.carbs || 0,
        fat: formData.fat || 0,
      },
    };

    try {
      setLoading(true);
      await apiFetch("/foods", "POST", payload);
      toast.success("Food added successfully!");
      navigate("/log-food");
    } catch (error) {
      console.error("Error adding food:", error);
      toast.error(`Could not add food: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // The JSX for the form remains exactly the same.
  return (
    <div>
      {loading && <Loader />}
      <h1 className="page-title">Add New Food</h1>
      <div className="card">
        <form onSubmit={handleSubmit}>
          {/* ... all your form inputs remain unchanged ... */}
          <div className="form-group">
            <label>Food Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label>Serving Size (e.g., 1 cup)</label>
            <input
              type="text"
              name="serving_size"
              value={formData.serving_size}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Weight (e.g., 100g)</label>
            <input
              type="text"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Calories</label>
            <input
              type="number"
              name="calories"
              value={formData.calories}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label>Protein (g)</label>
            <input
              type="number"
              name="protein"
              value={formData.protein}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Carbs (g)</label>
            <input
              type="number"
              name="carbs"
              value={formData.carbs}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Fat (g)</label>
            <input
              type="number"
              name="fat"
              value={formData.fat}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <button type="submit" className="btn">
            Add Food
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddFood;
